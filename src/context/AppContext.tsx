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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string>(() => {
    const saved = localStorage.getItem("profilePicture");
    return saved || "";
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    const saved = localStorage.getItem("displayName");
    return saved || "";
  });
  const [loading, setLoading] = useState(true);

  // Convert API TaskResponse to local Task type
  const convertApiTask = (apiTask: TaskResponse): Task => ({
    id: apiTask.id,
    title: apiTask.title,
    desc: apiTask.desc || undefined,
    completed: apiTask.completed,
    createdAt: new Date(apiTask.createdAt).getTime(),
    updatedAt: new Date(apiTask.updatedAt).getTime(),
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          setSession({ user: userData });
          setDisplayName(userData.name);
          if (userData.avatarUrl) {
            setProfilePicture(userData.avatarUrl);
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          // Try to refresh token
          try {
            await authApi.refreshToken();
            const userData = await userApi.getCurrentUser();
            setUser(userData);
            setSession({ user: userData });
          } catch (refreshError) {
            // If refresh fails, clear auth
            await authApi.logout();
            setUser(null);
            setSession(null);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch tasks when user is authenticated
  useEffect(() => {
    const fetchTasks = async () => {
      if (user && !loading) {
        try {
          const apiTasks = await taskApi.getTask();
          const convertedTasks = apiTasks.map(convertApiTask);
          setTasks(convertedTasks);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        }
      }
    };

    fetchTasks();
  }, [user, loading]);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Save profile picture to localStorage
  useEffect(() => {
    localStorage.setItem("profilePicture", profilePicture);
  }, [profilePicture]);

  // Save display name to localStorage
  useEffect(() => {
    localStorage.setItem("displayName", displayName);
  }, [displayName]);

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
    setUser(null);
    setSession(null);
    setTasks([]);
    setProfilePicture("");
    setDisplayName("");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("displayName");
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