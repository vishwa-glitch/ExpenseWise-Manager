/**
 * Component Rules Configuration
 * Defines which React Native components can contain direct text and which require Text wrappers
 */

import { ComponentRules, TextWrappingRule } from '../types';

/**
 * React Native components that should NOT contain direct text content
 */
export const RESTRICTED_COMPONENTS = [
  'View',
  'Pressable',
  'TouchableOpacity',
  'TouchableHighlight',
  'TouchableWithoutFeedback',
  'ScrollView',
  'FlatList',
  'SectionList',
  'VirtualizedList',
  'SafeAreaView',
  'KeyboardAvoidingView',
  'Modal',
  'RefreshControl',
  'StatusBar',
  'Switch',
  'Slider',
  'ActivityIndicator',
  'Image',
  'ImageBackground'
];

/**
 * React Native components that are allowed to contain direct text content
 */
export const ALLOWED_TEXT_CONTAINERS = [
  'Text',
  'TextInput',
  'Button', // Button can have title prop but also text children
  'Picker.Item', // Special case for Picker items
  'Animated.Text' // Animated text component
];

/**
 * Special handling rules for specific components
 */
export const SPECIAL_CASES = new Map<string, TextWrappingRule>([
  ['Button', {
    allowDirectText: true,
    requiresTextWrapper: false,
    specialHandling: (content: string) => {
      // Button components can have text children, but it's better to use title prop
      return content.trim().length > 0;
    }
  }],
  ['Picker.Item', {
    allowDirectText: true,
    requiresTextWrapper: false,
    specialHandling: (_content: string) => {
      // Picker.Item uses label prop, but can also have text children
      return false; // Don't wrap Picker.Item text
    }
  }],
  ['TouchableOpacity', {
    allowDirectText: false,
    requiresTextWrapper: true,
    specialHandling: (content: string) => {
      // TouchableOpacity should never have direct text
      return content.trim().length > 0;
    }
  }],
  ['Pressable', {
    allowDirectText: false,
    requiresTextWrapper: true,
    specialHandling: (content: string) => {
      // Pressable should never have direct text
      return content.trim().length > 0;
    }
  }]
]);

/**
 * Default component rules configuration
 */
export const DEFAULT_COMPONENT_RULES: ComponentRules = {
  restrictedComponents: RESTRICTED_COMPONENTS,
  allowedTextContainers: ALLOWED_TEXT_CONTAINERS,
  specialCases: SPECIAL_CASES
};

/**
 * Text-related style properties that should be migrated to Text components
 */
export const TEXT_STYLE_PROPERTIES = [
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'textAlign',
  'textAlignVertical',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationColor',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'lineHeight',
  'letterSpacing',
  'includeFontPadding',
  'textBreakStrategy',
  'selectable',
  'selectionColor',
  'suppressHighlighting',
  'ellipsizeMode',
  'numberOfLines',
  'adjustsFontSizeToFit',
  'minimumFontScale',
  'allowFontScaling'
];

/**
 * Layout-related style properties that should remain on parent components
 */
export const LAYOUT_STYLE_PROPERTIES = [
  'flex',
  'flexDirection',
  'flexWrap',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignItems',
  'alignSelf',
  'alignContent',
  'justifyContent',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'backgroundColor',
  'borderColor',
  'borderStyle',
  'opacity',
  'elevation',
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'transform',
  'zIndex'
];