import { useThreat } from '../context/ThreatContext';

export const useThreatData = () => {
  const { metrics, trendData, currentInvestigation } = useThreat();
  return {
    metrics,
    trendData: trendData?.['7d'] || [],
    currentInvestigation,
    loading: false,
  };
};
