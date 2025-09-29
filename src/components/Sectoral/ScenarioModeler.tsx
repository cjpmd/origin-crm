import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calculator, TrendingUp, Save, RotateCcw } from 'lucide-react';
import { getSectorById, getSectorBenchmark } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface ScenarioModelerProps {
  sectorId: string;
}

interface Scenario {
  name: string;
  growthRate: number;
  ebitdaMargin: number;
  valuationMultiple: number;
}

const chartConfig = {
  current: { label: 'Current', color: 'hsl(var(--muted-foreground))' },
  scenario: { label: 'Scenario', color: 'hsl(var(--primary))' },
  impact: { label: 'Impact %', color: 'hsl(var(--secondary))' }
};

export function ScenarioModeler({ sectorId }: ScenarioModelerProps) {
  const { toast } = useToast();
  const sector = getSectorById(sectorId);
  const benchmark = getSectorBenchmark(sectorId);

  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    name: 'Custom Scenario',
    growthRate: benchmark?.avg_revenue_growth || 20,
    ebitdaMargin: benchmark?.avg_ebitda_margin || 15,
    valuationMultiple: benchmark?.avg_valuation_multiple || 8
  });

  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([
    {
      name: 'Bull Case',
      growthRate: (benchmark?.avg_revenue_growth || 20) * 1.5,
      ebitdaMargin: (benchmark?.avg_ebitda_margin || 15) * 1.2,
      valuationMultiple: (benchmark?.avg_valuation_multiple || 8) * 1.3
    },
    {
      name: 'Bear Case',
      growthRate: (benchmark?.avg_revenue_growth || 20) * 0.6,
      ebitdaMargin: (benchmark?.avg_ebitda_margin || 15) * 0.8,
      valuationMultiple: (benchmark?.avg_valuation_multiple || 8) * 0.7
    }
  ]);

  if (!sector || !benchmark) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Scenario modeling not available for this sector
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate scenario impact
  const calculateImpact = (scenario: Scenario) => {
    const baseValuation = 100; // Base index
    const scenarioValuation = baseValuation * 
      (scenario.growthRate / benchmark.avg_revenue_growth) * 
      (scenario.ebitdaMargin / benchmark.avg_ebitda_margin) * 
      (scenario.valuationMultiple / benchmark.avg_valuation_multiple);
    
    return {
      valuationImpact: ((scenarioValuation - baseValuation) / baseValuation) * 100,
      revenueImpact: ((scenario.growthRate - benchmark.avg_revenue_growth) / benchmark.avg_revenue_growth) * 100,
      marginImpact: ((scenario.ebitdaMargin - benchmark.avg_ebitda_margin) / benchmark.avg_ebitda_margin) * 100,
      multipleImpact: ((scenario.valuationMultiple - benchmark.avg_valuation_multiple) / benchmark.avg_valuation_multiple) * 100
    };
  };

  const currentImpact = calculateImpact(currentScenario);

  // Comparison chart data
  const comparisonData = [
    {
      metric: 'Revenue Growth',
      current: benchmark.avg_revenue_growth,
      scenario: currentScenario.growthRate,
      unit: '%'
    },
    {
      metric: 'EBITDA Margin',
      current: benchmark.avg_ebitda_margin,
      scenario: currentScenario.ebitdaMargin,
      unit: '%'
    },
    {
      metric: 'Valuation Multiple',
      current: benchmark.avg_valuation_multiple,
      scenario: currentScenario.valuationMultiple,
      unit: 'x'
    }
  ];

  // Impact waterfall data
  const waterfallData = [
    { category: 'Base Case', value: 100, cumulative: 100 },
    { category: 'Growth Impact', value: currentImpact.revenueImpact, cumulative: 100 + currentImpact.revenueImpact },
    { category: 'Margin Impact', value: currentImpact.marginImpact, cumulative: 100 + currentImpact.revenueImpact + currentImpact.marginImpact },
    { category: 'Multiple Impact', value: currentImpact.multipleImpact, cumulative: 100 + currentImpact.revenueImpact + currentImpact.marginImpact + currentImpact.multipleImpact },
    { category: 'Total Impact', value: 0, cumulative: 100 + currentImpact.valuationImpact }
  ];

  const handleSaveScenario = () => {
    setSavedScenarios([...savedScenarios, { ...currentScenario }]);
    toast({
      title: "Scenario Saved",
      description: `"${currentScenario.name}" has been saved successfully.`
    });
  };

  const handleResetToBase = () => {
    setCurrentScenario({
      name: 'Base Case',
      growthRate: benchmark.avg_revenue_growth,
      ebitdaMargin: benchmark.avg_ebitda_margin,
      valuationMultiple: benchmark.avg_valuation_multiple
    });
  };

  const loadScenario = (scenario: Scenario) => {
    setCurrentScenario({ ...scenario });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Scenario Modeling - {sector.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modeling" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modeling">Modeling</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
              <TabsTrigger value="scenarios">Saved Scenarios</TabsTrigger>
            </TabsList>

            <TabsContent value="modeling" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="scenario-name">Scenario Name</Label>
                      <Input
                        id="scenario-name"
                        value={currentScenario.name}
                        onChange={(e) => setCurrentScenario({ ...currentScenario, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Revenue Growth Rate</Label>
                          <span className="text-sm font-medium">{currentScenario.growthRate.toFixed(1)}%</span>
                        </div>
                        <Slider
                          value={[currentScenario.growthRate]}
                          onValueChange={(value) => setCurrentScenario({ ...currentScenario, growthRate: value[0] })}
                          max={100}
                          min={-20}
                          step={0.5}
                        />
                        <div className="text-xs text-muted-foreground">
                          Base: {benchmark.avg_revenue_growth}%
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>EBITDA Margin</Label>
                          <span className="text-sm font-medium">{currentScenario.ebitdaMargin.toFixed(1)}%</span>
                        </div>
                        <Slider
                          value={[currentScenario.ebitdaMargin]}
                          onValueChange={(value) => setCurrentScenario({ ...currentScenario, ebitdaMargin: value[0] })}
                          max={50}
                          min={-10}
                          step={0.5}
                        />
                        <div className="text-xs text-muted-foreground">
                          Base: {benchmark.avg_ebitda_margin}%
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Valuation Multiple</Label>
                          <span className="text-sm font-medium">{currentScenario.valuationMultiple.toFixed(1)}x</span>
                        </div>
                        <Slider
                          value={[currentScenario.valuationMultiple]}
                          onValueChange={(value) => setCurrentScenario({ ...currentScenario, valuationMultiple: value[0] })}
                          max={20}
                          min={1}
                          step={0.1}
                        />
                        <div className="text-xs text-muted-foreground">
                          Base: {benchmark.avg_valuation_multiple}x
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveScenario} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Scenario
                      </Button>
                      <Button variant="outline" onClick={handleResetToBase}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Impact Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${currentImpact.valuationImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentImpact.valuationImpact >= 0 ? '+' : ''}{currentImpact.valuationImpact.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Valuation Impact</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${currentImpact.revenueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currentImpact.revenueImpact >= 0 ? '+' : ''}{currentImpact.revenueImpact.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Revenue Impact</div>
                      </div>
                    </div>

                    <ChartContainer config={chartConfig}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={waterfallData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                          <ReferenceLine y={100} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current vs Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="current" fill="hsl(var(--muted-foreground))" name="Current Benchmark" />
                        <Bar dataKey="scenario" fill="hsl(var(--primary))" name="Scenario" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scenarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedScenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Growth: {scenario.growthRate.toFixed(1)}% | 
                            Margin: {scenario.ebitdaMargin.toFixed(1)}% | 
                            Multiple: {scenario.valuationMultiple.toFixed(1)}x
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${calculateImpact(scenario).valuationImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {calculateImpact(scenario).valuationImpact >= 0 ? '+' : ''}
                              {calculateImpact(scenario).valuationImpact.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Impact</div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadScenario(scenario)}
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}