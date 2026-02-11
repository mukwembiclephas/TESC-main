import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BookOpen,
  GraduationCap,
  Building2,
  BarChart3,
  Lightbulb,
  Settings,
  LogOut,
  School, // New icon for Faculties
  ChevronRight,
  MoreHorizontal,
  HeartHandshake,
  Wallet2,
  Settings2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader, // Ensure you have this or use a div
  SidebarFooter, // Ensure you have this
  SidebarRail,   // Optional: for resizing
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have shadcn Avatar
import { useAuth } from "@/context/AuthContext";

// Grouped Menu Items for better organization
const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    label: "Academic Management",
    items: [
      { title: "Students", url: "/dashboard/students", icon: Users },
      { title: "Special Enrolment", url: "/dashboard/special-enrollment", icon: HeartHandshake },
      { title: "Fees & Payments", url: "/dashboard/fees", icon: Wallet2 },
      { title: "Staff", url: "/dashboard/staff", icon: UserCog },
      { title: "Faculties", url: "/dashboard/faculties", icon: School }, // Changed icon to distinguish
      { title: "Programs", url: "/dashboard/programs", icon: BookOpen },
      { title: "Graduates", url: "/dashboard/graduates", icon: GraduationCap },
    ]
  },
  {
    label: "Operations & Analytics",
    items: [
      { title: "Facilities", url: "/dashboard/facilities", icon: Building2 },
      { title: "Innovation & Industry", url: "/dashboard/innovation", icon: Lightbulb },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/dashboard/settings", icon: Settings2 },
      { title: "Help", url: "#", icon: Lightbulb },
      
    ]
  }
];

export default function AppSidebar() {
  const { user, logout } = useAuth();

  // Get initials for avatar fallback
  const initials = user 
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() 
    : "U";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Sidebar collapsible="icon">
      
      {/* --- HEADER: Institution Branding --- */}
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-white">
              {user?.institution?.name || "Institution"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Admin Portal
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* --- CONTENT: Navigation Groups --- */}
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard"}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                            : "text-muted-foreground hover:text-foreground"
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* --- FOOTER: User Profile & Settings --- */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar_url} alt={user?.first_name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <MoreHorizontal className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}