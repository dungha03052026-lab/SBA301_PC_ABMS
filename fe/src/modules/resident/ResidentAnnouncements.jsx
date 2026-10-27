// src/modules/resident/ResidentAnnouncements.jsx
// Tuân thủ 100% nguyên tắc thiết kế từ DESIGN-playstation.md:
// - Light Canvas Mode (#f5f7fa layout, #ffffff cards/tables)
// - Typography: Headlines ở weight 300 (light), Form labels 14px/600, Buttons 700 bold
// - Shapes: Inputs 4px (rounded.sm), Cards & Modals 8px (rounded.md), CTAs & Badges 9999px pill (rounded.full)
// - Elevation: Level 0 Flat (boxShadow: none)
// - Nghiệp vụ: UC-20 (Xem bảng tin thông báo tòa nhà, ưu tiên tin ghim lên đầu)

import React, { useState, useEffect, useMemo } from 'react';
import {
  Input,
  Button,
  Modal,
  Tag,
  Space,
  Empty,
  Badge,
} from 'antd';
import {
  NotificationOutlined,
  PushpinOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { MockDB } from '../../shared/constants/mockData';
import { PS_COLORS, PS_ROUNDED } from '../../shared/theme/playstationTheme';

const ResidentAnnouncements = () => {
  // State
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const reloadData = () => {
    setAnnouncements(MockDB.getAnnouncements());
    setUsers(MockDB.getUsers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Map author & sort pinned on top (UC-20)
  const enrichedList = useMemo(() => {
    return announcements
      .map((ann) => {
        const author = users.find((u) => u.id === ann.created_by);
        return {
          ...ann,
          author,
        };
      })
      .sort((a, b) => {
        // Ưu tiên tin ghim lên đầu
        if (a.is_pinned !== b.is_pinned) {
          return b.is_pinned ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [announcements, users]);

  // Filtered List
  const filteredList = useMemo(() => {
    return enrichedList.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const matchContent = item.content.toLowerCase().includes(searchKeyword.trim().toLowerCase());
      return !searchKeyword.trim() || matchTitle || matchContent;
    });
  }, [enrichedList, searchKeyword]);

  // Pinned count
  const pinnedCount = announcements.filter((a) => a.is_pinned).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ====================================================================
          PAGE HEADER: PlayStation signature light 300 typography
          ==================================================================== */}
      <div>
        <span
          className="ps-caption-sm"
          style={{
            backgroundColor: 'rgba(0, 112, 209, 0.08)',
            color: PS_COLORS.primary,
            padding: '4px 12px',
            borderRadius: PS_ROUNDED.full,
            fontWeight: 700,
            letterSpacing: '0.8px',
            display: 'inline-block',
            marginBottom: 10,
          }}
        >
          BẢNG TIN TÒA NHÀ • THÔNG BÁO TỔNG HỢP (UC-20)
        </span>

        <h1
          className="ps-heading-xl"
          style={{
            fontWeight: 300, // Signature PlayStation weight 300
            color: PS_COLORS.ink,
            margin: '0 0 8px 0',
            lineHeight: 1.25,
          }}
        >
          Bản tin Thông báo Ban Quản Lý
        </h1>

        <p
          className="ps-body-sm"
          style={{ color: PS_COLORS.bodyLight, margin: 0, maxWidth: 800 }}
        >
          Cập nhật kịp thời các kế hoạch bảo dưỡng định kỳ, thông báo lịch cắt điện nước,
          phun thuốc diệt côn trùng và các quy chế hoạt động chung trong tòa nhà chung cư.
        </p>
      </div>

      {/* ====================================================================
          SEARCH & FILTER BAR
          ==================================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: PS_COLORS.muteLight }} />}
          placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{
            maxWidth: 420,
            width: '100%',
            height: 44,
            borderRadius: PS_ROUNDED.sm,
            borderColor: PS_COLORS.ashLight,
          }}
          allowClear
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="ps-caption-sm"
            style={{
              backgroundColor: 'rgba(0, 112, 209, 0.06)',
              color: PS_COLORS.primary,
              padding: '6px 16px',
              borderRadius: PS_ROUNDED.full,
              fontWeight: 600,
            }}
          >
            📌 {pinnedCount} thông báo quan trọng được ghim trên cùng
          </span>
        </div>
      </div>

      {/* ====================================================================
          ANNOUNCEMENTS LIST: 8px-radius Flat Level 0 Cards
          ==================================================================== */}
      {filteredList.length === 0 ? (
        <div
          style={{
            backgroundColor: PS_COLORS.canvasLight,
            borderRadius: PS_ROUNDED.md,
            border: `1px solid ${PS_COLORS.hairlineLight}`,
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          <Empty description="Không tìm thấy thông báo nào phù hợp" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredList.map((ann) => (
            <div
              key={ann.id}
              style={{
                backgroundColor: PS_COLORS.canvasLight,
                border: ann.is_pinned
                  ? `2px solid ${PS_COLORS.primary}` // Viền PlayStation Blue cho tin ghim
                  : `1px solid ${PS_COLORS.hairlineLight}`,
                borderRadius: PS_ROUNDED.md,
                padding: '24px 28px',
                boxShadow: 'none', // Strictly Flat Level 0
                transition: 'border-color 0.15s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    {ann.is_pinned && (
                      <Tag
                        color="blue"
                        style={{
                          borderRadius: PS_ROUNDED.full,
                          padding: '2px 12px',
                          fontWeight: 700,
                          fontSize: 11,
                          backgroundColor: PS_COLORS.primary,
                          color: PS_COLORS.onPrimary,
                          border: 'none',
                        }}
                      >
                        <PushpinOutlined /> QUAN TRỌNG • ĐÃ GHIM
                      </Tag>
                    )}
                    <h2
                      className="ps-heading-md"
                      style={{
                        margin: 0,
                        color: PS_COLORS.ink,
                        fontWeight: 600,
                        fontSize: 18,
                      }}
                    >
                      {ann.title}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: PS_COLORS.muteLight }}>
                    <span>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {dayjs(ann.created_at).format('DD/MM/YYYY HH:mm')}
                    </span>
                    <span>
                      <UserOutlined style={{ marginRight: 4 }} />
                      Đăng bởi: <strong>{ann.author?.full_name || 'Ban Quản Lý'}</strong>
                    </span>
                  </div>
                </div>

                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedAnnouncement(ann);
                    setDetailModalOpen(true);
                  }}
                  className="ps-btn-primary"
                  style={{
                    height: 38,
                    borderRadius: PS_ROUNDED.full,
                    padding: '0 20px',
                    fontSize: 13,
                  }}
                >
                  Đọc toàn văn
                </Button>
              </div>

              {/* Snippet preview */}
              <p
                style={{
                  color: PS_COLORS.bodyLight,
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-line',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================
          MODAL: CHI TIẾT TOÀN VĂN THÔNG BÁO
          ==================================================================== */}
      <Modal
        title={
          <span className="ps-heading-lg" style={{ fontWeight: 300, color: PS_COLORS.ink }}>
            Bản tin Thông báo Tòa nhà
          </span>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={680}
        destroyOnClose
        style={{ borderRadius: PS_ROUNDED.md }}
      >
        {selectedAnnouncement && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              {selectedAnnouncement.is_pinned && (
                <Tag
                  color="blue"
                  style={{
                    borderRadius: PS_ROUNDED.full,
                    backgroundColor: PS_COLORS.primary,
                    color: PS_COLORS.onPrimary,
                    fontWeight: 700,
                    border: 'none',
                    marginBottom: 10,
                  }}
                >
                  <PushpinOutlined /> THÔNG BÁO QUAN TRỌNG
                </Tag>
              )}

              <h1 className="ps-heading-md" style={{ color: PS_COLORS.ink, margin: '6px 0', fontSize: 20 }}>
                {selectedAnnouncement.title}
              </h1>

              <span style={{ fontSize: 13, color: PS_COLORS.muteLight }}>
                Phát hành lúc: {dayjs(selectedAnnouncement.created_at).format('DD/MM/YYYY HH:mm')} • Ban Quản Lý Tòa Nhà
              </span>
            </div>

            <div
              style={{
                padding: '20px 24px',
                backgroundColor: PS_COLORS.surfaceCard,
                borderRadius: PS_ROUNDED.md,
                color: PS_COLORS.ink,
                fontSize: 15,
                lineHeight: 1.7,
                whiteSpace: 'pre-line',
                marginBottom: 24,
              }}
            >
              {selectedAnnouncement.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setDetailModalOpen(false)}
                className="ps-btn-primary"
                style={{ height: 44, borderRadius: PS_ROUNDED.full, padding: '0 28px' }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResidentAnnouncements;
