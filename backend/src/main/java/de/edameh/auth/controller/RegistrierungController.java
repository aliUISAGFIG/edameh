package de.edameh.auth.controller;


import de.edameh.auth.dto.RegistrierungRequest;
import de.edameh.auth.service.RegistrierungService;
import de.edameh.auth.service.SessionAnmeldungService;
import de.edameh.benutzer.dto.BenutzerResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.support.HttpRequestHandlerServlet;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor

public class RegistrierungController {

    private final RegistrierungService registrierungService;
    private final SessionAnmeldungService sessionAnmeldungService;


    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/registrierung")
    public BenutzerResponse registrierung(@RequestBody @Valid RegistrierungRequest request,
                                          HttpServletRequest httpRequest,
                                          HttpServletResponse httpResponse)
    {
        BenutzerResponse benutzer = registrierungService.registrierung(request);
        sessionAnmeldungService.anmelden(benutzer.id(), httpRequest, httpResponse); //Authentication داخل Session ذخیره می‌شود
        return benutzer;
    }


}
