"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/auth-store";

const navigation: {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  role?: string;
}[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Surveys", href: "/surveys", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Users", href: "/users", icon: Users, role: "Administrator" },
  { name: "Audit Logs", href: "/audit", icon: Shield, role: "Administrator" },
  { name: "Settings", href: "/settings", icon: Settings, role: "Administrator" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const visibleNav = navigation.filter(
    (item) => !item.role || user?.roles.includes(item.role)
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Survey Platform</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <p className="mb-2 truncate text-sm text-muted-foreground">
          {user?.fullName}
        </p>
        <p className="mb-3 truncate text-xs text-muted-foreground">
          {user?.email}
        </p>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
