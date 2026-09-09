/**
 * Theme cho Ant Design 5.
 *
 * Ant Design mặc định dùng màu xanh #1890ff. Trước đây dự án không cấu hình
 * ConfigProvider nên mọi component antd đều mang màu mặc định đó, lệch với
 * Bootstrap (#0d6efd) và các màu tự viết -> giao diện trông chắp vá.
 *
 * File này khai báo lại token của antd cho khớp với src/styles/tokens.css.
 * Giá trị phải trùng với các biến --brand-* / --gray-* trong tokens.css.
 */

// Giữ trùng với tokens.css
const BRAND = '#4f46e5';
const BRAND_HOVER = '#4338ca';
const BRAND_ACTIVE = '#3730a3';

const GRAY = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  900: '#0f172a',
};

const FONT =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

const antdTheme = {
  token: {
    // Màu
    colorPrimary: BRAND,
    colorInfo: '#0284c7',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#e11d48',
    colorLink: BRAND,
    colorLinkHover: BRAND_HOVER,

    // Chữ
    fontFamily: FONT,
    fontSize: 14,
    colorText: GRAY[700],
    colorTextHeading: GRAY[900],
    colorTextSecondary: GRAY[500],
    colorTextDescription: GRAY[500],
    colorTextDisabled: GRAY[400],

    // Nền & viền
    colorBgLayout: '#f6f7fb',
    colorBgContainer: '#ffffff',
    colorBorder: GRAY[200],
    colorBorderSecondary: GRAY[100],
    colorFillAlter: GRAY[50],

    // Bo góc
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    // Đổ bóng nhẹ hơn mặc định
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.07), 0 1px 3px rgba(15, 23, 42, 0.05)',
    boxShadowSecondary: '0 12px 28px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.05)',

    // Điều khiển
    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 30,
    lineWidth: 1,
    wireframe: false,
  },

  components: {
    Button: {
      fontWeight: 550,
      primaryShadow: '0 2px 6px rgba(79, 70, 229, 0.24)',
      colorPrimaryHover: BRAND_HOVER,
      colorPrimaryActive: BRAND_ACTIVE,
      paddingInline: 18,
    },

    Card: {
      headerBg: 'transparent',
      headerFontSize: 16,
      paddingLG: 20,
      colorBorderSecondary: GRAY[200],
    },

    Table: {
      headerBg: GRAY[50],
      headerColor: GRAY[700],
      headerSplitColor: 'transparent',
      rowHoverBg: '#eef2ff',
      borderColor: GRAY[100],
      cellPaddingBlock: 14,
      headerBorderRadius: 10,
    },

    Menu: {
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemHeight: 42,
      itemSelectedBg: '#eef2ff',
      itemSelectedColor: BRAND,
      itemHoverBg: GRAY[100],
      activeBarWidth: 0,
      iconSize: 16,
    },

    Layout: {
      bodyBg: '#f6f7fb',
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#ffffff',
    },

    Input: {
      paddingBlock: 8,
      activeBorderColor: '#818cf8',
      hoverBorderColor: '#a5b4fc',
      activeShadow: '0 0 0 3px #e0e7ff',
    },

    Select: {
      optionSelectedBg: '#eef2ff',
      optionSelectedColor: BRAND,
    },

    Tag: {
      borderRadiusSM: 999,
      defaultBg: GRAY[100],
      defaultColor: GRAY[600],
    },

    Statistic: {
      titleFontSize: 13,
      contentFontSize: 26,
    },

    Modal: {
      borderRadiusLG: 16,
      headerBg: 'transparent',
      titleFontSize: 18,
    },

    Tabs: {
      inkBarColor: BRAND,
      itemSelectedColor: BRAND,
      itemHoverColor: BRAND_HOVER,
      titleFontSize: 14,
      horizontalItemGutter: 24,
    },

    Steps: {
      colorPrimary: BRAND,
    },

    Progress: {
      defaultColor: BRAND,
    },

    Pagination: {
      itemActiveBg: BRAND,
      borderRadius: 8,
    },

    Descriptions: {
      labelBg: GRAY[50],
    },

    Alert: {
      borderRadiusLG: 10,
    },
  },
};

export default antdTheme;
