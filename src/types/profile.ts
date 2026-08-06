export type LayoutType =
  | "default"
  | "centered"
  | "wide"
  | "compact"
  | "minimal"
  | "floating-card"
  | "sidebar-layout"
  | "fullscreen-layout";

export interface ProfileCardConfig {
  // Card layout & dimensions
  layout: LayoutType;
  width: number; // in px or %
  height: string; // e.g. "auto"
  scale: number;
  rotationX: number;
  rotationY: number;
  padding: number;
  margin: number;
  borderRadius: number;
  opacity: number;
  glassBlur: number;
  backgroundOpacity: number;
  
  // Shadows & glow
  dropShadow: boolean;
  glowStrength: number; // 0 to 20px
  glowColor: string; // hex or rgb
  
  // Border options
  outlineThickness: number;
  outlineColor: string;
  borderStyle: "solid" | "dashed" | "dotted" | "double" | "none";
  borderEffect:
    | "none"
    | "rgb-rainbow"
    | "animated-gradient"
    | "pulse"
    | "glow"
    | "breathing";
  
  // Visual effects
  backgroundNoise: boolean;
  backgroundGrain: boolean;
  floatingEffect: boolean;
}

export type BackgroundType =
  | "solid"
  | "linear-gradient"
  | "radial-gradient"
  | "animated-gradient"
  | "gif"
  | "video"
  | "slideshow"
  | "dynamic-wallpaper";

export interface BackgroundConfig {
  type: BackgroundType;
  color1: string;
  color2: string;
  color3: string;
  imageUrl: string;
  videoUrl: string;
  brightness: number;
  saturation: number;
  contrast: number;
  blur: number;
  opacity: number;
  overlayColor: string;
  overlayOpacity: number;
}

export type ParticleType =
  | "none"
  | "stars"
  | "starfield"
  | "galaxy"
  | "snow"
  | "blizzard"
  | "rain"
  | "sakura"
  | "matrix"
  | "fireflies"
  | "hearts"
  | "bubbles"
  | "sparkles"
  | "hexagons"
  | "pixel";

export interface ParticleConfig {
  type: ParticleType;
  density: number;
  speed: number;
  opacity: number;
  color: string;
  size: number;
  spawnRate: number;
  gravity: number;
  wind: number;
  mouseInteraction: boolean;
  clickInteraction: boolean;
}

export interface TypographyConfig {
  fontFamily: string;
  fontWeight: string;
  usernameColor: string;
  bioColor: string;
  subtitleColor: string;
  descriptionOpacity: number;
  textGlow: boolean;
  textShadow: boolean;
  textEffect: "none" | "gradient" | "rainbow";
  textGradientColor1: string;
  textGradientColor2: string;
}

export interface CursorConfig {
  type: "default" | "custom" | "animated";
  customUrl: string;
  size: number;
  glow: boolean;
  glowColor: string;
  trail: "none" | "glow" | "sparkles" | "hearts" | "stars" | "fire" | "rainbow" | "bubbles" | "pixel";
  dampening: number; // 1 to 10
}

export interface SplashConfig {
  enabled: boolean;
  text: string;
  subtitle: string;
  buttonText: string;
  backgroundColor: string;
  glassBlur: number;
  fadeSpeed: number;
  enterSoundUrl: string;
  pulseEffect: boolean;
}

export interface SongTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  coverUrl: string;
  lyrics: string;
}

export interface MediaPlayerConfig {
  enabled: boolean;
  autoplay: boolean;
  loop: boolean;
  volume: number;
  backgroundColor: string;
  backgroundOpacity: number;
  glassBlur: number;
  progressColor: string;
  textColor: string;
  borderRadius: number;
  glowStrength: number;
  position: "top" | "bottom" | "floating-left" | "floating-right" | "inside-card";
  trackList: SongTrack[];
  currentTrackIndex: number;
}

export interface DiscordConfig {
  enabled: boolean;
  userId: string;
  mockStatus: {
    username: string;
    displayName: string;
    avatarUrl: string;
    bannerUrl: string;
    accentColor: string;
    status: "online" | "idle" | "dnd" | "offline";
    customStatus: string;
    activityName: string;
    activityDetails: string;
    spotifySong: string;
    spotifyArtist: string;
    spotifyAlbumUrl: string;
    badges: string[]; // e.g. nitro, staff, booster
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  glow: boolean;
  glowColor: string;
  animation: "none" | "bounce" | "pulse" | "spin" | "shake";
  iconColor: string;
  visible: boolean;
}

export interface BadgeConfig {
  id: string;
  name: string;
  icon: string;
  tooltip: string;
  glow: boolean;
  glowColor: string;
  animation: "none" | "rotate" | "pulse" | "float";
  color: string;
  visible: boolean;
}

export interface WidgetConfig {
  id: string;
  type: "views" | "likes" | "followers" | "uptime" | "online" | "custom";
  title: string;
  value: number | string;
  visible: boolean;
  x: number;
  y: number;
}

export interface FullProfileConfig {
  username: string;
  bio: string;
  card: ProfileCardConfig;
  background: BackgroundConfig;
  particles: ParticleConfig;
  typography: TypographyConfig;
  cursor: CursorConfig;
  splash: SplashConfig;
  mediaPlayer: MediaPlayerConfig;
  discord: DiscordConfig;
  links: SocialLink[];
  badges: BadgeConfig[];
  widgets: WidgetConfig[];
}
