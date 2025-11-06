import { cn } from "@/lib/utils";
import React from "react";

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className={cn("bg-card/50 pb-6", className)}>
      <div className="px-6">
        <h1 className="text-2xl font-bold tracking-tight font-headline">{title}</h1>
      </div>
      {children && <div className="px-6">{children}</div>}
    </div>
  );
}
