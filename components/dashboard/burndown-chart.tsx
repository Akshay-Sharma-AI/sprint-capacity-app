"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { burndownData } from "@/lib/mock-data"
import { TrendingDown } from "lucide-react"

const chartConfig = {
  ideal: { label: "Ideal", color: "var(--chart-2)" },
  actual: { label: "Actual", color: "var(--chart-1)" },
}

export function BurndownChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingDown className="size-4 text-primary" />
            Sprint Burndown
          </CardTitle>
          <span className="text-xs text-muted-foreground">Sprint 4 · 11 days</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <LineChart data={burndownData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="var(--chart-2)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
