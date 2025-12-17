// Template definitions for Finiclasse social media posts
// Based on Mercedes-Benz reference templates

export interface TextFieldConfig {
  id: string
  label: string
  placeholder: string
  defaultValue: string
  x: number
  y: number
  maxWidth: number
  fontSize: number
  fontFamily: string
  fontWeight: number
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight?: number
}

export interface FixedElement {
  type: 'logo' | 'badge' | 'shape'
  src?: string
  text?: string
  x: number
  y: number
  width: number
  height: number
  opacity?: number
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  fontFamily?: string
  borderRadius?: number
}

export interface Template {
  id: string
  name: string
  description: string
  category: 'novo-modelo' | 'entrega' | 'promocao' | 'servico'
  platform: 'instagram-story' | 'instagram-post' | 'instagram-reels' | 'facebook' | 'linkedin'
  width: number
  height: number
  photoArea: {
    x: number
    y: number
    width: number
    height: number
    overlayOpacity: number
    borderRadius?: number
  }
  textFields: TextFieldConfig[]
  fixedElements: FixedElement[]
}

// Brand colors
export const BRAND_COLORS = {
  midnight: '#0B1F2A',
  petronas: '#00A19B',
  arrow: '#A4AAAE',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#1a1a1a',
  lightGray: '#888888',
}

// Mercedes fonts
export const FONTS = {
  title: 'MB Corpo A Title, Arial, sans-serif',
  subtitle: 'MB Corpo S Title, Arial, sans-serif',
  body: 'MB Corpo S Title, Arial, sans-serif',
}

// Platform dimensions
export const PLATFORM_SIZES = {
  'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story' },
  'instagram-post': { width: 1080, height: 1080, label: 'Instagram Post' },
  'instagram-reels': { width: 1080, height: 1920, label: 'Instagram Reels' },
  'facebook': { width: 1200, height: 630, label: 'Facebook Post' },
  'linkedin': { width: 1200, height: 627, label: 'LinkedIn Post' },
}

