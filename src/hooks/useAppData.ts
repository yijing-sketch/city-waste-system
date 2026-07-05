import { useState, useEffect, useCallback } from 'react';
import type { SmartBin, Vehicle, Plant, Alert, InspectionRecord, CollectionTask, DailyStat, DistrictStat } from '../data/types';
import { getMockBins, getMockVehicles, getMockPlants, getMockAlerts, getMockInspections, getMockTasks, getMockDailyStats, getMockDistrictStats, refreshRealtimeData } from '../data/mockData';
import type { AppData } from './DataContext';

export function useAppData(): AppData {
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>(() => getMockDailyStats());
  const [districtStats] = useState<DistrictStat[]>(() => getMockDistrictStats());
  const [latestInspection, setLatestInspection] = useState<InspectionRecord | null>(null);

  useEffect(() => {
    setBins(getMockBins());
    setVehicles(getMockVehicles());
    setPlants(getMockPlants());
    setAlerts(getMockAlerts());
    setInspections(getMockInspections());
    setTasks(getMockTasks());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = refreshRealtimeData();
      setBins(fresh.bins);
      setVehicles(fresh.vehicles);
      setPlants(fresh.plants);
      // 同步更新今日清运量（模拟实时累积）
      setDailyStats(prev => {
        const updated = [...prev];
        const last = { ...updated[updated.length - 1] };
        last.collected = Math.round(last.collected + Math.random() * 2 + 0.5);
        last.recycled = Math.round(last.recycled + Math.random() * 0.5);
        updated[updated.length - 1] = last;
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addInspection = useCallback((record: InspectionRecord) => {
    setInspections(prev => [record, ...prev]);
    setLatestInspection(record);
  }, []);

  const handleAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, handled: true } : a));
  }, []);

  const assignTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'in_progress' as const, startTime: new Date().toISOString() } : t
    ));
  }, []);

  return {
    bins, vehicles, plants, alerts, inspections, tasks, dailyStats, districtStats,
    latestInspection, addInspection, handleAlert, assignTask,
  };
}
