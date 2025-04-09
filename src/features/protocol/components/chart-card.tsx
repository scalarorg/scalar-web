import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export type TChartCardData = {
  xAxis: string;
  yAxis: number;
};

export type TChartCardProps = {
  title: string;
  data: TChartCardData[];
  chartLabel: string;
};

export const ChartCard = ({ title, data, chartLabel }: TChartCardProps) => {
  return (
    <div className="space-y-3">
      <p className="font-semibold text-2xl text-text-primary-500">{title}</p>
      <Card className="rounded-lg">
        <CardContent>
          <ChartContainer
            config={{
              yAxis: {
                label: chartLabel,
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
                bottom: 50,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="xAxis"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={16}
                angle={-90}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatNumber(value)}
                fontSize={16}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillYAxis" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-yAxis)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-yAxis)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="yAxis"
                type="linear"
                fill="url(#fillYAxis)"
                fillOpacity={0.4}
                stroke="var(--color-yAxis)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export const ChartCardSkeleton = () => {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-1/2 rounded-lg" />
      <Skeleton className="h-64" />
    </div>
  );
};
