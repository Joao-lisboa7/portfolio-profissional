package br.com.joaolisboa.portfolio_profissional.wakatime.controller;

import br.com.joaolisboa.portfolio_profissional.wakatime.dto.WakaTimeStatsResponse;
import br.com.joaolisboa.portfolio_profissional.wakatime.service.WakatimeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wakatime")
@CrossOrigin(origins = "http://localhost:5173")
public class WakatimeController {

    private final WakatimeService wakatimeService;

    public WakatimeController(WakatimeService wakatimeService) {
        this.wakatimeService = wakatimeService;
    }

    @GetMapping
    public ResponseEntity<WakaTimeStatsResponse> getStats(
            @RequestParam(name = "range", defaultValue = "last_30_days") String range) {
        try {
            WakaTimeStatsResponse stats = wakatimeService.getWakaTimeStats(range);
            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }
}