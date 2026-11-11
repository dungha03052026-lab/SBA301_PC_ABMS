package com.example.apartmentbs.config;

import com.example.apartmentbs.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Cấu hình bảo mật trung tâm cho hệ thống ABMS bằng Spring Security 6 & JWT.
 * 
 * - Vô hiệu hóa CSRF & chuyển sang chế độ STATELESS (phiên không lưu trạng thái trên server).
 * - Phân quyền theo vai trò (RBAC):
 *   + /api/v1/auth/**: Cho phép truy cập tự do (Đăng nhập, lấy thông tin công khai).
 *   + /api/v1/admin/**: Yêu cầu vai trò ADMIN.
 *   + /api/v1/resident/**: Yêu cầu vai trò RESIDENT.
 *   + /api/v1/technician/**: Yêu cầu vai trò TECHNICIAN.
 * - Xử lý bắt lỗi tập trung dạng JSON chuẩn (ApiResponse) khi 401 Unauthorized hoặc 403 Forbidden.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Mã hóa mật khẩu sử dụng thuật toán băm an toàn BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Bean quản lý xác thực của Spring Security.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Cấu hình chuỗi lọc bảo mật (Security Filter Chain).
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        http
                // Vô hiệu hóa CSRF vì hệ thống sử dụng REST API không lưu session cookie
                .csrf(AbstractHttpConfigurer::disable)
                // Thiết lập phiên làm việc STATELESS cho kiến trúc Token JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Cấu hình quy tắc phân quyền cho các endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép toàn bộ pre-flight OPTIONS request cho CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Cho phép truy cập tự do vào các tài nguyên auth, lỗi, tài liệu API
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/error",
                                "/v3/api-docs/**",
                                "/swagger-ui/**"
                        ).permitAll()
                        // Công khai biểu phí dịch vụ cho cư dân và khách xem
                        .requestMatchers(HttpMethod.GET, "/api/v1/tariffs").permitAll()
                        // Phân quyền theo vai trò cụ thể
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/resident/**").hasRole("RESIDENT")
                        .requestMatchers("/api/v1/technician/**").hasRole("TECHNICIAN")
                        // Mọi yêu cầu còn lại đều phải được xác thực token hợp lệ
                        .anyRequest().authenticated()
                )
                // Xử lý ngoại lệ chuẩn JSON khi chưa đăng nhập (401) hoặc thiếu quyền (403)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            ApiResponse<Object> body = ApiResponse.error("Yêu cầu không được xác thực hoặc phiên đăng nhập đã hết hạn");
                            objectMapper.writeValue(response.getOutputStream(), body);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setCharacterEncoding("UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            ApiResponse<Object> body = ApiResponse.error("Bạn không có quyền truy cập tài nguyên này");
                            objectMapper.writeValue(response.getOutputStream(), body);
                        })
                )
                // Đặt bộ lọc JwtAuthenticationFilter trước bộ lọc đăng nhập mặc định của Spring
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
