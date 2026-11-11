package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy vấn dữ liệu cho thực thể Thông báo tòa nhà (Announcement).
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * Lấy toàn bộ thông báo tòa nhà: ưu tiên các tin được ghim (isPinned = true) lên trên cùng,
     * sau đó sắp xếp theo thời gian đăng giảm dần (mới nhất trước).
     */
    List<Announcement> findAllByOrderByIsPinnedDescCreatedAtDesc();
}
