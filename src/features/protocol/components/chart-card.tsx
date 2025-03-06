import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-[34px]">{title}</CardTitle>
      </CardHeader>
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
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="xAxis"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={18}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatNumber(value)}
              fontSize={18}
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
              type="natural"
              fill="url(#fillYAxis)"
              fillOpacity={0.4}
              stroke="var(--color-yAxis)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
