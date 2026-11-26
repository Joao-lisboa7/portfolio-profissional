package br.com.joaolisboa.portfolio_profissional.wakatime.service;

import br.com.joaolisboa.portfolio_profissional.wakatime.dto.WakaTimeStatsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WakatimeService {

    private static final Logger log = LoggerFactory.getLogger(WakatimeService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final List<String> privateProjects;
    private final long cacheTtlMillis;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public WakatimeService(
            @Value("${wakatime.api.base-url:https://wakatime.com/api/v1}") String baseUrl,
            @Value("${wakatime.api.key:}") String apiKey,
            @Value("${wakatime.cache.ttl-minutes:180}") long ttlMinutes,
            @Value("${WAKATIME_PRIVATE_PROJECTS:}") String privateProjectsEnv) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.cacheTtlMillis = ttlMinutes * 60 * 1000L;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.privateProjects = new ArrayList<>();
        if (privateProjectsEnv != null && !privateProjectsEnv.isBlank()) {
            for (String p : privateProjectsEnv.split(",")) {
                String t = p.trim();
                if (!t.isEmpty()) privateProjects.add(t.toLowerCase());
            }
        }
    }

    @SuppressWarnings("unchecked")
    public WakaTimeStatsResponse getWakaTimeStats(String range) {
        String effectiveRange = (range == null || range.isBlank()) ? "last_30_days" : range.trim();
        CacheEntry cached = cache.get(effectiveRange);
        if (cached != null && !cached.isExpired()) {
            return cached.data();
        }
        if (apiKey.isEmpty()) {
            log.error("WAKATIME_API_KEY ausente.");
            throw new IllegalStateException("WAKATIME_API_KEY ausente");
        }
        try {
            String auth = buildAuthHeader(apiKey);
            CompletableFuture<Map<String, Object>> statsF = CompletableFuture.supplyAsync(() -> {
                Map<String, Object> s = fetchMap("/users/current/stats/" + effectiveRange, auth);
                if (s == null || s.isEmpty() || !s.containsKey("data")) {
                    // fallback for all_time still processing
                    try { return fetchMap("/users/current/all_time_since_today", auth); } catch (Exception e) { return s == null ? Map.of() : s; }
                }
                return s;
            });
            CompletableFuture<Map<String, Object>> summariesF = CompletableFuture.supplyAsync(() -> {
                if (effectiveRange.equals("all_time")) {
                    return fetchSummariesChunked(auth, startDate(effectiveRange), LocalDate.now(ZoneOffset.UTC));
                }
                return fetchMap("/users/current/summaries?start=" + startDate(effectiveRange) + "&end=" + LocalDate.now(ZoneOffset.UTC), auth);
            });
            CompletableFuture<Map<String, Object>> insightsF = CompletableFuture.supplyAsync(() -> {
                try {
                    return fetchMap("/users/current/insights/ai_days/" + effectiveRange, auth);
                } catch (Exception e) {
                    log.warn("Insights indisponivel ({}): {}", effectiveRange, e.getMessage());
                    return Map.of();
                }
            });

            CompletableFuture.allOf(statsF, summariesF, insightsF).join();
            WakaTimeStatsResponse resp = mapResponse(effectiveRange, statsF.get(), summariesF.get(), insightsF.get());
            cache.put(effectiveRange, new CacheEntry(resp, Instant.now().toEpochMilli() + cacheTtlMillis));
            return resp;
        } catch (Exception ex) {
            log.error("Falha ao consultar WakaTime: {}", ex.getMessage());
            if (cached != null) return cached.data();
            return degraded(effectiveRange);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchSummariesChunked(String auth, LocalDate start, LocalDate end) {
        List<Map<String, Object>> allData = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            LocalDate chunkEnd = cursor.plusDays(30);
            if (chunkEnd.isAfter(end)) chunkEnd = end;
            try {
                Map<String, Object> part = fetchMap("/users/current/summaries?start=" + cursor + "&end=" + chunkEnd, auth);
                List<Map<String, Object>> d = (List<Map<String, Object>>) part.getOrDefault("data", List.of());
                allData.addAll(d);
            } catch (Exception e) {
                log.warn("Chunk summaries falhou {}..{}: {}", cursor, chunkEnd, e.getMessage());
            }
            cursor = chunkEnd.plusDays(1);
        }
        return Map.of("data", allData);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchMap(String path, String auth) {
        return restClient.get().uri(path)
                .header(HttpHeaders.AUTHORIZATION, auth)
                .header(HttpHeaders.ACCEPT, "application/json")
                .header("User-Agent", "portfolio-profissional/1.0")
                .retrieve().onStatus(HttpStatusCode::isError, (req, res) -> {
                    String body = "";
                    try { body = new String(res.getBody().readAllBytes()); } catch (Exception ignored) {}
                    log.error("WakaTime erro {} em {}: {}", res.getStatusCode(), path, body);
                    throw new RuntimeException("HTTP " + res.getStatusCode() + " em " + path);
                }).body(Map.class);
    }

    private LocalDate startDate(String range) {
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        return range.equals("last_30_days") ? end.minusDays(30) : end.minusMonths(24);
    }

    @SuppressWarnings("unchecked")
    private WakaTimeStatsResponse mapResponse(String range, Map<String, Object> stats, Map<String, Object> summaries, Map<String, Object> insights) {
        WakaTimeStatsResponse r = new WakaTimeStatsResponse();
        r.range = range;
        r.updatedAt = Instant.now().toString();
        Map<String, Object> data = (Map<String, Object>) stats.getOrDefault("data", Map.of());

        r.overview = new WakaTimeStatsResponse.Overview();
        r.overview.totalTimeText = str(data, "human_readable_total");
        r.overview.totalSeconds = (long) dbl(data, "total_seconds");
        r.overview.dailyAverageText = str(data, "human_readable_daily_average");
        r.overview.dailyAverageSeconds = (long) dbl(data, "daily_average");
        r.overview.activeDays = (int) dbl(data, "days_including_holidays");
        if (r.overview.activeDays == 0) r.overview.activeDays = (int) dbl(data, "days");

        r.overview.topProject = null;
        List<Map<String, Object>> projects = (List<Map<String, Object>>) data.getOrDefault("projects", List.of());
        double privPct = 0; long privSec = 0;
        r.projects = new ArrayList<>();
        for (Map<String, Object> p : projects) {
            String name = str(p, "name");
            if (isPrivate(name)) {
                privPct += dbl(p, "percent");
                privSec += (long) dbl(p, "total_seconds");
            } else {
                WakaTimeStatsResponse.Project pr = new WakaTimeStatsResponse.Project();
                pr.name = name;
                pr.percent = dbl(p, "percent");
                pr.timeText = str(p, "text");
                pr.isPrivate = false;
                r.projects.add(pr);
            }
        }
        if (privPct > 0 || privSec > 0) {
            WakaTimeStatsResponse.Project pr = new WakaTimeStatsResponse.Project();
            pr.name = "Projetos Privados";
            pr.percent = privPct;
            pr.timeText = "";
            pr.isPrivate = true;
            r.projects.add(pr);
        }
        for (Map<String, Object> p : projects) {
            String name = str(p, "name");
            if (isPrivate(name)) continue;
            WakaTimeStatsResponse.TopProject tp = new WakaTimeStatsResponse.TopProject();
            tp.name = name;
            tp.timeText = str(p, "text");
            tp.percent = dbl(p, "percent");
            r.overview.topProject = tp;
            break;
        }

        r.aiMetrics = new WakaTimeStatsResponse.AiMetrics();
        long aiAdd = (long) dbl(data, "ai_additions");
        long aiDel = (long) dbl(data, "ai_deletions");
        long huAdd = (long) dbl(data, "human_additions");
        long huDel = (long) dbl(data, "human_deletions");
        r.aiMetrics.aiAdditions = aiAdd;
        r.aiMetrics.aiDeletions = aiDel;
        r.aiMetrics.humanAdditions = huAdd;
        r.aiMetrics.humanDeletions = huDel;
        r.aiMetrics.hasAiData = (aiAdd + huAdd) > 0;
        double denom = aiAdd + huAdd;
        r.aiMetrics.aiSharePercent = denom == 0 ? 0 : (aiAdd / denom) * 100.0;
        Map<String, Object> insData = (Map<String, Object>) insights.getOrDefault("data", Map.of());
        r.aiMetrics.aiActiveDays = (int) dbl(insData, "total_days");
        if (r.aiMetrics.aiActiveDays == 0) {
            int c = 0;
            List<Map<String, Object>> sumData = (List<Map<String, Object>>) summaries.getOrDefault("data", List.of());
            for (Map<String, Object> it : sumData) {
                List<Map<String, Object>> cats = (List<Map<String, Object>>) it.getOrDefault("categories", List.of());
                for (Map<String, Object> cat : cats) {
                    if ("AI Coding".equals(str(cat, "name")) && dbl(cat, "total_seconds") > 0) c++;
                }
            }
            r.aiMetrics.aiActiveDays = c;
        }
        r.aiMetrics.tools = new ArrayList<>();
        List<Map<String, Object>> editors = (List<Map<String, Object>>) data.getOrDefault("editors", List.of());
        for (Map<String, Object> e : editors) {
            WakaTimeStatsResponse.AiTool t = new WakaTimeStatsResponse.AiTool();
            t.name = str(e, "name");
            t.percent = dbl(e, "percent");
            t.timeText = str(e, "text");
            r.aiMetrics.tools.add(t);
        }

        r.languages = new ArrayList<>();
        List<Map<String, Object>> langs = (List<Map<String, Object>>) data.getOrDefault("languages", List.of());
        double otherPct = 0;
        int count = 0;
        for (Map<String, Object> l : langs) {
            if (count < 7) {
                WakaTimeStatsResponse.Language li = new WakaTimeStatsResponse.Language();
                li.name = str(l, "name");
                li.percent = dbl(l, "percent");
                li.timeText = str(l, "text");
                r.languages.add(li);
            } else {
                otherPct += dbl(l, "percent");
            }
            count++;
        }
        if (count > 7) {
            WakaTimeStatsResponse.Language o = new WakaTimeStatsResponse.Language();
            o.name = "Outras";
            o.percent = otherPct;
            o.timeText = "";
            r.languages.add(o);
        }

        r.timeline = new ArrayList<>();
        boolean allTime = range.equals("all_time");
        Map<String, long[]> monthly = new ConcurrentHashMap<>();
        List<Map<String, Object>> sumData = (List<Map<String, Object>>) summaries.getOrDefault("data", List.of());
        for (Map<String, Object> item : sumData) {
            Map<String, Object> rng = (Map<String, Object>) item.getOrDefault("range", Map.of());
            String date = str(rng, "date");
            if (date.isEmpty()) date = str(item, "date");
            long total = (long) dbl(item.getOrDefault("grand_total", Map.of()) instanceof Map ? (Map<String, Object>) item.get("grand_total") : Map.of(), "total_seconds");
            long coding = 0, ai = 0;
            List<Map<String, Object>> cats = (List<Map<String, Object>>) item.getOrDefault("categories", List.of());
            for (Map<String, Object> cat : cats) {
                String cn = str(cat, "name");
                long sec = (long) dbl(cat, "total_seconds");
                if ("Coding".equals(cn)) coding = sec;
                if ("AI Coding".equals(cn)) ai = sec;
            }
            if (allTime) {
                String month = date.length() >= 7 ? date.substring(0, 7) : date;
                monthly.computeIfAbsent(month, k -> new long[3])[0] += total;
                monthly.get(month)[1] += coding;
                monthly.get(month)[2] += ai;
            } else {
                WakaTimeStatsResponse.TimelinePoint tp = new WakaTimeStatsResponse.TimelinePoint();
                tp.date = date;
                tp.totalSeconds = total;
                tp.codingSeconds = coding;
                tp.aiCodingSeconds = ai;
                r.timeline.add(tp);
            }
        }
        if (allTime) {
            for (Map.Entry<String, long[]> e : monthly.entrySet()) {
                WakaTimeStatsResponse.TimelinePoint tp = new WakaTimeStatsResponse.TimelinePoint();
                tp.date = e.getKey();
                tp.totalSeconds = e.getValue()[0];
                tp.codingSeconds = e.getValue()[1];
                tp.aiCodingSeconds = e.getValue()[2];
                r.timeline.add(tp);
            }
        }

        r.environment = new WakaTimeStatsResponse.Environment();
        r.environment.editors = mapEnv((List<Map<String, Object>>) data.getOrDefault("editors", List.of()));
        r.environment.operatingSystems = mapEnv((List<Map<String, Object>>) data.getOrDefault("operating_systems", List.of()));

        return r;
    }

    private List<WakaTimeStatsResponse.EnvironmentItem> mapEnv(List<Map<String, Object>> arr) {
        List<WakaTimeStatsResponse.EnvironmentItem> list = new ArrayList<>();
        for (Map<String, Object> e : arr) {
            WakaTimeStatsResponse.EnvironmentItem it = new WakaTimeStatsResponse.EnvironmentItem();
            it.name = str(e, "name");
            it.percent = dbl(e, "percent");
            it.timeText = str(e, "text");
            list.add(it);
        }
        return list;
    }

    private boolean isPrivate(String name) {
        String lower = name.toLowerCase();
        for (String p : privateProjects) {
            if (lower.startsWith(p) || lower.contains(p)) return true;
        }
        return false;
    }

    private String str(Map<String, Object> node, String field) {
        Object v = node.get(field);
        if (v == null) return "";
        if (v instanceof Map) {
            Object t = ((Map<?, ?>) v).get("text");
            return t == null ? "" : String.valueOf(t);
        }
        return String.valueOf(v);
    }

    private double dbl(Map<String, Object> node, String field) {
        Object v = node.get(field);
        if (v instanceof Number) return ((Number) v).doubleValue();
        if (v == null) return 0;
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return 0; }
    }

    private WakaTimeStatsResponse degraded(String range) {
        WakaTimeStatsResponse r = new WakaTimeStatsResponse();
        r.range = range;
        r.updatedAt = Instant.now().toString();
        r.overview = new WakaTimeStatsResponse.Overview();
        r.overview.topProject = null;
        r.aiMetrics = new WakaTimeStatsResponse.AiMetrics();
        r.aiMetrics.tools = new ArrayList<>();
        r.languages = new ArrayList<>();
        r.projects = new ArrayList<>();
        r.timeline = new ArrayList<>();
        r.environment = new WakaTimeStatsResponse.Environment();
        r.environment.editors = new ArrayList<>();
        r.environment.operatingSystems = new ArrayList<>();
        return r;
    }

    private String buildAuthHeader(String key) {
        if (key.startsWith("sec_") || key.startsWith("waka_sec_")) {
            return "Bearer " + key;
        }
        String encoded = Base64.getEncoder().encodeToString((key + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private record CacheEntry(WakaTimeStatsResponse data, long expiresAt) {
        boolean isExpired() { return Instant.now().toEpochMilli() > expiresAt; }
    }
}