"use client";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        {icon && <div className="text-primary">{icon}</div>}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
