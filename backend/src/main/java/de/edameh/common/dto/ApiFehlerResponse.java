package de.edameh.common.dto;

import java.time.Instant;
import java.util.Map;

public record ApiFehlerResponse(
                                Instant timestamp,
                                int status,
                                String code,
                                String message,
                                String path,
                                Map<String, String> fieldErrors) {

}
