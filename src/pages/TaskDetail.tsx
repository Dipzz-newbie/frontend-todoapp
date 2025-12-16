import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { taskApi } from "@/lib/api/task";

const TaskDetail: React.FC = () => {
  const { tasks, setTasks, user } = useApp();
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.hash = "/login";
      return;
    }

    // Extract task ID from hash
    const hash = window.location.hash;
    const match = hash.match(/\/tasks\/([^/]+)$/);
    if (match) {
      setTaskId(match[1]);
    }
    setLoading(false);
  }, [user]);

  const task = tasks.find((t) => t.id === taskId);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async() => {
    if(!taskId) return;

    setDeleting(true);

    try{
      await taskApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully!");
      window.location.hash = "/";
    }catch(error: any) {
      toast.error(error.message || "Failed to delete tasks");
    }finally{
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    window.location.hash = `/tasks/${taskId}/edit`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
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
          onClick={() => (window.location.hash = "/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <Card className="shadow-xl border-border">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl sm:text-2xl break-words">
                {task.title}
              </CardTitle>
              {task.completed && (
                <span className="shrink-0 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Completed
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-foreground">
                {task.desc || <span className="text-muted-foreground italic">No description</span>}
              </p>
            </div>

            {/* Timestamps */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>Created: {formatDate(task.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>Updated: {formatDate(task.updatedAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex-1 h-11 rounded-xl gap-2"
                disabled={task.completed || deleting}
              >
                <Edit2 size={18} />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 h-11 rounded-xl gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Yes, delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetail;