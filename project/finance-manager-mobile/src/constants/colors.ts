export const colors = {
  // Primary (Financial Blue-Green Gradient)
  primary: '#2E7D57',
  primaryLight: '#4CAF50', 
  primaryDark: '#1B5E20',
  
  // Accent (Engaging Colors)
  accent: '#FF6B35',
  accentLight: '#FF8A65',
  
  // Financial Data Colors
  income: '#28a745',      // Green for positive
  expense: '#dc3545',     // Red for negative  
  neutral: '#007bff',     // Blue for neutral
  warning: '#ffc107',     // Yellow for alerts
  
  // Category Colors (12 distinct colors)
  categories: [
    '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ],
  
  // Theme Colors  
  background: '#FFFFFF',
  backgroundDark: '#121212',
  surface: '#F8F9FA',
  surfaceDark: '#1E1E1E',
  text: '#212529',
  textDark: '#FFFFFF',
  textSecondary: '#6C757D',
  
  // UI Elements
  card: '#FFFFFF',
  cardDark: '#2D2D2D',
  border: '#E9ECEF',
  borderDark: '#404040',
  shadow: '#000000',
  
  // Status Colors
  success: '#28a745',
  error: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#FFFFFF'
};

export const typography = {
  h1: { fontSize: 28, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, fontWeight: 'normal' as const },
  small: { fontSize: 12, fontWeight: 'normal' as const }
};

export const spacing = {
  xs: 4, 
  sm: 8, 
  md: 16, 
  lg: 24, 
  xl: 32, 
  xxl: 48
};