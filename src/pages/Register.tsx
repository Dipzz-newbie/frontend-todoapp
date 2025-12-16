import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { Link } from "@/components/Link";
import { useApp } from "@/context/AppContext";
import { authApi } from "@/lib/api/auth";
import { userApi } from "@/lib/api/user";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser, setSession } = useApp();

  // Check if user is already logged in
  const checkAuth = async () => {
    if (authApi.isAuthenticated()) {
      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        setSession({ user: userData });
        window.location.hash = "/";
      } catch (error) {
        // Token invalid, stay on register
        await authApi.logout();
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, [setUser, setSession]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      //register user
      await authApi.register({ name, email, password });

      const loginResponse = await authApi.login({ email, password });

      setUser(loginResponse);
      setSession({ user: loginResponse });

      toast({
        title: "Success",
        description: "Account created successfully!",
      });

      window.location.hash = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md animate-slide-in-right">
        {/* Card Container */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-8 space-y-6 transition-all hover:shadow-accent/10 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/70 mb-2 shadow-lg shadow-accent/30">
              <UserPlus className="w-10 h-10 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Join Us Today
            </h1>
            <p className="text-muted-foreground text-base">
              Create your account to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-accent transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-accent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                At least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-accent transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Already a member?
              </span>
            </div>
          </div>

          {/* Toggle to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Sign in to your account
              <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                Sign in →
              </span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          By continuing, you agree to our{" "}
          <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Terms
          </span>{" "}
          and{" "}
          <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
