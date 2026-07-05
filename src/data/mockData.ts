import type { SmartBin, Vehicle, Plant, InspectionRecord, Alert, CollectionTask, DailyStat, DistrictStat } from './types';

// ========== 城市中心坐标 (模拟某中等城市) ==========
const CITY_CENTER = { lng: 116.40, lat: 39.90 };

// ========== 6个片区定义 ==========
const DISTRICTS = [
  { name: '城东区', center: { lng: 116.44, lat: 39.91 } },
  { name: '城西区', center: { lng: 116.35, lat: 39.90 } },
  { name: '城南区', center: { lng: 116.41, lat: 39.87 } },
  { name: '城北区', center: { lng: 116.39, lat: 39.93 } },
  { name: '高新区', center: { lng: 116.47, lat: 39.89 } },
  { name: '开发区', center: { lng: 116.33, lat: 39.88 } },
];

const BIN_NAMES: Record<string, string[]> = {
  '城东区': ['东湖路', '朝阳街', '人民路', '解放路', '中山街', '和平路', '建设路', '文化路', '东门站', '东城广场'],
  '城西区': ['西湖路', '西大街', '学院路', '公园路', '西站路', '滨河路', '西城广场', '望京街', '新华路', '西苑站'],
  '城南区': ['南湖路', '南大街', '幸福路', '光明路', '南站路', '育才路', '河滨路', '南城广场', '康宁路', '南门站'],
  '城北区': ['北湖路', '北大街', '团结路', '兴华路', '北站路', '安泰路', '科技路', '北城广场', '迎宾路', '北门站'],
  '高新区': ['创新路', '科技街', '高科路', '数码街', '创业路', '智谷站', '未来路', '高新广场', '智慧路', '研发路'],
  '开发区': ['工业路', '开泰路', '兴业街', '富强路', '开发区站', '和谐路', '平安路', '开发区广场', '昌盛路', '华兴路'],
};

// ========== 生成智能垃圾桶数据 ==========
function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBins(): SmartBin[] {
  const bins: SmartBin[] = [];
  const types: SmartBin['type'][] = ['可回收', '厨余', '有害', '其他'];
  let id = 1;

  for (const district of DISTRICTS) {
    const names = BIN_NAMES[district.name];
    for (let i = 0; i < 10; i++) {
      const fillLevel = randomInt(10, 98);
      let status: SmartBin['status'] = 'normal';
      if (fillLevel >= 90) status = 'full';
      else if (fillLevel >= 70) status = 'warning';

      bins.push({
        id: `BIN-${String(id).padStart(3, '0')}`,
        name: `${district.name}-${names[i]}`,
        district: district.name,
        location: {
          lng: randomInRange(district.center.lng - 0.02, district.center.lng + 0.02),
          lat: randomInRange(district.center.lat - 0.02, district.center.lat + 0.02),
        },
        type: types[randomInt(0, 3)],
        capacity: 240,
        fillLevel,
        battery: randomInt(15, 95),
        temperature: randomInRange(20, 42),
        lastReportTime: new Date(Date.now() - randomInt(0, 30) * 60000).toISOString(),
        status,
      });
      id++;
    }
  }
  return bins;
}

// ========== 生成清运车辆数据 ==========
function generateVehicles(): Vehicle[] {
  const plates = ['京B·88421', '京B·76350', '京B·52918', '京B·34176', '京B·90723', '京B·12845',
    '京B·65239', '京B·49107', '京B·38562', '京B·74019', '京B·23684', '京B·81937'];
  const drivers = ['张建国', '李卫民', '王守成', '赵长青', '刘建华', '陈志强',
    '周天宇', '吴永刚', '郑明辉', '冯大伟', '孙国栋', '何志远'];
  const types = ['压缩车', '压缩车', '压缩车', '勾臂车', '勾臂车', '压缩车',
    '压缩车', '勾臂车', '压缩车', '勾臂车', '压缩车', '压缩车'];

  const vehicles: Vehicle[] = [];
  for (let i = 0; i < 12; i++) {
    const statuses: Vehicle['status'][] = ['idle', 'heading', 'working', 'returning'];
    const status = statuses[randomInt(0, 3)];
    const district = DISTRICTS[randomInt(0, 5)];

    vehicles.push({
      id: `VH-${String(i + 1).padStart(2, '0')}`,
      plate: plates[i],
      type: types[i],
      driver: drivers[i],
      location: {
        lng: randomInRange(district.center.lng - 0.03, district.center.lng + 0.03),
        lat: randomInRange(district.center.lat - 0.03, district.center.lat + 0.03),
      },
      status,
      loadWeight: status === 'idle' ? 0 : randomInRange(2, 8),
      maxLoad: 10,
      fuel: randomInt(30, 95),
      route: [],
      routeProgress: status === 'idle' ? 0 : randomInt(10, 90),
      currentTask: status === 'idle' ? null : `TSK-${randomInt(100, 200)}`,
    });
  }
  return vehicles;
}

