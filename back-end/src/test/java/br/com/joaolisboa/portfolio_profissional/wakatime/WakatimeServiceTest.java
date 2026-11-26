package br.com.joaolisboa.portfolio_profissional.wakatime;

import br.com.joaolisboa.portfolio_profissional.wakatime.service.WakatimeService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WakatimeServiceTest {

    @Test
    @DisplayName("Deve lancar excecao quando apiKey estiver vazia")
    void shouldThrowWhenApiKeyIsEmpty() {
        WakatimeService service = new WakatimeService("https://wakatime.com/api/v1", "", 30, "");
        assertThrows(Exception.class, () -> service.getWakaTimeStats("last_30_days"));
    }
}