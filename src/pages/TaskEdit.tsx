import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { taskApi } from "@/lib/api/task";

const TaskEdit: React.FC = () => {
  const { tasks, setTasks, user } = useApp();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTasks, setFetchingTasks] = useState(true);

  useEffect(() => {
    if (!user) {
      window.location.hash = "/login";
      return;
    }

    // Extract task ID from hash
    const hash = window.location.hash;
    const match = hash.match(/\/tasks\/([^/]+)\/edit$/);
    if (match) {
      const id = match[1];
      setTaskId(id);
      // Fetch task from API
      const fetchTask = async () => {
        try {
          const apiTask = await taskApi.getTaskById(id);
          setTitle(apiTask.title);
          setDesc(apiTask.desc || "");
        } catch (error: any) {
          toast.error(error.message || "Failed to load task");
        } finally {
          setFetchingTasks(false);
        }
      };
      fetchTask();
    } else {
      setFetchingTasks(false);
    }
  }, [user, tasks]);

  const task = tasks.find((t) => t.id === taskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!taskId) return;

    setLoading(true);

    try {
      const updatedTask = await taskApi.updateTask(taskId, {
        title: title.trim(),
        desc: desc.trim() || undefined,
      });

      // Update local state
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                title: updatedTask.title,
                desc: updatedTask.desc || undefined,
                updatedAt: new Date(updatedTask.updatedAt).getTime(),
              }
            : t
        )
      );

      toast.success("Task updated successfully!");
      window.location.hash = `/tasks/${taskId}`;
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTasks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task && !fetchingTasks) {
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
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
                <CheckCircle2 size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Task not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto page-enter">
        <Button
          variant="ghost"
          onClick={() => (window.location.hash = `/tasks/${taskId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={18} />
          Back to Task
        </Button>

        <Card className="shadow-xl border-border">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Edit Task</CardTitle>
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
                  onClick={() => (window.location.hash = `/tasks/${taskId}`)}
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
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
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

export default TaskEdit;