// ========== 生成处理厂数据 ==========
function generatePlants(): Plant[] {
  return [
    {
      id: 'PL-01', name: '城东垃圾转运站', type: '转运站',
      location: { lng: 116.46, lat: 39.92 },
      capacity: 800, currentLoad: randomInRange(300, 700), queueCount: randomInt(2, 8), status: 'normal',
    },
    {
      id: 'PL-02', name: '南山焚烧发电厂', type: '焚烧厂',
      location: { lng: 116.38, lat: 39.85 },
      capacity: 1200, currentLoad: randomInRange(600, 1100), queueCount: randomInt(1, 5), status: 'normal',
    },
    {
      id: 'PL-03', name: '北郊卫生填埋场', type: '填埋场',
      location: { lng: 116.37, lat: 39.95 },
      capacity: 2000, currentLoad: randomInRange(800, 1600), queueCount: randomInt(0, 3), status: 'normal',
    },
    {
      id: 'PL-04', name: '绿源厨余处理中心', type: '厨余处理',
      location: { lng: 116.43, lat: 39.88 },
      capacity: 500, currentLoad: randomInRange(250, 480), queueCount: randomInt(3, 12), status: 'busy',
    },
  ];
}

// ========== 生成巡检记录 ==========
function generateInspections(): InspectionRecord[] {
  const inspectors = ['周巡查', '吴检查', '郑监管', '王稽查'];
  const records: InspectionRecord[] = [];
  const notesPool = [
    '桶体完好，正常使用',
    '桶盖轻微破损，建议维修',
    '周围地面有散落垃圾，已通知清理',
    '分类标识清晰，居民配合良好',
    '桶体严重锈蚀，建议更换',
    '传感器读数异常，需检修',
    '桶内发现违规投放建筑垃圾',
    '一切正常',
    '满溢速度较快，建议增加清运频次',
    '桶体倾斜，已现场扶正',
  ];

  for (let d = 6; d >= 0; d--) {
    for (let i = 0; i < 4 + randomInt(0, 3); i++) {
      const district = DISTRICTS[randomInt(0, 5)];
      const binNames = BIN_NAMES[district.name];
      const binName = binNames[randomInt(0, 9)];
      const date = new Date(Date.now() - d * 86400000 - randomInt(0, 12) * 3600000);
      records.push({
        id: `INS-${String(records.length + 1).padStart(3, '0')}`,
        binId: `BIN-${String(randomInt(1, 60)).padStart(3, '0')}`,
        binName: `${district.name}-${binName}`,
        inspector: inspectors[randomInt(0, 3)],
        district: district.name,
        time: date.toISOString(),
        fillLevel: randomInt(20, 95),
        isDamaged: Math.random() < 0.15,
        notes: notesPool[randomInt(0, 9)],
      });
    }
  }
  return records.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

// ========== 生成告警事件 ==========
function generateAlerts(): Alert[] {
  const now = Date.now();
  return [
    {
      id: 'ALT-001', type: '溢出告警', level: 'high',
      title: '城东区-东湖路垃圾桶即将溢出',
      description: '智能传感器检测到满溢率达96%，已超过警戒线，请立即安排清运。',
      location: '城东区-东湖路', time: new Date(now - 15 * 60000).toISOString(), handled: false, relatedId: 'BIN-001',
    },
    {
      id: 'ALT-002', type: '设备故障', level: 'medium',
      title: '城南区-幸福路传感器离线',
      description: 'BIN-035号智能垃圾桶传感器已离线超过30分钟，需派员现场检查。',
      location: '城南区-幸福路', time: new Date(now - 45 * 60000).toISOString(), handled: false, relatedId: 'BIN-035',
    },
    {
      id: 'ALT-003', type: '路线偏离', level: 'medium',
      title: '车辆京B·76350偏离规划路线',
      description: '清运车辆偏离预定路线超过500米，已持续10分钟，请核查原因。',
      location: '城西区-学院路', time: new Date(now - 25 * 60000).toISOString(), handled: false, relatedId: 'VH-02',
    },
    {
      id: 'ALT-004', type: '电池低电', level: 'low',
      title: '高新区多台设备电池低电量',
      description: '高新区3台智能垃圾桶电池电量低于15%，需安排更换电池。',
      location: '高新区', time: new Date(now - 60 * 60000).toISOString(), handled: true,
    },
    {
      id: 'ALT-005', type: '温度异常', level: 'low',
      title: '开发区-工业路垃圾桶温度异常',
      description: 'BIN-058垃圾桶内部温度达52°C，可能存在发酵风险。',
      location: '开发区-工业路', time: new Date(now - 35 * 60000).toISOString(), handled: false, relatedId: 'BIN-058',
    },
    {
      id: 'ALT-006', type: '市民投诉', level: 'medium',
      title: '市民投诉城北区北大街垃圾堆积',
      description: '接到12345热线工单，市民反映北大街垃圾收集点连续2天未清运。',
      location: '城北区-北大街', time: new Date(now - 90 * 60000).toISOString(), handled: true,
    },
    {
      id: 'ALT-007', type: '溢出告警', level: 'high',
      title: '开发区-开发区站满溢告警',
      description: '满溢率达98%，周边商户和居民区受影响严重。',
      location: '开发区-开发区站', time: new Date(now - 10 * 60000).toISOString(), handled: false, relatedId: 'BIN-053',
    },
    {
      id: 'ALT-008', type: '溢出告警', level: 'medium',
      title: '城西区-滨河路垃圾桶满溢',
      description: '满溢率87%，该区域周末人流量大，预计将快速恶化。',
      location: '城西区-滨河路', time: new Date(now - 20 * 60000).toISOString(), handled: false, relatedId: 'BIN-018',
    },
  ];
}

// ========== 生成清运任务 ==========
function generateTasks(): CollectionTask[] {
  const now = Date.now();
  return [
    { id: 'TSK-101', vehicleId: 'VH-01', vehiclePlate: '京B·88421', driver: '张建国', district: '城东区', binIds: ['BIN-001', 'BIN-002', 'BIN-003', 'BIN-004', 'BIN-005'], status: 'in_progress', startTime: new Date(now - 60 * 60000).toISOString(), estimatedDuration: 120 },
    { id: 'TSK-102', vehicleId: 'VH-02', vehiclePlate: '京B·76350', driver: '李卫民', district: '城西区', binIds: ['BIN-011', 'BIN-012', 'BIN-013', 'BIN-014'], status: 'in_progress', startTime: new Date(now - 40 * 60000).toISOString(), estimatedDuration: 90 },
    { id: 'TSK-103', vehicleId: 'VH-03', vehiclePlate: '京B·52918', driver: '王守成', district: '城南区', binIds: ['BIN-021', 'BIN-022', 'BIN-023', 'BIN-024', 'BIN-025', 'BIN-026'], status: 'completed', startTime: new Date(now - 240 * 60000).toISOString(), endTime: new Date(now - 120 * 60000).toISOString(), estimatedDuration: 120, collectedWeight: 6.8 },
    { id: 'TSK-104', vehicleId: 'VH-04', vehiclePlate: '京B·34176', driver: '赵长青', district: '高新区', binIds: ['BIN-041', 'BIN-042', 'BIN-043'], status: 'pending', startTime: new Date(now + 30 * 60000).toISOString(), estimatedDuration: 75 },
    { id: 'TSK-105', vehicleId: 'VH-05', vehiclePlate: '京B·90723', driver: '刘建华', district: '开发区', binIds: ['BIN-051', 'BIN-052', 'BIN-053', 'BIN-054'], status: 'in_progress', startTime: new Date(now - 20 * 60000).toISOString(), estimatedDuration: 100 },
    { id: 'TSK-106', vehicleId: 'VH-06', vehiclePlate: '京B·12845', driver: '陈志强', district: '城北区', binIds: ['BIN-031', 'BIN-032', 'BIN-033', 'BIN-034', 'BIN-035'], status: 'completed', startTime: new Date(now - 300 * 60000).toISOString(), endTime: new Date(now - 180 * 60000).toISOString(), estimatedDuration: 120, collectedWeight: 7.2 },
    { id: 'TSK-107', vehicleId: 'VH-07', vehiclePlate: '京B·65239', driver: '周天宇', district: '城东区', binIds: ['BIN-006', 'BIN-007', 'BIN-008', 'BIN-009', 'BIN-010'], status: 'pending', startTime: new Date(now + 60 * 60000).toISOString(), estimatedDuration: 110 },
    { id: 'TSK-108', vehicleId: 'VH-08', vehiclePlate: '京B·49107', driver: '吴永刚', district: '城西区', binIds: ['BIN-015', 'BIN-016', 'BIN-017', 'BIN-018'], status: 'pending', startTime: new Date(now + 90 * 60000).toISOString(), estimatedDuration: 85 },
  ];
}

// ========== 生成每日统计数据 ==========
function generateDailyStats(): DailyStat[] {
  const stats: DailyStat[] = [];
  const now = new Date();
  for (let d = 30; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? randomInRange(280, 350) : randomInRange(340, 450);
    stats.push({
      date: date.toISOString().slice(0, 10),
      collected: base,
      recycled: base * randomInRange(0.28, 0.38),
      kitchen: base * randomInRange(0.42, 0.52),
      hazardous: base * randomInRange(0.02, 0.05),
      other: base * randomInRange(0.10, 0.20),
    });
  }
  return stats;
}

// ========== 生成片区统计 ==========
function generateDistrictStats(bins: SmartBin[]): DistrictStat[] {
  return DISTRICTS.map(d => {
    const districtBins = bins.filter(b => b.district === d.name);
    return {
      district: d.name,
      binCount: districtBins.length,
      avgFillLevel: Math.round(districtBins.reduce((s, b) => s + b.fillLevel, 0) / districtBins.length),
      alertCount: districtBins.filter(b => b.fillLevel >= 70).length,
      recyclingRate: randomInRange(25, 45),
    };
  });
}

// ========== 创建模拟数据快照函数 ==========
let cachedBins: SmartBin[] | null = null;
let cachedVehicles: Vehicle[] | null = null;
let cachedPlants: Plant[] | null = null;
let cachedInspections: InspectionRecord[] | null = null;
let cachedAlerts: Alert[] | null = null;
let cachedTasks: CollectionTask[] | null = null;
let cachedDailyStats: DailyStat[] | null = null;
let cachedDistrictStats: DistrictStat[] | null = null;

export function getMockBins(): SmartBin[] {
  if (!cachedBins) cachedBins = generateBins();
  return cachedBins;
}

export function getMockVehicles(): Vehicle[] {
  if (!cachedVehicles) cachedVehicles = generateVehicles();
  return cachedVehicles;
}

export function getMockPlants(): Plant[] {
  if (!cachedPlants) cachedPlants = generatePlants();
  return cachedPlants;
}

export function getMockInspections(): InspectionRecord[] {
  if (!cachedInspections) cachedInspections = generateInspections();
  return cachedInspections;
}

export function getMockAlerts(): Alert[] {
  if (!cachedAlerts) cachedAlerts = generateAlerts();
  return cachedAlerts;
}

export function getMockTasks(): CollectionTask[] {
  if (!cachedTasks) cachedTasks = generateTasks();
  return cachedTasks;
}

export function getMockDailyStats(): DailyStat[] {
  if (!cachedDailyStats) cachedDailyStats = generateDailyStats();
  return cachedDailyStats;
}

export function getMockDistrictStats(): DistrictStat[] {
  const bins = getMockBins();
  if (!cachedDistrictStats) cachedDistrictStats = generateDistrictStats(bins);
  return cachedDistrictStats;
}

// 模拟实时数据刷新：微微波动垃圾桶满溢率和车辆位置
export function refreshRealtimeData(): { bins: SmartBin[]; vehicles: Vehicle[]; plants: Plant[] } {
  const bins = getMockBins().map(b => {
    const newFillLevel = Math.min(100, Math.max(5, b.fillLevel + randomInt(-3, 3)));
    const newStatus: SmartBin['status'] = newFillLevel >= 90 ? 'full' : newFillLevel >= 70 ? 'warning' : 'normal';
    return {
      ...b,
      fillLevel: newFillLevel,
      temperature: randomInRange(20, 45),
      lastReportTime: new Date().toISOString(),
      status: newStatus,
    };
  });

  const vehicles = getMockVehicles().map(v => ({
    ...v,
    location: {
      lng: v.location.lng + randomInRange(-0.003, 0.003),
      lat: v.location.lat + randomInRange(-0.003, 0.003),
    },
    routeProgress: v.status === 'idle' ? 0 : Math.min(100, v.routeProgress + randomInt(0, 5)),
    loadWeight: v.status === 'idle' ? 0 : randomInRange(2, 8),
  }));

  const plants = getMockPlants().map(p => ({
    ...p,
    currentLoad: randomInRange(p.capacity * 0.4, p.capacity * 0.95),
    queueCount: randomInt(0, 12),
  }));

  return { bins, vehicles, plants };
}
