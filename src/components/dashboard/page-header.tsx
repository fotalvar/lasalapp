import { cn } from "@/lib/utils";
import React from "react";

type PageHeaderProps = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, className, children }: PageHeaderProps) {
  return (
    <div className={cn("px-4 md:px-6 pt-6", className)}>
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
}
