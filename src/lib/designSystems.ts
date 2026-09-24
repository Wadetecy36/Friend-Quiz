export type DesignSystemId =
  | 'neo-tactile'
  | 'midnight-obsidian'
  | 'nordic-archival'
  | 'tokyo-arcade'
  | 'bauhaus-monolith';

export interface DesignSystemColorTokens {
  canvas: string; // 60% dominant neutral background
  surface: string; // 30% structural container background
  surfaceElevated: string; // interactive / raised item background
  surfaceSubtle: string; // quiet secondary containers / unselected states
  border: string; // border color
  borderSecondary?: string; // lighter divider or inner hairline
  textPrimary: string; // high-contrast display & body prose
  textSecondary: string; // muted metadata / quiet labels
  textMuted: string; // low-contrast helper hints
  accent: string; // 10% primary action / key indicator
  accentText: string; // text on primary accent
  accentSecondary: string; // supporting accent (e.g. green / emerald / cyan)
  accentSecondaryText: string;
  badgeBg: string; // subtle badge / indicator background
  badgeText: string;
  statusCorrect: string; // quiz correct / success color
  statusWrong: string; // quiz wrong / alert color
}

export interface DesignSystemTypography {
  displayFont: string; // Expressive display / hero font family
  displayFontName: string;
  bodyFont: string; // Refined body prose font family
  bodyFontName: string;
  monoFont: string; // Tabular numerals / data font family
  monoFontName: string;
  displayWeight: string; // font weight class
  displayTracking: string; // letter-spacing class
  metaTracking: string;
}

export interface DesignSystemGeometry {
  cardRadius: string; // CSS border-radius for main cards
  cardRadiusSm: string; // CSS border-radius for buttons/inputs
  cardRadiusInner: string; // CSS border-radius for child items (R_inner = R_outer - padding)
  borderWidth: string; // e.g. "2.5px" | "1px" | "2px"
  shadowCard: string; // Box-shadow style for cards
  shadowButton: string; // Box-shadow style for buttons
  shadowSm: string; // Small tactile shadow
  buttonActiveTransform: string; // active press physics
  cardElevationDepth: string; // description of spatial presence
}

export interface DesignSystemMeta {
  id: DesignSystemId;
  name: string;
  subtitle: string;
  tagline: string;
  curatorQuote: string;
  targetMood: string;
  bestSuitedFor: string;
  antiSlopRestraints: string[];
  colors: DesignSystemColorTokens;
  typography: DesignSystemTypography;
  geometry: DesignSystemGeometry;
  cssVariables: Record<string, string>;
}

