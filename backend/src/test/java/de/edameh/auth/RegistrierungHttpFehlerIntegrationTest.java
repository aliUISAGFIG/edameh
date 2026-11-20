package de.edameh.auth;


import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.service.RegistrierungService;
import jakarta.servlet.http.Cookie;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RegistrierungHttpFehlerIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private RegistrierungService registrierungService;

    @Test
    void datenbankEmailFehlerWirdZu409() throws Exception {

        SQLException sqlFehler = new SQLException(
                "Duplicate email",
                "23505"
        );

        ConstraintViolationException hibernateFehler =
                new ConstraintViolationException(
                        "Unique constraint verletzt",
                        sqlFehler,
                        "INSERT INTO benutzer",
                        "uq_benutzer_email_lower"
                );

        DataIntegrityViolationException springFehler =
                new DataIntegrityViolationException(
                        "E-Mail bereits vorhanden",
                        hibernateFehler
                );

        doThrow(springFehler)
                .when(registrierungService)
                .registrierung(any(RegistrierungRequest.class));

        // بخش سوم: دریافت CSRF معتبر از Endpoint واقعی
        MvcResult csrfResult = mvc.perform(get("/api/csrf"))
                .andExpect(status().isOk())
                .andReturn();

        Cookie csrfCookie =
                csrfResult.getResponse().getCookie("XSRF-TOKEN");

        assertNotNull(csrfCookie);

        String json = """
                {
                  "eMail": "http-test@example.com",
                  "anzeigename": "TestBenutzer",
                  "passwort": "TestPasswort123",
                  "passwortBestaetigung": "TestPasswort123"
                }
                """;
// اینجا برررسی میکنیم که ارسال درخواست از مسیر http هم اروری که گفتیم رو بده
        mvc.perform(
                        post("/api/registrierung")
                                .cookie(csrfCookie)
                                .header("X-XSRF-TOKEN", csrfCookie.getValue())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json)
                )
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.code")
                        .value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.path")
                        .value("/api/registrierung"));
        //اطمینان از اینکه کنترلر سرویس رو صدا زده
        verify(registrierungService).registrierung(any(RegistrierungRequest.class));


    }

}
