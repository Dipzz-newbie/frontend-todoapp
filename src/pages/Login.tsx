// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import { userApi } from '@/lib/api/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { Link } from '@/components/Link';
import { useApp } from '@/context/AppContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser, setSession } = useApp();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (authApi.isAuthenticated()) {
        try {
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          setSession({ user: userData });
          window.location.hash = '/';
        } catch (error) {
          // Token invalid, stay on login
          await authApi.logout();
        }
      }
    };
    
    checkAuth();
  }, [setUser, setSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Update context
      setUser(response);
      setSession({ user: response });

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      
      window.location.hash = '/';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="w-full max-w-md animate-slide-in-left">
        {/* Card Container */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-border/50 p-8 space-y-6 transition-all hover:shadow-primary/10 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-2 shadow-lg shadow-primary/30">
              <LogIn className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-12 rounded-xl border-border/50 focus:border-primary transition-all"
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
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
              <span className="bg-card px-2 text-muted-foreground">New here?</span>
            </div>
          </div>

          {/* Toggle to Register */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Create your account
              <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">Sign up →</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          By continuing, you agree to our{' '}
          <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;