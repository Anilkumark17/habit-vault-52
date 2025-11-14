import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time and time 1 hour from now
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    console.log("Checking for tasks due between", now.toISOString(), "and", oneHourLater.toISOString());

    // Fetch tasks that are due in the next hour and haven't been reminded yet
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(`
        *,
        profiles!inner(email, name)
      `)
      .eq("type", "DEADLINE")
      .eq("is_active", true)
      .gte("deadline", now.toISOString())
      .lte("deadline", oneHourLater.toISOString())
      .is("reminded_at", null);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks to remind`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks to remind" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email for each task
    const emailPromises = tasks.map(async (task: any) => {
      const userEmail = task.profiles.email;
      const userName = task.profiles.name || "there";
      const priorityEmoji = task.priority === "urgent" ? "🚨" : task.priority === "low" ? "📌" : "⏰";
      const urgencyText = task.priority === "urgent" ? "URGENT" : task.priority === "low" ? "Low Priority" : "Normal";

      const deadline = new Date(task.deadline);
      const formattedDeadline = deadline.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🌱 Habit Vault Reminder</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
            
            <div style="background-color: ${task.priority === 'urgent' ? '#FEE2E2' : '#F3F4F6'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${task.priority === 'urgent' ? '#EF4444' : '#6366F1'};">
              <h2 style="color: #1F2937; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                ${priorityEmoji} ${task.title}
              </h2>
              <p style="color: #6B7280; margin: 10px 0;"><strong>Description:</strong> ${task.description || "No description provided"}</p>
              <p style="color: #6B7280; margin: 10px 0;"><strong>Priority:</strong> <span style="color: ${task.priority === 'urgent' ? '#EF4444' : '#6366F1'}; font-weight: bold;">${urgencyText}</span></p>
              <p style="color: #6B7280; margin: 10px 0;"><strong>Deadline:</strong> ${formattedDeadline}</p>
            </div>
            
            ${task.priority === 'urgent' 
              ? '<p style="font-size: 16px; color: #EF4444; font-weight: bold; text-align: center; margin: 20px 0;">⚡ This is urgent! Complete it as soon as possible! ⚡</p>'
              : '<p style="font-size: 16px; color: #6366F1; text-align: center; margin: 20px 0;">Don\'t forget to complete this task on time! 💪</p>'
            }
            
            <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
              Stay organized and productive! 🚀
            </p>
            
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              You're receiving this email because you set a deadline for this task in Habit Vault.
            </p>
          </div>
        </div>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "Habit Vault <onboarding@resend.dev>",
          to: [userEmail],
          subject: `${priorityEmoji} Task Reminder: ${task.title}`,
          html: emailHtml,
        });

        console.log(`Email sent to ${userEmail} for task ${task.id}:`, emailResponse);

        // Mark task as reminded
        await supabase
          .from("tasks")
          .update({ reminded_at: now.toISOString() })
          .eq("id", task.id);

        return { success: true, taskId: task.id, email: userEmail };
      } catch (error: any) {
        console.error(`Error sending email to ${userEmail}:`, error);
        return { success: false, taskId: task.id, email: userEmail, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Successfully sent ${successCount} out of ${results.length} reminder emails`);

    return new Response(
      JSON.stringify({ 
        message: `Sent ${successCount} reminder emails`,
        results 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-task-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
