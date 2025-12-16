import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { taskApi } from "@/lib/api/task";

const TaskNew: React.FC = () => {
  const { tasks, setTasks, user } = useApp();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.hash = "/login";
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);

    try {
      const newTask = await taskApi.createTask({
        title: title.trim(),
        desc: desc.trim() || undefined,
      });

      const convertedApi = {
        id: newTask.id,
        title: newTask.title,
        desc: newTask.desc,
        completed: newTask.completed,
        createdAt: new Date(newTask.createdAt).getTime(),
        updatedAt: new Date(newTask.updatedAt).getTime(),
      };

      setTasks([...tasks, convertedApi]);
      toast.success("Task created successfully!");
      window.location.hash = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to create new task");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto page-enter">
        <Button
          variant="ghost"
          onClick={() => (window.location.hash = "/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <Card className="shadow-xl border-border">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="h-11 rounded-xl"
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="desc" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Enter task description (optional)..."
                  className="min-h-[120px] rounded-xl resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (window.location.hash = "/")}
                  className="flex-1 h-11 rounded-xl"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-11 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskNew;