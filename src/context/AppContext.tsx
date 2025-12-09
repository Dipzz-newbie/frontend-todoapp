import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AppContextType, Task, ThemeColors } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>(() => {
    const saved = localStorage.getItem("profilePicture");
    return saved || "";
  });
  const [displayName, setDisplayName] = useState<string>(() => {
    const saved = localStorage.getItem("displayName");
    return saved || "";
  });

  // Authentication effect
  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

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
