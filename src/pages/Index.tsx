import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Calendar, Folder } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Make Every Day Meaningful
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A calm space to track your habits, meet deadlines, and organize your thoughts.
            Simple. Motivating. Built for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-all">
            <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold">Daily Habits</h3>
            <p className="text-muted-foreground">
              Build meaningful habits with daily tasks. Track streaks and celebrate small wins.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-all">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Deadline Tasks</h3>
            <p className="text-muted-foreground">
              Keep track of important deadlines. Never miss what matters most to you.
            </p>
          </div>

          <div className="text-center space-y-3 p-6 rounded-lg bg-card border hover:shadow-lg transition-all">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/30 flex items-center justify-center">
              <Folder className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Organized Notes</h3>
            <p className="text-muted-foreground">
              Save links and notes in categories. Your personal knowledge base, beautifully organized.
            </p>
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="text-center mt-16 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground italic">
            "A small win is still a win. Keep going 🚀"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
