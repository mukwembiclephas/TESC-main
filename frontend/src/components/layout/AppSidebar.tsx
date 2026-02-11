import { useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building,
  BarChart3,
  Lightbulb,
  Factory,
  FileText,
  Settings,
  HelpCircle,
  School,
  MapPin,
  LogOut,
  User,
  Building2,
  Rocket,
  GraduationCap,
  Wallet,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { tesc_logo } from "./logo";

// --- Navigation Item Definitions ---
const mainNavigation = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Institutions", url: "/institutions", icon: Building },
  { title: "Student Records", url: "/students", icon: GraduationCap },
  { title: "Staff Records", url: "/staff", icon: User },
  { title: "Statistics", url: "/statistics", icon: BarChart3 },
  
];

const dataCategories = [
  { title: "Facilities & Capacity", url: "/facilities", icon: School },
  { title: "Innovation", url: "/innovation", icon: Lightbulb },
  { title: "Industrialisation", url: "/industrialisation", icon: Factory },
  { title: "Incubation Hubs", url: "/hubs", icon: Building2 },
  { title: "Startups", url: "/startups", icon: Rocket },
  { title: "Regional Analysis", url: "/regional", icon: MapPin },
];

const admissionsCategory = [
  { title: "Admissions Dashboard", url: "/admissions", icon: GraduationCap },
  { title: "Dropout Analysis", url: "/admissions/dropouts", icon: UserX },
  { title: "Special Enrollments", url: "/admissions/special", icon: User },
  { title: "Payments & Fees", url: "/admissions/fees", icon: Wallet },
];

const systemItems = [
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const isCollapsed = state === "collapsed";

  console.log(user);
  

  // 🚨 Dynamic Access Control Logic
  const userPermissions = user?.department?.permissions || [];
  const userRoleName = user?.role?.name || "";
  const userLevel = user?.level;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-black font-medium" : "hover:bg-muted";

  /**
   * Filters navigation items based on Database Permissions + Admin Levels
   */
  const filterLinks = (items: any[]) => {
    // 1. Level 1 (Super Admin) or "Superuser" role gets everything
    if (userLevel === "1" || userRoleName === "Superuser") {
      return items;
    }

    return items.filter((item) => {
      // 2. Public pages (Dashboard/Help) are always visible
      if (item.url === "/dashboard" || item.url === "/help" || item.url === "/settings") {
        return true;
      }

      // 3. Security Layer: Hard-restrict Settings to Level 1 only
      // Even if the permission exists in the department list, block it for others
      if (item.url === "/settings" && userLevel !== "1") {
        return false;
      }

      // 4. Departmental Permission Check
      // Matches the URLs saved in the Settings -> Department Permissions matrix
      return userPermissions.includes(item.url);
    });
  };

  const filteredMainNavigation = filterLinks(mainNavigation);
  const filteredDataCategories = filterLinks(dataCategories);
  const filteredAdmissionsCategory = filterLinks(admissionsCategory);
  const filteredSystemItems = filterLinks(systemItems);

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Logo and Title */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div className="flex items-center">
              <img src={tesc_logo} className="w-12 mr-3" alt="TESC Logo" />
              <div>
                <h1 className="text-md font-bold text-primary leading-tight">
                  TESC SRS
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Data Systems
                </p>
              </div>
            </div>
          ) : (
            <div className="text-primary font-bold text-xl text-center">T</div>
          )}
        </div>

        {/* Navigation Groups */}
        {[
          { label: "Main", items: filteredMainNavigation },
          { label: "Data Categories", items: filteredDataCategories },
          { label: "Analysis", items: filteredAdmissionsCategory },
          { label: "System", items: filteredSystemItems },
        ].map(
          (group) =>
            group.items.length > 0 && (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/dashboard"}
                            className={getNavCls}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
        )}
      </SidebarContent>

      {/* User Info & Logout Footer */}
      {user && (
        <div
          className={`p-4 border-t bg-muted/10 ${
            isCollapsed ? "flex justify-center" : ""
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold truncate">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <span className="text-[10px] font-bold text-muted-foreground bg-white/50 px-2 py-0.5 rounded w-fit border border-muted">
                  {user.department?.name || "Staff"}
                </span>
                <span className="text-[9px] text-primary/70 uppercase font-bold px-2">
                  Level {user.level} Access
                </span>
              </div>
              <Button
                onClick={logout}
                className="w-full h-8 text-xs"
                variant="destructive"
              >
                <LogOut className="mr-2 h-3 w-3" />
                Log Out
              </Button>
            </>
          ) : (
            <Button
              onClick={logout}
              size="icon"
              variant="destructive"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Sidebar>
  );
}
