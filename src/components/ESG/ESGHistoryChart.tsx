import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ESGHistory } from "@/types";

interface ESGHistoryChartProps {
  history: ESGHistory[];
  title?: string;
}

const chartConfig = {
  overall_score: {
    label: "Overall",
    color: "hsl(var(--primary))",
  },
  e_score: {
    label: "Environmental",
    color: "hsl(134, 61%, 41%)",
  },
  s_score: {
    label: "Social",
    color: "hsl(200, 100%, 36%)",
  },
  g_score: {
    label: "Governance",
    color: "hsl(270, 95%, 60%)",
  },
};

export function ESGHistoryChart({ history, title = "ESG Score Trends" }: ESGHistoryChartProps) {
  const chartData = history.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    overall_score: item.overall_score,
    e_score: item.e_score,
    s_score: item.s_score,
    g_score: item.g_score,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="overall_score" 
                stroke="var(--color-overall_score)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="e_score" 
                stroke="var(--color-e_score)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="s_score" 
                stroke="var(--color-s_score)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="g_score" 
                stroke="var(--color-g_score)" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}