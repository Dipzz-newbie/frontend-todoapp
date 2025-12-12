import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AppContextType, Task, ThemeColors } from "@/types";
import { authApi } from "@/lib/api/auth";
import { userAPi } from "@/lib/api/user";
import { taskApi } from "@/lib/api/task";
import { TaskResponse } from "@/models/tasks-interface";

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

  const convertApiTask = (apiTask: TaskResponse): Task => ({
    id: apiTask.id,
    title: apiTask.title,
    desc: apiTask.desc,
    completed: apiTask.complatedAt,
    createdAt: new Date(apiTask.createdAt).getTime(),
    updatedAt: new Date(apiTask.updatedAt).getTime(),
  });

  // Authentication effect
  const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userData = await userAPi.getCurrentUser();
          setUser(userData);
          setSession({ user: userData });
          setDisplayName(userData.name);
          if (userData.avatarUrl) {
            setProfilePicture(userData.avatarUrl);
          }
        } catch (err) {
          console.log(err);

          try {
            await authApi.refreshToken();
            const userData = await userAPi.getCurrentUser();
            setUser(userData);
            setSession({ user: userData });
          } catch (refreshError) {
            await authApi.logout();
            setUser(null);
            setSession(null);
          }
        }
      }
    };

     // Fetch tasks when user is authenticated
    const fetchTask = async() => {
      if(user) {
        try{
          const apiTask = await taskApi.getTask();
          const convertedTask = apiTask.map(convertApiTask);
          setTasks(convertedTask);
        }catch(err) {
          console.log("Failed to fetch tasks: ", err);
        }
      }
    }

  useEffect(() => {
    checkAuth();
  }, []);
  
  useEffect(() => {
    fetchTask();
  }, [user]);

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
    await supabase.auth.signOut();
    // Clear profile data on sign out
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
        session,
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
