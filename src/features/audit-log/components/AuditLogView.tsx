import React from 'react'

export interface AuditLogItem {
    id: string | number
    type: 'UPDATE' | 'DELETE' | 'CREATE' | 'IMPORT'
    user: {
        name: string
        role: string
        ip: string
    }
    timestamp: string
    target: string
    oldValues?: Record<string, any>
    newValues?: Record<string, any>
    description?: string
}

interface AuditLogViewProps {
    totalRecord?: number
    logs?: AuditLogItem[]
    onExport?: () => void
}

export function AuditLogView({
    totalRecord = 1284,
    logs = [
        {
            id: 1,
            type: 'UPDATE',
            user: { name: 'Dewi Anggraini', role: 'Staff GA', ip: '192.168.1.24' },
            timestamp: '05/08/2026 08:47:12',
            target: 'assets · 0853/INC-GA/1/26',
            oldValues: { condition: 'Bagus', status: 'Digunakan' },
            newValues: { condition: 'Rusak Berat', status: 'Diperbaiki' }
        },
        {
            id: 2,
            type: 'DELETE',
            user: { name: 'Rizky Saputra', role: 'Admin', ip: '192.168.1.10' },
            timestamp: '05/08/2026 10:47:12',
            target: 'assets · 0447/INC-GA/1/26',
            description: 'Soft delete. Alasan: duplikat baris 41-51 hasil migrasi Excel. Record dipindahkan ke arsip, deleted_at = 2026-08-05T08:20:44Z.'
        },
        {
            id: 3,
            type: 'CREATE',
            user: { name: 'Rizky Saputra', role: 'Admin', ip: '192.168.1.10' },
            timestamp: '05/08/2026 11:47:12',
            target: 'assets · 0447/INC-GA/1/26',
            description: 'Monitor LG 24MK430H · 2 Unit · Elektronik Kantor · Redaksi L3 · harga Rp 1.750.000'
        },
        {
            id: 4,
            type: 'IMPORT',
            user: { name: 'Rizky Saputra', role: 'Admin', ip: '192.168.1.10' },
            timestamp: '05/08/2026 15:47:12',
            target: 'assets · migrasi awal',
            description: '88 baris tersimpan · 4 gagal · 3 baris header diabaikan · 33 harga dinormalkan dari teks ke numerik. File: ASET_PT_INDONESIA_NEWS_CENTER_1_Sheet1.xlsx'
        },
    ],
    onExport
}: AuditLogViewProps) {

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'UPDATE': return 'bg-amber-100 text-amber-800 border-amber-200'
            case 'DELETE': return 'bg-rose-100 text-rose-800 border-rose-200'
            case 'CREATE': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
            case 'IMPORT': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-neutral-100 text-neutral-800 border-neutral-200'
        }
    }

    return (
        <div className="min-h-screen w-full">
            <div className="w-full space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8 text-[#1C1C1E] pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-sm font-medium">
                            <span className="text-neutral-500">Pengguna:</span>
                            <span className="text-neutral-900 font-semibold">Semua</span>
                            <span className="text-neutral-400">▾</span>
                        </div>

                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-sm font-medium">
                            <span className="text-neutral-500">Entitas:</span>
                            <span className="text-neutral-900 font-semibold">assets</span>
                            <span className="text-neutral-400 cursor-pointer">×</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-sm font-medium">
                            <span className="text-neutral-500">Aksi:</span>
                            <span className="text-neutral-900 font-semibold">Semua</span>
                            <span className="text-neutral-400">▾</span>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200 shadow-sm font-medium">
                            <span className="text-neutral-900 font-semibold">01/08/2026 - 05/08/2026</span>
                            <span className="text-neutral-400">▾</span>
                        </div>
                    </div>

                    <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#78350F] px-4 py-2 rounded-xl text-xs font-medium shadow-sm flex items-center gap-2 w-fit">
                        Hanya baca — log tidak dapat diubah atau dihapus
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Audit log</h1>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            {totalRecord.toLocaleString()} catatan · menampilkan 5 terbaru pada filter aktif
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onExport}
                        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm"
                    >
                        Export log
                    </button>
                </div>

                <div className="space-y-4">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            className="rounded-2xl bg-white p-5 shadow-sm space-y-3"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${getBadgeStyle(log.type)}`}
                                    >{log.type}</span>
                                    <div className="text-xs">
                                        <span className="font-semibold text-neutral-900">{log.user.name}</span>
                                        <span className="text-neutral-400 mx-1.5">·</span>
                                        <span className="text-neutral-500">{log.user.role} ({log.user.ip})</span>
                                        <span className="text-neutral-400 ml-1.5">{log.timestamp}</span>
                                    </div>
                                </div>
                                <div className="text-xs font-mono text-neutral-600">
                                    {log.target}
                                </div>
                            </div>
                            {log.oldValues && log.newValues ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 font-mono text-[11px] text-neutral-700 space-y-1">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">OLD_VALUES</div>
                                        <pre className="whitespace-pre-wrap text-neutral-600">
                                            {JSON.stringify(log.oldValues, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3 font-mono text-[11px] text-neutral-700 space-y-1">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">NEW_VALUES</div>
                                        <pre 
                                        className="whitespace-pre-wrap text-neutral-600"
                                        >
                                            {JSON.stringify(log.newValues, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-neutral-600 pt-1 leading-relaxed">{log.description}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}