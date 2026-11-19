package de.edameh.benutzer.controller;

import de.edameh.auth.security.AngemeldeterBenutzer;
import de.edameh.benutzer.dto.BenutzerResponse;
import de.edameh.benutzer.service.BenutzerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
//(@AuthenticationPrincipal : عدد 15 رو برمیگردونه و در کل هویت کاربری که الان لاگین کرده رو میده benutzer.id() مثلا اگه کاربر با ایدی 15 لاگین کرده باشه پس



@RestController
@RequiredArgsConstructor
public class BenutzerController {

    private final BenutzerService benutzerService;

    @GetMapping("/api/benutzer/ich")
            public BenutzerResponse ich(@AuthenticationPrincipal AngemeldeterBenutzer benutzer){

       return benutzerService.findeNachId(benutzer.id());

    }

}
