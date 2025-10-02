import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { GlobalSearch } from '@/components/Search/GlobalSearch';
import {
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  Home,
  GitBranch,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  Settings,
  Search,
  LogOut,
  User,
  Briefcase,
  LineChart,
  Network,
  FileText,
  CheckSquare,
  Newspaper,
  BookOpen
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Main navigation items (always visible)
const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
];

// Grouped navigation
const navigationGroups = [
  {
    label: 'Relationships',
    defaultOpen: true,
    items: [
      { name: 'Companies', href: '/companies', icon: Building2 },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Investors', href: '/investors', icon: TrendingUp },
      { name: 'Intermediaries', href: '/intermediaries', icon: Network },
    ]
  },
  {
    label: 'Intelligence',
    defaultOpen: false,
    items: [
      { name: 'News', href: '/news', icon: Newspaper },
      { name: 'Analytics', href: '/analytics', icon: LineChart },
      { name: 'Reports', href: '/reports', icon: FileText },
    ]
  },
  {
    label: 'Operations',
    defaultOpen: false,
    items: [
      { name: 'Funds', href: '/funds', icon: Briefcase },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
      { name: 'Team', href: '/team', icon: Users },
      { name: 'Journal', href: '/journal', icon: BookOpen },
    ]
  }
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings }
];

export default function AppLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useCompanyProfile();

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              {profile?.logo_url ? (
                <img src={profile.logo_url} alt="Company Logo" className="h-8 w-8 object-contain" />
              ) : (
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">PE</span>
                </div>
              )}
              <span className="font-semibold text-sidebar-foreground">
                {profile?.company_name || 'Deal Flow CRM'}
              </span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            {/* Main Navigation - Always visible */}
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Grouped Navigation */}
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.href}
                            className={({ isActive }) => 
                              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive 
                                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                              }`
                            }
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* Bottom Navigation - Settings */}
          <SidebarFooter>
            <SidebarMenu>
              {bottomNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 lg:h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search deals, contacts, companies... (⌘K)"
                  className="pl-8 cursor-pointer"
                  value={searchQuery}
                  onClick={() => setSearchOpen(true)}
                  readOnly
                />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">My Account</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}