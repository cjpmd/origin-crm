import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
  SidebarInset
} from '@/components/ui/sidebar';
import { 
  Home,
  GitBranch,
  Users,
  Building2,
  TrendingUp,
  BarChart3,
  TreePine,
  Settings,
  Search,
  Leaf,
  LogOut,
  User,
  Briefcase,
  LineChart,
  Network,
  FileText,
  CheckSquare
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

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Funds', href: '/funds', icon: Briefcase },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Investors', href: '/investors', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Intermediaries', href: '/intermediaries', icon: Network },
  { name: 'ESG Analytics', href: '/esg-analytics', icon: Leaf },
  { name: 'Sectoral Analysis', href: '/sectoral-analysis', icon: TreePine },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Team', href: '/team', icon: Users },
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
            <SidebarMenu>
              {navigation.map((item) => (
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
          </SidebarContent>
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