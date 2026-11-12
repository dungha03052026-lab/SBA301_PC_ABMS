package com.example.apartmentbs.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;

/**
 * Cấu hình chia sẻ tài nguyên nguồn gốc chéo (CORS - Cross-Origin Resource Sharing).
 * 
 * Cho phép Frontend (Vite/React tại localhost:5173 hoặc domain khác) có thể gửi
 * HTTP request an toàn kèm theo Bearer Authorization token và cookie/credentials.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép gửi kèm thông tin xác thực (Credentials/Cookies/Authorization headers)
        config.setAllowCredentials(true);
        // Cho phép mọi nguồn gốc truy cập (phù hợp với môi trường dev & deployment)
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        // Danh sách các HTTP Headers được phép gửi lên
        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"));
        // Danh sách các HTTP Methods được phép gọi
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Cho phép client đọc các Header phản hồi đặc biệt
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));

        // Áp dụng cấu hình CORS cho tất cả các đường dẫn API
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Đăng ký CorsFilter ở độ ưu tiên cao nhất để đảm bảo header CORS luôn được gắn
     * ngay cả khi Spring Security trả về 401/403 hoặc lỗi phát sinh trước Controller.
     */
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration(CorsConfigurationSource corsConfigurationSource) {
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(corsConfigurationSource));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
