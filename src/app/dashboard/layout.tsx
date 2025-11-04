
'use client'

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/team", icon: Users, label: "Team" },
  { href: "/dashboard/programming", icon: Theater, label: "Programming" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { href: "/dashboard/expenses", icon: Banknote, label: "Expenses" },
  { href: "/dashboard/meetings", icon: BookUser, label: "Meetings" },
  { href: "/dashboard/todos", icon: ListTodo, label: "To-Do List" },
  { href: "/dashboard/productions", icon: Film, label: "Productions" },
  { href: "/dashboard/ideas", icon: Lightbulb, label: "Ideas" },
];

const UserAvatar = () => {
    const userImage = PlaceHolderImages.find(img => img.id === 'user-avatar-1');
    return (
        <Avatar className="h-8 w-8">
            <AvatarImage src={userImage?.imageUrl} alt="User Avatar" data-ai-hint={userImage?.imageHint} />
            <AvatarFallback>AN</AvatarFallback>
        </Avatar>
    )
}

function MainSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <Theater className="w-6 h-6 text-primary-foreground" />
          <span className="font-bold font-headline text-lg">laSalapp</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full gap-2 p-2 rounded-md text-left hover:bg-sidebar-accent transition-colors">
                    <UserAvatar />
                    <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="font-semibold text-sm truncate">Anna</p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">Director</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/">
                  <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                  </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function MobileHeader() {
    const { isMobile } = useSidebar();
    if (!isMobile) return null;

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
             <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Theater className="h-6 w-6" />
                <span className="">laSalapp</span>
            </Link>
            <div className="ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <UserAvatar />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                         <Link href="/">
                            <DropdownMenuItem>Logout</DropdownMenuItem>
                         </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <MainSidebar />
        <div className="flex flex-col md:ml-[--sidebar-width] group-data-[collapsible=icon]:md:ml-[--sidebar-width-icon]">
            <MobileHeader />
            <SidebarInset>
                {children}
            </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
