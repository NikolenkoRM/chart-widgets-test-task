import { SensorType } from './sensors';

export const chartLimits: Record<SensorType, { min: number; max: number }> = {
  temperature: { min: 0, max: 20 },
  humidity: { min: 0, max: 100 },
  light: { min: 0, max: 100 },
};
