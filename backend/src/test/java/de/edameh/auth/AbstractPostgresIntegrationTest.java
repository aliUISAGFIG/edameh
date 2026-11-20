package de.edameh.auth;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;

@ActiveProfiles("test")
public abstract class AbstractPostgresIntegrationTest {

    // دیتابیس آزمایشی مشترک برای تست‌های این اجرای Maven
    private static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:17-alpine")
                    .withDatabaseName("edameh_test")
                    .withUsername("edameh_test")
                    .withPassword("test_password_only");

    // قبل از آماده‌شدن Spring، PostgreSQL آزمایشی را اجرا می‌کنیم
    static {
        POSTGRES.start();
    }

    /**
     * آدرس و اطلاعات اتصال دیتابیس آزمایشی را
     * به Spring می‌دهد تا تست‌ها به دیتابیس توسعه وصل نشوند.
     */
    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {

        // آدرس اتصال PostgreSQL آزمایشی
        registry.add(
                "spring.datasource.url",
                POSTGRES::getJdbcUrl
        );

        // نام کاربری دیتابیس آزمایشی
        registry.add(
                "spring.datasource.username",
                POSTGRES::getUsername
        );

        // رمز دیتابیس آزمایشی
        registry.add(
                "spring.datasource.password",
                POSTGRES::getPassword
        );
    }
}

