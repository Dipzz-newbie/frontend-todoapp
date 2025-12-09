import React, { useState, useRef, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface TaskInputProps {
  onAdd: (title: string, desc?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), desc.trim() || undefined);
    setTitle("");
    setDesc("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Title (required)"
          className={cn(
            "flex-1 px-4 py-3 rounded-xl",
            "border border-input bg-background",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-all duration-200",
            "text-sm sm:text-base"
          )}
          aria-label="Task title"
        />
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className={cn(
            "flex-shrink-0 p-3 rounded-xl",
            "bg-primary text-primary-foreground",
            "hover:opacity-90 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            "shadow-md hover:shadow-lg"
          )}
          aria-label="Add task"
        >
          <Plus size={24} />
        </button>
      </div>
      <Textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
        className={cn(
          "min-h-[80px] rounded-xl",
          "border border-input bg-background",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "transition-all duration-200",
          "text-sm sm:text-base resize-none"
        )}
        aria-label="Task description"
      />
    </div>
  );
};

export default TaskInput;
