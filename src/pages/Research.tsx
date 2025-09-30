import { useParams, useNavigate } from "react-router-dom";
import { useResearch } from "@/hooks/useResearch";
import { ResearchReportCard } from "@/components/Research/ResearchReportCard";
import { ResearchReportViewer } from "@/components/Research/ResearchReportViewer";
import { EvidenceExplorer } from "@/components/Research/EvidenceExplorer";
import { ResearchTrigger } from "@/components/Research/ResearchTrigger";
import { ResearchProgress } from "@/components/Research/ResearchProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Research() {
  const { companyId, sectorId } = useParams();
  const navigate = useNavigate();
  const [showFullReport, setShowFullReport] = useState(false);
  
  const {
    jobs,
    latestJob,
    latestReport,
    evidence,
    allReports,
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
  const hasCompletedResearch = jobs.some(j => j.status === 'done');

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
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Key Findings</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFullReport(true)}
                    >
                      View Full Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {latestReport.structured_findings && latestReport.structured_findings.length > 0 ? (
                    <div className="space-y-4">
                      {latestReport.structured_findings.slice(0, 3).map((finding: any, i: number) => (
                        <div key={i} className="border-l-4 border-primary pl-4">
                          <h4 className="font-medium">{finding.claim}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{finding.evidence}</p>
                        </div>
                      ))}
                      {latestReport.structured_findings.length > 3 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowFullReport(true)}
                          className="w-full"
                        >
                          View {latestReport.structured_findings.length - 3} more findings
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No findings available yet</p>
                  )}
                </CardContent>
              </Card>

              <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Full Research Report</DialogTitle>
                  </DialogHeader>
                  <ResearchReportViewer report={latestReport} />
                </DialogContent>
              </Dialog>
            </>
          )}
        </TabsContent>

        <TabsContent value="evidence">
          <EvidenceExplorer evidence={evidence} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Research History ({jobs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No research history yet. Start a new research job to begin.</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const jobReport = allReports.find(r => r.research_job_id === job.id);
                    return (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{job.depth} Research</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              job.status === 'done' ? 'bg-green-100 text-green-800' :
                              job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {jobReport && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">{jobReport.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{jobReport.summary}</p>
                            {jobReport.posterior_probability && (
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span>Confidence: {((jobReport.confidence || 0) * 100).toFixed(0)}%</span>
                                <span>Probability: {((jobReport.posterior_probability || 0) * 100).toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                        {job.completed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Completed: {new Date(job.completed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
