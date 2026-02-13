import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { ArrowLeft, Ban, ShieldCheck, Infinity } from "lucide-react";
import { useAdmin } from "@/hooks/use-admin";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [banReason, setBanReason] = useState("");
  const [extraApps, setExtraApps] = useState(0);
  const [extraRegens, setExtraRegens] = useState(0);
  const [forceUnlimited, setForceUnlimited] = useState(false);

  const { data: user, isLoading } = useQuery<any>({
    queryKey: [`/api/applykit/admin/users/${userId}`],
    enabled: isAdmin && !!userId,
  });

  useEffect(() => {
    if (user?.override) {
      setExtraApps(user.override.extraApplications || 0);
      setExtraRegens(user.override.extraRegenerations || 0);
      setForceUnlimited(user.override.forceUnlimited || false);
    }
  }, [user]);

  const banMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/applykit/admin/users/${userId}/ban`, { reason: banReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applykit/admin/users/${userId}`] });
      toast({ title: "User banned" });
      setBanReason("");
    },
  });

  const unbanMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/applykit/admin/users/${userId}/unban`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applykit/admin/users/${userId}`] });
      toast({ title: "User unbanned" });
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/applykit/admin/users/${userId}/override`, {
        extraApplications: extraApps,
        extraRegenerations: extraRegens,
        forceUnlimited,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applykit/admin/users/${userId}`] });
      toast({ title: "Overrides saved" });
    },
  });

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">Access denied</p></div>;
  }

  if (isLoading) {
    return <div className="p-6 space-y-4 max-w-4xl mx-auto"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-48" /></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-full"><p className="text-muted-foreground">User not found</p></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/app/admin/users">
          <Button variant="ghost" size="icon" data-testid="button-back-users">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-serif font-bold" data-testid="text-user-detail-title">User Detail</h1>
        {user.flag?.isBanned && <Badge variant="destructive">Banned</Badge>}
        {user.isAdmin && <Badge>Admin</Badge>}
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="font-medium">Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span data-testid="text-user-name">{user.firstName} {user.lastName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{" "}
            <span data-testid="text-user-email">{user.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profile Name:</span>{" "}
            <span>{user.profile?.fullName || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profile Complete:</span>{" "}
            <span>{user.profile?.structuredComplete ? "Yes" : "No"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Joined:</span>{" "}
            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Applications:</span>{" "}
            <span data-testid="text-user-total-apps">{user.totalApplications}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-medium">Usage (This Month)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Applications Generated:</span>{" "}
            <span>{user.usage?.applicationsGenerated || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Regenerations:</span>{" "}
            <span>{user.usage?.regenerations || 0}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Infinity className="h-4 w-4" />
          <h2 className="font-medium">Limit Overrides</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Extra Applications</Label>
            <Input
              type="number"
              min={0}
              value={extraApps}
              onChange={(e) => setExtraApps(parseInt(e.target.value) || 0)}
              data-testid="input-extra-apps"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Extra Regenerations</Label>
            <Input
              type="number"
              min={0}
              value={extraRegens}
              onChange={(e) => setExtraRegens(parseInt(e.target.value) || 0)}
              data-testid="input-extra-regens"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={forceUnlimited}
            onCheckedChange={setForceUnlimited}
            data-testid="switch-unlimited"
          />
          <Label>Force Unlimited Access</Label>
        </div>
        <Button
          onClick={() => overrideMutation.mutate()}
          disabled={overrideMutation.isPending}
          data-testid="button-save-overrides"
        >
          Save Overrides
        </Button>
        {user.override && (
          <p className="text-xs text-muted-foreground">
            Current: +{user.override.extraApplications} apps, +{user.override.extraRegenerations} regens
            {user.override.forceUnlimited && ", Unlimited"}
          </p>
        )}
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Ban className="h-4 w-4" />
          <h2 className="font-medium">Account Actions</h2>
        </div>
        {user.flag?.isBanned ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Banned: {user.flag.banReason || "No reason provided"}
            </p>
            <Button
              variant="outline"
              onClick={() => unbanMutation.mutate()}
              disabled={unbanMutation.isPending}
              data-testid="button-unban"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              Unban User
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              placeholder="Ban reason..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="resize-none"
              data-testid="input-ban-reason"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" data-testid="button-ban">
                  <Ban className="mr-1.5 h-4 w-4" />
                  Ban User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ban this user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately block this user from creating or generating applications. They can still view existing data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => banMutation.mutate()}>Ban User</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </Card>

      {user.recentApplications?.length > 0 && (
        <Card className="p-5 space-y-3">
          <h2 className="font-medium">Recent Applications</h2>
          <div className="space-y-2">
            {user.recentApplications.map((app: any) => (
              <div key={app.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm">
                <span className="truncate max-w-xs">{app.companyName || app.roleTitle || `Application #${app.id}`}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{app.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
