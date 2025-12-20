import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Trash2,
  LogOut,
  Camera,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { taskApi } from "@/lib/api/task";
import { userApi } from "@/lib/api/user";
import { getAvatarUrl } from "@/lib/avatar";

const Settings: React.FC = () => {
  const {
    darkMode,
    setDarkMode,
    setTasks,
    user,
    signOut,
    profilePicture,
    setProfilePicture,
    displayName,
    setDisplayName,
  } = useApp();

  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState<string>("");
  const [profileEmail, setProfileEmail] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string>("");

  useEffect(() => {
    // Redirect to login if not logged in
    if (!user) {
      window.location.hash = "/login";
    }
  }, [user]);

  const getProfileUser = async () => {
    if (user) {
      setLoading(true);
      try {
        const dataUser = await userApi.getCurrentUser();
        setProfileName(dataUser.name);
        setProfileEmail(dataUser.email);
        setProfileAvatar(dataUser.avatarUrl);
      } catch (error: any) {
        toast.error(error.message || "Failed to get profile user");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getProfileUser();
  }, [user, setProfileName]);

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all tasks? This action cannot be undone."
      )
    ) {
      setClearing(true);
      try {
        const tasks = await taskApi.getTask();

        await Promise.all(tasks.map((task) => taskApi.deleteTask(task.id)));

        setTasks([]);
        toast.success("All tasks have been cleared");
      } catch (error: any) {
        toast.error(error.message || "Failed to clear tasks");
      } finally {
        setClearing(false);
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setSaving(true);

      await userApi.updateCurrentUser({
        avatarUrl: "",
      });

      setProfileAvatar("");

      toast.success("Profile picture removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove profile picture");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Image only");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }

    try {
      if (profileAvatar !== null) {
        await handleRemoveProfilePicture();
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await userApi.uploadAvatar(formData);
      setProfileAvatar(res.avatarUrl);

      toast.success("Avatar updated!");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    }
  };

  const handlerSaveDisplayName = async () => {
    if (profileName.trim()) {
      try {
        setSaving(true);
        await userApi.updateCurrentUser({ name: profileName });
        toast.success("Display name updated!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update display name");
      } finally {
        setSaving(false);
      }
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:py-12 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl mb-4 shadow-lg">
            <SettingsIcon
              size={32}
              className="text-primary-foreground sm:w-10 sm:h-10"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Customize your experience
          </p>
        </header>

        {/* Settings Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6">
          {/* Profile Section */}
          <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User size={20} />
              Profile Information
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-lg">
                  {profileAvatar ? (
                    <img
                      src={getAvatarUrl(profileAvatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={`https://www.gravatar.com/avatar/?d=mp&s=200`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Upload Button Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={saving}
                >
                  <Camera size={24} className="text-white" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={saving}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <Label
                    htmlFor="displayName"
                    className="text-sm font-medium mb-2 block"
                  >
                    Display Name
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="displayName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1"
                      disabled={saving}
                    />
                    <Button
                      onClick={handlerSaveDisplayName}
                      size="sm"
                      disabled={
                        saving ||
                        !profileName.trim() ||
                        profileName === displayName
                      }
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {user?.email}
                  </p>
                </div>

                {profileAvatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveProfilePicture}
                    className="w-full sm:w-auto"
                    disabled={saving}
                  >
                    Remove Picture
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-task-bg rounded-lg border border-task-border">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon size={24} className="text-primary" />
              ) : (
                <Sun size={24} className="text-primary" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">
                  {darkMode ? "Switch to light theme" : "Switch to dark theme"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="min-w-[80px]"
            >
              {darkMode ? "Light" : "Dark"}
            </Button>
          </div>

          {/* Clear All Tasks */}
          <div className="flex items-center justify-between p-4 bg-task-bg rounded-lg border border-task-border">
            <div className="flex items-center gap-3">
              <Trash2 size={24} className="text-destructive" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Clear All Tasks
                </h3>
                <p className="text-sm text-muted-foreground">
                  Delete all tasks permanently
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              className="min-w-[80px]"
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear"}
            </Button>
          </div>

          {/* Sign Out */}
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <Button
              variant="destructive"
              size="sm"
              onClick={signOut}
              className="w-full"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>

          {/* App Info */}
          <div className="mt-4 p-4 bg-task-bg rounded-lg border border-task-border">
            <h3 className="font-semibold text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground">
              Task Manager App v1.0
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              A simple and elegant task management application
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
