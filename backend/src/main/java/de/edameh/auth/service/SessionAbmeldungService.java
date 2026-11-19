package de.edameh.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfLogoutHandler;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionAbmeldungService{

    private final CookieCsrfTokenRepository csrfTokenRepository;
    private final SecurityContextRepository securityContextRepository;


    public void abmelden(
      Authentication authentication,
      HttpServletRequest httpServletRequest,
      HttpServletResponse httpServletResponse
    ){
        CsrfLogoutHandler csrfLogoutHandler = new CsrfLogoutHandler(csrfTokenRepository);
        csrfLogoutHandler.logout(httpServletRequest , httpServletResponse , authentication);

        SecurityContextLogoutHandler contextLogoutHandler = new SecurityContextLogoutHandler();
        contextLogoutHandler.setSecurityContextRepository(securityContextRepository);
        contextLogoutHandler.logout(httpServletRequest , httpServletResponse , authentication);


    }


}
