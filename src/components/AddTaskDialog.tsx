import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

const AddTaskDialog = ({ open, onOpenChange, onTaskAdded }: AddTaskDialogProps) => {
  const [taskType, setTaskType] = useState<"DAILY" | "DEADLINE">("DAILY");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const taskData: any = {
        user_id: user.id,
        title,
        description: description || null,
        type: taskType,
        completed: false,
      };

      if (taskType === "DAILY") {
        taskData.time_of_day = timeOfDay || null;
      } else {
        taskData.deadline = deadline ? new Date(deadline).toISOString() : null;
      }

      const { error } = await supabase.from("tasks").insert([taskData]);

      if (error) throw error;

      toast.success("Task created! 🌱");
      resetForm();
      onTaskAdded();
    } catch (error: any) {
      toast.error(error.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTimeOfDay("");
    setDeadline("");
    setTaskType("DAILY");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task Type</Label>
            <RadioGroup value={taskType} onValueChange={(value: any) => setTaskType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DAILY" id="daily" />
                <Label htmlFor="daily" className="cursor-pointer">
                  Daily Task (Habit)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DEADLINE" id="deadline" />
                <Label htmlFor="deadline" className="cursor-pointer">
                  Deadline Task
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What do you want to accomplish?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {taskType === "DAILY" ? (
            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time (optional)</Label>
              <Input
                id="time"
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
