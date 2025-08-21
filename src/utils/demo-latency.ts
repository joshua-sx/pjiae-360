/**
 * Simulates realistic API latency for demo mode
 */

export const simulateLatency = (min: number = 300, max: number = 1200): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const simulateNetworkError = (errorRate: number = 0.05): boolean => {
  return Math.random() < errorRate;
};