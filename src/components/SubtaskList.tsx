import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  onSubtaskChange: () => void;
}

const SubtaskList = ({ taskId, subtasks, onSubtaskChange }: SubtaskListProps) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    try {
      const { error } = await supabase.from("subtasks").insert({
        task_id: taskId,
        title: newSubtask.trim(),
      });

      if (error) throw error;
      setNewSubtask("");
      setIsAdding(false);
      onSubtaskChange();
    } catch (error: any) {
      toast.error("Failed to add subtask");
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("subtasks")
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", subtaskId);

      if (error) throw error;
      onSubtaskChange();
    } catch (error: any) {
      toast.error("Failed to update subtask");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);
      if (error) throw error;
      onSubtaskChange();
    } catch (error: any) {
      toast.error("Failed to delete subtask");
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <div className="mt-3 space-y-2">
      {subtasks.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{completedCount}/{subtasks.length}</span>
          </div>

          <div className="space-y-1 pl-2 border-l-2 border-muted">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 group py-1"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={(checked) =>
                    handleToggleSubtask(subtask.id, checked as boolean)
                  }
                  className="h-3.5 w-3.5"
                />
                <span
                  className={`text-sm flex-1 ${
                    subtask.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {subtask.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {isAdding ? (
        <div className="flex items-center gap-2 pl-2">
          <Input
            placeholder="Subtask title..."
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="sm" className="h-8" onClick={handleAddSubtask}>
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => {
              setIsAdding(false);
              setNewSubtask("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add subtask
        </Button>
      )}
    </div>
  );
};

export default SubtaskList;
