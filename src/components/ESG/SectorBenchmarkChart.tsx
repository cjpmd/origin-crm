import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { SectorBenchmark, ESGRating } from "@/types";

interface SectorBenchmarkChartProps {
  benchmark: SectorBenchmark;
  companyRating: ESGRating;
  title?: string;
}

const chartConfig = {
  score: {
    label: "ESG Score",
    color: "hsl(var(--primary))",
  },
  company: {
    label: "Company",
    color: "hsl(var(--accent))",
  },
};

export function SectorBenchmarkChart({ 
  benchmark, 
  companyRating, 
  title = "Sector Benchmark Comparison" 
}: SectorBenchmarkChartProps) {
  const chartData = [
    {
      category: "25th Percentile",
      score: benchmark.percentile_25,
      type: "benchmark"
    },
    {
      category: "Sector Average",
      score: benchmark.average_overall,
      type: "benchmark"
    },
    {
      category: "75th Percentile", 
      score: benchmark.percentile_75,
      type: "benchmark"
    },
    {
      category: "Company Score",
      score: companyRating.overall_score,
      type: "company"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {benchmark.sector} sector in {benchmark.geography}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <XAxis 
                type="number" 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis 
                dataKey="category" 
                type="category" 
                width={100}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="score" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="text-xs text-muted-foreground mt-2">
          Dashed line indicates sector median ({benchmark.median_overall})
        </div>
      </CardContent>
    </Card>
  );
}