"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Theater,
  Calendar,
  Banknote,
  BookUser,
  ListTodo,
  Loader2,
  User,
  LogOut,
  Shield,
  Ticket,
  ExternalLink,
  PlusCircle,
  List,
  Home,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/firebase";
import { TeamUserProvider, useTeamUser } from "@/context/team-user-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as LucideIcons from "lucide-react";
import { signOut } from "firebase/auth";
import type { TeamMember } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/firebase";
import AdminDialog from "@/components/dashboard/admin/admin-dialog";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Principal",
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    href: "/dashboard/programming",
    icon: Theater,
    label: "Programación",
    color: "text-rose-500",
    bgColor: "bg-rose-100",
  },
  {
    href: "/dashboard/calendar",
    icon: Calendar,
    label: "Calendario",
    color: "text-amber-500",
    bgColor: "bg-amber-100",
  },
  {
    href: "/dashboard/expenses",
    icon: Banknote,
    label: "Gastos",
    color: "text-emerald-500",
    bgColor: "bg-emerald-100",
  },
  {
    href: "/dashboard/meetings",
    icon: BookUser,
    label: "Reuniones",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
  {
    href: "/dashboard/tasks",
    icon: ListTodo,
    label: "Tareas",
    color: "text-pink-500",
    bgColor: "bg-pink-100",
  },
];

const mobileNavItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Principal",
    color: "text-blue-500",
  },
  {
    href: "/dashboard/programming",
    icon: Theater,
    label: "Programación",
    color: "text-rose-500",
  },
  {
    href: "/dashboard/calendar",
    icon: Calendar,
    label: "Calendario",
    color: "text-amber-500",
  },
  {
    href: "/dashboard/expenses",
    icon: Banknote,
    label: "Gastos",
    color: "text-emerald-500",
  },
  {
    href: "/dashboard/tasks",
    icon: ListTodo,
    label: "Tareas",
    color: "text-pink-500",
  },
];

function MemberIcon({
  member,
  className,
}: {
  member: TeamMember;
  className?: string;
}) {
  const IconComponent = (LucideIcons as any)[
    member.avatar.icon
  ] as React.ElementType;
  if (!IconComponent)
    return <LucideIcons.User className={cn("h-5 w-5", className)} />;
  return <IconComponent className={cn("h-5 w-5", className)} />;
}

function UserMenu({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { user } = useUser();
  const { selectedTeamUser } = useTeamUser();
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!selectedTeamUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <Avatar
            className="h-8 w-8 text-white"
            style={{ backgroundColor: selectedTeamUser.avatar.color }}
          >
            <AvatarFallback className="bg-transparent">
              <MemberIcon member={selectedTeamUser} className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-left">
              {selectedTeamUser.name}
            </p>
            <p className="text-xs text-muted-foreground text-left">
              Viendo como
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p>Sesión iniciada como</p>
          <p className="font-normal text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/select-user")}>
          <Users className="mr-2 h-4 w-4" />
          <span>Cambiar de usuario</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenAdmin}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav() {
  const pathname = usePathname();
  const router = useRouter();

  const openWeeztixUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <nav className="hidden md:flex gap-2 items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn(isActive && `${item.color} ${item.bgColor}`)}
            >
              <item.icon className="h-5 w-5 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={pathname === "/dashboard/weeztix" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              pathname === "/dashboard/weeztix" &&
                "text-purple-600 bg-purple-100",
              pathname !== "/dashboard/weeztix" && "text-purple-600"
            )}
          >
            <Ticket className="h-5 w-5 mr-2" />
            Weeztix
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Gestión de Eventos
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/weeztix")}
            className="cursor-pointer"
          >
            <List className="mr-2 h-4 w-4" />
            <span>Mis Eventos</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => openWeeztixUrl("https://dashboard.weeztix.com/home")}
            className="cursor-pointer"
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard Weeztix</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              openWeeztixUrl(
                "https://dashboard.weeztix.com/eventSettings/simple/basic"
              )
            }
            className="cursor-pointer"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Crear Evento</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              openWeeztixUrl("https://dashboard.weeztix.com/events")
            }
            className="cursor-pointer"
          >
            <List className="mr-2 h-4 w-4" />
            <span>Gestionar Eventos</span>
            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

function BottomNavBar({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const openWeeztixUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <TooltipProvider>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex h-16 items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-full w-full flex-col items-center justify-center gap-1 text-xs transition-colors",
                      !isActive && "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn("h-5 w-5", isActive && item.color)}
                    />
                    {isActive && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs transition-colors text-purple-600 hover:text-purple-700">
                    <Ticket className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Weeztix</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Gestión de Eventos
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/weeztix")}
                className="cursor-pointer"
              >
                <List className="mr-2 h-4 w-4" />
                <span>Mis Eventos</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  openWeeztixUrl("https://dashboard.weeztix.com/home")
                }
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Dashboard Weeztix</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openWeeztixUrl(
                    "https://dashboard.weeztix.com/eventSettings/simple/basic"
                  )
                }
                className="cursor-pointer"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Crear Evento</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  openWeeztixUrl("https://dashboard.weeztix.com/events")
                }
                className="cursor-pointer"
              >
                <List className="mr-2 h-4 w-4" />
                <span>Gestionar Eventos</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </TooltipProvider>
  );
}

const ADMIN_EMAILS = ["info@atresquarts.com", "admin@atresquarts.com"];

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedTeamUser, isLoading: isTeamUserLoading } = useTeamUser();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  useEffect(() => {
    if (isUserLoading) return; // Wait until Firebase user state is determined
    if (!user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Don't run this check on the selection page itself
    if (
      pathname === "/dashboard/select-user" ||
      isUserLoading ||
      isTeamUserLoading
    )
      return;

    if (!selectedTeamUser) {
      router.replace("/dashboard/select-user");
    }
  }, [selectedTeamUser, isTeamUserLoading, isUserLoading, router, pathname]);

  if (
    isUserLoading ||
    !user ||
    (user.email && !ADMIN_EMAILS.includes(user.email)) ||
    (!isTeamUserLoading &&
      !selectedTeamUser &&
      pathname !== "/dashboard/select-user")
  ) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="mt-2 text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  if (pathname === "/dashboard/select-user") {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen w-full bg-background pb-16 md:pb-0">
        <header className="flex h-[60px] items-center justify-between border-b bg-gray-50/80 backdrop-blur-sm sticky top-0 z-40 px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo.png"
                alt="La Sala Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </Link>
            <DesktopNav />
          </div>
          <div className="md:ml-auto">
            <UserMenu onOpenAdmin={() => setAdminDialogOpen(true)} />
          </div>
        </header>
        <div className="flex flex-col">{children}</div>
        <BottomNavBar onOpenAdmin={() => setAdminDialogOpen(true)} />
      </div>
      <AdminDialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen} />
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TeamUserProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </TeamUserProvider>
  );
}
