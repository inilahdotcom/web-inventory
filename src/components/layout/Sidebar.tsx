import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Tombol Burger Mobile Terpisah di Atas */}
            <div className="lg:hidden flex items-center justify-between bg-[#121212] px-4 py-3 text-white border-b border-neutral-800 w-full sticky top-0 z-40">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-neutral-900">
                        GA
                    </div>
                    <span className="text-sm font-medium tracking-wide">INC Inventaris</span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 focus:outline-none flex flex-col justify-center items-center w-9 h-9 gap-1"
                    aria-label="Toggle Menu"
                >
                    <span className={`block h-0.5 w-5 bg-white transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block h-0.5 w-5 bg-white transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`block h-0.5 w-5 bg-white transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </button>
            </div>

            {/* Backdrop / Overlay Hitam saat Mobile Drawer Terbuka */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 lg:hidden transition-opacity"
                />
            )}

            {/* Sidebar Utama (Desktop: Statis | Mobile: Drawer Melayang di Atas) */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between bg-[#121212] p-4 text-white shrink-0 border-r border-neutral-800 transition-transform duration-300 ease-in-out
                    lg:static lg:translate-x-0 lg:min-h-screen
                    ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                `}
            >
                <div className="space-y-6">
                    <div className="hidden lg:flex items-center justify-between px-2 py-1">
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

                    <nav className="space-y-1" onClick={() => setIsOpen(false)}>
                        <NavItem to="/" label="Dashboard" exact count={undefined} />
                        <NavItem to="/asset/new" label="Daftar Aset" count={95} />
                        <NavItem to="/mutasi" label="Mutasi Aset" />
                        <NavItem to="/import/preview" label="Import Data" />
                        <NavItem to="/laporan" label="Laporan" />
                        <NavItem to="/arsip" label="Arsip Aset" count={3} />
                    </nav>

                    <div className="space-y-2 pt-2">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            ADMIN
                        </div>
                        <nav className="space-y-1" onClick={() => setIsOpen(false)}>
                            <NavItem to="/master-data/kategori" label="Master Data" />
                            <NavItem to="/pengguna" label="Pengguna" count={7} />
                            <NavItem to="/audit-log" label="Audit Log" />
                            <NavItem to="/profil" label="Profil" />
                        </nav>
                    </div>
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
        </>
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