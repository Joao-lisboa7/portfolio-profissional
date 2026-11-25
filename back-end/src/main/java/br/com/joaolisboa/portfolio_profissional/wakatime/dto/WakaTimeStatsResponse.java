package br.com.joaolisboa.portfolio_profissional.wakatime.dto;

import java.util.List;

public class WakaTimeStatsResponse {
    public String range;
    public String updatedAt;
    public Overview overview;
    public AiMetrics aiMetrics;
    public List<Language> languages;
    public List<Project> projects;
    public List<TimelinePoint> timeline;
    public Environment environment;

    public static class Overview {
        public String totalTimeText;
        public long totalSeconds;
        public String dailyAverageText;
        public long dailyAverageSeconds;
        public int activeDays;
        public TopProject topProject;
    }
    public static class TopProject {
        public String name;
        public String timeText;
        public double percent;
    }
    public static class AiTool {
        public String name;
        public double percent;
        public String timeText;
    }
    public static class AiMetrics {
        public boolean hasAiData;
        public long aiAdditions;
        public long aiDeletions;
        public long humanAdditions;
        public long humanDeletions;
        public double aiSharePercent;
        public int aiActiveDays;
        public List<AiTool> tools;
    }
    public static class Language {
        public String name;
        public double percent;
        public String timeText;
    }
    public static class Project {
        public String name;
        public double percent;
        public String timeText;
        public boolean isPrivate;
    }
    public static class TimelinePoint {
        public String date;
        public long totalSeconds;
        public long codingSeconds;
        public long aiCodingSeconds;
    }
    public static class EnvironmentItem {
        public String name;
        public double percent;
        public String timeText;
    }
    public static class Environment {
        public List<EnvironmentItem> editors;
        public List<EnvironmentItem> operatingSystems;
    }
}