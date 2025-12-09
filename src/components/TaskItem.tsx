import React, { useState } from "react";
import { Check, Edit2, Save, Trash2, X, Calendar, Clock } from "lucide-react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, desc?: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.desc || "");

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim(), editDesc.trim() || undefined);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.desc || "");
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <li
      className={cn(
        "group flex flex-col",
        "bg-card hover:bg-accent/5",
        "border border-border rounded-xl p-4",
        "shadow-sm hover:shadow-md",
        "transition-all duration-300 ease-in-out",
        "transform hover:-translate-y-0.5"
      )}
    >
      {/* Header with checkbox and actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5",
              "flex items-center justify-center",
              "transition-all duration-300",
              task.completed
                ? "bg-primary border-primary scale-110"
                : "border-muted-foreground hover:border-primary hover:scale-110"
            )}
            aria-label={
              task.completed ? "Mark as incomplete" : "Mark as complete"
            }
            disabled={isEditing}
          >
            {task.completed && (
              <Check size={16} className="text-primary-foreground" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    "border border-primary bg-background",
                    "text-sm font-medium text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary"
                  )}
                  placeholder="Title"
                  autoFocus
                />
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={cn(
                    "w-full min-h-[60px] rounded-lg",
                    "border border-primary bg-background",
                    "text-sm text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  )}
                  placeholder="Description (optional)"
                />
              </div>
            ) : (
              <div>
                <h3
                  className={cn(
                    "text-sm sm:text-base font-semibold transition-all duration-300",
                    "break-words",
                    task.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  )}
                >
                  {task.title}
                </h3>
                {task.desc && (
                  <p
                    className={cn(
                      "text-xs sm:text-sm mt-1 transition-all duration-300",
                      "break-words",
                      task.completed
                        ? "line-through text-muted-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {task.desc}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg",
                  "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30",
                  "transition-all duration-200"
                )}
                aria-label="Save changes"
              >
                <Save size={18} />
              </button>
              <button
                onClick={handleCancel}
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg",
                  "text-muted-foreground hover:bg-muted",
                  "transition-all duration-200"
                )}
                aria-label="Cancel editing"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg",
                  "text-primary hover:bg-primary/10",
                  "transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  "focus:opacity-100"
                )}
                aria-label="Edit task"
                disabled={task.completed}
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg",
                  "text-destructive hover:bg-destructive/10",
                  "transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  "focus:opacity-100"
                )}
                aria-label="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer with timestamps */}
      {!isEditing && (
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>Created: {formatDate(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>Updated: {formatDate(task.updatedAt)}</span>
          </div>
        </div>
      )}
    </li>
  );
};

export default TaskItem;
