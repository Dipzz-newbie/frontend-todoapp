import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/context/AppContext";
import { Router, Route } from "@/components/Router";
import { Navigation } from "@/components/Navigation";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskNew from "./pages/TaskNew";
import TaskDetail from "./pages/TaskDetail";
import TaskEdit from "./pages/TaskEdit";

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Route path="/" component={Home} />
            <Route path="/stats" component={Stats} />
            <Route path="/settings" component={Settings} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/tasks/new" component={TaskNew} />
            <Route path="/tasks/:id" component={TaskDetail} />
            <Route path="/tasks/:id/edit" component={TaskEdit} />
          </Router>
          <Navigation />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </>
);

export default App;
