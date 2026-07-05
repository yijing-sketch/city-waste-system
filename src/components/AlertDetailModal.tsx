import { X, MapPin, CheckCircle2, Navigation } from 'lucide-react';
import type { Alert, SmartBin, Vehicle, Plant } from '../data/types';

interface AlertDetailModalProps {
  alert: Alert;
  bins: SmartBin[];
  vehicles: Vehicle[];
  plants: Plant[];
  onClose: () => void;
  onHandle: (alertId: string) => void;
  onLocate: (lat: number, lng: number) => void;
}

export default function AlertDetailModal({ alert, bins, vehicles, plants, onClose, onHandle, onLocate }: AlertDetailModalProps) {
  const relatedBin = alert.relatedId ? bins.find(b => b.id === alert.relatedId) : null;
  const relatedVehicle = alert.relatedId ? vehicles.find(v => v.id === alert.relatedId) : null;

  const levelConfig = {
    high: { label: '高', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    medium: { label: '中', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    low: { label: '低', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };
  const lc = levelConfig[alert.level];

  const handleLocate = () => {
    if (relatedBin) {
      onLocate(relatedBin.location.lat, relatedBin.location.lng);
    } else if (relatedVehicle) {
      onLocate(relatedVehicle.location.lat, relatedVehicle.location.lng);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* 弹窗 */}
      <div
        className="relative w-[460px] max-h-[85vh] bg-[#0f1520] border border-[#1e2a3a] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className={`px-5 py-4 border-b ${lc.border} flex items-start justify-between`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${lc.bg} ${lc.text} border ${lc.border}`}>
              {lc.label}
            </span>
            <h3 className="text-sm font-bold text-white truncate">{alert.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-5 py-4 space-y-4 overflow-auto">
          {/* 完整描述 */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider">告警描述</label>
            <p className="text-sm text-slate-200 mt-1 leading-relaxed">{alert.description}</p>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500">告警类型</label>
              <p className="text-sm text-slate-200 mt-0.5">{alert.type}</p>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500">发生时间</label>
              <p className="text-sm text-slate-200 mt-0.5">{alert.time.slice(0, 19).replace('T', ' ')}</p>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500">位置</label>
              <p className="text-sm text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-slate-500" />
                {alert.location}
              </p>
            </div>
            <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500">处理状态</label>
              <p className={`text-sm mt-0.5 ${alert.handled ? 'text-green-400' : 'text-yellow-400'}`}>
                {alert.handled ? '已处理' : '待处理'}
              </p>
            </div>
          </div>

          {/* 关联设备 */}
          {relatedBin && (
            <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 block">关联垃圾桶</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">名称：</span><span className="text-slate-200">{relatedBin.name}</span></div>
                <div><span className="text-slate-500">片区：</span><span className="text-slate-200">{relatedBin.district}</span></div>
                <div><span className="text-slate-500">满溢率：</span>
                  <span className={relatedBin.fillLevel >= 90 ? 'text-red-400' : relatedBin.fillLevel >= 70 ? 'text-yellow-400' : 'text-green-400'}>
                    {relatedBin.fillLevel}%
                  </span>
                </div>
                <div><span className="text-slate-500">电池：</span><span className="text-slate-200">{relatedBin.battery}%</span></div>
                <div><span className="text-slate-500">温度：</span><span className="text-slate-200">{relatedBin.temperature}°C</span></div>
                <div><span className="text-slate-500">类型：</span><span className="text-slate-200">{relatedBin.type}</span></div>
              </div>
            </div>
          )}

          {relatedVehicle && (
            <div className="bg-[#0a0e17] rounded-lg p-4 border border-[#1e2a3a]">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 block">关联车辆</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500">车牌：</span><span className="text-slate-200">{relatedVehicle.plate}</span></div>
                <div><span className="text-slate-500">司机：</span><span className="text-slate-200">{relatedVehicle.driver}</span></div>
                <div><span className="text-slate-500">油量：</span><span className="text-slate-200">{relatedVehicle.fuel}%</span></div>
                <div><span className="text-slate-500">载重：</span><span className="text-slate-200">{relatedVehicle.loadWeight}吨</span></div>
                <div><span className="text-slate-500">状态：</span><span className="text-slate-200">
                  {relatedVehicle.status === 'idle' ? '空闲' : relatedVehicle.status === 'heading' ? '前往中' : relatedVehicle.status === 'working' ? '作业中' : '返程中'}
                </span></div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-5 py-4 border-t border-[#1e2a3a] flex items-center gap-3">
          {(relatedBin || relatedVehicle) && (
            <button
              onClick={handleLocate}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
            >
              <Navigation size={13} />
              在地图上定位
            </button>
          )}
          {!alert.handled && (
            <button
              onClick={() => { onHandle(alert.id); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors ml-auto"
            >
              <CheckCircle2 size={13} />
              标记已处理
            </button>
          )}
          {alert.handled && (
            <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> 已处理完成
            </span>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1a1f2e] text-slate-400 border border-[#2a3a4a] rounded-lg text-xs font-medium hover:text-slate-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
