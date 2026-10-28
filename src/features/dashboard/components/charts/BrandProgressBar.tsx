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
  data,
}: BrandProgressBarProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-neutral-200 bg-rose-50/30 p-6 shadow-sm">
      <h3 className="text-xs font-bold text-neutral-900">
        {title}{" "}
        {subtitle && (
          <span className="font-normal text-neutral-400">{subtitle}</span>
        )}
      </h3>

      <div className="my-3 space-y-2.5">
        {data.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px]">
            <span className="w-16 truncate font-bold text-neutral-600">
              {m.brand}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className="w-4 text-right font-bold text-neutral-800">
              {m.count}
            </span>
          </div>
        ))}
      </div>

      {note && (
        <p className="rounded-xl bg-rose-100/60 p-2 text-center text-[10px] text-rose-700">
          {note}
        </p>
      )}
    </div>
  )
}