// Templates based on reference design
export const TEMPLATES: Template[] = [
  // Instagram Post - 1080x1080 (Square)
  {
    id: 'instagram-post-novo-modelo',
    name: 'Instagram Post',
    description: 'Post quadrado para feed do Instagram (1080x1080)',
    category: 'novo-modelo',
    platform: 'instagram-post',
    width: 1080,
    height: 1080,
    photoArea: {
      x: 40,
      y: 40,
      width: 1000,
      height: 1000,
      overlayOpacity: 0.35,
      borderRadius: 24,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 80,
        y: 620,
        maxWidth: 900,
        fontSize: 120,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'left',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 80,
        y: 870,
        maxWidth: 900,
        fontSize: 30,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'left',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      // Mercedes star logo - top left
      {
        type: 'logo',
        src: '/mercedes-logo.png',
        x: 70,
        y: 70,
        width: 60,
        height: 60,
        opacity: 1,
      },
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 920,
        y: 70,
        width: 90,
        height: 60,
        opacity: 1,
      },
    ],
  },

  // Instagram Story Horizontal Style - 1920x1080 (Landscape in story)
  {
    id: 'instagram-story-landscape',
    name: 'Story Horizontal',
    description: 'Story com foto horizontal (1920x1080)',
    category: 'novo-modelo',
    platform: 'instagram-story',
    width: 1920,
    height: 1080,
    photoArea: {
      x: 40,
      y: 40,
      width: 1840,
      height: 1000,
      overlayOpacity: 0.3,
      borderRadius: 24,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 80,
        y: 620,
        maxWidth: 1200,
        fontSize: 120,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'left',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 80,
        y: 870,
        maxWidth: 1200,
        fontSize: 30,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'left',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      {
        type: 'logo',
        src: '/mercedes-logo.png',
        x: 70,
        y: 70,
        width: 60,
        height: 60,
        opacity: 1,
      },
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 1770,
        y: 70,
        width: 90,
        height: 60,
        opacity: 1,
      },
    ],
  },

  // Instagram Story Vertical - 1080x1920 (Portrait)
  {
    id: 'instagram-story-vertical',
    name: 'Story Vertical',
    description: 'Story vertical para Instagram (1080x1920)',
    category: 'novo-modelo',
    platform: 'instagram-story',
    width: 1080,
    height: 1920,
    photoArea: {
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
      overlayOpacity: 0.25,
      borderRadius: 0,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 1000,
        y: 1480,
        maxWidth: 900,
        fontSize: 120,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'right',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 1000,
        y: 1730,
        maxWidth: 900,
        fontSize: 30,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'right',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 920,
        y: 50,
        width: 90,
        height: 60,
        opacity: 1,
      },
    ],
  },

  // Facebook Post - 1200x630 (Landscape)
  {
    id: 'facebook-post-novo-modelo',
    name: 'Facebook Post',
    description: 'Post para Facebook (1200x630)',
    category: 'novo-modelo',
    platform: 'facebook',
    width: 1200,
    height: 630,
    photoArea: {
      x: 30,
      y: 30,
      width: 1140,
      height: 570,
      overlayOpacity: 0.35,
      borderRadius: 16,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 70,
        y: 280,
        maxWidth: 800,
        fontSize: 80,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'left',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 70,
        y: 450,
        maxWidth: 800,
        fontSize: 26,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'left',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      {
        type: 'logo',
        src: '/mercedes-logo.png',
        x: 60,
        y: 55,
        width: 50,
        height: 50,
        opacity: 1,
      },
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 1065,
        y: 55,
        width: 75,
        height: 50,
        opacity: 1,
      },
    ],
  },

  // LinkedIn Post - 1200x627
  {
    id: 'linkedin-post-novo-modelo',
    name: 'LinkedIn Post',
    description: 'Post profissional para LinkedIn (1200x627)',
    category: 'novo-modelo',
    platform: 'linkedin',
    width: 1200,
    height: 627,
    photoArea: {
      x: 30,
      y: 30,
      width: 1140,
      height: 567,
      overlayOpacity: 0.35,
      borderRadius: 16,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 70,
        y: 280,
        maxWidth: 800,
        fontSize: 80,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'left',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 70,
        y: 450,
        maxWidth: 800,
        fontSize: 26,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'left',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      {
        type: 'logo',
        src: '/mercedes-logo.png',
        x: 60,
        y: 55,
        width: 50,
        height: 50,
        opacity: 1,
      },
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 1065,
        y: 55,
        width: 75,
        height: 50,
        opacity: 1,
      },
    ],
  },

  // Instagram Reels Cover - 1080x1920
  {
    id: 'instagram-reels-cover',
    name: 'Reels Cover',
    description: 'Capa para Reels do Instagram (1080x1920)',
    category: 'novo-modelo',
    platform: 'instagram-reels',
    width: 1080,
    height: 1920,
    photoArea: {
      x: 0,
      y: 0,
      width: 1080,
      height: 1920,
      overlayOpacity: 0.3,
      borderRadius: 0,
    },
    textFields: [
      {
        id: 'headline',
        label: 'Titulo Principal',
        placeholder: 'The future is around the corner.',
        defaultValue: 'The future is\naround the corner.',
        x: 540,
        y: 1480,
        maxWidth: 960,
        fontSize: 120,
        fontFamily: FONTS.title,
        fontWeight: 400,
        color: BRAND_COLORS.white,
        align: 'center',
        lineHeight: 0.92,
      },
      {
        id: 'subtitle',
        label: 'Subtitulo',
        placeholder: 'CLArem ipsum',
        defaultValue: 'CLArem ipsum',
        x: 540,
        y: 1730,
        maxWidth: 960,
        fontSize: 30,
        fontFamily: FONTS.subtitle,
        fontWeight: 300,
        color: BRAND_COLORS.lightGray,
        align: 'center',
        lineHeight: 1.33,
      },
    ],
    fixedElements: [
      {
        type: 'logo',
        src: '/mercedes-logo.png',
        x: 60,
        y: 60,
        width: 60,
        height: 60,
        opacity: 1,
      },
      // Finiclasse logo - top right (white version)
      {
        type: 'logo',
        src: '/finiclasse-logo-white.png',
        x: 920,
        y: 55,
        width: 90,
        height: 60,
        opacity: 1,
      },
    ],
  },
]

// Helper to get templates by platform
export const getTemplatesByPlatform = (platform: Template['platform']) => {
  return TEMPLATES.filter(t => t.platform === platform)
}

// Helper to get templates by category
export const getTemplatesByCategory = (category: Template['category']) => {
  return TEMPLATES.filter(t => t.category === category)
}

// Get template by ID
export const getTemplateById = (id: string) => {
  return TEMPLATES.find(t => t.id === id)
}

// Get all unique platforms
export const getAllPlatforms = () => {
  return [...new Set(TEMPLATES.map(t => t.platform))]
}
