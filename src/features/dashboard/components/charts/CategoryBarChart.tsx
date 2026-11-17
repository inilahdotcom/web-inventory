import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export interface CategoryBarDataItem {
  name: string
  total: number
}

interface CategoryBarChartProps {
  title?: string
  subtitle?: string
  data: CategoryBarDataItem[]
  height?: number
}

export function CategoryBarChart({
  title = "Aset per kategori",
  subtitle = "FR-002 - Klik batang untuk memfilter",
  data,
  height = 208,
}: CategoryBarChartProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-neutral-200 bg-[#E0F7F6] p-6 shadow-sm">
      <div>
        <h3 className="text-xs font-bold text-neutral-900">
          {title}{" "}
          {subtitle && (
            <span className="font-normal text-neutral-500">{subtitle}</span>
          )}
        </h3>
      </div>
      <div className="w-full pt-4" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={false}
              axisLine={false}
              tickLine={false}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--primary)",
                borderRadius: "12px",
                border: "none",
                color: "var(--primary-foreground)",
                fontSize: "11px",
              }}
              itemStyle={{ color: "var(--primary-foreground)" }}
            />
            <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
