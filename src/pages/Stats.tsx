import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BarChart3, CheckCircle2, Circle, TrendingUp } from "lucide-react";

const Stats: React.FC = () => {
  const { tasks, user } = useApp();

  useEffect(() => {
    // Redirect to login if not logged in
    if (!user) {
      window.location.hash = '/login';
    }
  }, [user]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;
  const completionRate = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const stats = [
    { label: "Total Tasks", value: tasks.length, icon: BarChart3, color: "text-primary" },
    { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-green-500" },
    { label: "Active", value: activeCount, icon: Circle, color: "text-blue-500" },
    { label: "Completion Rate", value: `${completionRate.toFixed(0)}%`, icon: TrendingUp, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl mb-4 shadow-lg">
            <BarChart3 size={32} className="text-primary-foreground sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Statistics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your productivity overview
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl shadow-xl border border-border p-6 hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon size={24} className={stat.color} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Card */}
        {tasks.length > 0 && (
          <div className="mt-6 bg-card rounded-2xl shadow-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Overall Progress</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Completed: {completedCount}</span>
                <span>Remaining: {activeCount}</span>
              </div>
              <div className="h-4 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {completionRate.toFixed(1)}% of tasks completed
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {tasks.length > 0 && (
          <div className="mt-6 bg-card rounded-2xl shadow-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Recent Tasks</h2>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-task-bg rounded-lg border border-task-border">
                  {task.completed ? (
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;