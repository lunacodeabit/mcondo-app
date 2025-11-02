"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4">
        <div className="flex items-center gap-2 mb-8">
          <Logo />
          <span className="text-lg font-semibold">CondoAdmin</span>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/dashboard" className={`flex items-center gap-2 p-2 rounded ${pathname === '/dashboard' ? 'bg-blue-600' : ''}`}>
                <i data-lucide="layout-dashboard"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/clientes" className={`flex items-center gap-2 p-2 rounded ${pathname === '/clientes' ? 'bg-blue-600' : ''}`}>
                <i data-lucide="users"></i> Clientes
              </Link>
            </li>
            {/* Add other links here */}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <span>¡Bienvenido, Howard!</span>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
