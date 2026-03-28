"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  surveys: "Surveys",
  analytics: "Analytics",
  users: "Users",
  audit: "Audit Logs",
  settings: "Settings",
  new: "New Survey",
};

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const label = routeLabels[segment] ?? segment;
              const href = "/" + segments.slice(0, index + 1).join("/");

              return isLast ? (
                <BreadcrumbItem key={segment}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem key={segment}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
