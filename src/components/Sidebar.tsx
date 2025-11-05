import Link from 'next/link';
import { useState } from 'react';

import { UserProfile } from '@/types/user';

interface SidebarProps {
  onLogout: () => void;
  user?: Partial<UserProfile> | null;
}

export default function Sidebar({ onLogout, user }: SidebarProps) {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`h-screen bg-white text-[#181b4a] flex flex-col justify-between border-r border-gray-100 shadow-sm transition-all duration-300 ${open ? 'w-72' : 'w-20'}`}
    >
      {/* Topo: Logo e nome do app */}
      {open ? (
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow">
            <span className="text-lg font-extrabold text-white">C</span>
          </div>
          <span className="font-bold text-lg tracking-tight">ChatCheckout</span>
          <button
            className="ml-auto p-2 rounded hover:bg-[#f2f4f7] transition"
            onClick={() => setOpen(false)}
            aria-label="Fechar sidebar"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-[#6f43d0]">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" fill="currentColor" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center shadow">
            <span className="text-lg font-extrabold text-white">C</span>
          </div>
          <div className="h-4" />
          <button
            className="p-2 rounded hover:bg-[#f2f4f7] transition"
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
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#f2f4f7] transition text-base font-medium group ${open ? '' : 'justify-center'}`}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className="text-[#6f43d0] group-hover:text-[#181b4a]"
          >
            <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" />
            <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" />
          </svg>
          {open && 'Dashboard'}
        </Link>
        <Link
          href="/produtos"
          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#f2f4f7] transition text-base font-medium group ${open ? '' : 'justify-center'}`}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className="text-[#6f43d0] group-hover:text-[#181b4a]"
          >
            <path
              d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z"
              fill="currentColor"
            />
          </svg>
          {open && 'Produtos'}
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#f2f4f7] transition text-base font-medium group ${open ? '' : 'justify-center'}`}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            className="text-[#6f43d0] group-hover:text-[#181b4a]"
          >
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" fill="currentColor" />
          </svg>
          {open && 'Perfil'}
        </Link>
        <div className={`border-t border-gray-100 my-4 ${open ? '' : 'mx-2'}`} />
      </nav>
      {/* Rodapé: Área do usuário + logout, adaptável */}
      <div className={`py-6 border-t border-gray-100 ${open ? 'px-6' : 'px-2'}`}>
        <div
          className={`flex items-center ${open ? 'gap-2 p-2 rounded-lg bg-[#f7f8fa] shadow-sm' : 'justify-center'} transition-all duration-300`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6fdcff] to-[#6f43d0] flex items-center justify-center overflow-hidden">
            <span className="text-base font-bold text-white">{user?.firstName?.[0] || 'U'}</span>
          </div>
          {open && (
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-xs text-gray-400 truncate">{user?.email}</span>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 mt-4 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6f43d0] to-[#6fdcff] text-white font-semibold shadow hover:scale-[1.01] hover:shadow-lg transition-all ${open ? '' : 'text-sm px-2 py-2'}`}
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
