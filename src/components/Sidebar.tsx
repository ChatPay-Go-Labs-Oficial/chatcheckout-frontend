'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserProfile } from '@/types/user';

interface SidebarProps {
  onLogout: () => void;
  user?: Partial<UserProfile> | null;
}

export default function Sidebar({ onLogout, user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-white to-gray-50 text-[#181b4a] flex flex-col justify-between border-r border-gray-200 shadow-xl transition-all duration-300 ${open ? 'w-72' : 'w-20'}`}
    >
      {open ? (
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 bg-white">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow-lg">
            <span className="text-xl font-extrabold text-white">C</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] bg-clip-text text-transparent">
            ChatCheckout
          </span>
          <button
            className="ml-auto p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
            onClick={() => setOpen(false)}
            aria-label="Fechar sidebar"
          >
            <span
              className="material-symbols-outlined text-[20px] text-[#6f43d0]"
              style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
            >
              chevron_left
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 border-b border-gray-200 bg-white">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow-lg">
            <span className="text-xl font-extrabold text-white">C</span>
          </div>
          <div className="h-4" />
          <button
            className="p-2 rounded-lg hover:bg-purple-50 transition-all duration-200"
            onClick={() => setOpen(true)}
            aria-label="Abrir sidebar"
          >
            <span
              className="material-symbols-outlined text-[20px] text-[#6f43d0]"
              style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
            >
              chevron_right
            </span>
          </button>
        </div>
      )}

      <nav className={`flex-1 flex flex-col gap-1 py-6 ${open ? 'px-4' : 'px-2'}`}>
        {open && <span className="text-xs font-semibold text-gray-400 mb-2 ml-2">Menu</span>}

        <Link
          href="/dashboard"
          title={!open ? 'Dashboard' : ''}
          className={`relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group ${open ? '' : 'justify-center'} ${isActive('/dashboard') ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'}`}
        >
          {isActive('/dashboard') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Dashboard
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${isActive('/dashboard') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            space_dashboard
          </span>
          {open && 'Dashboard'}
        </Link>

        <Link
          href="/produtos"
          title={!open ? 'Produtos' : ''}
          className={`relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group ${open ? '' : 'justify-center'} ${isActive('/produtos') ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'}`}
        >
          {isActive('/produtos') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Produtos
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${isActive('/produtos') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            storefront
          </span>
          {open && 'Produtos'}
        </Link>

        <Link
          href="/vendas"
          title={!open ? 'Vendas' : ''}
          className={`relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group ${open ? '' : 'justify-center'} ${isActive('/vendas') ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'}`}
        >
          {isActive('/vendas') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Vendas
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${isActive('/vendas') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            receipt_long
          </span>
          {open && 'Vendas'}
        </Link>

        <Link
          href="/profile"
          title={!open ? 'Perfil' : ''}
          className={`relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group ${open ? '' : 'justify-center'} ${isActive('/profile') ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'}`}
        >
          {isActive('/profile') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Perfil
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${isActive('/profile') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            person_outline
          </span>
          {open && 'Perfil'}
        </Link>

        <Link
          href="/settings/wallet"
          title={!open ? 'Carteira' : ''}
          className={`relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group ${open ? '' : 'justify-center'} ${isActive('/settings/wallet') ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'}`}
        >
          {isActive('/settings/wallet') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Carteira
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
          <span
            className={`material-symbols-outlined text-[22px] transition-colors ${isActive('/settings/wallet') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            account_balance_wallet
          </span>
          {open && 'Carteira'}
        </Link>

        <div className={`border-t border-gray-200 my-4 ${open ? '' : 'mx-2'}`} />
      </nav>

      <div className={`py-6 border-t border-gray-200 bg-white ${open ? 'px-6' : 'px-2'}`}>
        <div
          className={`flex items-center ${open ? 'gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-100 shadow-sm' : 'justify-center'} transition-all duration-300`}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6f43d0] to-[#6fdcff] blur-sm opacity-40"></div>
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#6f43d0] to-[#6fdcff] flex items-center justify-center overflow-hidden ring-2 ring-white">
              <span className="text-base font-bold text-white">{user?.firstName?.[0] || 'U'}</span>
            </div>
          </div>
          {open && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-semibold text-sm truncate text-gray-800">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-500 truncate">{user?.email}</span>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${open ? '' : 'px-2'}`}
        >
          <span
            className="material-symbols-outlined text-[20px] rotate-180"
            style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}
          >
            logout
          </span>
          {open && 'Sair'}
        </button>
      </div>
    </aside>
  );
}
