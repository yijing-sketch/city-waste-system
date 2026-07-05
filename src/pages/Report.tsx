import { useState } from 'react';
import { useData } from '../hooks/DataContext';
import { ClipboardList, Send, AlertCircle, CheckCircle2, Trash2, Camera } from 'lucide-react';
import type { InspectionRecord } from '../data/types';

export default function Report() {
  const { bins, inspections, addInspection } = useData();
  const [selectedBinId, setSelectedBinId] = useState('');
  const [fillLevel, setFillLevel] = useState(50);
  const [isDamaged, setIsDamaged] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedBin = bins.find(b => b.id === selectedBinId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBinId) return;

    const record: InspectionRecord = {
      id: `INS-${String(Date.now()).slice(-6)}`,
      binId: selectedBinId,
      binName: selectedBin?.name || selectedBinId,
      inspector: '当前用户',
      district: selectedBin?.district || '未知',
      time: new Date().toISOString(),
      fillLevel,
      isDamaged,
      notes: notes || (isDamaged ? '发现设备损坏，已记录' : '巡检正常'),
    };

    addInspection(record);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedBinId('');
      setFillLevel(50);
      setIsDamaged(false);
      setNotes('');
    }, 2500);
  };

  return (
    <div className="p-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">数据填报</h2>
        <p className="text-xs text-slate-500 mt-0.5">巡检人员现场记录与异常上报</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* 填报表单 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">巡检记录填报</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 选择垃圾桶 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">选择垃圾桶点位</label>
              <select
                value={selectedBinId}
                onChange={e => setSelectedBinId(e.target.value)}
                className="w-full bg-[#1a1f2e] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                required
              >
                <option value="">-- 请选择垃圾桶 --</option>
                {bins.map(bin => (
                  <option key={bin.id} value={bin.id}>
                    {bin.id} - {bin.name} ({bin.district}) [{bin.status === 'full' ? '满溢' : bin.status === 'warning' ? '预警' : '正常'}]
                  </option>
                ))}
              </select>
            </div>

            {/* 满溢程度滑块 */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <label>满溢程度</label>
                <span className={`font-bold ${
                  fillLevel >= 90 ? 'text-red-400' : fillLevel >= 70 ? 'text-yellow-400' : 'text-green-400'
                }`}>{fillLevel}%</span>
              </div>
              <input
                type="range"
                min="0" max="100"
                value={fillLevel}
                onChange={e => setFillLevel(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 rounded-full"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>空</span><span>半满</span><span>满溢</span>
              </div>
            </div>

            {/* 是否损坏 */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDamaged}
                  onChange={e => setIsDamaged(e.target.checked)}
                  className="w-4 h-4 rounded accent-red-500"
                />
                <span className="text-xs text-slate-400">
                  {isDamaged ? (
                    <span className="flex items-center gap-1"><AlertCircle size={14} className="text-red-400" /> 设备损坏</span>
                  ) : '标记设备损坏'}
                </span>
              </label>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">备注说明</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="请描述现场情况..."
                rows={3}
                className="w-full bg-[#1a1f2e] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              />
            </div>

            {/* 模拟拍照上传 */}
            <div className="flex items-center gap-3 p-3 bg-[#1a1f2e] border border-dashed border-[#2a3a4a] rounded-lg">
              <Camera size={18} className="text-slate-500" />
              <span className="text-xs text-slate-500">模拟拍照上传（Demo 环境下不实际存储）</span>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={!selectedBinId}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Send size={15} />
              提交巡检记录
            </button>

            {/* 提交成功提示 */}
            {submitted && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400">
                <CheckCircle2 size={14} />
                巡检记录已成功提交！
              </div>
            )}
          </form>
        </div>

        {/* 最近提交记录 */}
        <div className="bg-[#0f1520] border border-[#1e2a3a] rounded-xl p-5 overflow-auto max-h-[calc(100vh-140px)]">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={18} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-200">最近巡检记录</h3>
            <span className="text-[10px] text-slate-600 ml-auto">共{inspections.length}条</span>
          </div>

          <div className="space-y-2">
            {inspections.slice(0, 20).map(record => (
              <div key={record.id} className={`p-3 rounded-lg border text-xs ${
                record.isDamaged ? 'border-red-500/20 bg-red-500/5' : 'border-[#1e2a3a] bg-[#0a0e17]'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-200">{record.binName}</span>
                  <span className="text-slate-600">{record.time.slice(5, 16).replace('T', ' ')}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span>满溢: <span className={record.fillLevel >= 70 ? 'text-yellow-400' : 'text-green-400'}>{record.fillLevel}%</span></span>
                  <span>巡检员: {record.inspector}</span>
                  {record.isDamaged && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={10} /> 损坏</span>}
                </div>
                <p className="text-slate-600 mt-1">{record.notes}</p>
              </div>
            ))}
            {inspections.length === 0 && (
              <div className="text-center text-slate-600 py-8 text-xs">暂无巡检记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
