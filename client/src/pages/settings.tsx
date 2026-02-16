import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { User, CreditCard, Trash2, Shield, Loader2, LogOut, ExternalLink } from "lucide-react";
import type { Usage } from "@shared/schema";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, subscriptionStatus, subscription, isLoading: subLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: usage, isLoading: usageLoading } = useQuery<Usage>({
    queryKey: ["/api/applykit/usage"],
  });

  const deleteDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/applykit/data");
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({ title: "Data deleted", description: "All your Resuma data has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete data.", variant: "destructive" });
    },
  });

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/applykit/create-portal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to open billing portal");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setPortalLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isAdmin) return <Badge variant="secondary">Admin</Badge>;
    if (subscriptionStatus === "active") return <Badge variant="secondary">Active</Badge>;
    if (subscriptionStatus === "trialing") return <Badge variant="secondary">Trial</Badge>;
    if (subscriptionStatus === "past_due") return <Badge variant="outline">Past Due</Badge>;
    if (subscriptionStatus === "canceled") return <Badge variant="outline">Canceled</Badge>;
    return <Badge variant="outline">Inactive</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Account</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium" data-testid="text-settings-name">{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium" data-testid="text-settings-email">{user?.email}</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Plan & Usage</h2>
        </div>
        {subLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <div>
                <p className="font-medium">{isAdmin ? "Admin Access" : "Monthly Plan — $9.99/mo"}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Unlimited access" : "30 resume discoveries per month"}
                </p>
              </div>
              {getStatusBadge()}
            </div>
            {subscription?.current_period_end && !isAdmin && (
              <p className="text-xs text-muted-foreground mb-3">
                {subscription.cancel_at_period_end
                  ? `Access until ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : `Next billing: ${new Date(subscription.current_period_end).toLocaleDateString()}`}
              </p>
            )}
            {!isAdmin && (subscriptionStatus === "active" || subscriptionStatus === "trialing") && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalLoading}
                data-testid="button-manage-billing"
              >
                {portalLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Manage Billing
              </Button>
            )}
          </>
        )}
        <Separator className="my-4" />
        {usageLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Applications used</p>
              <p className="text-xl font-bold" data-testid="text-settings-apps-used">
                {usage?.applicationsGenerated || 0} / {isAdmin ? "Unlimited" : "30"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regenerations used</p>
              <p className="text-xl font-bold" data-testid="text-settings-regens-used">
                {usage?.regenerations || 0} / {isAdmin ? "Unlimited" : "30"}
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5 border-destructive/30">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-destructive" />
          <h2 className="font-medium text-destructive">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete all your Resuma data including your profile, applications, and generated documents.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" data-testid="button-delete-data">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your profiles, applications, generated documents, and usage history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDataMutation.mutate()}
                className="bg-destructive text-destructive-foreground"
                data-testid="button-confirm-delete"
              >
                {deleteDataMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>

      <div className="pt-2 pb-6">
        <a href="/api/logout" className="block">
          <Button
            variant="outline"
            className="w-full border-destructive/30 text-destructive"
            data-testid="button-sign-out"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </a>
      </div>
    </div>
  );
}
