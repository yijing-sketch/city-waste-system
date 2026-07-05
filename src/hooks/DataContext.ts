import { createContext, useContext } from 'react';
import type { SmartBin, Vehicle, Plant, Alert, InspectionRecord, CollectionTask, DailyStat, DistrictStat } from '../data/types';

export interface AppData {
  bins: SmartBin[];
  vehicles: Vehicle[];
  plants: Plant[];
  alerts: Alert[];
  inspections: InspectionRecord[];
  tasks: CollectionTask[];
  dailyStats: DailyStat[];
  districtStats: DistrictStat[];
  latestInspection: InspectionRecord | null;
  addInspection: (record: InspectionRecord) => void;
  handleAlert: (alertId: string) => void;
  assignTask: (taskId: string) => void;
}

export const DataContext = createContext<AppData | null>(null);

export function useData(): AppData {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData() must be used within a <DataContext.Provider>. Ensure <App /> wraps your component tree.');
  }
  return ctx;
}
