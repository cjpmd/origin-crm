import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TreePine, Target, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectorExplorer } from '@/components/Sectoral/SectorExplorer';
import { SectorProfile } from '@/components/Sectoral/SectorProfile';
import { ScenarioModeler } from '@/components/Sectoral/ScenarioModeler';
import { ResearchTrigger } from '@/components/Research/ResearchTrigger';
import { useResearch } from '@/hooks/useResearch';
import { useSectors } from '@/hooks/useSectors';

const SectoralAnalysis = () => {
  const { sectorId } = useParams<{ sectorId?: string }>();
  const [activeTab, setActiveTab] = useState('explorer');
  const navigate = useNavigate();
  const { startResearch, isStarting } = useResearch();
  const { getSectorById } = useSectors();

  // If a specific sector is selected, show the sector profile
  const selectedSector = sectorId ? getSectorById(sectorId) : null;

  const handleStartResearch = (depth: "quick" | "standard" | "forensic") => {
    if (sectorId) {
      startResearch({ sectorId, depth });
      navigate(`/research/sector/${sectorId}`);
    }
  };

  if (sectorId && !selectedSector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/sectoral-analysis">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explorer
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sector Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              The requested sector could not be found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedSector) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/sectoral-analysis">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{selectedSector.name} Sector</h1>
              <p className="text-muted-foreground">
                Detailed analysis and scenario modeling for {selectedSector.name.toLowerCase()}
              </p>
            </div>
          </div>
          <ResearchTrigger
            sectorId={sectorId}
            onStart={handleStartResearch}
            isLoading={isStarting}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sector Profile
            </TabsTrigger>
            <TabsTrigger value="modeling" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Scenario Modeling
            </TabsTrigger>
            <TabsTrigger value="benchmarks" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              Benchmarking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <SectorProfile sectorId={selectedSector.id} />
          </TabsContent>

          <TabsContent value="modeling" className="space-y-4">
            <ScenarioModeler sectorId={selectedSector.id} />
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company vs Sector Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Advanced benchmarking tools coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sectoral Analysis</h1>
          <p className="text-muted-foreground">
            Explore industry sectors, benchmark performance, and model investment scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/reports">
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      <SectorExplorer />
    </div>
  );
};

export default SectoralAnalysis;