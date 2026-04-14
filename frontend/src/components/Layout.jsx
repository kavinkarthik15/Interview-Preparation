import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, MessageSquare, FileText, User, LogOut, Cpu, Menu, X, Mic } from 'lucide-react';
import { PageTransition } from './ui/PageTransition';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/topics', label: 'Topics', icon: BookOpen },
  { to: '/interviews', label: 'Interviews', icon: MessageSquare },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-dark-bg flex">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-card border-b border-dark-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-accent/20">
            <Cpu className="text-brand-accent-light" size={16} />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-brand-primary-light to-brand-accent-light bg-clip-text text-transparent">
            Interview Prep
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-text-secondary hover:bg-dark-card-hover transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-dark-card border-r border-dark-border flex flex-col fixed h-full z-30 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-brand-primary/20 to-brand-accent/20">
              <Cpu className="text-brand-accent-light" size={18} />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-primary-light to-brand-accent-light bg-clip-text text-transparent">
              Interview Prep
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-2 truncate">Welcome, {user?.name}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary-light shadow-glow-primary ds-nav-active'
                    : 'text-text-secondary hover:bg-dark-card-hover hover:text-text-primary'
                }`
              }
            >
              <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-dark-border">
          <div className="px-4 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-primary-light">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-card text-sm font-medium text-status-error hover:bg-status-error-bg w-full transition-all duration-200 group"
          >
            <LogOut size={18} className="transition-transform duration-200 group-hover:scale-110" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}
