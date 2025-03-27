import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PingPong from "@/pages/PingPong";

/**
 * Main Router component
 * Handles navigation between different pages
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ping-pong" component={PingPong} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Main App component
 * Sets up global providers and renders the router
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
