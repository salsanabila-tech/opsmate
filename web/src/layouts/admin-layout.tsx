import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { ClipboardList, LayoutDashboard, LogOut, Users, UserRoundCog } from 'lucide-react';

import { useAuth } from '../context/auth-context';

const menu = [
  {
    label: 'Dashboard',
    to: '/app',
    icon: LayoutDashboard,
    end: true,
  },

  {
    label: 'Work Orders',
    to: '/app/work-orders',
    icon: ClipboardList,
  },

  {
    label: 'Customers',
    to: '/app/customers',
    icon: Users,
  },

  {
    label: 'Technicians',
    to: '/app/technicians',
    icon: UserRoundCog,
  },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();

    navigate('/login', {
      replace: true,
    });
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-20 items-center border-b border-gray-100 px-6">
          <div>
            <div className="text-lg font-bold text-gray-950">OpsMate</div>

            <div className="text-xs text-gray-400">Admin Console</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menu.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => ['flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'].join(' ')}
            >
              <Icon className="h-4 w-4" />

              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="mb-3 px-3">
            <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>

            <div className="truncate text-xs text-gray-400">{user?.email}</div>
          </div>

          <button
            onClick={() => {
              void handleLogout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto min-h-screen max-w-[1600px] p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
