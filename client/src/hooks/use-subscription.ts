import { useQuery } from "@tanstack/react-query";

interface SubscriptionData {
  isAdmin: boolean;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  hasAccess: boolean;
  subscription: {
    id: string;
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  } | null;
}

export function useSubscription() {
  const { data, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ["/api/applykit/subscription"],
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  return {
    isAdmin: data?.isAdmin || false,
    hasAccess: data?.hasAccess || false,
    subscriptionStatus: data?.subscriptionStatus || null,
    subscription: data?.subscription || null,
    isLoading,
    refetch,
  };
}
