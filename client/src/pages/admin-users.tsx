import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";

export default function AdminUsers() {
  const { isAdmin } = useAdmin();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const buildUsersUrl = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("query", searchTerm);
    params.set("page", String(page));
    params.set("limit", String(pageSize));
    return `/api/applykit/admin/users?${params}`;
  };

  const { data, isLoading } = useQuery<{ users: any[]; total: number }>({
    queryKey: [buildUsersUrl()],
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Access denied</p></div>;
  }

  const handleSearch = () => {
    setSearchTerm(query);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" data-testid="button-back-admin">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-serif font-bold" data-testid="text-admin-users-title">Users</h1>
        <Badge variant="secondary" className="ml-auto">{data?.total || 0} total</Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          data-testid="input-search-users"
        />
        <Button onClick={handleSearch} data-testid="button-search-users">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.users?.map((u: any) => (
            <Link key={u.id} href={`/app/admin/users/${u.id}`}>
              <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-user-${u.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{u.profileName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "No name"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email || "No email"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {u.isBanned && <Badge variant="destructive">Banned</Badge>}
                    {u.isAdmin && <Badge>Admin</Badge>}
                    {u.forceUnlimited && <Badge variant="secondary">Unlimited</Badge>}
                    <span className="text-xs text-muted-foreground">{u.totalApplications} apps</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {(!data?.users || data.users.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
