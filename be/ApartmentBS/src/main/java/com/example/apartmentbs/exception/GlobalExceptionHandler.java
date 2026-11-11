package com.example.apartmentbs.exception;

import com.example.apartmentbs.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * Bộ xử lý ngoại lệ tập trung toàn cục (Global Exception Handler) cho toàn bộ REST Controller.
 * 
 * Đảm bảo mọi lỗi phát sinh (validation, xác thực, nghiệp vụ hoặc lỗi hệ thống không lường trước)
 * đều trả về một định dạng thống nhất ApiResponse(success = false, message = "...") cho Frontend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Bắt các ngoại lệ nghiệp vụ do nhà phát triển chủ động ném ra trong tầng Service (AppException).
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(ApiResponse.error(ex.getMessage()));
    }

    /**
     * Bắt các lỗi vi phạm validation (@Valid, @NotNull, @Min, @Size, v.v.) từ request body.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorMessage));
    }

    /**
     * Bắt lỗi xác thực thông tin đăng nhập sai (BadCredentialsException).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Số điện thoại hoặc mật khẩu không chính xác"));
    }

    /**
     * Bắt lỗi truy cập vượt quyền (AccessDeniedException) từ @PreAuthorize.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Bạn không có quyền thực hiện chức năng này"));
    }

    /**
     * Bắt lỗi khi không tìm thấy tài nguyên tĩnh hoặc endpoint (NoResourceFoundException).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Không tìm thấy đường dẫn tài nguyên: " + ex.getResourcePath()));
    }

    /**
     * Bắt tất cả các ngoại lệ chưa được khai báo khác (Fallback Exception Handler).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Đã xảy ra lỗi máy chủ: " + ex.getMessage()));
    }
}
