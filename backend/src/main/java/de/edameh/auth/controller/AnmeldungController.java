package de.edameh.auth.controller;


import de.edameh.auth.dto.AnmeldungRequest;
import de.edameh.auth.service.AnmeldungService;
import de.edameh.auth.service.SessionAnmeldungService;
import de.edameh.benutzer.dto.BenutzerResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnmeldungController {

    private final AnmeldungService anmeldungService;
    private final SessionAnmeldungService sessionAnmeldungService;

    @PostMapping("/anmeldung")
    public BenutzerResponse anmelden(
            @Valid @RequestBody AnmeldungRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    )

    {
        BenutzerResponse benutzer =
                anmeldungService.anmelden(request);

        sessionAnmeldungService.anmelden(
                benutzer.id(),
                httpRequest,
                httpResponse
        );

        return benutzer;
    }
}
