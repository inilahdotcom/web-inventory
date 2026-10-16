import { useNavigate } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export interface ActivityItem {
  id: number
  entity_type: string
  entity_id: string
  action: string
  changed_by: string
  created_at: string
}

function getActivityBadgeVariant(action: string) {
  const a = action?.toUpperCase()
  if (a === "CREATE") return "bagus" as const
  if (a === "UPDATE") return "rusak-ringan" as const
  if (a === "DELETE") return "destructive" as const
  if (a === "RESTORE") return "secondary" as const
  return "outline" as const
}

interface RecentActivityTableProps {
  data?: ActivityItem[]
}

export function RecentActivityTable({ data = [] }: RecentActivityTableProps) {
  const navigate = useNavigate()

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground">
          10 aktivitas terakhir{" "}
          <span className="font-normal text-muted-foreground">FR-005</span>
        </h3>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => navigate({ to: "/audit-log" })}
          className="h-auto p-0 font-semibold text-blue-600 hover:underline"
        >
          Lihat audit log →
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-hairline bg-muted/50">
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Aksi
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Entitas
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                ID Entitas
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Pelaku (User ID)
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-[10px] font-semibold tracking-wider uppercase">
                Waktu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                    className="transition hover:bg-muted/50"
                  >
                    <TableCell className="px-4 py-3">
                      <Badge variant={getActivityBadgeVariant(item.action)}>
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium capitalize">
                      {item.entity_type}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono font-medium text-blue-600">
                      {item.entity_id}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      {item.changed_by}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-[11px] text-muted-foreground">
                      {item.created_at}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-xs text-muted-foreground"
                >
                  Belum ada riwayat aktivitas terbaru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
