package de.edameh.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   SecurityContextRepository securityContextRepo,
                                                   CookieCsrfTokenRepository csrfTokenRepository,
                                                   @Qualifier("handlerExceptionResolver")
                                                   HandlerExceptionResolver exceptionResolver) throws Exception {
        //  برای ذخیره و یا بازیابی csrf token از همین Repository که به متد تزریق شده استفاده کن یعنی csrfTokenRepository
        http.csrf(csrf -> csrf.spa().csrfTokenRepository(csrfTokenRepository))

                .cors(Customizer.withDefaults()) //این خط یعنی,اسپرینگ سکوریتی CROS رو فعال کن و تنظیماتی که بهت میدم استفاده کن
                .securityContext(sec -> sec.securityContextRepository(securityContextRepo))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.GET, "/api/csrf").permitAll() // بدون نیاز به login
                        .requestMatchers(HttpMethod.POST, "/api/registrierung").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/anmeldung").permitAll()
                        .anyRequest().authenticated())
                .formLogin(AbstractHttpConfigurer::disable) // formlogin پیشفرض خود اسپرینگ نیاد چون خودمون در فرانت طراحی کردیم
                .httpBasic(AbstractHttpConfigurer::disable) //چون مال ما قراره Session-cockie باشه
                //به Spring Secutity میگه که خطا هایی که اطلا به controller نمیرسه و امنیتی هستن رو چطور مدیریت کنه.
                .exceptionHandling(error -> error
                        //وقتی کاربر Login نکرده ولی درخواستش نیاز به Login داره
                        .authenticationEntryPoint((request, response, authException) ->

                                exceptionResolver.resolveException( //خطا ساخته شده سیستمی رو میده به Spring mvc تا مدیریت کنه (یعنی متود مناسبشو پیدا کنه و غیره)
                                        request,
                                        response,
                                        null,
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Anmeldung erforderlich."
                                        )

                                )
                                //هم مسئول دسترسی ممنوعه، مثل CSRF نامعتبر یا نداشتن مجوز؛ یعنی 403.
                        ).accessDeniedHandler((request, response, exception) ->
                                exceptionResolver.resolveException(
                                        request,
                                        response,
                                        null,
                                        new ResponseStatusException(
                                                HttpStatus.FORBIDDEN,
                                                "Zugriff verweigert."
                                        )
                                )
                        )
                );
        return http.build();

    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration corsConfiguration = new CorsConfiguration(); //این Object فقط تنظیمات CORS رو نگه می‌داره

        corsConfiguration.setAllowedOrigins(
                List.of("http://localhost:5173"));

        corsConfiguration.setAllowedMethods(
                List.of("GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        corsConfiguration.setAllowedHeaders(
                List.of("Content-Type",
                        "X-XSRF-TOKEN"));
//درخواست‌های Frontend مجاز می‌تونن Credentialهایی مثل Cookie رو هم همراه خودشون داشته باشن.
        corsConfiguration.setAllowCredentials(true);
// در اینجا کلاس UrlBasedCorsConfigurationSource میگه این تنظیمات cross برای چه url هایی بایداستفاده شه ؟ که ما گفتیم هر چی که با api شروه شه
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/api/**",
                corsConfiguration
        );

        return source;


    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository(); //اطلاعات Authentication کاربر رو داخل Session سمت سرور نگه دار.
    }

    @Bean
    public CookieCsrfTokenRepository csrfTokenRepository() {
        return CookieCsrfTokenRepository.withHttpOnlyFalse(); //توکن CSRF رو داخل Cookie مرورگر ذخیره کن.
    }


}
