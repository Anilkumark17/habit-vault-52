import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Clock, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import SubtaskList from "./SubtaskList";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: "DAILY" | "DEADLINE";
  priority: "urgent" | "normal" | "low";
  deadline: string | null;
  completed: boolean;
  time_of_day: string | null;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onRefresh?: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "destructive";
    case "low":
      return "secondary";
    default:
      return "default";
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "🔴 Urgent";
    case "low":
      return "🟢 Low";
    default:
      return "🟡 Normal";
  }
};

const TaskList = ({ tasks, onToggle, onDelete, onEdit, onRefresh }: TaskListProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [subtasksMap, setSubtasksMap] = useState<Record<string, Subtask[]>>({});

  useEffect(() => {
    fetchAllSubtasks();
  }, [tasks]);

  const fetchAllSubtasks = async () => {
    if (tasks.length === 0) return;

    const taskIds = tasks.map((t) => t.id);
    const { data, error } = await supabase
      .from("subtasks")
      .select("*")
      .in("task_id", taskIds)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching subtasks:", error);
      return;
    }

    const map: Record<string, Subtask[]> = {};
    data?.forEach((subtask: any) => {
      if (!map[subtask.task_id]) map[subtask.task_id] = [];
      map[subtask.task_id].push(subtask);
    });
    setSubtasksMap(map);
  };

  const handleSubtaskChange = async (taskId: string) => {
    await fetchAllSubtasks();

    // Check if all subtasks are completed for auto-complete
    const { data: subtasks } = await supabase
      .from("subtasks")
      .select("*")
      .eq("task_id", taskId);

    if (subtasks && subtasks.length > 0) {
      const allCompleted = subtasks.every((s: any) => s.completed);
      const task = tasks.find((t) => t.id === taskId);
      
      if (task && allCompleted && !task.completed) {
        onToggle(taskId, true);
      }
    }

    onRefresh?.();
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const subtasks = subtasksMap[task.id] || [];
        const isExpanded = expandedTasks.has(task.id);
        const subtaskCount = subtasks.length;
        const completedSubtasks = subtasks.filter((s) => s.completed).length;

        return (
          <Card
            key={task.id}
            className="p-4 transition-all hover:shadow-md"
            style={{
              opacity: task.completed ? 0.6 : 1,
              borderLeft: task.completed
                ? "4px solid hsl(var(--success))"
                : "4px solid transparent",
            }}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={`font-semibold ${
                      task.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  {subtaskCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {completedSubtasks}/{subtaskCount} subtasks
                    </Badge>
                  )}
                </div>

                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {task.type === "DEADLINE" && task.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(task.deadline), "MMM d, yyyy")}</span>
                    </div>
                  )}

                  {task.type === "DAILY" && task.time_of_day && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.time_of_day}</span>
                    </div>
                  )}
                </div>

                {/* Subtasks Section */}
                {(isExpanded || subtaskCount === 0) && (
                  <SubtaskList
                    taskId={task.id}
                    subtasks={subtasks}
                    onSubtaskChange={() => handleSubtaskChange(task.id)}
                  />
                )}
              </div>

              <div className="flex gap-1">
                {subtaskCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(task.id)}
                    className="hover:bg-secondary"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="hover:bg-secondary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskList;
