import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => {
      onClick();
    }, 150);
  };

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={() => setIsPressed(false)}
      className={cn(
        "fixed bottom-24 right-6 z-40",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-200 ease-out",
        "hover:scale-110",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "fab-enter",
        isPressed && "animate-bounce-in"
      )}
      aria-label="Create new task"
    >
      <Plus 
        size={24} 
        strokeWidth={2.5} 
        className={cn(
          "transition-transform duration-200",
          isPressed && "rotate-90"
        )}
      />
    </button>
  );
};

export default FloatingActionButton;
