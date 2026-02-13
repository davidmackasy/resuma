import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Users, FileText, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminDashboard() {
  const { isAdmin } = useAdmin();
  const { data: metrics, isLoading } = useQuery<any>({
    queryKey: ["/api/applykit/admin/metrics"],
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Users", value: metrics?.totalUsers || 0, sub: `${metrics?.signupsToday || 0} today`, icon: Users },
    { label: "Signups This Week", value: metrics?.signupsWeek || 0, sub: "Last 7 days", icon: TrendingUp },
    { label: "Total Applications", value: metrics?.totalApplications || 0, sub: `${metrics?.applicationsToday || 0} today`, icon: FileText },
    { label: "Apps This Week", value: metrics?.applicationsWeek || 0, sub: "Last 7 days", icon: Activity },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-serif font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
        <Link href="/app/admin/users">
          <Button variant="outline" data-testid="link-admin-users">
            Manage Users
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold" data-testid={`text-kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-4">Signups (Last 14 Days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.signupsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" className="fill-primary/20 stroke-primary" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-4">Applications Generated (Last 14 Days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.applicationsByDay || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" className="fill-primary/20 stroke-primary" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/app/admin/users">
          <Button variant="outline" data-testid="link-admin-users-bottom">Users List</Button>
        </Link>
        <Link href="/app/admin/admins">
          <Button variant="outline" data-testid="link-admin-admins">Manage Admins</Button>
        </Link>
      </div>
    </div>
  );
}
