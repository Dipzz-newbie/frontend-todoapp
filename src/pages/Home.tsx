import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import TaskCard from "@/components/TaskCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import {
  CheckCircle2,
  Search,
  ArrowUpDown,
  CalendarIcon,
  X,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { taskApi } from "@/lib/api/task";
import { TaskResponse } from "@/types/task-interface";
import { Task } from "@/types";
import { toast } from "sonner";

type SortOption =
  | "createdAt-desc"
  | "createdAt-asc"
  | "updatedAt-desc"
  | "updatedAt-asc";

const Home: React.FC = () => {
  const { tasks, setTasks, user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("createdAt-desc");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.hash = "/login";
    }
  }, [user]);

  const fetchTask = async () => {
    if (user) {
      setLoading(true);

      try {
        const apiTasks = await taskApi.getTask();
        const convertedTask: Task[] = apiTasks.map((t: TaskResponse) => ({
          id: t.id,
          title: t.title,
          desc: t.desc || undefined,
          completed: t.completed,
          createdAt: new Date(t.createdAt).getTime(),
          updatedAt: new Date(t.updatedAt).getTime(),
        }));
        setTasks(convertedTask);
      } catch (error: any) {
        toast.error(error.message || "failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTask();
  }, [user, setTasks]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time in WIB (UTC+7)
  const formatWIBTime = useCallback((date: Date) => {
    const wibOffset = 7 * 60; // WIB is UTC+7 in minutes
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const wibDate = new Date(utc + wibOffset * 60000);
    return wibDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Format date in English
  const formatFullDate = useCallback((date: Date) => {
    const wibOffset = 7 * 60;
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const wibDate = new Date(utc + wibOffset * 60000);
    return wibDate.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  const toggleComplete = async(id: string) => {
    try {
      const task = tasks.find((t) => t.id === t.id);
      if (!task) return;

      setTasks(
        tasks.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, updatedAt: Date.now() }
            : t
        )
      );

      await taskApi.updateTask(id, {
        title: task.title,
        desc: task.desc,
      });

      toast.success(task.completed ? "Task marked as incompleted" : "Task marked as complated!")
    } catch (error: any) {
      setTasks(tasks)
      toast.error(error.message || "Failed to update task")
    }
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter by title
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task) => task.title.toLowerCase().includes(query));
    }

    // Date/time filter
    if (selectedDate) {
      result = result.filter((task) => {
        const createdDate = new Date(task.createdAt);
        const updatedDate = new Date(task.updatedAt);

        const matchesCreatedDate =
          createdDate.getFullYear() === selectedDate.getFullYear() &&
          createdDate.getMonth() === selectedDate.getMonth() &&
          createdDate.getDate() === selectedDate.getDate();

        const matchesUpdatedDate =
          updatedDate.getFullYear() === selectedDate.getFullYear() &&
          updatedDate.getMonth() === selectedDate.getMonth() &&
          updatedDate.getDate() === selectedDate.getDate();

        if (selectedTime) {
          const [hours, minutes] = selectedTime.split(":").map(Number);
          
          const matchesCreatedTime =
            matchesCreatedDate &&
            createdDate.getHours() === hours &&
            createdDate.getMinutes() === minutes;

          const matchesUpdatedTime =
            matchesUpdatedDate &&
            updatedDate.getHours() === hours &&
            updatedDate.getMinutes() === minutes;

          return matchesCreatedTime || matchesUpdatedTime;
        }

        return matchesCreatedDate || matchesUpdatedDate;
      });
    }

    // Sort
    const [field, order] = sortOption.split("-") as ["createdAt" | "updatedAt", "asc" | "desc"];
    result.sort((a, b) => {
      const diff = a[field] - b[field];
      return order === "asc" ? diff : -diff;
    });

    return result;
  }, [tasks, searchQuery, sortOption, selectedDate, selectedTime]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleCreateTask = () => {
    window.location.hash = "/tasks/new";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Greeting Section */}
        <div className="mb-6 sm:mb-8 animate-greeting-in">
          <p className="text-base sm:text-lg text-foreground mb-2 font-medium">
            Hi there! Do you have anything scheduled to write today? 👋
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} className="shrink-0" />
              <span className="text-sm sm:text-base font-medium">
                {formatWIBTime(currentTime)} WIB
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-light">
              {formatFullDate(currentTime)}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          {/* Search and Filter */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className="pl-10 h-11 rounded-xl"
                />
              </div>
              <Select
                value={sortOption}
                onValueChange={(v) => setSortOption(v as SortOption)}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl">
                  <ArrowUpDown size={16} className="mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">
                    Created (Newest)
                  </SelectItem>
                  <SelectItem value="createdAt-asc">
                    Created (Oldest)
                  </SelectItem>
                  <SelectItem value="updatedAt-desc">
                    Updated (Newest)
                  </SelectItem>
                  <SelectItem value="updatedAt-asc">
                    Updated (Oldest)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[200px] h-11 rounded-xl justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "dd MMM yyyy", { locale: id })
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                placeholder="Select time"
                className="w-full sm:w-[140px] h-11 rounded-xl"
                disabled={!selectedDate}
              />

              {selectedDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearDateFilter}
                  className="h-11 w-11 rounded-xl shrink-0"
                >
                  <X size={18} />
                </Button>
              )}
            </div>

            {/* Active Date Filter Display */}
            {selectedDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
                <CalendarIcon size={14} />
                <span>
                  Showing tasks on:{" "}
                  {format(selectedDate, "dd MMMM yyyy", { locale: id })}
                  {selectedTime && ` at ${selectedTime}`}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} completed
              </span>
              <div className="flex gap-2">
                <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{
                      width: `${
                        totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
                  <CheckCircle2 size={32} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {tasks.length === 0
                    ? "No tasks yet. Tap the + button to create your first task!"
                    : "No tasks found matching your search."}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredAndSortedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    index={index}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs sm:text-sm text-muted-foreground">
          <p>Click on tasks to view details • Tap checkbox to complete</p>
        </footer>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleCreateTask} />
    </div>
  );
};

export default Home;
