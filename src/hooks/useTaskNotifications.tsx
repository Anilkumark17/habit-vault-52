import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  type: "DAILY" | "DEADLINE";
  time_of_day: string | null;
  deadline: string | null;
}

export const useTaskNotifications = (userId: string | undefined) => {
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const checkedTasks = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Initialize notification sound
    notificationSound.current = new Audio("/notification.mp3");
    notificationSound.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkTaskTimes = async () => {
      try {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        const currentDateTime = now.toISOString();

        // Fetch tasks that are due now
        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true);

        if (!tasks) return;

        tasks.forEach((task: any) => {
          const taskKey = `${task.id}-${currentTime}`;
          
          // Skip if already notified in this minute
          if (checkedTasks.current.has(taskKey)) return;

          let shouldNotify = false;

          if (task.type === "DAILY" && task.time_of_day) {
            // Check if current time matches task time (within same minute)
            if (task.time_of_day.slice(0, 5) === currentTime) {
              shouldNotify = true;
            }
          } else if (task.type === "DEADLINE" && task.deadline) {
            const deadline = new Date(task.deadline);
            const deadlineTime = deadline.toTimeString().slice(0, 5);
            const timeDiff = deadline.getTime() - now.getTime();
            
            // Notify at exact deadline time (within same minute)
            if (timeDiff > 0 && timeDiff <= 60 * 1000 && deadlineTime === currentTime) {
              shouldNotify = true;
            }
          }

          if (shouldNotify) {
            checkedTasks.current.add(taskKey);
            sendNotification(task);
          }
        });

        // Clean up old checked tasks (older than 2 minutes)
        const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000)
          .toTimeString()
          .slice(0, 5);
        
        checkedTasks.current.forEach((key) => {
          const keyTime = key.split("-")[1];
          if (keyTime < twoMinutesAgo) {
            checkedTasks.current.delete(key);
          }
        });
      } catch (error) {
        console.error("Error checking task times:", error);
      }
    };

    const sendNotification = (task: Task) => {
      // Play sound
      notificationSound.current?.play().catch((e) => {
        console.log("Could not play sound:", e);
      });

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Task Reminder 🌱", {
          body: `Time for: ${task.title}`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: task.id,
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Show toast as fallback
      toast.success(`⏰ Task Reminder: ${task.title}`, {
        duration: 10000,
      });
    };

    // Check immediately
    checkTaskTimes();

    // Then check every 30 seconds
    const interval = setInterval(checkTaskTimes, 30000);

    return () => clearInterval(interval);
  }, [userId]);
};
