import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, GraduationCap, LayoutDashboard, Settings, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // PrivateRoute in App.jsx handles redirects — this is just a safety fallback
  if (!user) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  /* ── nav links by role ── */
  const navLinks = user.role === 'admin'
    ? [{ name: 'Courses', path: '/admin', icon: <LayoutDashboard size={20} />, exact: true }]
    : [{ name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} />, exact: true }];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  /* ── Breadcrumb from path segments ── */
  const buildBreadcrumbs = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs = [];
    let href = '';

    // These are URL structure words with no real route — skip as clickable crumbs
    const SKIP_LABELS = new Set(['course', 'assignment', 'groups', 'create', 'edit']);

    segments.forEach((seg, i) => {
      href += `/${seg}`;
      // Skip IDs (course1, assign_, grp_, etc.) and connector words
      const isId   = /^(assign_|grp_|course\d|student\d|assign\d|sub_)/.test(seg);
      const isSkip = SKIP_LABELS.has(seg.toLowerCase());
      if (isId || isSkip) return;  // don't add a crumb for this segment

      const label = seg.charAt(0).toUpperCase() + seg.slice(1);
      const isLast = i === segments.length - 1
        || segments.slice(i + 1).every(s =>
            /^(assign_|grp_|course\d|student\d|assign\d|sub_)/.test(s) ||
            SKIP_LABELS.has(s.toLowerCase())
          );
      crumbs.push({ label, href: isLast ? null : href });
    });
    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-outfit overflow-hidden relative">

      {/* ── BACKGROUND GRAPHIC ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-5%] text-[45rem] font-serif font-black text-slate-50 leading-none select-none opacity-40">D</div>
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-70 animate-blob" />
        <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-72 bg-white flex-shrink-0 flex-col pt-10 z-20 h-screen border-r border-slate-100 relative shadow-[20px_0_60px_-15px_rgba(0,0,0,0.02)]">

        {/* Brand */}
        <div className="flex items-center gap-3 px-8 mb-12">
          <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tighter">
            eduTrack<span className="text-indigo-500">.</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link key={link.name} to={link.path}
                className={`flex items-center gap-3 px-5 py-4 rounded-[20px] transition-all duration-300 font-bold tracking-tight text-sm relative z-10 group ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}>
                {active && (
                  <motion.div layoutId="active-nav-bg"
                    className="absolute inset-0 bg-indigo-50/50 rounded-[20px] border border-indigo-100/50 z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 transition-colors duration-300 ${active ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'} transform group-hover:scale-110`}>
                  {link.icon}
                </div>
                <span className="relative z-10">{link.name}</span>
                {active && <ChevronRight size={14} className="ml-auto relative z-10 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 mt-auto mb-4">
          <div className="bg-slate-50/80 backdrop-blur-sm border border-slate-100 rounded-[24px] p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center text-slate-900 font-black text-lg border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-50" />
              <span className="relative z-10">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-900 leading-tight">{user.name.split(' ')[0]}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{user.role}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[18px] transition-all duration-300 group uppercase tracking-widest">
            <LogOut size={16} className="transform group-hover:-translate-x-1 duration-300 text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <h1 className="text-xl font-serif font-black text-slate-900 tracking-tighter">
          eduTrack<span className="text-indigo-500">.</span>
        </h1>
        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 font-black border border-slate-100">
          {user.name.charAt(0)}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-x-hidden w-full relative h-[100dvh] md:h-screen z-10">
        <div className="h-full overflow-y-auto px-6 py-8 md:px-12 md:py-10 lg:px-16 lg:py-12 max-w-7xl mx-auto w-full relative z-10 pb-32 md:pb-16">
          {/* Breadcrumb */}
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1.5 mb-8 text-[10px] font-black uppercase tracking-widest text-slate-300">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-indigo-600 transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-slate-600">{crumb.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <ChevronRight size={10} className="text-slate-200" />}
                </React.Fragment>
              ))}
            </nav>
          )}
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[92%] max-w-sm z-50">
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[28px] p-2 flex items-center justify-between">
          {navLinks.map((link) => {
            const active = isActive(link.path, link.exact);
            return (
              <Link key={link.name} to={link.path}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 relative z-10 ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {active && (
                  <motion.div layoutId="mobile-active-bg"
                    className="absolute inset-0 bg-white/10 rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 mb-1">{link.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-wider relative z-10">{link.name}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-2.5 text-slate-500 hover:text-rose-400 rounded-2xl transition-all duration-300">
            <LogOut size={20} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
