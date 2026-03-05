import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useGame } from "@/context/GameContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AppSidebar = () => {
  const { currentUser, logout } = useGame();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isGM = currentUser?.role === "guild_master";

  const navItems = [
    { title: "Quest Board", url: "/quests", icon: "📜" },
    ...(isGM ? [{ title: "Review Board", url: "/review", icon: "⚖️" }] : []),
    { title: "The Tavern", url: "/tavern", icon: "🍻" },
    { title: "Guild Codex", url: "/codex", icon: "📖" },
    { title: "Hall of Fame", url: "/fame", icon: "🏆" },
    { title: "Profile", url: "/profile", icon: "👤" },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="font-heading text-gold text-lg">
              ⚜️ Sovereign Guild
            </div>
          )}
          {collapsed && <div className="text-center text-xl">⚜️</div>}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-gold font-medium"
                    >
                      <span className="text-lg">{item.icon}</span>
                      {!collapsed && <span className="font-body">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        {!collapsed && currentUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{currentUser.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-heading text-gold truncate">{currentUser.username}</div>
              <div className="text-xs text-muted-foreground">
                Lv.{currentUser.level} • {currentUser.xp} XP
              </div>
            </div>
          </div>
        )}
        <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={logout} className="w-full text-muted-foreground hover:text-crimson">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Leave Hall</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
