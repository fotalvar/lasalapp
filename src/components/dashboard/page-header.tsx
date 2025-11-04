import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("border-b bg-card/50", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight font-headline">{title}</h1>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
