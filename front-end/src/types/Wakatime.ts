export type WakaTimeRange = "last_30_days" | "all_time";

export interface WakaTimeTopProject {
  name: string;
  timeText: string;
  percent: number;
}

export interface WakaTimeOverview {
  totalTimeText: string;
  totalSeconds: number;
  dailyAverageText: string;
  dailyAverageSeconds: number;
  activeDays: number;
  topProject: WakaTimeTopProject | null;
}

export interface WakaTimeAiTool {
  name: string;
  percent: number;
  timeText: string;
}

export interface WakaTimeAiMetrics {
  hasAiData: boolean;
  aiAdditions: number;
  aiDeletions: number;
  humanAdditions: number;
  humanDeletions: number;
  aiSharePercent: number;
  aiActiveDays: number;
  tools: WakaTimeAiTool[];
}

export interface WakaTimeLanguage {
  name: string;
  percent: number;
  timeText: string;
}

export interface WakaTimeProject {
  name: string;
  percent: number;
  timeText: string;
  isPrivate: boolean;
}

export interface WakaTimeTimelinePoint {
  date: string;
  totalSeconds: number;
  codingSeconds: number;
  aiCodingSeconds: number;
}

export interface WakaTimeEnvironmentItem {
  name: string;
  percent: number;
  timeText: string;
}

export interface WakaTimeEnvironment {
  editors: WakaTimeEnvironmentItem[];
  operatingSystems: WakaTimeEnvironmentItem[];
}

export interface WakaTimeStatsResponse {
  range: WakaTimeRange;
  updatedAt: string;
  overview: WakaTimeOverview;
  aiMetrics: WakaTimeAiMetrics;
  languages: WakaTimeLanguage[];
  projects: WakaTimeProject[];
  timeline: WakaTimeTimelinePoint[];
  environment: WakaTimeEnvironment;
}