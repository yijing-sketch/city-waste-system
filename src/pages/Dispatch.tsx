import { useState, useMemo } from 'react';
import { useData } from '../hooks/DataContext';
import { Truck, MapPin, Clock, CheckCircle2, Play, User, Gauge } from 'lucide-react';
import type { SmartBin } from '../data/types';

/** 计算清运进度：已清理（满溢率<50%）的桶占比 */
function calcProgress(binIds: string[], bins: SmartBin[]): number {
  if (binIds.length === 0) return 0;
  const cleaned = binIds.filter(id => {
    const bin = bins.find(b => b.id === id);
    return !bin || bin.fillLevel < 50;
  }).length;
  return Math.min(100, Math.round(cleaned / binIds.length * 100));
}

export default function Dispatch() {
  const { tasks, vehicles, bins, assignTask } = useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(t => t.status === filter);
  }, [tasks, filter]);

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '待执行', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    in_progress: { label: '进行中', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    completed: { label: '已完成', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  };

  const vehicleStatusLabels: Record<string, { label: string; color: string }> = {
    idle: { label: '空闲', color: 'text-slate-400 bg-slate-400/10' },
    heading: { label: '前往中', color: 'text-blue-400 bg-blue-400/10' },
    working: { label: '作业中', color: 'text-green-400 bg-green-400/10' },
    returning: { label: '返程中', color: 'text-yellow-400 bg-yellow-400/10' },
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">调度中心</h2>
          <p className="text-xs text-slate-500 mt-0.5">清运任务管理与车辆调度</p>
        </div>
      </div>

      {/* 车辆状态概览 */}
      <div className="grid grid-cols-4 gap-3">
        {vehicles.map(v => (
          <div key={v.id} className={`rounded-xl p-3.5 border ${v.status === 'idle' ? 'border-[#1e2a3a] bg-[#0f1520]' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${v.status === 'idle' ? 'bg-slate-500' : v.status === 'working' ? 'bg-green-500' : v.status === 'heading' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-slate-400">{v.plate}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              <div className="flex items-center gap-1"><User size={10} /> {v.driver}</div>
              <div className="flex items-center gap-1 mt-1"><Gauge size={10} /> 油量{v.fuel}% | 载重{v.loadWeight}吨</div>
              <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] ${vehicleStatusLabels[v.status].color}`}>
                {vehicleStatusLabels[v.status].label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 任务筛选与列表 */}
      <div className="flex gap-2 mb-1">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {f === 'all' ? '全部' : statusLabels[f]?.label}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      <div className="grid grid-cols-2 gap-4">
        {filteredTasks.map(task => {
          const vehicle = vehicles.find(v => v.id === task.vehicleId);
          const districtBins = bins.filter(b => task.binIds.includes(b.id));
          const avgFill = districtBins.length > 0
            ? Math.round(districtBins.reduce((s, b) => s + b.fillLevel, 0) / districtBins.length)
            : 0;

          return (
            <div key={task.id} className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-4 hover:border-[#2a3a4a] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">#{task.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusLabels[task.status]?.color}`}>
                      {statusLabels[task.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {task.district}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> 预计{task.estimatedDuration}分钟</span>
                  </div>
                </div>
                {task.status === 'pending' && (
                  <button
                    onClick={() => assignTask(task.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <Play size={12} /> 派单
                  </button>
                )}
                {task.status === 'completed' && (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1"><Truck size={12} /> {task.vehiclePlate}</span>
                <span>司机: {task.driver}</span>
              </div>

              {/* 垃圾桶点位 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {task.binIds.map(bid => {
                  const bin = bins.find(b => b.id === bid);
                  return (
                    <span key={bid} className={`px-2 py-0.5 rounded text-[10px] border ${
                      bin?.status === 'full' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                      bin?.status === 'warning' ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' :
                      'border-[#1e2a3a] text-slate-500'
                    }`}>
                      {bid}-{bin?.name?.split('-').pop()}
                    </span>
                  );
                })}
              </div>

              {/* 进度条 */}
              {task.status === 'in_progress' && (
                <div className="mt-1">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>清运进度</span>
                    <span>{avgFill > 70 ? '注意：满溢垃圾桶较多' : '正常作业'}</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all" style={{ width: `${calcProgress(task.binIds, bins)}%` }} />
                  </div>
                </div>
              )}

              {task.status === 'completed' && task.collectedWeight && (
                <div className="text-xs text-slate-500 mt-2">
                  已清运 <span className="text-green-400 font-bold">{task.collectedWeight}吨</span>
                  <span className="mx-2">|</span>
                  完成于 {task.endTime?.slice(11, 16)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
