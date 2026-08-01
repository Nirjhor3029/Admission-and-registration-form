import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin/overview', icon: 'dashboard', label: 'Overview' },
  { path: '/admin/students', icon: 'group', label: 'Students' },
  { path: '/admin/payments', icon: 'payments', label: 'Payments' },
  { path: '/admin/courses', icon: 'library_books', label: 'Courses' },
  { path: '/admin/reports', icon: 'analytics', label: 'Reports' },
  { path: '/admin/settings', icon: 'settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex bg-surface-container-low text-on-surface text-label-md w-[280px] border-r border-outline-variant flex-col py-8 z-40">
        <div className="px-6 mb-8">
          <h1 className="text-headline-lg font-black text-primary">FARS</h1>
        </div>
        <div className="flex items-center gap-4 px-6 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
            <span className="text-headline-md font-bold">{user?.name?.[0] || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-label-md text-on-surface truncate">{user?.name || 'Admin'}</p>
            <p className="text-body-sm text-on-surface-variant truncate capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</p>
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto pr-4">
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <NavLink
                to={item.path}
                end={item.path === '/admin/overview'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-r-full transition-colors ${
                    isActive
                      ? 'bg-secondary-container text-on-secondary-container font-bold'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  }`
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="px-6 pt-4 mt-auto border-t border-outline-variant">
          <button
            onClick={logout}
            className="flex items-center gap-3 text-on-surface-variant hover:text-error transition-colors w-full py-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <p className="text-body-sm text-on-surface-variant mt-2">v1.0.4</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 h-screen overflow-y-auto bg-surface-bright">
        <div className="p-4 md:p-10 pb-20 md:pb-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant shadow-lg flex justify-around items-center px-4 py-2">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin/overview'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] mt-1">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center justify-center p-2 min-w-[64px] text-on-surface-variant rounded-xl"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-[10px] mt-1">Logout</span>
        </button>
      </nav>
    </div>
  );
}
