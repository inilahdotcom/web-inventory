import { Link } from '@tanstack/react-router'

export function Sidebar() {
    return (
        <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#121212] p-4 text-white shrink-0 min-h-screen border-r border-neutral-800">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-neutral-900">
                            GA
                        </div>
                        <div>
                            <div className="text-sm font-medium tracking-wide">INC Inventaris</div>
                            <div className="text-[10px] text-neutral-400">General Affairs</div>
                        </div>
                    </div>
                    <span className="text-xs text-neutral-500 cursor-pointer">«</span>
                </div>

                <nav className="space-y-1">
                    <NavItem to="/" label="Dashboard" exact count={undefined} />
                    <NavItem to="/asset/new" label="Daftar Aset"/>
                    <NavItem to="/mutasi" label="Mutasi Aset" />
                    <NavItem to="/import" label="Import Data" />
                    <NavItem to="/laporan" label="Laporan" />
                    <NavItem to="/arsip" label="Arsip Aset" />
                </nav>
            </div>


            <div className="pt-4 border-t border-neutral-800/60">
                <div className="flex items-center space-x-3 rounded-xl bg-neutral-900/80 p-3 border border-neutral-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400 font-bold text-xs">
                        RS
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-xs font-medium text-white truncate">Rizky Saputra</div>
                        <div className="text-[10px] text-neutral-400 truncate">Admin GA</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function NavItem({ to, label, count, exact = false }: { to: string; label: string; count?: number; exact?: boolean }) {
    return (
        <Link
            to={to}
            activeOptions={{ exact }}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-800/60 hover:text-white"
            activeProps={{
                className: "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium bg-neutral-800 text-white font-semibold",
            }}
        >
            {({ isActive }) => (
                <>
                    <div className="flex items-center space-x-3">
                        {/* Kotak kecil otomatis berubah kuning terang jika halaman sedang aktif */}
                        <div className={`h-3.5 w-3.5 rounded border ${isActive ? 'bg-amber-400 border-amber-400' : 'border-neutral-600 bg-transparent'}`} />
                        <span>{label}</span>
                    </div>
                    {count !== undefined && (
                        <span className="text-[11px] text-neutral-400 font-normal">
                            {count}
                        </span>
                    )}
                </>
            )}
        </Link>
    )
}