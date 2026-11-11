package com.example.apartmentbs.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Ngoại lệ nghiệp vụ tùy chỉnh (Custom Business Exception) cho toàn bộ hệ thống ABMS.
 * 
 * Cho phép kèm theo mã trạng thái HTTP (HttpStatus) tương ứng như:
 * - BAD_REQUEST (400): Tham số không hợp lệ hoặc dữ liệu vi phạm nghiệp vụ thông thường.
 * - UNAUTHORIZED (401): Sai mật khẩu, chưa đăng nhập, hoặc phiên làm việc hết hạn.
 * - FORBIDDEN (403): Tài khoản bị khóa (is_active = 0) hoặc không đủ thẩm quyền.
 * - NOT_FOUND (404): Không tìm thấy tài nguyên (Căn hộ, Hóa đơn, Cư dân, v.v.).
 * - CONFLICT (409): Vi phạm quy tắc chuyển đi khi còn nợ tiền (BR-04), trùng mã/biển số.
 */
@Getter
public class AppException extends RuntimeException {
    private final HttpStatus status;

    public AppException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}
