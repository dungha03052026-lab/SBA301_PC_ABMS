// src/shared/theme/playstationTheme.js
// Triển khai chính xác 100% token thiết kế từ DESIGN-playstation.md

export const PS_COLORS = {
  // Brand & Accent
  primary: '#0070d1',          // PlayStation Blue (universal primary CTA, badge fill, active filter chip)
  primaryPressed: '#0064b7',   // PlayStation Blue Pressed
  primaryActive: '#004d8d',    // PlayStation Blue Active
  onPrimary: '#ffffff',
  linkLight: '#0064b7',
  linkDark: '#53b1ff',
  commerce: '#d53b00',         // Commerce Orange (reserved for Store/Buy/Pay CTAs)
  commercePressed: '#aa2f00',
  onCommerce: '#ffffff',

  // Canvas & Surfaces
  canvasDark: '#000000',       // Pure black hero band, primary nav, footer base
  surfaceDarkElevated: '#121314', // Inset dark panels, elevated containers
  surfaceDarkCard: '#181818',  // Game tile fill, dark product card
  charcoal: '#1f2024',
  canvasLight: '#ffffff',      // True white canvas
  surfaceSoft: '#f3f3f3',      // Soft surface & hairline divider on light canvas
  surfaceCard: '#f5f7fa',      // Cool-blue-tinted product card background
  surfaceFilter: 'rgba(245,247,250,0.3)', // Filter pill default background
  hairlineLight: '#f3f3f3',    // 1px divider rule on light surfaces
  hairlineDark: 'rgba(229,229,229,0.2)', // Translucent 1px divider on dark surfaces

  // Typography & Text
  ink: '#000000',              // Primary text on canvas-light
  inkDeep: '#121314',
  inkElevated: '#181818',
  bodyLight: 'rgba(0,0,0,0.6)',// Default body paragraph on light canvas
  muteLight: '#6b6b6b',
  ashLight: '#cccccc',         // Border & disabled state on light surfaces
  onDark: '#ffffff',           // Primary text on canvas-dark
  bodyDark: 'rgba(255,255,255,0.7)', // Body text on dark canvas
  onDarkMute: '#cccccc',
  muteDark: 'rgba(229,229,229,0.55)',
  ashDark: 'rgba(229,229,229,0.2)',

  // Semantic & Gradient
  warning: '#c81b3a',          // Validation errors & destructive confirmation copy
  psPlusGoldStart: '#ffce21',
  psPlusGoldMid: '#f5a623',
  psPlusGoldEnd: '#ee8e00',
};

export const PS_ROUNDED = {
  none: 0,
  sm: 4,      // Text inputs (4px)
  md: 8,      // Cards, containers, modals (8px)
  lg: 16,     // Rare large containers
  full: 9999, // Every CTA pill, filter chip, badge (9999px)
};

export const PS_SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 96,
};

// Cấu hình Ant Design ConfigProvider Theme khớp 100% PlayStation Design Tokens
export const playstationAntdTheme = {
  token: {
    // Brand Colors
    colorPrimary: PS_COLORS.primary,
    colorPrimaryHover: PS_COLORS.primaryPressed,
    colorPrimaryActive: PS_COLORS.primaryActive,
    colorError: PS_COLORS.warning,
    colorWarning: PS_COLORS.psPlusGoldMid,
    colorSuccess: '#52c41a',
    colorInfo: PS_COLORS.primary,

    // Typography & Font
    fontFamily: `'PlayStation SST', 'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`,
    colorTextBase: PS_COLORS.ink,
    colorText: PS_COLORS.ink,
    colorTextSecondary: PS_COLORS.bodyLight,
    colorTextDescription: PS_COLORS.muteLight,
    colorTextDisabled: PS_COLORS.ashLight,

    // Surfaces & Backgrounds
    colorBgBase: PS_COLORS.canvasLight,
    colorBgContainer: PS_COLORS.canvasLight,
    colorBgLayout: PS_COLORS.surfaceCard,

    // Borders & Hairlines
    colorBorder: PS_COLORS.ashLight,
    colorBorderSecondary: PS_COLORS.hairlineLight,

    // Shapes & Radius (Scale: inputs 4px, cards 8px, CTAs full)
    borderRadius: PS_ROUNDED.md,      // 8px cho cards & containers
    borderRadiusSM: PS_ROUNDED.sm,    // 4px cho text inputs
    borderRadiusLG: PS_ROUNDED.md,    // 8px

    // Elevation & Depth: Level 0 (Flat, no resting drop shadows!)
    boxShadow: 'none',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.16)', // Chỉ xuất hiện khi active/pressed
    boxShadowTertiary: 'none',
  },
  components: {
    Button: {
      // CTA Pills: Tất cả nút hành động là fully-rounded pill (9999px)
      borderRadius: PS_ROUNDED.full,
      controlHeight: 48,
      fontWeight: 700,
      letterSpacing: '0.45px',
      primaryColor: PS_COLORS.onPrimary,
      defaultColor: PS_COLORS.ink,
      defaultBorderColor: PS_COLORS.ashLight,
      defaultBg: 'transparent',
      textHoverBg: PS_COLORS.surfaceSoft,
      paddingInline: 28,
      boxShadow: 'none',
    },
    Input: {
      borderRadius: PS_ROUNDED.sm,     // 4px
      controlHeight: 48,
      colorBorder: PS_COLORS.ashLight,
      activeBorderColor: PS_COLORS.primary,
      hoverBorderColor: PS_COLORS.primary,
      activeShadow: 'none',            // Không dùng halo, tăng độ dày border theo spec
      paddingInline: 16,
    },
    Select: {
      borderRadius: PS_ROUNDED.sm,
      controlHeight: 40,
      colorBorder: PS_COLORS.ashLight,
      colorPrimary: PS_COLORS.primary,
    },
    Card: {
      borderRadiusLG: PS_ROUNDED.md,   // 8px
      colorBgContainer: PS_COLORS.canvasLight,
      colorBorderSecondary: PS_COLORS.hairlineLight,
      boxShadowTertiary: 'none',
      paddingLG: 24,
    },
    Table: {
      borderRadius: PS_ROUNDED.md,
      headerBg: PS_COLORS.surfaceCard,
      headerColor: PS_COLORS.ink,
      headerSplitColor: PS_COLORS.hairlineLight,
      borderColor: PS_COLORS.hairlineLight,
      rowHoverBg: PS_COLORS.surfaceCard,
    },
    Modal: {
      borderRadiusLG: PS_ROUNDED.md,   // 8px
      headerBg: PS_COLORS.canvasLight,
      boxShadowSecondary: '0 8px 32px rgba(0,0,0,0.2)',
    },
    Tag: {
      borderRadiusSM: PS_ROUNDED.full, // 9999px cho badge/info tags
      fontSize: 12,
      lineHeight: 1.5,
      fontWeight: 500,
    },
    Menu: {
      darkItemBg: PS_COLORS.canvasDark,
      darkSubMenuItemBg: PS_COLORS.surfaceDarkElevated,
      darkItemSelectedBg: PS_COLORS.primary,
      darkItemSelectedColor: PS_COLORS.onDark,
      darkItemHoverBg: PS_COLORS.surfaceDarkElevated,
      itemBorderRadius: PS_ROUNDED.full,
    },
    Tabs: {
      colorPrimary: PS_COLORS.primary,
      inkBarColor: PS_COLORS.primary,
      itemSelectedColor: PS_COLORS.primary,
      itemHoverColor: PS_COLORS.primaryPressed,
    },
  },
};
