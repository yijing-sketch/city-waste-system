import { useMemo, useState, useRef } from 'react';
import { useData } from '../hooks/DataContext';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart3, TrendingUp, Recycle, Factory } from 'lucide-react';

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

type TimeRange = 'week' | 'month';

export default function Analytics() {
  const { dailyStats, districtStats, plants, vehicles, bins } = useData();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // 垃圾产生量趋势
  const trendOption = useMemo(() => {
    const data = timeRange === 'week' ? dailyStats.slice(-7) : dailyStats;
    return {
      backgroundColor: 'transparent',
      title: { text: '垃圾清运量趋势', left: 'center', top: 10, textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 } },
      legend: { data: ['清运总量', '厨余垃圾', '可回收物', '其他垃圾'], bottom: 5, textStyle: { color: '#64748b', fontSize: 10 } },
      grid: { left: 50, right: 30, top: 55, bottom: 40 },
      xAxis: { type: 'category', data: data.map(d => d.date.slice(5)), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } } },
      yAxis: { type: 'value', name: '吨', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
      series: [
        { type: 'line', data: data.map(d => d.collected), smooth: true, lineStyle: { color: '#22c55e', width: 2.5 }, itemStyle: { color: '#22c55e' }, symbol: 'circle', symbolSize: 5, name: '清运总量' },
        { type: 'line', data: data.map(d => d.kitchen), smooth: true, lineStyle: { color: '#f59e0b', width: 1.5 }, itemStyle: { color: '#f59e0b' }, symbol: 'diamond', symbolSize: 4, name: '厨余垃圾' },
        { type: 'line', data: data.map(d => d.recycled), smooth: true, lineStyle: { color: '#3b82f6', width: 1.5 }, itemStyle: { color: '#3b82f6' }, symbol: 'triangle', symbolSize: 4, name: '可回收物' },
        { type: 'line', data: data.map(d => d.other), smooth: true, lineStyle: { color: '#94a3b8', width: 1.5, type: 'dashed' }, itemStyle: { color: '#94a3b8' }, symbol: 'rect', symbolSize: 3, name: '其他垃圾' },
      ],
    };
  }, [dailyStats, timeRange]);

  // 各片区分类回收率
  const districtRecycleOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { text: '各片区分类回收率对比', left: 'center', top: 10, textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 } },
    grid: { left: 60, right: 30, top: 55, bottom: 30 },
    xAxis: { type: 'category', data: districtStats.map(d => d.district.replace('区', '')), axisLabel: { color: '#64748b', fontSize: 10 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', name: '%', max: 60, nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
    series: [
      {
        type: 'bar',
        data: districtStats.map(d => ({
          value: d.recyclingRate,
          itemStyle: {
            color: d.recyclingRate >= 35 ? '#22c55e' : d.recyclingRate >= 28 ? '#f59e0b' : '#ef4444',
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: 32,
        label: { show: true, position: 'top', color: '#94a3b8', fontSize: 10, formatter: '{c}%' },
      },
    ],
  }), [districtStats]);

  // 车辆油耗与效率（确定性模拟数据，首次计算后缓存）
  const vehicleEfficiencySeeded = useRef<{ attendance: number[]; fullLoad: number[] } | null>(null);
  if (!vehicleEfficiencySeeded.current) {
    const hash = (s: string) => s.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    vehicleEfficiencySeeded.current = {
      attendance: vehicles.slice(0, 8).map(v => 60 + (hash(v.id + v.driver) % 35)),
      fullLoad: vehicles.slice(0, 8).map(v => 70 + (hash(v.plate + v.driver) % 25)),
    };
  }
  const vehicleEfficiencyOption = useMemo(() => ({
    backgroundColor: 'transparent',
    title: { text: '车辆作业效率概览', left: 'center', top: 10, textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 } },
    grid: { left: 80, right: 50, top: 55, bottom: 30 },
    xAxis: { type: 'value', name: '%', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
    yAxis: { type: 'category', data: vehicles.slice(0, 8).map(v => `${v.plate} ${v.driver}`), axisLabel: { color: '#94a3b8', fontSize: 10 } },
    series: [
      { type: 'bar', data: vehicleEfficiencySeeded.current!.attendance, itemStyle: { color: '#3b82f6', borderRadius: [0, 6, 6, 0] }, barWidth: 12, name: '出勤率' },
      { type: 'bar', data: vehicleEfficiencySeeded.current!.fullLoad, itemStyle: { color: '#22c55e', borderRadius: [0, 6, 6, 0] }, barWidth: 12, name: '满载率' },
    ],
  }), [vehicles]);

  // 处理厂利用率排行
  const plantUtilOption = useMemo(() => {
    const plantData = plants.map(p => ({
      name: p.name,
      value: Math.round(p.currentLoad / p.capacity * 100),
    }));

    return {
      backgroundColor: 'transparent',
      title: { text: '处理厂利用率排行', left: 'center', top: 10, textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: '{b}: {c}%' },
      grid: { left: 100, right: 50, top: 55, bottom: 30 },
      xAxis: { type: 'value', max: 100, name: '%', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e2a3a', type: 'dashed' } } },
      yAxis: { type: 'category', data: plantData.map(p => p.name), axisLabel: { color: '#94a3b8', fontSize: 10 }, inverse: true },
      series: [{
        type: 'bar',
        data: plantData.map(p => ({
          value: p.value,
          itemStyle: {
            color: p.value >= 90 ? '#ef4444' : p.value >= 70 ? '#f59e0b' : '#22c55e',
            borderRadius: [0, 6, 6, 0],
          },
        })),
        barWidth: 18,
        label: { show: true, position: 'right', color: '#94a3b8', fontSize: 11, formatter: '{c}%' },
      }],
    };
  }, [plants]);

  // 垃圾组成饼图
  const compositionOption = useMemo(() => {
    const latest = dailyStats[dailyStats.length - 1];
    return {
      backgroundColor: 'transparent',
      title: { text: '今日垃圾组成', left: 'center', top: 10, textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' } },
      tooltip: { trigger: 'item', backgroundColor: 'rgba(15,21,32,0.95)', borderColor: '#1e2a3a', textStyle: { color: '#e2e8f0', fontSize: 12 }, formatter: '{b}: {c}吨 ({d}%)' },
      legend: { bottom: 5, textStyle: { color: '#64748b', fontSize: 10 } },
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '48%'],
        itemStyle: { borderRadius: 4, borderColor: '#0f1520', borderWidth: 3 },
        label: { color: '#94a3b8', fontSize: 10 },
        data: [
          { value: latest.kitchen, name: '厨余垃圾', itemStyle: { color: '#f59e0b' } },
          { value: latest.recycled, name: '可回收物', itemStyle: { color: '#3b82f6' } },
          { value: latest.hazardous, name: '有害垃圾', itemStyle: { color: '#ef4444' } },
          { value: latest.other, name: '其他垃圾', itemStyle: { color: '#94a3b8' } },
        ],
      }],
    };
  }, [dailyStats]);

  // 概要卡片
  const summaryCards = useMemo(() => {
    const recent = dailyStats.slice(-7);
    const avgDaily = Math.round(recent.reduce((s, d) => s + d.collected, 0) / recent.length);
    const totalRecycled = Math.round(recent.reduce((s, d) => s + d.recycled, 0));
    const recycleRate = Math.round(totalRecycled / recent.reduce((s, d) => s + d.collected, 0) * 100);
    const totalBins = bins.length;
    const damagedBins = bins.filter(b => b.status === 'full').length;

    return [
      { icon: <TrendingUp size={18} />, label: '日均清运量', value: `${avgDaily}吨`, sub: '近7日平均', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
      { icon: <Recycle size={18} />, label: '回收利用率', value: `${recycleRate}%`, sub: `共回收${totalRecycled}吨`, color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400' },
      { icon: <BarChart3 size={18} />, label: '垃圾桶总数', value: totalBins, sub: `满溢${damagedBins}个`, color: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400' },
      { icon: <Factory size={18} />, label: '处理厂', value: plants.length, sub: '全部正常运行', color: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400' },
    ];
  }, [dailyStats, bins, plants]);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">数据分析</h2>
          <p className="text-xs text-slate-500 mt-0.5">清运效率、分类成效与趋势洞察</p>
        </div>
        <div className="flex gap-1 bg-[#0f1520] border border-[#1e2a3a] rounded-lg p-0.5">
          <button onClick={() => setTimeRange('week')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeRange === 'week' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>近7天</button>
          <button onClick={() => setTimeRange('month')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeRange === 'month' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>近30天</button>
        </div>
      </div>

      {/* 概要卡片 */}
      <div className="grid grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} border rounded-xl p-3.5`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="opacity-70">{card.icon}</span>
              <span className="text-xs text-slate-400">{card.label}</span>
            </div>
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-[10px] text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 清运量趋势 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3" style={{ height: 360 }}>
          <ReactEChartsCore echarts={echarts} option={trendOption} style={{ height: '100%' }} />
        </div>

        {/* 垃圾组成 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3" style={{ height: 360 }}>
          <ReactEChartsCore echarts={echarts} option={compositionOption} style={{ height: '100%' }} />
        </div>

        {/* 片区回收率 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3" style={{ height: 300 }}>
          <ReactEChartsCore echarts={echarts} option={districtRecycleOption} style={{ height: '100%' }} />
        </div>

        {/* 处理厂利用率 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-3" style={{ height: 300 }}>
          <ReactEChartsCore echarts={echarts} option={plantUtilOption} style={{ height: '100%' }} />
        </div>
      </div>
    </div>
  );
}