export const DESIGN_SYSTEMS: DesignSystemMeta[] = [
  {
    id: 'neo-tactile',
    name: 'Neo-Tactile Risograph',
    subtitle: 'Warm Neo-Brutalist & Editorial Zine',
    tagline: 'Physical stationery, high-contrast ink, and tactile risograph warmth.',
    curatorQuote:
      'Reminiscent of heavy letterpress cardstock and honest indie zines. High-touch, cheerful, and physically grounded.',
    targetMood: 'Warm, approachable, playful, tangible, authentic human questionnaire',
    bestSuitedFor: 'Casual friend groups, intimate personal catch-ups, creative portfolios',
    antiSlopRestraints: [
      'Strict 2.5px crisp ink borders with solid offset drop-shadows (no muddy CSS blurs)',
      'Warm oat canvas (#FAF7F0) with sunburst amber and terracotta accents (60-30-10 rule)',
      'Unboxed metadata with typographic dot separators',
      'Instrument Serif italic callouts for human warmth',
    ],
    colors: {
      canvas: '#FAF7F0',
      surface: '#FFFDF9',
      surfaceElevated: '#FFFFFF',
      surfaceSubtle: '#F4EFE6',
      border: '#1C1917',
      borderSecondary: '#E5DFD3',
      textPrimary: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#78716C',
      accent: '#F9C84E',
      accentText: '#1C1917',
      accentSecondary: '#3D8F70',
      accentSecondaryText: '#FFFFFF',
      badgeBg: '#F3EDE0',
      badgeText: '#1C1917',
      statusCorrect: '#3D8F70',
      statusWrong: '#E05338',
    },
    typography: {
      displayFont: "'Outfit', sans-serif",
      displayFontName: 'Outfit 900 + Instrument Serif',
      bodyFont: "'Outfit', sans-serif",
      bodyFontName: 'Outfit 500',
      monoFont: "'Space Mono', monospace",
      monoFontName: 'Space Mono',
      displayWeight: 'font-black',
      displayTracking: 'tracking-tight',
      metaTracking: 'tracking-[0.22em]',
    },
    geometry: {
      cardRadius: '28px',
      cardRadiusSm: '16px',
      cardRadiusInner: '18px',
      borderWidth: '2.5px',
      shadowCard: '4px 4px 0px #1C1917',
      shadowButton: '3px 3px 0px #1C1917',
      shadowSm: '2px 2px 0px #1C1917',
      buttonActiveTransform: 'translate(2px, 2px)',
      cardElevationDepth: 'Single tactile hard-drop stamp (4px offset, zero blur)',
    },
    cssVariables: {
      '--ds-canvas': '#FAF7F0',
      '--ds-surface': '#FFFDF9',
      '--ds-surface-subtle': '#F4EFE6',
      '--ds-border': '#1C1917',
      '--ds-text-primary': '#1C1917',
      '--ds-text-secondary': '#57534E',
      '--ds-accent': '#F9C84E',
      '--ds-accent-text': '#1C1917',
      '--ds-accent-sec': '#3D8F70',
      '--ds-shadow': '4px 4px 0px #1C1917',
      '--ds-shadow-sm': '2px 2px 0px #1C1917',
      '--ds-radius-card': '28px',
      '--ds-radius-btn': '16px',
    },
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Studio',
    subtitle: 'Neo-Tactile Dark Obsidian Edition',
    tagline: 'Deep basalt midnight lounge powered by tactile letterpress cards, Outfit 900 typography, and crisp ink stamps.',
    curatorQuote:
      'The best of both worlds: deep obsidian dark-mode palette (#090B0E) paired with tactile 2.5px crisp borders, Outfit 900 headlines, and tactile hard-drop stamps.',
    targetMood: 'Tactile, intimate, high-contrast, playful, late-night confession with tangible print physics',
    bestSuitedFor: 'Late night truth-or-dare, deep friendships, high-tactile dark mode enthusiasts',
    antiSlopRestraints: [
      'Bold 2.5px high-contrast structural borders with solid offset drop-shadows (4px 4px 0px #000000)',
      'Outfit 900 geometric display headlines with Instrument Serif italic personal callouts',
      'Tactile button physics: translate(2px, 2px) on active press with crisp mechanical snap',
      'Tactile washi tape and field note cards on deep basalt surfaces',
    ],
    colors: {
      canvas: '#090B0E',
      surface: '#13171F',
      surfaceElevated: '#1C222E',
      surfaceSubtle: '#0F131A',
      border: 'rgba(249, 115, 22, 0.28)',
      borderSecondary: 'rgba(249, 115, 22, 0.14)',
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      accent: '#F97316',
      accentText: '#FFFFFF',
      accentSecondary: '#F59E0B',
      accentSecondaryText: '#FFFFFF',
      badgeBg: 'rgba(249, 115, 22, 0.14)',
      badgeText: '#FB923C',
      statusCorrect: '#10B981',
      statusWrong: '#F43F5E',
    },
    typography: {
      displayFont: "'Outfit', sans-serif",
      displayFontName: 'Outfit 900 + Instrument Serif',
      bodyFont: "'Outfit', sans-serif",
      bodyFontName: 'Outfit 500',
      monoFont: "'Space Mono', monospace",
      monoFontName: 'Space Mono',
      displayWeight: 'font-black',
      displayTracking: 'tracking-tight',
      metaTracking: 'tracking-[0.22em]',
    },
    geometry: {
      cardRadius: '28px',
      cardRadiusSm: '16px',
      cardRadiusInner: '18px',
      borderWidth: '2.5px',
      shadowCard: '4px 4px 0px #000000',
      shadowButton: '3px 3px 0px #000000',
      shadowSm: '2px 2px 0px #000000',
      buttonActiveTransform: 'translate(2px, 2px)',
      cardElevationDepth: 'Tactile neo-brutalist hard stamp (4px offset, zero blur) on deep obsidian basalt',
    },
    cssVariables: {
      '--ds-canvas': '#090B0E',
      '--ds-surface': '#13171F',
      '--ds-surface-subtle': '#0F131A',
      '--ds-border': 'rgba(249, 115, 22, 0.28)',
      '--ds-border-sec': 'rgba(249, 115, 22, 0.14)',
      '--ds-text-primary': '#F1F5F9',
      '--ds-text-secondary': '#94A3B8',
      '--ds-accent': '#F97316',
      '--ds-accent-text': '#FFFFFF',
      '--ds-accent-sec': '#F59E0B',
      '--ds-shadow': '4px 4px 0px #000000',
      '--ds-shadow-sm': '2px 2px 0px #000000',
      '--ds-radius-card': '28px',
      '--ds-radius-btn': '16px',
    },
  },
  {
    id: 'nordic-archival',
    name: 'Nordic Archival',
    subtitle: 'Atelier Minimalist & Quiet Luxury',
    tagline: 'Quiet travertine neutrals, gallery typography, and soothing Scandinavian serenity.',
    curatorQuote:
      'Inspired by Copenhagen independent art catalogues and archival print journals. Spacious, contemplative, and deeply respectful of thought.',
    targetMood: 'Calm, thoughtful, elegant, timeless, intimate conversation',
    bestSuitedFor: 'Couples, lifelong friends, family questionnaires, thoughtful reflections',
    antiSlopRestraints: [
      'No heavy cartoon borders; strictly 1px delicate architectural hairlines',
      'Cormorant Garamond editorial serif headers with wide line-height (1.65)',
      'Muted juniper sage (#3B6755) and natural bone (#F6F4EF) palette',
      'Zero pill boxes; metadata separated by subtle typographic middle dots',
    ],
    colors: {
      canvas: '#F6F4EF',
      surface: '#FFFFFF',
      surfaceElevated: '#FCFAF6',
      surfaceSubtle: '#EEEAE1',
      border: '#E3DDD3',
      borderSecondary: '#EFEBE3',
      textPrimary: '#22201D',
      textSecondary: '#66615B',
      textMuted: '#948E85',
      accent: '#3B6755',
      accentText: '#FFFFFF',
      accentSecondary: '#B88E4B',
      accentSecondaryText: '#FFFFFF',
      badgeBg: '#EAE4D9',
      badgeText: '#22201D',
      statusCorrect: '#3B6755',
      statusWrong: '#C85A48',
    },
    typography: {
      displayFont: "'Cormorant Garamond', Georgia, serif",
      displayFontName: 'Cormorant Garamond 600 + Plus Jakarta Sans',
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      bodyFontName: 'Plus Jakarta Sans 450',
      monoFont: "'Space Mono', monospace",
      monoFontName: 'Space Mono',
      displayWeight: 'font-semibold',
      displayTracking: 'tracking-normal',
      metaTracking: 'tracking-[0.16em]',
    },
    geometry: {
      cardRadius: '18px',
      cardRadiusSm: '10px',
      cardRadiusInner: '12px',
      borderWidth: '1px',
      shadowCard: '0 4px 20px -2px rgba(34, 32, 29, 0.05), 0 0 0 1px #E3DDD3',
      shadowButton: '0 2px 8px rgba(59, 103, 85, 0.15)',
      shadowSm: '0 1px 3px rgba(34, 32, 29, 0.04)',
      buttonActiveTransform: 'translateY(1px)',
      cardElevationDepth: 'Whisper-thin 1px boundary with delicate ground shadow',
    },
    cssVariables: {
      '--ds-canvas': '#F6F4EF',
      '--ds-surface': '#FFFFFF',
      '--ds-surface-subtle': '#EEEAE1',
      '--ds-border': '#E3DDD3',
      '--ds-text-primary': '#22201D',
      '--ds-text-secondary': '#66615B',
      '--ds-accent': '#3B6755',
      '--ds-accent-text': '#FFFFFF',
      '--ds-accent-sec': '#B88E4B',
      '--ds-shadow': '0 4px 20px -2px rgba(34, 32, 29, 0.05)',
      '--ds-shadow-sm': '0 1px 3px rgba(34, 32, 29, 0.04)',
      '--ds-radius-card': '18px',
      '--ds-radius-btn': '10px',
    },
  },
  {
    id: 'tokyo-arcade',
    name: 'Tokyo Neo-Arcade',
    subtitle: '90s Social Trivia & Cyber Game-Show',
    tagline: 'High-voltage arcade energy, cyan/amber neon strikes, and tournament leaderboards.',
    curatorQuote:
      'Turns the friendship quiz into an electric retro-futuristic game show. Punchy, competitive, and engineered for social hype.',
    targetMood: 'Electrifying, competitive, energetic, party game, viral trivia',
    bestSuitedFor: 'Party trivia nights, university societies, gaming squads, group challenges',
    antiSlopRestraints: [
      'Intentional Y2K cyber-arcade palette with stark contrast (no generic purple clouds)',
      'Sharp beveled 2px border strokes with dual cyan/amber neon drop stamps',
      'Segmented digital progress bars and tabular bracketed score telemetry',
      'Syne 800 avant-garde display face paired with JetBrains Mono numbers',
    ],
    colors: {
      canvas: '#0B0F19',
      surface: '#111827',
      surfaceElevated: '#1F2937',
      surfaceSubtle: '#080C14',
      border: '#06B6D4',
      borderSecondary: '#1E293B',
      textPrimary: '#F9FAFB',
      textSecondary: '#9CA3AF',
      textMuted: '#6B7280',
      accent: '#FBBF24',
      accentText: '#0B0F19',
      accentSecondary: '#06B6D4',
      accentSecondaryText: '#0B0F19',
      badgeBg: '#1E293B',
      badgeText: '#FBBF24',
      statusCorrect: '#10B981',
      statusWrong: '#F43F5E',
    },
    typography: {
      displayFont: "'Syne', sans-serif",
      displayFontName: 'Syne 800 + JetBrains Mono',
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      bodyFontName: 'Plus Jakarta Sans 600',
      monoFont: "'JetBrains Mono', monospace",
      monoFontName: 'JetBrains Mono',
      displayWeight: 'font-extrabold',
      displayTracking: 'tracking-tight',
      metaTracking: 'tracking-[0.25em]',
    },
    geometry: {
      cardRadius: '14px',
      cardRadiusSm: '8px',
      cardRadiusInner: '10px',
      borderWidth: '2px',
      shadowCard: '4px 4px 0px #06B6D4',
      shadowButton: '3px 3px 0px #FBBF24',
      shadowSm: '2px 2px 0px #06B6D4',
      buttonActiveTransform: 'translate(2px, 2px)',
      cardElevationDepth: 'Electrified dual-offset 2px vector stamp',
    },
    cssVariables: {
      '--ds-canvas': '#0B0F19',
      '--ds-surface': '#111827',
      '--ds-surface-subtle': '#080C14',
      '--ds-border': '#06B6D4',
      '--ds-text-primary': '#F9FAFB',
      '--ds-text-secondary': '#9CA3AF',
      '--ds-accent': '#FBBF24',
      '--ds-accent-text': '#0B0F19',
      '--ds-accent-sec': '#06B6D4',
      '--ds-shadow': '4px 4px 0px #06B6D4',
      '--ds-shadow-sm': '2px 2px 0px #06B6D4',
      '--ds-radius-card': '14px',
      '--ds-radius-btn': '8px',
    },
  },
  {
    id: 'bauhaus-monolith',
    name: 'Bauhaus Monolith',
    subtitle: 'International Typographic & Swiss Grid',
    tagline: 'Zero gradients, stark monochrome contrast, and uncompromising architectural precision.',
    curatorQuote:
      'Absolute purity of form following function. Heavy 90-degree corners, architectural lines, and bold graphic presence.',
    targetMood: 'Authoritative, timeless, high-contrast, artistic, disciplined',
    bestSuitedFor: 'Design purists, architecture fans, stark editorial experiences',
    antiSlopRestraints: [
      'Pure stark black and white palette (#000000 / #FFFFFF / #F4F4F5)',
      'Sharp 0px corner radii (rounded-none) throughout all buttons, cards, and inputs',
      'Zero gradients, zero blur shadows—pure architectural division lines',
      'Strict tabular alignment with JetBrains Mono numbers',
    ],
    colors: {
      canvas: '#F5F5F7',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceSubtle: '#ECECED',
      border: '#000000',
      borderSecondary: '#D4D4D8',
      textPrimary: '#000000',
      textSecondary: '#3F3F46',
      textMuted: '#71717A',
      accent: '#000000',
      accentText: '#FFFFFF',
      accentSecondary: '#DC2626',
      accentSecondaryText: '#FFFFFF',
      badgeBg: '#E4E4E7',
      badgeText: '#000000',
      statusCorrect: '#16A34A',
      statusWrong: '#DC2626',
    },
    typography: {
      displayFont: "'Outfit', sans-serif",
      displayFontName: 'Outfit 900 (Heavy Grotesk)',
      bodyFont: "'Plus Jakarta Sans', sans-serif",
      bodyFontName: 'Plus Jakarta Sans 600',
      monoFont: "'JetBrains Mono', monospace",
      monoFontName: 'JetBrains Mono',
      displayWeight: 'font-black',
      displayTracking: 'tracking-tighter',
      metaTracking: 'tracking-[0.24em]',
    },
    geometry: {
      cardRadius: '0px',
      cardRadiusSm: '0px',
      cardRadiusInner: '0px',
      borderWidth: '2px',
      shadowCard: '5px 5px 0px #000000',
      shadowButton: '3px 3px 0px #000000',
      shadowSm: '2px 2px 0px #000000',
      buttonActiveTransform: 'translate(2px, 2px)',
      cardElevationDepth: 'Pure 90-degree stark monolith block stamp',
    },
    cssVariables: {
      '--ds-canvas': '#F5F5F7',
      '--ds-surface': '#FFFFFF',
      '--ds-surface-subtle': '#ECECED',
      '--ds-border': '#000000',
      '--ds-text-primary': '#000000',
      '--ds-text-secondary': '#3F3F46',
      '--ds-accent': '#000000',
      '--ds-accent-text': '#FFFFFF',
      '--ds-accent-sec': '#DC2626',
      '--ds-shadow': '5px 5px 0px #000000',
      '--ds-shadow-sm': '2px 2px 0px #000000',
      '--ds-radius-card': '0px',
      '--ds-radius-btn': '0px',
    },
  },
];

export const DEFAULT_DESIGN_SYSTEM_ID: DesignSystemId = 'midnight-obsidian';

export function getDesignSystem(id: string): DesignSystemMeta {
  const match = DESIGN_SYSTEMS.find((ds) => ds.id === id);
  return match || DESIGN_SYSTEMS[0];
}

export function applyDesignSystemToDocument(system: DesignSystemMeta) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // Set data attribute for theme targeting
  root.setAttribute('data-theme', system.id);

  // Apply CSS variables
  Object.entries(system.cssVariables).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });

  // Apply body background and text color directly
  body.style.backgroundColor = system.colors.canvas;
  body.style.color = system.colors.textPrimary;
  body.style.fontFamily = system.typography.bodyFont;
}
