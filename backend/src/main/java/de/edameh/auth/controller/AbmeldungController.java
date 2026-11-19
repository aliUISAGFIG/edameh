package de.edameh.auth.controller;


import de.edameh.auth.service.SessionAbmeldungService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AbmeldungController {

    private final SessionAbmeldungService sessionAbmeldungServices;

    @PostMapping("/abmeldung")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void abmelden(Authentication authentication , HttpServletRequest request , HttpServletResponse response){

        sessionAbmeldungServices.abmelden(authentication , request , response);
    }






}
