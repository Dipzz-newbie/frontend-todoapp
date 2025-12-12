export interface Task {
  id: string;
  title: string;
  desc?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
}

export interface AppContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  theme: ThemeColors;
  user: any;
  setUser: (u: any) => void;
  session: any;
  setSession: (s: any) => void;
  signOut: () => Promise<void>;
  profilePicture: string;
  setProfilePicture: React.Dispatch<React.SetStateAction<string>>;
  displayName: string;
  setDisplayName: React.Dispatch<React.SetStateAction<string>>;
}
