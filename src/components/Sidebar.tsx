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

  // Helper para verificar se o link está ativo
  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-white to-gray-50 text-[#181b4a] flex flex-col justify-between border-r border-gray-200 shadow-xl transition-all duration-300 ${open ? 'w-72' : 'w-20'}`}
    >
      {/* Topo: Logo e nome do app */}
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
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#6f43d0]">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" fill="currentColor" />
            </svg>
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
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#6f43d0]">
              <path d="M8.59 16.59L13.17 12l-4.58-4.59L10 6l6 6-6 6z" fill="currentColor" />
            </svg>
          </button>
        </div>
      )}
      {/* Navegação principal */}
      <nav className={`flex-1 flex flex-col gap-1 py-6 ${open ? 'px-4' : 'px-2'}`}>
        {open && <span className="text-xs font-semibold text-gray-400 mb-2 ml-2">Menu</span>}

        {/* Dashboard */}
        <Link
          href="/dashboard"
          title={!open ? 'Dashboard' : ''}
          className={`
            relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group
            ${open ? '' : 'justify-center'}
            ${
              isActive('/dashboard')
                ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'
            }
          `}
        >
          {/* Indicador de página ativa */}
          {isActive('/dashboard') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}

          {/* Tooltip customizado quando fechado */}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Dashboard
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}

          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className={`transition-colors ${isActive('/dashboard') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
          >
            <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" />
          </svg>
          {open && 'Dashboard'}
        </Link>

        {/* Produtos */}
        <Link
          href="/produtos"
          title={!open ? 'Produtos' : ''}
          className={`
            relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group
            ${open ? '' : 'justify-center'}
            ${
              isActive('/produtos')
                ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'
            }
          `}
        >
          {/* Indicador de página ativa */}
          {isActive('/produtos') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}

          {/* Tooltip customizado quando fechado */}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Produtos
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}

          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className={`transition-colors ${isActive('/produtos') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
          >
            <path
              d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z"
              fill="currentColor"
            />
          </svg>
          {open && 'Produtos'}
        </Link>

        {/* Perfil */}
        <Link
          href="/profile"
          title={!open ? 'Perfil' : ''}
          className={`
            relative flex items-center gap-3 py-3 px-3 rounded-lg transition-all duration-200 text-base font-medium group
            ${open ? '' : 'justify-center'}
            ${
              isActive('/profile')
                ? 'bg-gradient-to-r from-purple-50 to-cyan-50 text-[#6f43d0] font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-[#6f43d0] hover:shadow-sm'
            }
          `}
        >
          {/* Indicador de página ativa */}
          {isActive('/profile') && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6f43d0] to-[#6fdcff] rounded-r-full" />
          )}

          {/* Tooltip customizado quando fechado */}
          {!open && (
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Perfil
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}

          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className={`transition-colors ${isActive('/profile') ? 'text-[#6f43d0]' : 'text-gray-500 group-hover:text-[#6f43d0]'}`}
          >
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" fill="currentColor" />
          </svg>
          {open && 'Perfil'}
        </Link>

        <div className={`border-t border-gray-200 my-4 ${open ? '' : 'mx-2'}`} />
      </nav>
      {/* Rodapé: Área do usuário + logout, adaptável */}
      <div className={`py-6 border-t border-gray-200 bg-white ${open ? 'px-6' : 'px-2'}`}>
        <div
          className={`flex items-center ${
            open
              ? 'gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-100 shadow-sm'
              : 'justify-center'
          } transition-all duration-300`}
        >
          {/* Avatar com borda gradiente */}
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

        {/* Botão de logout aprimorado */}
        <button
          onClick={onLogout}
          className={`
            w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl
            bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold shadow-lg
            hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
            ${open ? '' : 'px-2'}
          `}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
              d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
              fill="#fff"
            />
          </svg>
          {open && 'Sair'}
        </button>
      </div>
    </aside>
  );
}
