import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AppContextType, Task, ThemeColors } from "@/types";
import { TaskResponse } from "@/types/task-interface";
import { authApi } from "@/lib/api/auth";
import { userApi } from "@/lib/api/user";
import { taskApi } from "@/lib/api/task";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [displayName, setDisplayName] = useState<string>("");

  const [profilePicture, setProfilePicture] = useState<string>("");

  const clearUserCache = () => {
    setUser(null);
    setSession(null);
    setTasks([]);
    setDisplayName("");
    setProfilePicture("");

    localStorage.removeItem("displayName");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("tasks");
  };

  const convertApiTask = (apiTask: TaskResponse): Task => ({
    id: apiTask.id,
    title: apiTask.title,
    desc: apiTask.desc || undefined,
    completed: apiTask.completed,
    createdAt: new Date(apiTask.createdAt).getTime(),
    updatedAt: new Date(apiTask.updatedAt).getTime(),
  });


  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authApi.isAuthenticated()) {
          clearUserCache();
          return;
        }

        const token = authApi.getAccessToken();
        if (!token) {
          clearUserCache();
          return;
        }

        const userData = await userApi.getCurrentUser();

        setUser(userData);
        setSession({ user: userData });
        setDisplayName(userData.name || "");

        if (userData.avatarUrl) {
          setProfilePicture(userData.avatarUrl);
        }
      } catch (err) {
        await authApi.logout();
        clearUserCache();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const apiTasks = await taskApi.getTask();
        setTasks(apiTasks.map(convertApiTask));
      } catch (err: any) {
        // task kosong = NORMAL
        if (err?.message?.includes("404")) {
          setTasks([]);
          return;
        }

        // token invalid
        if (err?.message?.includes("401")) {
          await authApi.logout();
          clearUserCache();
          window.location.hash = "/login";
          return;
        }

        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [user, loading]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem("displayName", displayName);
  }, [displayName, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem("profilePicture", profilePicture);
  }, [profilePicture, user]);

  const theme: ThemeColors = {
    bg: "hsl(var(--background))",
    surface: "hsl(var(--card))",
    surfaceHover: "hsl(var(--task-hover))",
    border: "hsl(var(--border))",
    text: "hsl(var(--foreground))",
    textSecondary: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--primary))",
  };

  const signOut = async () => {
    await authApi.logout();
    clearUserCache();
    window.location.hash = "/login";
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        setTasks,
        darkMode,
        setDarkMode,
        theme,
        user,
        setUser,
        session,
        setSession,
        signOut,
        profilePicture,
        setProfilePicture,
        displayName,
        setDisplayName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
