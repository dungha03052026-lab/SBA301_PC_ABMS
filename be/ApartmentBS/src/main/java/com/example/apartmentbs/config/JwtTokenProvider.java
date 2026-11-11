package com.example.apartmentbs.config;

import com.example.apartmentbs.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Tiện ích tạo, phân tích và kiểm tra tính hợp lệ của JSON Web Token (JWT).
 * 
 * - Sử dụng thư viện JJWT với thuật toán ký HMAC SHA-256.
 * - Đóng gói các thông tin định danh: User ID, số điện thoại, họ tên, vai trò và email vào Payload.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    /**
     * Khởi tạo SecretKey ký mã hóa từ chuỗi bí mật jwt.secret.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Tạo chuỗi JWT Token có thời hạn và gắn các Claims thông tin người dùng.
     *
     * @param user Đối tượng người dùng đã được xác thực
     * @return Chuỗi JWT Token
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("phoneNumber", user.getPhoneNumber())
                .claim("fullName", user.getFullName())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Giải mã Token để lấy User ID (Subject của Token).
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    /**
     * Trích xuất vai trò (Role) từ Claim trong Token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    /**
     * Kiểm tra tính toàn vẹn và thời hạn sử dụng của JWT Token.
     *
     * @param authToken Token nhận từ Client (Header Bearer)
     * @return true nếu token hợp lệ, ngược lại false
     */
    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
