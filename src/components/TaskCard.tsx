import React from "react";
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Check, Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  index?: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, index = 0 }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    window.location.hash = `/tasks/${task.id}`;
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id);
  };

  return (
    <li
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 80}ms` }}
      className={cn(
        "group flex flex-col cursor-pointer",
        "bg-card hover:bg-accent/5",
        "border border-border rounded-xl p-4",
        "shadow-sm",
        "card-interactive stagger-item",
        "hover:shadow-lg"
      )}
    >
      {/* Header with checkbox and title */}
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleClick}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5",
            "flex items-center justify-center",
            "transition-all duration-200",
            task.completed
              ? "bg-primary border-primary scale-110"
              : "border-muted-foreground hover:border-primary hover:scale-110"
          )}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && (
            <Check size={16} className="text-primary-foreground animate-fade-in-scale" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-sm sm:text-base font-semibold transition-all duration-200",
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
                "text-xs sm:text-sm mt-1 transition-all duration-200",
                "break-words line-clamp-2",
                task.completed
                  ? "line-through text-muted-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {task.desc}
            </p>
          )}
        </div>
      </div>

      {/* Footer with timestamps */}
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
    </li>
  );
};

export default TaskCard;
