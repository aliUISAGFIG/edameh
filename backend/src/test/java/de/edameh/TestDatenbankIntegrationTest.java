package de.edameh;
import de.edameh.auth.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class TestDatenbankIntegrationTest
        extends AbstractPostgresIntegrationTest{

    @Autowired
    private DataSource dataSource;

    /**
     * بررسی می‌کند که تست‌ها واقعاً به دیتابیس آزمایشی
     * وصل شده‌اند و نه دیتابیس توسعه‌ی Edameh.
     */
    @Test
    void verwendetSeparateTestDatenbank() throws SQLException {

        try (Connection connection = dataSource.getConnection()) {

            assertEquals("edameh_test", connection.getCatalog());
        }
    }
}




