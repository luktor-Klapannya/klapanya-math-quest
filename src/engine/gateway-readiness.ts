import { GatewayReadinessLevel } from '../types';

export interface ReadinessCalculationParams {
  accuracy: number; // 0 to 100
  averageTimeSec: number;
  targetTimeSec: number;
  gridAccuracy?: number; // 0 to 100 if applicable
}

export function calculateGatewayReadiness(params: ReadinessCalculationParams): GatewayReadinessLevel {
  const { accuracy, averageTimeSec, targetTimeSec } = params;

  if (accuracy >= 95 && averageTimeSec <= targetTimeSec * 0.8) {
    return 'MASTER';
  } else if (accuracy >= 85) {
    return 'ADVANCED';
  } else if (accuracy >= 75) {
    return 'PROFICIENT';
  } else if (accuracy >= 60) {
    return 'DEVELOPING';
  } else {
    return 'FOUNDATION';
  }
}
