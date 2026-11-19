package de.edameh.auth.service;

import de.edameh.auth.security.AngemeldeterBenutzer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Service;

import java.util.List;
/*
با این کلاس داریم به Spring Security می‌گیم :
«این کاربر با موفقیت احراز هویت شده. حالا براش یه Session آماده کن، اطلاعات ورودش رو ذخیره کن و یه CSRF Token جدید هم براش بساز.»
*/

@Service
@RequiredArgsConstructor
public class SessionAnmeldungService {
   private final SecurityContextRepository securityContextRepository; //برای ذخیره و بازیابی اطلاعات Authentication هست
   private final CookieCsrfTokenRepository csrfTokenRepository; // برای مدیریت CSRF Token داخل Cookie هست.

   public void anmelden(  Long benutzerId, HttpServletRequest request, HttpServletResponse response) //benutzerid = ایدی کاربری که لاگین موفق داشته , request = http anfrage die von der browser kam , response = http antwort die zu der browser geht
   {
    request.getSession(true); // اگه برای این درخواست Session وجود داره، همونو بده اگه وجود نداره، یکی بساز.
    request.changeSessionId(); // شناسه Session رو عوض کن مثلا قبل از login JSESSIONID=abc123 و بعدش میشه JSESSIONID=o3n883

       AngemeldeterBenutzer principal = new AngemeldeterBenutzer(benutzerId); //در Spring security کلمه principal یعنی کاربری که احزار حویت شده و طلاعاتی هست که باهاش کاربر فعلی رو می‌شناسیم
       UsernamePasswordAuthenticationToken authenticated =
               UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of());// یه Authentication می‌سازه که وضعیتش از قبل موفق اعلام شده.

       SecurityContext emptyContext = SecurityContextHolder.createEmptyContext(); //  مثل یه جعبه تصور کن که اطلاعات Authentication کاربر داخلش قرار می‌گیره
       emptyContext.setAuthentication(authenticated); // در اینجا Authentication رو داخل جعبه میزاریم
       SecurityContextHolder.setContext(emptyContext); // اطلاعات Authntication رو برای پردازش درخواست فعلی که نگه میداره

       securityContextRepository.saveContext(emptyContext , request , response); //اون اطلاعات رو از طریق Repository ذخیره می‌کنه تا در درخواست‌های بعدی هم قابل بازیابی باشن و لازم به لاگین باز نباشه.

       CsrfToken neuerToken = csrfTokenRepository.generateToken(request);

       csrfTokenRepository.saveToken(neuerToken , request , response);

   }




}
