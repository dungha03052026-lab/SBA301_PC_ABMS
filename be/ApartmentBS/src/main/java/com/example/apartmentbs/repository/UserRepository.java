package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Role;
import com.example.apartmentbs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho thực thể Người dùng (User).
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm tài khoản người dùng theo số điện thoại (dùng làm username đăng nhập).
     */
    Optional<User> findByPhoneNumber(String phoneNumber);

    /**
     * Tìm tài khoản người dùng theo email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Kiểm tra số điện thoại đã được đăng ký hay chưa.
     */
    boolean existsByPhoneNumber(String phoneNumber);

    /**
     * Kiểm tra email đã được đăng ký hay chưa.
     */
    boolean existsByEmail(String email);

    /**
     * Lấy danh sách người dùng theo vai trò (ADMIN, RESIDENT, TECHNICIAN).
     */
    List<User> findByRole(Role role);
}
