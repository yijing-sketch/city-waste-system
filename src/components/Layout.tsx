import { NavLink, Outlet } from 'react-router-dom';
import { useData } from '../hooks/DataContext';
import { LayoutDashboard, Truck, ClipboardList, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '指挥大屏' },
  { to: '/dispatch', icon: Truck, label: '调度中心' },
  { to: '/report', icon: ClipboardList, label: '数据填报' },
  { to: '/analytics', icon: BarChart3, label: '数据分析' },
];

export default function Layout() {
  const { alerts } = useData();
  const unhandledCount = alerts.filter(a => !a.handled).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0e17]">
      {/* 左侧导航 */}
      <aside className="w-56 flex-shrink-0 bg-[#0f1520] border-r border-[#1e2a3a] flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-[#1e2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">城市垃圾处理</h1>
              <p className="text-[10px] text-slate-500">CityWaste System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.to === '/dashboard' && unhandledCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                  {unhandledCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e2a3a]">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Bell size={14} />
            <span>系统运行中 · v1.0</span>
          </div>
        </div>
      </aside>

      {/* 右侧内容 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
