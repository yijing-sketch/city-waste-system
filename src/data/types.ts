// ========== 数据类型定义 ==========

export interface BinLocation {
  lng: number;
  lat: number;
}

export interface SmartBin {
  id: string;
  name: string;
  district: string;
  location: BinLocation;
  type: '可回收' | '厨余' | '有害' | '其他';
  capacity: number;        // 容量(L)
  fillLevel: number;        // 0-100 满溢率
  battery: number;          // 0-100 电池电量
  temperature: number;      // 摄氏度
  lastReportTime: string;
  status: 'normal' | 'warning' | 'full';
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
  driver: string;
  location: BinLocation;
  status: 'idle' | 'heading' | 'working' | 'returning';
  loadWeight: number;       // 当前载重(吨)
  maxLoad: number;          // 最大载重(吨)
  fuel: number;             // 油量百分比
  route: BinLocation[];     // 路线点
  routeProgress: number;    // 0-100 路线进度
  currentTask: string | null;
}

export interface Plant {
  id: string;
  name: string;
  type: '转运站' | '焚烧厂' | '填埋场' | '厨余处理';
  location: BinLocation;
  capacity: number;         // 日处理能力(吨)
  currentLoad: number;      // 当前负载(吨)
  queueCount: number;       // 排队车辆
  status: 'normal' | 'busy' | 'full';
}

export interface InspectionRecord {
  id: string;
  binId: string;
  binName: string;
  inspector: string;
  district: string;
  time: string;
  fillLevel: number;
  isDamaged: boolean;
  notes: string;
  photoUrl?: string;
}

export interface Alert {
  id: string;
  type: '溢出告警' | '设备故障' | '路线偏离' | '电池低电' | '温度异常' | '市民投诉';
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  time: string;
  handled: boolean;
  relatedId?: string;
}

export interface CollectionTask {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driver: string;
  district: string;
  binIds: string[];
  status: 'pending' | 'in_progress' | 'completed';
  startTime: string;
  endTime?: string;
  estimatedDuration: number; // 分钟
  collectedWeight?: number;
}

export interface DistrictStat {
  district: string;
  binCount: number;
  avgFillLevel: number;
  alertCount: number;
  recyclingRate: number;
}

export interface DailyStat {
  date: string;
  collected: number;        // 清运量(吨)
  recycled: number;         // 回收量(吨)
  kitchen: number;          // 厨余量(吨)
  hazardous: number;        // 有害量(吨)
  other: number;            // 其他量(吨)
}
