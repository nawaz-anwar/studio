
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type ChartData = {
  month: string;
  expenses: number;
  salary: number;
};

const chartConfig = {
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
  salary: {
    label: 'Salary',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export default function DashboardClient({ chartData }: { chartData: ChartData[] }) {
  
  return (
    <Card className="h-full">
        <CardHeader>
            <CardTitle>Financial Overview (Last 6 Months)</CardTitle>
            <CardDescription>Monthly expenses vs. fixed monthly salary cost.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `AED ${Number(value) / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="salary" fill="var(--color-salary)" radius={4} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
