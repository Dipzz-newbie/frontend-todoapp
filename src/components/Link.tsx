import React from "react";

export const Link: React.FC<{
  to: string;
  children: React.ReactNode;
  className?: string;
}> = ({ to, children, className }) => (
  <a href={`#${to}`} className={className}>
    {children}
  </a>
);
