package com.example.apartmentbs.config;

import com.example.apartmentbs.model.User;
import com.example.apartmentbs.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * Bộ lọc xác thực JWT áp dụng một lần cho mỗi HTTP Request (OncePerRequestFilter).
 * 
 * Luồng hoạt động:
 * 1. Bóc tách header 'Authorization' chứa 'Bearer <token>'.
 * 2. Xác thực tính hợp lệ của token qua JwtTokenProvider.
 * 3. Trích xuất User ID, truy vấn DB để đảm bảo tài khoản tồn tại và còn kích hoạt (isActive = true).
 * 4. Nạp thông tin xác thực và danh sách quyền hạn (ROLE_...) vào SecurityContextHolder.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Bước 1: Lấy JWT từ Authorization header
            String jwt = getJwtFromRequest(request);

            // Bước 2: Kiểm tra tính hợp lệ của JWT
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                Long userId = tokenProvider.getUserIdFromToken(jwt);
                Optional<User> userOptional = userRepository.findById(userId);

                // Bước 3: Đảm bảo người dùng còn tồn tại và đang hoạt động (không bị khóa)
                if (userOptional.isPresent() && Boolean.TRUE.equals(userOptional.get().getIsActive())) {
                    User user = userOptional.get();
                    String role = user.getRole().name();
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

                    // Bước 4: Tạo Authentication object và lưu vào SecurityContext
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Không thể thiết lập xác thực người dùng trong security context", ex);
        }

        // Chuyển tiếp request sang filter tiếp theo trong chuỗi lọc
        filterChain.doFilter(request, response);
    }

    /**
     * Bóc tách token từ header Authorization theo tiền tố 'Bearer '.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
