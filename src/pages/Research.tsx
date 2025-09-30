import { useParams, useNavigate } from "react-router-dom";
import { useResearch } from "@/hooks/useResearch";
import { ResearchReportCard } from "@/components/Research/ResearchReportCard";
import { EvidenceExplorer } from "@/components/Research/EvidenceExplorer";
import { ResearchTrigger } from "@/components/Research/ResearchTrigger";
import { ResearchProgress } from "@/components/Research/ResearchProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Research() {
  const { companyId, sectorId } = useParams();
  const navigate = useNavigate();
  const {
    latestJob,
    latestReport,
    evidence,
    isLoading,
    startResearch,
    isStarting,
  } = useResearch(companyId, sectorId);

  const handleStartResearch = (depth: "quick" | "standard" | "forensic") => {
    startResearch({ companyId, sectorId, depth });
  };

  const handleBack = () => {
    if (sectorId) {
      navigate(`/sectoral-analysis/${sectorId}`);
    } else if (companyId) {
      navigate(`/portfolio/${companyId}`);
    } else {
      navigate(-1);
    }
  };

  const showResearchTrigger = !latestJob || latestJob.status === 'done' || latestJob.status === 'failed';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Deep Research</h1>
            <p className="text-muted-foreground">
              AI-powered market intelligence and evidence-based analysis
            </p>
          </div>
        </div>
        {showResearchTrigger && (
          <ResearchTrigger
            companyId={companyId}
            sectorId={sectorId}
            onStart={handleStartResearch}
            isLoading={isStarting}
          />
        )}
      </div>

      {/* Show progress indicator if research is running */}
      {latestJob && (latestJob.status === "pending" || latestJob.status === "running") && (
        <ResearchProgress
          status={latestJob.status}
          depth={latestJob.depth as "quick" | "standard" | "forensic"}
          createdAt={latestJob.created_at}
        />
      )}

      <Tabs defaultValue="report" className="w-full">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({evidence.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6">
          <ResearchReportCard
            report={latestReport}
            job={latestJob}
            onRerun={() => handleStartResearch("standard")}
          />

          {latestReport && (
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                {latestReport.structured_findings && latestReport.structured_findings.length > 0 ? (
                  <div className="space-y-4">
                    {latestReport.structured_findings.map((finding: any, i: number) => (
                      <div key={i} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium">{finding.claim}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{finding.evidence}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No findings available yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evidence">
          <EvidenceExplorer evidence={evidence} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Research History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Research history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
