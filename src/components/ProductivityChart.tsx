import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, ListTodo, TrendingUp, Target } from "lucide-react";

interface Task {
  id: string;
  completed: boolean;
  created_at?: string;
  completed_at?: string | null;
  type: "DAILY" | "DEADLINE";
}

interface ProductivityChartProps {
  tasks: Task[];
}

const ProductivityChart = ({ tasks }: ProductivityChartProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dailyTasks = tasks.filter((t) => t.type === "DAILY");
  const deadlineTasks = tasks.filter((t) => t.type === "DEADLINE");

  const dailyCompleted = dailyTasks.filter((t) => t.completed).length;
  const deadlineCompleted = deadlineTasks.filter((t) => t.completed).length;

  const barData = [
    {
      name: "Daily",
      total: dailyTasks.length,
      completed: dailyCompleted,
    },
    {
      name: "Deadline",
      total: deadlineTasks.length,
      completed: deadlineCompleted,
    },
  ];

  const pieData = [
    { name: "Completed", value: completedTasks, color: "hsl(162, 73%, 46%)" },
    { name: "Pending", value: pendingTasks, color: "hsl(220, 13%, 91%)" },
  ];

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: Target,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: completionRate >= 50 ? "text-success" : "text-destructive",
      bg: completionRate >= 50 ? "bg-success/10" : "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Tasks by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="total" fill="hsl(220, 13%, 85%)" name="Total" radius={4} />
                <Bar dataKey="completed" fill="hsl(162, 73%, 46%)" name="Completed" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Overall Progress</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-3xl font-bold">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductivityChart;
