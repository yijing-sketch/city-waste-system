import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { SmartBin, Vehicle, Plant } from '../data/types';

// ========== 类型 ==========
export type LayerMode = 'fillLevel' | 'battery' | 'temperature';

interface MapViewProps {
  bins: SmartBin[];
  vehicles: Vehicle[];
  plants: Plant[];
  flyToTarget?: { lat: number; lng: number } | null;
}

// ========== 根据图层模式获取垃圾桶颜色 ==========
function getBinColor(bin: SmartBin, mode: LayerMode): string {
  if (mode === 'fillLevel') {
    if (bin.fillLevel >= 90) return '#ef4444';
    if (bin.fillLevel >= 70) return '#f59e0b';
    return '#22c55e';
  }
  if (mode === 'battery') {
    if (bin.battery <= 20) return '#ef4444';
    if (bin.battery <= 40) return '#f59e0b';
    return '#22c55e';
  }
  // temperature
  if (bin.temperature >= 45) return '#ef4444';
  if (bin.temperature >= 35) return '#f59e0b';
  return '#22c55e';
}

function getBinRadius(bin: SmartBin, mode: LayerMode): number {
  if (mode === 'fillLevel') return Math.max(6, bin.fillLevel * 0.2);
  if (mode === 'battery') return Math.max(4, (100 - bin.battery) * 0.2 + 4);
  return Math.max(4, bin.temperature * 0.15);
}

function getLayerLabel(mode: LayerMode): string {
  if (mode === 'fillLevel') return '满溢率';
  if (mode === 'battery') return '电池电量';
  return '温度';
}

// ========== 车辆图标 ==========
function createVehicleIcon(vehicle: Vehicle): L.DivIcon {
  const colors: Record<string, string> = {
    idle: '#64748b', heading: '#3b82f6', working: '#22c55e', returning: '#f59e0b',
  };
  const statusLabels: Record<string, string> = {
    idle: '空闲', heading: '前往', working: '作业', returning: '返程',
  };
  const color = colors[vehicle.status] || '#64748b';
  return L.divIcon({
    className: 'vehicle-marker',
    html: `<div style="
      background:${color};color:#fff;white-space:nowrap;font-size:11px;
      padding:2px 6px;border-radius:4px;font-weight:bold;border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    ">🚛 ${vehicle.plate}</div>`,
    iconSize: [0, 0],
    iconAnchor: [50, 14],
  });
}

// ========== 处理厂图标 ==========
function createPlantIcon(plant: Plant): L.DivIcon {
  const colors: Record<string, string> = {
    '转运站': '#8b5cf6', '焚烧厂': '#ef4444', '填埋场': '#f59e0b', '厨余处理': '#22c55e',
  };
  return L.divIcon({
    className: 'plant-marker',
    html: `<div style="
      background:${colors[plant.type] || '#8b5cf6'};color:#fff;
      font-size:10px;padding:3px 8px;border-radius:6px;font-weight:bold;
      border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);text-align:center;
      white-space:nowrap;
    ">🏭 ${plant.name.substring(0, 6)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [45, 14],
  });
}

// ========== MarkerCluster 垃圾桶图层 ==========
function BinClusterLayer({ bins, mode }: { bins: SmartBin[]; mode: LayerMode }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // 清除旧图层
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }

    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 60,
      iconCreateFunction: (c: any) => {
        const count = c.getChildCount();
        const markers = c.getAllChildMarkers();
        const avgFill = Math.round(markers.reduce((s: number, m: any) => {
          return s + (m.options.fillLevel || 0);
        }, 0) / count);
        const color = avgFill >= 90 ? '#ef4444' : avgFill >= 70 ? '#f59e0b' : '#22c55e';
        return L.divIcon({
          html: `<div style="
            background:${color};color:#fff;width:${Math.min(50, 28 + count * 2)}px;
            height:${Math.min(50, 28 + count * 2)}px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:12px;font-weight:bold;border:3px solid #fff;
            box-shadow:0 2px 10px rgba(0,0,0,0.5);
          ">${count}</div>`,
          className: 'cluster-icon',
          iconSize: L.point(Math.min(50, 28 + count * 2), Math.min(50, 28 + count * 2)),
        });
      },
    });

    bins.forEach(bin => {
      const color = getBinColor(bin, mode);
      const radius = getBinRadius(bin, mode);
      const marker = L.circleMarker([bin.location.lat, bin.location.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.85,
        fillLevel: bin.fillLevel,
      } as any);
      marker.bindPopup(`
        <div style="font-size:12px;line-height:1.6;">
          <b>${bin.name}</b><br/>
          📍 ${bin.district} | ${bin.type}<br/>
          📊 满溢率: <b style="color:${color}">${bin.fillLevel}%</b><br/>
          🔋 电池: ${bin.battery}%<br/>
          🌡️ 温度: ${bin.temperature}°C<br/>
          🕐 上报: ${bin.lastReportTime.slice(11, 19)}
        </div>
      `);
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
    };
  }, [bins, mode, map]);

  return null;
}

// ========== 车辆图层 ==========
function VehicleLayer({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <>
      {vehicles.map(v => (
        <Marker
          key={v.id}
          position={[v.location.lat, v.location.lng]}
          icon={createVehicleIcon(v)}
        >
          <Popup>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <b>{v.plate}</b><br/>
              👨‍✈️ {v.driver}<br/>
              🚛 {v.type}<br/>
              ⛽ 油量: {v.fuel}%<br/>
              ⚖️ 载重: {v.loadWeight}/{v.maxLoad}吨<br/>
              📍 状态: {v.status === 'idle' ? '空闲' : v.status === 'heading' ? '前往中' : v.status === 'working' ? '作业中' : '返程中'}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ========== 处理厂图层 ==========
function PlantLayer({ plants }: { plants: Plant[] }) {
  return (
    <>
      {plants.map(p => (
        <Marker
          key={p.id}
          position={[p.location.lat, p.location.lng]}
          icon={createPlantIcon(p)}
        >
          <Popup>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              <b>{p.name}</b><br/>
              🏷️ {p.type}<br/>
              📊 负载: {Math.round(p.currentLoad)}/{p.capacity}吨<br/>
              🚛 排队车辆: {p.queueCount}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// ========== 地图飞行控制器 ==========
function FlyController({ target }: { target: { lat: number; lng: number } | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 16, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// ========== 主组件 ==========
export default function MapView({ bins, vehicles, plants, flyToTarget }: MapViewProps) {
  const [layerMode, setLayerMode] = useState<LayerMode>('fillLevel');

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* 图层切换按钮 */}
      <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-[#0f1520]/90 rounded-lg p-0.5 border border-[#1e2a3a]">
        {(['fillLevel', 'battery', 'temperature'] as LayerMode[]).map(m => (
          <button
            key={m}
            onClick={() => setLayerMode(m)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 border-none cursor-pointer ${
              layerMode === m
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {getLayerLabel(m)}
          </button>
        ))}
      </div>

      <MapContainer
        center={[39.90, 116.40]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BinClusterLayer bins={bins} mode={layerMode} />
        <VehicleLayer vehicles={vehicles} />
        <PlantLayer plants={plants} />
        <FlyController target={flyToTarget} />
      </MapContainer>
    </div>
  );
}
