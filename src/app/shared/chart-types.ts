export const chartTypes = ['line', 'bar'] as const;
export type CharType = (typeof chartTypes)[number];
