package de.edameh.auth.controller;

import de.edameh.auth.dto.CsrfResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CsrfController {

// bevor der Request zu Controller kommt, geht der zuerst durch Spring Security danach bekommt der ein csrftoken, dann guckt Spring was der methode will und übwegibt das ihn

@GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken csrfToken){

    return new CsrfResponse(csrfToken.getToken());
}

}
