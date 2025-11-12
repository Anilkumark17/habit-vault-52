import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, Folder } from "lucide-react";
import TaskList from "@/components/TaskList";
import AddTaskDialog from "@/components/AddTaskDialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: "DAILY" | "DEADLINE";
  deadline: string | null;
  completed: boolean;
  completed_at: string | null;
  time_of_day: string | null;
}

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data as Task[]) || []);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          completed, 
          completed_at: completed ? new Date().toISOString() : null 
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed, completed_at: completed ? new Date().toISOString() : null }
          : task
      ));
    } catch (error: any) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error: any) {
      console.error("Error deleting task:", error);
    }
  };

  const dailyTasks = tasks.filter(task => task.type === "DAILY");
  const deadlineTasks = tasks.filter(task => task.type === "DEADLINE");

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Task Planner
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/categories")}
            >
              <Folder className="w-4 h-4 mr-2" />
              Categories
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Welcome back! 🌞</h2>
            <p className="text-muted-foreground mt-1">Let's make today meaningful</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
        </div>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="daily">Daily Tasks</TabsTrigger>
            <TabsTrigger value="deadline">Deadlines</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {loadingTasks ? (
              <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
            ) : dailyTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No daily tasks yet ✨
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create one and build a meaningful habit
                </p>
              </div>
            ) : (
              <TaskList
                tasks={dailyTasks}
                onToggle={handleTaskToggle}
                onDelete={handleTaskDelete}
              />
            )}
          </TabsContent>

          <TabsContent value="deadline" className="space-y-4">
            {loadingTasks ? (
              <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
            ) : deadlineTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No deadline tasks yet 🎯
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Set a goal with a deadline and achieve it
                </p>
              </div>
            ) : (
              <TaskList
                tasks={deadlineTasks}
                onToggle={handleTaskToggle}
                onDelete={handleTaskDelete}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onTaskAdded={() => {
          fetchTasks();
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
