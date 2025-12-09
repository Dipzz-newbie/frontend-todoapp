import React, { useEffect, useState } from 'react';

interface RouteProps {
  path: string;
  component: React.ComponentType;
}

export const Route: React.FC<RouteProps> = () => null;

interface RouterProps {
  children: React.ReactNode;
}

const matchPath = (pattern: string, path: string): boolean => {
  // Handle exact matches
  if (pattern === path) return true;
  
  // Handle dynamic routes with :param
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  
  if (patternParts.length !== pathParts.length) return false;
  
  return patternParts.every((part, index) => {
    // Dynamic parameter (starts with :)
    if (part.startsWith(':')) return true;
    // Exact match required
    return part === pathParts[index];
  });
};

export const Router: React.FC<RouterProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(
    window.location.hash.slice(1) || '/'
  );

  useEffect(() => {
    const handleHashChange = () =>
      setCurrentPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Find the first matching route
  const matchedRoute = React.Children.toArray(children).find((child) => {
    if (React.isValidElement<RouteProps>(child)) {
      return matchPath(child.props.path, currentPath);
    }
    return false;
  });

  if (React.isValidElement<RouteProps>(matchedRoute)) {
    return <matchedRoute.props.component />;
  }

  return null;
};
