import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles } from "lucide-react";
import { COMING_SOON_FEATURES } from "@/lib/nav-config";

export default function ComingSoonPage() {
  const [, params] = useRoute("/app/coming-soon/:feature");
  const feature = params?.feature || "feature";
  const meta = COMING_SOON_FEATURES[feature] ?? {
    title: "Coming Soon",
    description: "This feature is under development and will be available in a future update.",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto">
      <Link href="/app">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Home
        </Button>
      </Link>

      <Card className="p-8 sm:p-10 text-center space-y-5 border-dashed">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <Badge variant="outline" className="text-caption font-medium">
            Coming soon
          </Badge>
          <h1 className="text-h1 font-serif">{meta.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link href="/app/new">
            <Button className="w-full sm:w-auto">New Application</Button>
          </Link>
          <Link href="/app/applications">
            <Button variant="outline" className="w-full sm:w-auto">
              Application Tracker
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
