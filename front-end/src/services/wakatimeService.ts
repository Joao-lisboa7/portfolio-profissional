import type { WakaTimeStatsResponse, WakaTimeRange } from '../types/Wakatime';

const API_BASE_URL = 'http://localhost:8080/api/wakatime';

export async function getWakatimeStats(range: WakaTimeRange = 'last_30_days'): Promise<WakaTimeStatsResponse> {
  const response = await fetch(`${API_BASE_URL}?range=${encodeURIComponent(range)}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar estatísticas do Wakatime (${response.status})`);
  }
  return response.json() as Promise<WakaTimeStatsResponse>;
}