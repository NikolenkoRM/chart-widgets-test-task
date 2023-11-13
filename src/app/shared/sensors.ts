export const sensors = ['temperature', 'humidity', 'light'] as const;
export type SensorType = (typeof sensors)[number];
