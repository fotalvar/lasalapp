'use client'

import {
  LayoutDashboard,
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  Film,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/team", icon: Users, label: "Team", color: "text-sky-500" },
  { href: "/dashboard/programming", icon: Theater, label: "Programming", color: "text-rose-500" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar", color: "text-amber-500" },
  { href: "/dashboard/expenses", icon: Banknote, label: "Expenses", color: "text-emerald-500" },
  { href: "/dashboard/meetings", icon: BookUser, label: "Meetings", color: "text-indigo-500" },
  { href: "/dashboard/todos", icon: ListTodo, label: "To-Do List", color: "text-pink-500" },
  { href: "/dashboard/productions", icon: Film, label: "Productions", color: "text-teal-500" },
  { href: "/dashboard/ideas", icon: Lightbulb, label: "Ideas", color: "text-orange-500" },
];

export default function DashboardPage() {
  return (
    <div className="flex-1">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {navItems.map((item) => (
                <Link href={item.href} key={item.href}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-col items-center justify-center text-center p-4">
                            <item.icon className={cn("h-8 w-8 mb-2", item.color)} />
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
