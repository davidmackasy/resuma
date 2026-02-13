import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, ShieldCheck, ShieldOff } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminAdmins() {
  const { isAdmin, role } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("admin");
  const isOwner = role === "owner";

  const { data: admins, isLoading } = useQuery<any[]>({
    queryKey: ["/api/applykit/admin/admins"],
    enabled: isAdmin,
  });

  const addAdminMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/applykit/admin/admins", { email: newEmail, role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/admin/admins"] });
      toast({ title: "Admin added" });
      setNewEmail("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to add admin", description: error.message, variant: "destructive" });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ adminId, isActive }: { adminId: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/applykit/admin/admins/${adminId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/admin/admins"] });
      toast({ title: "Admin updated" });
    },
  });

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Access denied</p></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/app/admin">
          <Button variant="ghost" size="icon" data-testid="button-back-admin">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-serif font-bold" data-testid="text-admin-admins-title">Manage Admins</h1>
      </div>

      {isOwner && (
        <Card className="p-5 space-y-4">
          <h2 className="font-medium">Add Admin</h2>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="User email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 min-w-[200px]"
              data-testid="input-admin-email"
            />
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-32" data-testid="select-admin-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => addAdminMutation.mutate()}
              disabled={!newEmail || addAdminMutation.isPending}
              data-testid="button-add-admin"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">The user must have already signed up before they can be added as an admin.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {admins?.map((admin: any) => (
            <Card key={admin.id} className="p-4" data-testid={`card-admin-${admin.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {admin.role} {admin.isActive ? "" : "(disabled)"} — Added {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={admin.role === "owner" ? "default" : "secondary"}>{admin.role}</Badge>
                  {admin.isActive ? (
                    <Badge variant="outline">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Disabled</Badge>
                  )}
                  {isOwner && admin.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAdminMutation.mutate({ adminId: admin.id, isActive: !admin.isActive })}
                      disabled={toggleAdminMutation.isPending}
                      data-testid={`button-toggle-admin-${admin.id}`}
                    >
                      {admin.isActive ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {(!admins || admins.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No admins configured</p>
          )}
        </div>
      )}
    </div>
  );
}
