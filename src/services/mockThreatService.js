import axios from 'axios';
import { MOCK_PRESETS, MOCK_CASES, MOCK_METRICS, MOCK_TREND_CHART_DATA } from '../data/mockData';

// Axios instance configured for future backend integration, currently providing resilient mock fallbacks
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock Threat Service - pure client side without external dependencies
export const mockThreatService = {
  getMetrics: async () => {
    return Promise.resolve(MOCK_METRICS);
  },

  getTrendData: async (timeRange = '7d') => {
    return Promise.resolve(MOCK_TREND_CHART_DATA[timeRange] || MOCK_TREND_CHART_DATA['7d']);
  },

  getPresets: async () => {
    return Promise.resolve(MOCK_PRESETS);
  },

  getCases: async () => {
    return Promise.resolve(MOCK_CASES);
  },

  analyzeEmailMock: async (emailText, attachments = []) => {
    // Simulated deep parser
    const isCritical = emailText.toLowerCase().includes('urgent') || emailText.toLowerCase().includes('wire');
    const score = isCritical ? 96 : 14;
    return Promise.resolve({
      riskScore: score,
      threatLevel: score > 75 ? 'CRITICAL' : 'SAFE',
      confidence: 99.2
    });
  }
};
