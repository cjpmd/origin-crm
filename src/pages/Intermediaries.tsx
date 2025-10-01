import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntermediaryManagement } from "@/components/Intelligence/IntermediaryManagement";
import { CoverageMatrix } from "@/components/Intelligence/CoverageMatrix";
import { Users, Grid3x3 } from "lucide-react";

export default function Intermediaries() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intermediary Network</h1>
        <p className="text-muted-foreground">
          Manage your relationships with bankers, brokers, and advisors who source deals
        </p>
      </div>

      <Tabs defaultValue="management" className="w-full">
        <TabsList>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Intermediaries
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center gap-2">
            <Grid3x3 className="h-4 w-4" />
            Coverage Matrix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-6">
          <IntermediaryManagement />
        </TabsContent>

        <TabsContent value="coverage" className="mt-6">
          <CoverageMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}
