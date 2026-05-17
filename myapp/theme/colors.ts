// 🌿 Forest Night Theme — moonlit deep greens, teals, midnight blues
export const darkColors = {
  background: '#0A1409',        // deep forest floor at night
  surface: '#111E0F',           // dark mossy bark
  surfaceAlt: '#0D1B0B',        // darker understory
  surfaceMuted: '#1C2E1A',      // shadow of leaves
  border: 'rgba(100,180,80,0.10)',
  borderLight: 'rgba(100,180,80,0.05)',
  text: '#D8EDCF',              // soft moonlit leaf
  textMuted: '#7FAF72',         // muted forest green
  textLight: '#4A7A40',         // deep vine
  accent: '#5DBF6E',            // bioluminescent glow green
  accentDeep: '#3A8A4A',        // deeper glow
  accentSoft: '#1C3D1E',        // ambient night green
  accentBlue: '#3B9BC8',        // moonlit water

  calm: '#1E4030',              // night pond
  calmLight: '#0D2018',         // deep canopy
  calmDark: '#091410',          // darkest understory

  uplift: '#8A6B2E',            // firefly amber
  upliftLight: '#2A1E0A',       // amber shadow
  reflect: '#1E3040',           // moonlit pool
  reflectLight: '#0D1820',      // deep water
  learn: '#2E2040',             // twilight purple
  learnLight: '#16101E',        // deep twilight
  crisis: '#7A2E2E',            // urgent red
  crisisLight: '#2E0F0F',       // danger shadow
  success: '#4DBF7A',           // glowing fern
  warning: '#D4A830',           // firefly glow
  danger: '#E05050',            // alert red
};

// 🌄 Forest Morning Theme — golden sunrise, dewy greens, warm amber
export const lightColors = {
  background: '#F0F7E8',        // morning mist on leaves
  surface: '#FAFFF5',           // sunlit leaf
  surfaceAlt: '#E8F2DC',        // dew-kissed grass
  surfaceMuted: '#D4E8C4',      // mossy shade
  border: '#C2D9A8',            // leaf vein
  borderLight: '#DAF0C4',       // soft morning border
  text: '#1A2E10',              // dark bark
  textMuted: '#4A6E35',         // vine shadow
  textLight: '#7AAF5A',         // young leaf
  accent: '#5A9C3A',            // morning forest green
  accentDeep: '#3A6E20',        // deep canopy green
  accentSoft: '#B8D99A',        // soft young leaf
  accentBlue: '#2E8BAD',        // forest stream

  calm: '#6DAF80',              // morning meadow
  calmLight: '#C8E8D0',         // dewy morning
  calmDark: '#3D8050',          // deep morning green

  uplift: '#C4932A',            // golden sunray
  upliftLight: '#F0DFA8',       // warm morning light
  reflect: '#5A8CAD',           // forest stream blue
  reflectLight: '#C8DFF0',      // still water
  learn: '#8A6AB8',             // morning violet shade
  learnLight: '#E0D0F8',        // lavender mist
  crisis: '#B84040',            // urgent
  crisisLight: '#F0C4C4',       // soft danger
  success: '#4A9A60',           // lush green
  warning: '#B89030',           // morning amber
  danger: '#B84040',            // alert
};

export type ThemeColors = typeof lightColors;

