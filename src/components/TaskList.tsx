import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";

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

const TaskList = ({ tasks, onToggle, onDelete, onEdit }: TaskListProps) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className="p-4 transition-all hover:shadow-md"
          style={{ 
            opacity: task.completed ? 0.6 : 1,
            borderLeft: task.completed ? "4px solid hsl(var(--success))" : "4px solid transparent"
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
                <h3 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
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
            </div>

            <div className="flex gap-1">
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
      ))}
    </div>
  );
};

export default TaskList;
