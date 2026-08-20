
export interface BrandDataItem {
    brand: string
    count: number
    pct: number 
}

interface BrandProgressBarProps {
    title?: string
    subtitle?: string
    note?: string
    data: BrandDataItem[]
}

export function BrandProgressBar({
    title = "10 merek terbanyak", 
    subtitle = "FR-004",
    note,
    data
}: BrandProgressBarProps) {
    return (
        <div className="rounded-3xl border border-neutral-200 bg-rose-50/30 p-6 shadow-sm flex flex-col justify-between h-full">
            <h3 className="text-xs font-bold text-neutral-900">
                {title} {subtitle && <span className="text-neutral-400 font-normal">{subtitle}</span>}
            </h3>

            <div className="space-y-2.5 my-3">
                {data.map((m, idx) => (
                    <div key={idx} className="flex items-center text-[10px] gap-2">
                        <span className="w-16 font-bold text-neutral-600 truncate">{m.brand}</span>
                        <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-neutral-900 h-full rounded-full transition-all duration-500"
                                style={{ width: `${m.pct}%`}}
                            />      
                        </div>
                        <span className="w-4 font-bold text-right text-neutral-800">{m.count}</span>
                    </div>
                ))}
            </div>

            {note && (
                <p className="text-[10px] text-rose-700 bg-rose-100/60 p-2 rounded-xl text-center">
                    {note}
                </p>
            )}
        </div>
    )
}