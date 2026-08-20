
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export interface ConditionDataItem {
    name: string
    value: number 
    color: string
}

interface ConditionDonutChartProps {
    title? : string
    totalLabel? : string
    data : ConditionDataItem[]
}

export function ConditionDonutChart({
    title = "Komposisi kondisi",
    totalLabel = "Aset",
    data
}: ConditionDonutChartProps) {
    const totalCount = data.reduce((acc, curr) => acc + curr.value, 0)

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6  shadow-sm flex flex-col justify-between h-full">
            <h3 className="text-xs font-bold text-neutral-900">{title}</h3>

            <div className="flex items-center justify-between my-2">
                <div className="relative size-36">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color}/>
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '12px', border: 'none', color: '#fff', fontSize:'11px'}}
                        />
                    </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-neutral-900">{totalCount}</span>
                        <span className="text-[9px] text-neutral-400 uppercase font-medium">{totalLabel}</span>
                    </div>
                </div>

                <div className="space-y-2 text-xs">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 text-neutral-600">
                                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                {item.name}
                            </span>
                            <span className="font-bold text-neutral-900">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}