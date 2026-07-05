import { useMemo, useState, useCallback } from 'react';
import { useData } from '../hooks/DataContext';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import MapView from '../components/MapView';
import AlertDetailModal from '../components/AlertDetailModal';
import { Trash2, Truck, AlertTriangle, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import type { Alert } from '../data/types';

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

export default function Dashboard() {
  const { bins, vehicles, plants, alerts, dailyStats, handleAlert } = useData();

  // 告警弹窗状态
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  // 地图飞行目标
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocateOnMap = useCallback((lat: number, lng: number) => {
    setFlyToTarget({ lat, lng });
    // 触发后自动清除，下次相同坐标仍能触发 flyTo
    setTimeout(() => setFlyToTarget(null), 100);
  }, []);

  const stats = useMemo(() => {
    const totalBins = bins.length;
    const fullBins = bins.filter(b => b.status === 'full').length;
    const warningBins = bins.filter(b => b.status === 'warning').length;
    const activeVehicles = vehicles.filter(v => v.status !== 'idle').length;
    const unhandledAlerts = alerts.filter(a => !a.handled).length;
    const todayCollected = dailyStats[dailyStats.length - 1]?.collected || 0;
    const avgFill = Math.round(bins.reduce((s, b) => s + b.fillLevel, 0) / totalBins);
    return { totalBins, fullBins, warningBins, activeVehicles, unhandledAlerts, todayCollected, avgFill };
  }, [bins, vehicles, alerts, dailyStats]);

  // 处理厂负载
  const plantLoadOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { text: '处理厂实时负载', left: 'center', top: 8, textStyle: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 } },
    grid: { left: 85, right: 30, top: 50, bottom: 25 },
    xAxis: { type: 'value', max: 2500, axisLabel: { formatter: '{value}吨', color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
    yAxis: { type: 'category', data: plants.map(p => p.name), axisLabel: { color: '#94a3b8', fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
    series: [
      { type: 'bar', data: plants.map(p => p.currentLoad), itemStyle: { color: '#22c55e', borderRadius: [0, 4, 4, 0] }, barWidth: 14, name: '当前负载' },
      { type: 'bar', data: plants.map(p => p.capacity), itemStyle: { color: 'transparent', borderColor: '#334155', borderWidth: 1, borderRadius: [0, 4, 4, 0] }, barWidth: 14, barGap: '-100%', name: '最大容量' },
    ],
  }), [plants]);

  // 14天趋势
  const trendOption = useMemo(() => {
    const recentDays = dailyStats.slice(-14);
    return {
      backgroundColor: 'transparent',
      title: { text: '近14天垃圾清运量趋势', left: 'center', top: 8, textStyle: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      grid: { left: 45, right: 20, top: 50, bottom: 25 },
      xAxis: { type: 'category', data: recentDays.map(d => d.date.slice(5)), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', name: '吨', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
      series: [
        { type: 'bar', data: recentDays.map(d => d.collected), itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] }, barWidth: 10, name: '清运量' },
        { type: 'line', data: recentDays.map(d => d.recycled), smooth: true, lineStyle: { color: '#3b82f6', width: 2 }, itemStyle: { color: '#3b82f6' }, symbol: 'circle', symbolSize: 4, name: '回收量' },
      ],
    };
  }, [dailyStats]);

  return (
    <div className="p-5 space-y-4 h-full flex flex-col">
      {/* 顶部指标卡片 */}
      <div className="grid grid-cols-6 gap-4 flex-shrink-0">
        <MetricCard icon={<Trash2 size={18} />} label="垃圾桶总数" value={stats.totalBins} sub={`满溢 ${stats.fullBins} / 预警 ${stats.warningBins}`} color="emerald" />
        <MetricCard icon={<TrendingUp size={18} />} label="平均满溢率" value={`${stats.avgFill}%`} sub="全城平均" color="blue" />
        <MetricCard icon={<Truck size={18} />} label="在途车辆" value={stats.activeVehicles} sub={`共 ${vehicles.length} 辆`} color="cyan" />
        <MetricCard icon={<AlertTriangle size={18} />} label="待处理告警" value={stats.unhandledAlerts} sub={stats.unhandledAlerts > 0 ? '需要关注' : '一切正常'} color={stats.unhandledAlerts > 0 ? 'red' : 'green'} />
        <MetricCard icon={<CheckCircle2 size={18} />} label="今日清运" value={`${stats.todayCollected}吨`} sub="预计完成率 92%" color="violet" />
        <MetricCard icon={<Clock size={18} />} label="系统运行" value="正常" sub="数据刷新中" color="slate" />
      </div>

      {/* 全宽地图 */}
      <div className="flex-1 min-h-0 bg-[#0f1520] border border-[#1e2a3a] rounded-xl overflow-hidden">
        <MapView bins={bins} vehicles={vehicles} plants={plants} flyToTarget={flyToTarget} />
      </div>

      {/* 底部：告警 + 图表 */}
      <div className="flex gap-4 flex-shrink-0" style={{ height: '42%', minHeight: 300 }}>
        {/* 左：告警列表 */}
        <div className="w-1/3 bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3 overflow-auto">
          <h3 className="text-sm font-bold text-slate-300 mb-3">实时告警事件</h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:brightness-110 transition-all ${
                  alert.level === 'high' ? 'border-red-500/20 bg-red-500/5' :
                  alert.level === 'medium' ? 'border-yellow-500/20 bg-yellow-500/5' :
                  'border-blue-500/20 bg-blue-500/5'
                } ${alert.handled ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between gap-1.5 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      alert.level === 'high' ? 'bg-red-500' : alert.level === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-slate-200 truncate">{alert.title}</span>
                  </div>
                  {alert.handled ? (
                    <span className="text-[10px] text-green-400 flex-shrink-0">已处理</span>
                  ) : (
                    <button
                      onClick={() => handleAlert(alert.id)}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex-shrink-0"
                    >
                      处理
                    </button>
                  )}
                </div>
                <p className="text-slate-500 ml-3 truncate">{alert.description}</p>
                <div className="flex items-center gap-2 mt-1 ml-3">
                  <span className="text-slate-600">{alert.time.slice(11, 16)}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-500">{alert.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右：处理厂 + 趋势（上下排列） */}
        <div className="w-2/3 flex flex-col gap-4">
          <div className="flex-1 bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3">
            <ReactEChartsCore echarts={echarts} option={plantLoadOption} style={{ height: '100%' }} />
          </div>
          <div className="flex-1 bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3">
            <ReactEChartsCore echarts={echarts} option={trendOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      {/* 告警详情弹窗 */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          bins={bins}
          vehicles={vehicles}
          plants={plants}
          onClose={() => setSelectedAlert(null)}
          onHandle={handleAlert}
          onLocate={handleLocateOnMap}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400',
    slate: 'from-slate-500/20 to-slate-500/5 border-slate-500/20 text-slate-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.emerald} border rounded-xl p-3.5`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-70">{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
    </div>
  );
}
