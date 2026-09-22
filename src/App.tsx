import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Wand2,
  Scissors,
  Layers,
  Type,
  Music,
  Download,
  Maximize2,
  Minimize2,
  Video,
  Sliders,
  Camera,
  Mic,
  Settings,
  Check,
  Plus,
  Trash2,
  Clock,
  Film,
  Zap,
  Monitor,
  Smartphone,
  Square,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Split,
  Eye,
  Info,
  X,
  Radio,
  FileVideo,
  AudioWaveform,
  MoveHorizontal,
  MoveVertical,
  Compass,
  CircleDot,
  Image as ImageIcon,
  Edit3,
  ExternalLink
} from 'lucide-react';

// --- TYPES ---
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type CameraMotion = 'pan' | 'zoom' | 'tilt' | 'drone' | 'orbit' | 'static';
export type Quality = '720p' | '1080p' | '4k';
export type VoiceGender = 'male' | 'female' | 'cyber';
export type Emotion = 'cinematic' | 'excited' | 'whisper' | 'dramatic' | 'neutral' | 'cheerful';
export type SceneTheme = 'forest' | 'cyberpunk' | 'mountains' | 'ocean' | 'space' | 'synthwave' | 'anime' | 'cinematic';

export interface VideoClip {
  id: string;
  name: string;
  prompt: string;
  sceneDescription: string;
  theme: SceneTheme;
  startTime: number;
  duration: number;
  motion: CameraMotion;
  style: string;
  color: string;
  accentColor: string;
  secondaryColor: string;
}

export interface SubtitleItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface BgmTrack {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  energy: string;
}

// Helper: detect scene theme from user's prompt text
export function detectThemeFromPrompt(text: string): SceneTheme {
  const lower = text.toLowerCase();
  if (lower.includes('cyberpunk') || lower.includes('tokyo') || lower.includes('neon') || lower.includes('blade runner') || lower.includes('megacity') || lower.includes('flying vehicle') || lower.includes('spinner') || lower.includes('cyber')) {
    return 'cyberpunk';
  }
  if (lower.includes('mountain') || lower.includes('alps') || lower.includes('peak') || lower.includes('fjord') || lower.includes('sunset') || lower.includes('golden hour') || lower.includes('summit') || lower.includes('valley') || lower.includes('norwegian')) {
    return 'mountains';
  }
  if (lower.includes('ocean') || lower.includes('underwater') || lower.includes('jellyfish') || lower.includes('coral') || lower.includes('sea') || lower.includes('deep sea') || lower.includes('aquatic') || lower.includes('submerged') || lower.includes('abyss')) {
    return 'ocean';
  }
  if (lower.includes('space') || lower.includes('galaxy') || lower.includes('nebula') || lower.includes('planet') || lower.includes('cosmos') || lower.includes('stars') || lower.includes('alien') || lower.includes('astronaut') || lower.includes('orbital') || lower.includes('celestial')) {
    return 'space';
  }
  if (lower.includes('synthwave') || lower.includes('retrowave') || lower.includes('80s') || lower.includes('highway') || lower.includes('outrun') || lower.includes('grid tunnel') || lower.includes('sports car') || lower.includes('speed trails')) {
    return 'synthwave';
  }
  if (lower.includes('anime') || lower.includes('sakura') || lower.includes('cherry blossom') || lower.includes('makoto') || lower.includes('manga') || lower.includes('ghibli') || lower.includes('heroine')) {
    return 'anime';
  }
  if (lower.includes('firefly') || lower.includes('gugnu') || lower.includes('forest') || lower.includes('rain forest') || lower.includes('jungle') || lower.includes('leaf') || lower.includes('bioluminescent') || lower.includes('trees') || lower.includes('nature')) {
    return 'forest';
  }
  return 'cinematic';
}

// Helper: generate 2-3 distinct video scene clips from a prompt
export function generateClipsFromPrompt(
  promptText: string,
  totalDurationSec: number,
  startOffset: number,
  baseMotion: CameraMotion,
  selectedStyle: string
): { clips: VideoClip[]; subtitles: SubtitleItem[] } {
  const theme = detectThemeFromPrompt(promptText);
  const numScenes = totalDurationSec >= 15 ? 3 : 2;

  // Calculate durations for each scene
  const durations: number[] = [];
  if (numScenes === 2) {
    const d1 = Math.round((totalDurationSec / 2) * 10) / 10;
    durations.push(d1, Math.max(1, Math.round((totalDurationSec - d1) * 10) / 10));
  } else {
    const d1 = Math.round((totalDurationSec / 3) * 10) / 10;
    const d2 = Math.round((totalDurationSec / 3) * 10) / 10;
    durations.push(d1, d2, Math.max(1, Math.round((totalDurationSec - d1 - d2) * 10) / 10));
  }

  // Scene metadata presets per theme
  const themeTemplates: Record<SceneTheme, Array<{ name: string; desc: string; motion: CameraMotion; color: string; accent: string; sec: string }>> = {
    cyberpunk: [
      {
        name: 'Neo-Tokyo Skyline • Establishing Aerial',
        desc: 'Holographic spires piercing neon smog and rain in futuristic Neo-Tokyo',
        motion: 'drone',
        color: 'from-[#8A2BE2] to-cyan-500',
        accent: '#00FFFF',
        sec: '#8A2BE2'
      },
      {
        name: 'Rain-Slicked Canyon • Flying Spinners',
        desc: 'Autonomous hover-crafts streaking past illuminated cyber billboards with light trails',
        motion: 'pan',
        color: 'from-fuchsia-600 to-indigo-900',
        accent: '#FF007F',
        sec: '#4F46E5'
      },
      {
        name: 'Holographic Megatower • Wet Reflections',
        desc: 'Ray-traced neon glints and vertical cyber rain shimmering off glass megastructures',
        motion: 'zoom',
        color: 'from-cyan-500 to-purple-800',
        accent: '#00FFFF',
        sec: '#A855F7'
      }
    ],
    mountains: [
      {
        name: 'Alpine Ridge • Soaring FPV Drone',
        desc: 'FPV drone soaring across jagged misty peaks catching dawn light in 8k resolution',
        motion: 'drone',
        color: 'from-amber-600 to-rose-900',
        accent: '#F59E0B',
        sec: '#BE185D'
      },
      {
        name: 'Misty Fjord Valley • Sweeping Glide',
        desc: 'Emerald valleys veiled in rolling mountain mist and glacial streams',
        motion: 'pan',
        color: 'from-orange-500 to-violet-900',
        accent: '#FB923C',
        sec: '#7C3AED'
      },
      {
        name: 'Golden Summit Crest • Volumetric Sun Rays',
        desc: 'Volumetric golden hour sunbeams breaking through alpine clouds over the horizon',
        motion: 'tilt',
        color: 'from-amber-500 to-emerald-900',
        accent: '#FBBF24',
        sec: '#059669'
      }
    ],
    ocean: [
      {
        name: 'Abyssal Turquoise • Sunlight Caustic Rays',
        desc: 'Shimmering sunlight caustic rays piercing deep turquoise waters above coral reefs',
        motion: 'tilt',
        color: 'from-cyan-600 to-blue-950',
        accent: '#06B6D4',
        sec: '#1E3A8A'
      },
      {
        name: 'Bioluminescent Jellyfish Swarm',
        desc: 'Pulsing translucent jellyfish floating through submerged ancient pillars',
        motion: 'zoom',
        color: 'from-teal-500 to-indigo-900',
        accent: '#14B8A6',
        sec: '#312E81'
      },
      {
        name: 'Sunken Alien Ruins • Plankton Drift',
        desc: 'Glowing plankton clouds illuminating forgotten sunken temple arches and rising bubbles',
        motion: 'drone',
        color: 'from-sky-500 to-cyan-900',
        accent: '#38BDF8',
        sec: '#164E63'
      }
    ],
    space: [
      {
        name: 'Cosmic Deep Void • Violet Nebula',
        desc: 'Interstellar dust clouds and star clusters shimmering in zero-gravity space',
        motion: 'pan',
        color: 'from-purple-900 to-indigo-950',
        accent: '#C084FC',
        sec: '#4338CA'
      },
      {
        name: 'Ringed Exoplanet • Orbital Glide',
        desc: 'Colossal ringed celestial planet with glowing cyan atmospheric rim and meteors',
        motion: 'orbit',
        color: 'from-violet-700 to-cyan-900',
        accent: '#A78BFA',
        sec: '#0891B2'
      },
      {
        name: 'Interstellar Probe • Deep Space Horizon',
        desc: 'Spacecraft cutting through crystalline cosmic debris with ion thruster glow',
        motion: 'drone',
        color: 'from-indigo-800 to-slate-950',
        accent: '#818CF8',
        sec: '#0F172A'
      }
    ],
    synthwave: [
      {
        name: 'Neon Wireframe Grid • Retro Horizon',
        desc: 'Perspective laser grid expanding toward giant glowing striped retro sun',
        motion: 'drone',
        color: 'from-pink-600 to-purple-900',
        accent: '#F43F5E',
        sec: '#9333EA'
      },
      {
        name: 'Cyber Sports Car • 200MPH Speed Trails',
        desc: 'High-speed acceleration with brilliant neon light streaks and electric motion blur',
        motion: 'zoom',
        color: 'from-violet-600 to-cyan-600',
        accent: '#8B5CF6',
        sec: '#06B6D4'
      },
      {
        name: 'Wireframe Mountains • Outrun Sunset',
        desc: 'Retro synthwave horizon under electric violet and magenta twilight sky',
        motion: 'pan',
        color: 'from-fuchsia-500 to-rose-900',
        accent: '#D946EF',
        sec: '#881337'
      }
    ],
    anime: [
      {
        name: 'Dusk Megacity • Pastel Twilight Sky',
        desc: 'Makoto-style painterly clouds and sunset gradient over megacity rooftops',
        motion: 'pan',
        color: 'from-rose-500 to-indigo-800',
        accent: '#FB7185',
        sec: '#4338CA'
      },
      {
        name: 'Sakura Petal Drift • Atmospheric Wind',
        desc: 'Cherry blossom sakura petals swirling gracefully through atmospheric evening breeze',
        motion: 'drone',
        color: 'from-sky-500 to-violet-800',
        accent: '#38BDF8',
        sec: '#7C3AED'
      },
      {
        name: 'Skyscraper Ledge • Golden Hour Reflections',
        desc: 'Anime heroine watching twilight reflections illuminate the anime metropolis',
        motion: 'zoom',
        color: 'from-purple-500 to-pink-700',
        accent: '#A855F7',
        sec: '#BE185D'
      }
    ],
    forest: [
      {
        name: 'Midnight Rainforest • Gugnu Awakening',
        desc: 'Ancient moss-covered boughs awakening in dark misty rainforest rain with bioluminescence',
        motion: 'drone',
        color: 'from-[#8A2BE2] to-emerald-900',
        accent: '#A3E635',
        sec: '#8A2BE2'
      },
      {
        name: 'Bioluminescent Firefly Swarm',
        desc: 'Dozens of glowing fireflies (Gugnus) floating through emerald mist and raindrops',
        motion: 'pan',
        color: 'from-cyan-600 to-emerald-700',
        accent: '#00FFFF',
        sec: '#10B981'
      },
      {
        name: 'Emerald Leaf Perch • Pulsing Lantern Glow',
        desc: 'Macro close-up of hero Gugnu abdomen pulsing with lime and cyan lantern light',
        motion: 'zoom',
        color: 'from-teal-700 to-green-950',
        accent: '#2DD4BF',
        sec: '#14532D'
      }
    ],
    cinematic: [
      {
        name: 'Master Establishing • Volumetric Atmosphere',
        desc: 'High-contrast cinematic framing with ray-traced atmospheric haze and dual rim light',
        motion: 'drone',
        color: 'from-slate-800 to-violet-950',
        accent: '#00FFFF',
        sec: '#8A2BE2'
      },
      {
        name: 'Dynamic Tracking • Anamorphic Streak',
        desc: 'Smooth 35mm camera motion capturing dual-tone cyan and violet rim light and flares',
        motion: 'pan',
        color: 'from-indigo-900 to-cyan-950',
        accent: '#38BDF8',
        sec: '#6366F1'
      },
      {
        name: 'High-Contrast Climax • 8K Arri Alexa',
        desc: 'Hyperrealistic lighting and depth-of-field bokeh resolving in 60FPS Full HD',
        motion: 'zoom',
        color: 'from-violet-900 to-black',
        accent: '#C084FC',
        sec: '#1E1B4B'
      }
    ]
  };

  const templates = themeTemplates[theme];
  const newClips: VideoClip[] = [];
  const newSubtitles: SubtitleItem[] = [];

  let currentStart = startOffset;
  const timestamp = Date.now();

  for (let i = 0; i < numScenes; i++) {
    const dur = durations[i];
    const tpl = templates[i % templates.length];
    const clipId = `clip-${timestamp}-${i + 1}`;

    const clipMotion = i === 0 && baseMotion !== 'static' ? baseMotion : tpl.motion;

    newClips.push({
      id: clipId,
      name: tpl.name,
      prompt: promptText,
      sceneDescription: tpl.desc,
      theme,
      startTime: Math.round(currentStart * 10) / 10,
      duration: dur,
      motion: clipMotion,
      style: selectedStyle,
      color: tpl.color,
      accentColor: tpl.accent,
      secondaryColor: tpl.sec
    });

    newSubtitles.push({
      id: `sub-${clipId}`,
      startTime: Math.round((currentStart + 0.4) * 10) / 10,
      endTime: Math.round((currentStart + dur - 0.3) * 10) / 10,
      text: tpl.desc
    });

    currentStart += dur;
  }

  return { clips: newClips, subtitles: newSubtitles };
}

// =========================================================================
// GUGNU FIREFLY LOGO CONFIGURATION & PLACEHOLDER
// =========================================================================
// Replace this placeholder link with your own hosted Gugnu image link!
export const DEFAULT_GUGNU_LOGO = "https://i.ibb.co/gugnu-logo.jpg";

// High-fidelity fallback SVG if the placeholder image is loading or unreachable
const FALLBACK_GUGNU_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%230b2e2e"/>
      <stop offset="65%" stop-color="%23081a20"/>
      <stop offset="100%" stop-color="%2303090e"/>
    </radialGradient>
    <radialGradient id="bioglow" cx="42%" cy="65%" r="45%">
      <stop offset="0%" stop-color="%23a3e635" stop-opacity="1"/>
      <stop offset="30%" stop-color="%2322d3ee" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="%2300ffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="%23000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="leafgrad" cx="40%" cy="50%" r="60%">
      <stop offset="0%" stop-color="%23166534"/>
      <stop offset="100%" stop-color="%23052e16"/>
    </radialGradient>
  </defs>
  <rect width="240" height="240" fill="url(%23bg)"/>
  <circle cx="50" cy="50" r="16" fill="%2322d3ee" opacity="0.15"/>
  <circle cx="190" cy="70" r="22" fill="%23a3e635" opacity="0.12"/>
  <circle cx="30" cy="180" r="14" fill="%2300ffff" opacity="0.12"/>
  <path d="M 20 210 Q 110 135 220 150 Q 130 200 20 210 Z" fill="url(%23leafgrad)" opacity="0.95"/>
  <path d="M 35 205 Q 115 145 205 152" stroke="%234ade80" stroke-width="1.8" fill="none" opacity="0.7"/>
  <circle cx="145" cy="132" r="38" fill="url(%23bioglow)"/>
  <ellipse cx="147" cy="130" rx="18" ry="13" fill="%23bef264"/>
  <ellipse cx="118" cy="115" rx="15" ry="11" fill="%2378350f" transform="rotate(-20 118 115)"/>
  <circle cx="102" cy="105" r="9" fill="%23451a03"/>
  <circle cx="99" cy="103" r="3.2" fill="%23f59e0b"/>
  <path d="M 98 102 Q 82 86 72 80" stroke="%23d97706" stroke-width="1.8" fill="none"/>
  <path d="M 101 100 Q 92 80 90 68" stroke="%23d97706" stroke-width="1.8" fill="none"/>
  <path d="M 115 122 L 105 145 L 94 149" stroke="%2378350f" stroke-width="2.2" fill="none"/>
  <path d="M 124 123 L 128 147 L 140 151" stroke="%2378350f" stroke-width="2.2" fill="none"/>
  <ellipse cx="142" cy="98" rx="34" ry="13" fill="%23fef08a" opacity="0.65" transform="rotate(-35 142 98)"/>
  <ellipse cx="150" cy="107" rx="30" ry="10" fill="%23fed7aa" opacity="0.8" transform="rotate(-18 150 107)"/>
  <circle cx="65" cy="45" r="3.5" fill="%2300ffff" opacity="0.85"/>
  <circle cx="205" cy="60" r="4.5" fill="%23a3e635" opacity="0.8"/>
  <circle cx="215" cy="195" r="3" fill="%2338bdf8" opacity="0.75"/>
</svg>`;

// --- PRESET PROMPTS ---
const SAMPLE_PROMPTS = [
  "A glowing firefly (Gugnu) illuminating a dark mystical forest in the rain, bioluminescent spores, 8k cinematic",
  "Cyberpunk Neo-Tokyo in rain with flying vehicles, neon reflections on wet asphalt, 8k cinematic masterpiece",
  "FPV drone soaring through Norwegian misty mountain peaks at golden hour, volumetric sun rays, ultra-detailed",
  "Bioluminescent jellyfish swarm floating through submerged alien temple ruins, glowing cyan and violet hues",
  "Anime sci-fi heroine standing on skyscraper ledge overlooking illuminated megacity, cherry blossom wind",
  "Futuristic sports car accelerating through neon synthwave tunnel at 200 mph with electric light trails"
];

const BGM_TRACKS: BgmTrack[] = [
  { id: 'synthwave', name: 'Cyberpunk Synthwave', genre: 'Electronic', bpm: 124, energy: 'High' },
  { id: 'cinematic', name: 'Cinematic Horizon', genre: 'Orchestral', bpm: 82, energy: 'Epic' },
  { id: 'lofi', name: 'Midnight Lo-Fi Chill', genre: 'Chillhop', bpm: 88, energy: 'Relaxed' },
  { id: 'trailer', name: 'Dark Hybrid Action', genre: 'Trailer', bpm: 130, energy: 'Intense' },
  { id: 'ambient', name: 'Ethereal Forest Drift', genre: 'Ambient', bpm: 64, energy: 'Peaceful' }
];

const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic Movie (35mm)', tag: 'Arri Alexa' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', tag: 'Raytraced' },
  { id: 'photoreal', name: 'Photorealistic 8K', tag: 'Hyper-Real' },
  { id: 'anime', name: 'Anime Masterpiece', tag: 'Makoto Style' },
  { id: '3drender', name: '3D Octane Render', tag: 'CGI VFX' },
  { id: 'vintage', name: 'Vintage 70s Film', tag: 'Kodak Film' }
];

export default function App() {
  // --- GUGNU LOGO & BRANDING STATE ---
  const [gugnuLogoUrl, setGugnuLogoUrl] = useState<string>(DEFAULT_GUGNU_LOGO);
  const [customLogoInput, setCustomLogoInput] = useState<string>(DEFAULT_GUGNU_LOGO);
  const [showLogoModal, setShowLogoModal] = useState<boolean>(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<'video' | 'spotlight'>('video');

  // --- STUDIO CONTROLS STATE ---
  const [prompt, setPrompt] = useState<string>(
    "A magical glowing firefly (Gugnu) perched on a wet emerald leaf in a dark misty rain forest, bioluminescent cyan and gold glow, soft cinematic bokeh, 8k resolution, photorealistic"
  );
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedBadge, setEnhancedBadge] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(15);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>('drone');
  const [motionIntensity, setMotionIntensity] = useState<number>(65);
  const [selectedStyle, setSelectedStyle] = useState<string>('cinematic');

  // Voice Changer & Audio Options
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [pitch, setPitch] = useState<number>(1.0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [emotion, setEmotion] = useState<Emotion>('cinematic');
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);

  // Quality & Resolution
  const [quality, setQuality] = useState<Quality>('1080p');
  const [fps, setFps] = useState<number>(60);

  // Generation Pipeline State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStage, setGenerationStage] = useState<string>('');

  // Player & Timeline State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-1');
  const [timelineZoom, setTimelineZoom] = useState<number>(1);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'subtitles' | 'music' | 'voice'>('editor');
  const [appendMode, setAppendMode] = useState<boolean>(true);

  // Multi-Track Timeline Data
  const [clips, setClips] = useState<VideoClip[]>([
    {
      id: 'clip-1',
      name: 'Gugnu Bioluminescent Awakening',
      prompt: 'A magical glowing firefly (Gugnu) perched on a wet emerald leaf in a dark misty rain forest...',
      sceneDescription: 'The ancient Gugnu firefly awakens amidst dark misty canopy and glowing flora',
      theme: 'forest',
      startTime: 0,
      duration: 8,
      motion: 'drone',
      style: 'cinematic',
      color: 'from-[#8A2BE2] to-emerald-900',
      accentColor: '#A3E635',
      secondaryColor: '#8A2BE2'
    },
    {
      id: 'clip-2',
      name: 'Misty Forest Rain & Fireflies',
      prompt: 'A magical glowing firefly (Gugnu) perched on a wet emerald leaf in a dark misty rain forest...',
      sceneDescription: 'A bioluminescent swarm of fireflies rises through the forest rain',
      theme: 'forest',
      startTime: 8,
      duration: 7,
      motion: 'pan',
      style: 'cinematic',
      color: 'from-cyan-600 to-emerald-700',
      accentColor: '#00FFFF',
      secondaryColor: '#10B981'
    }
  ]);

  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([
    { id: 'sub-1', startTime: 0.8, endTime: 4.8, text: "In the heart of the midnight forest, the Gugnu begins to glow." },
    { id: 'sub-2', startTime: 5.2, endTime: 9.8, text: "A spark of light pierces the rain, awakening the ancient trees." },
    { id: 'sub-3', startTime: 10.2, endTime: 14.5, text: "Created with Gugnu AI Video Maker • Free HD text to video." }
  ]);

  const [selectedBgm, setSelectedBgm] = useState<string>('ambient');
  const [bgmVolume, setBgmVolume] = useState<number>(75);

  // Modals & UI helpers
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExportComplete, setIsExportComplete] = useState<boolean>(false);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState<boolean>(false);

  // Canvas & Audio Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gainNode?: GainNode } | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);

  // Total Duration
  const totalDuration = useMemo(() => {
    if (clips.length === 0) return duration;
    const maxEnd = Math.max(...clips.map(c => c.startTime + c.duration));
    return Math.max(maxEnd, duration);
  }, [clips, duration]);

  // Handle duration changes
  const handleDurationChange = (newSec: number) => {
    setDuration(newSec);
  };

  // --- AUDIO SYNTHESIS ENGINE (BGM & VOICE TONES) ---
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playSynthChords = useCallback(() => {
    if (isMuted || volume === 0) return;
    try {
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (synthNodesRef.current?.osc1) {
        try {
          synthNodesRef.current.osc1.stop();
          synthNodesRef.current.osc2?.stop();
        } catch {}
      }

      const masterGain = ctx.createGain();
      const targetGain = (volume / 100) * (bgmVolume / 100) * 0.12;
      masterGain.gain.setValueAtTime(targetGain, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(selectedBgm === 'synthwave' ? 850 : 550, ctx.currentTime);

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      const chordRoot = selectedBgm === 'synthwave' ? 110 : 82.4;
      const timeInMeasure = Math.floor(currentTime % 8);
      const noteOffset = timeInMeasure < 4 ? 0 : 5;

      osc1.frequency.setValueAtTime(chordRoot * Math.pow(2, noteOffset / 12), ctx.currentTime);
      osc2.frequency.setValueAtTime(chordRoot * 1.5 * Math.pow(2, noteOffset / 12), ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();

      synthNodesRef.current = { osc1, osc2, gainNode: masterGain };
    } catch {}
  }, [bgmVolume, currentTime, initAudio, isMuted, selectedBgm, volume]);

  const stopSynthChords = useCallback(() => {
    if (synthNodesRef.current) {
      try {
        synthNodesRef.current.osc1?.stop();
        synthNodesRef.current.osc2?.stop();
      } catch {}
      synthNodesRef.current = null;
    }
  }, []);

  // --- PLAYBACK TICKER ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      playSynthChords();
      const step = 0.05;
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + step;
          if (next >= totalDuration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              stopSynthChords();
              return totalDuration;
            }
          }
          return next;
        });
      }, 50);
    } else {
      stopSynthChords();
    }
    return () => {
      if (interval) clearInterval(interval);
      stopSynthChords();
    };
  }, [isPlaying, totalDuration, isLooping, playSynthChords, stopSynthChords]);

  // Active clip based on currentTime
  const activeClip = useMemo(() => {
    if (clips.length === 0) return null;
    const found = clips.find(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration);
    if (found) return found;
    const selected = clips.find(c => c.id === selectedClipId);
    if (selected) return selected;
    return clips[clips.length - 1];
  }, [clips, currentTime, selectedClipId]);

  // --- PROCEDURAL CINEMATIC CANVAS ENGINE WITH DYNAMIC THEMES & PARTICLES ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Persistent procedural particles across frames
    const fireflies: Array<{ x: number; y: number; radius: number; speedX: number; speedY: number; glowColor: string; pulseSpeed: number; phase: number }> = [];
    for (let i = 0; i < 45; i++) {
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 1.4,
        speedY: (Math.random() - 0.5) * 0.9,
        glowColor: Math.random() > 0.4 ? '#00ffff' : '#a3e635',
        pulseSpeed: Math.random() * 2 + 1.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    const stars: Array<{ x: number; y: number; size: number; speed: number; phase: number }> = [];
    for (let i = 0; i < 65; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.8,
        speed: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    const bubbles: Array<{ x: number; y: number; radius: number; speedY: number; wobble: number; phase: number }> = [];
    for (let i = 0; i < 30; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 2,
        speedY: Math.random() * 1.2 + 0.6,
        wobble: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    const sakuraPetals: Array<{ x: number; y: number; size: number; speedX: number; speedY: number; rot: number; rotSpeed: number }> = [];
    for (let i = 0; i < 35; i++) {
      sakuraPetals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 4,
        speedX: Math.random() * 1.5 + 0.8,
        speedY: Math.random() * 1.2 + 0.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08
      });
    }

    const renderFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      const t = currentTime;

      // Determine active clip and current theme
      const currentClip = clips.find(c => t >= c.startTime && t < c.startTime + c.duration)
        || clips.find(c => c.id === selectedClipId)
        || clips[clips.length - 1]
        || clips[0];

      const currentTheme: SceneTheme = currentClip?.theme || detectThemeFromPrompt(prompt);
      const clipMotion: CameraMotion = currentClip?.motion || cameraMotion;
      const intensity = motionIntensity / 100;

      // Calculate progress in active clip
      const clipDuration = currentClip?.duration || 8;
      const clipStart = currentClip?.startTime || 0;
      const clipProgress = Math.max(0, Math.min(1, (t - clipStart) / clipDuration));

      // 1. CLEAR & DRAW THEMED SKY / BACKGROUND GRADIENT
      ctx.save();

      if (currentTheme === 'cyberpunk') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#04020c');
        bgGrad.addColorStop(0.5, '#120524');
        bgGrad.addColorStop(0.85, '#091528');
        bgGrad.addColorStop(1, '#050b14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Distant atmospheric neon smog
        const smog1 = ctx.createRadialGradient(w * 0.25, h * 0.6, 20, w * 0.25, h * 0.6, w * 0.45);
        smog1.addColorStop(0, 'rgba(138, 43, 226, 0.28)');
        smog1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = smog1;
        ctx.fillRect(0, 0, w, h);

        const smog2 = ctx.createRadialGradient(w * 0.75, h * 0.65, 20, w * 0.75, h * 0.65, w * 0.45);
        smog2.addColorStop(0, 'rgba(0, 255, 255, 0.22)');
        smog2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = smog2;
        ctx.fillRect(0, 0, w, h);
      } else if (currentTheme === 'mountains') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#150624');
        bgGrad.addColorStop(0.3, '#3b0e35');
        bgGrad.addColorStop(0.65, '#9a3412');
        bgGrad.addColorStop(0.85, '#f59e0b');
        bgGrad.addColorStop(1, '#fef3c7');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Volumetric golden sun
        const sunX = w * 0.62;
        const sunY = h * 0.42;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 160);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.4)');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
        ctx.fill();

        // God-rays
        ctx.save();
        ctx.translate(sunX, sunY);
        for (let ray = 0; ray < 9; ray++) {
          const rayAngle = (ray * (Math.PI / 6)) + (Math.sin(t * 0.5) * 0.05);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, w * 0.7, rayAngle - 0.08, rayAngle + 0.08);
          ctx.closePath();
          ctx.fillStyle = 'rgba(254, 243, 199, 0.07)';
          ctx.fill();
        }
        ctx.restore();
      } else if (currentTheme === 'ocean') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#064e68');
        bgGrad.addColorStop(0.35, '#032b42');
        bgGrad.addColorStop(0.7, '#02182b');
        bgGrad.addColorStop(1, '#010912');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Caustic sunlight rays from water surface
        for (let c = 0; c < 7; c++) {
          const cx = (c * (w / 6)) + Math.sin(t * 1.5 + c) * 35;
          const cGrad = ctx.createLinearGradient(cx, 0, cx + 40, h * 0.85);
          cGrad.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
          cGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.12)');
          cGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 20, 0);
          ctx.lineTo(cx + 45, 0);
          ctx.lineTo(cx + 120, h * 0.85);
          ctx.lineTo(cx - 50, h * 0.85);
          ctx.closePath();
          ctx.fill();
        }
      } else if (currentTheme === 'space') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#020108');
        bgGrad.addColorStop(0.5, '#060318');
        bgGrad.addColorStop(1, '#010512');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Cosmic Nebula Clouds
        const neb1 = ctx.createRadialGradient(w * 0.35, h * 0.4, 30, w * 0.35, h * 0.4, w * 0.4);
        neb1.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
        neb1.addColorStop(0.6, 'rgba(138, 43, 226, 0.12)');
        neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, w, h);

        const neb2 = ctx.createRadialGradient(w * 0.75, h * 0.55, 20, w * 0.75, h * 0.55, w * 0.35);
        neb2.addColorStop(0, 'rgba(6, 182, 212, 0.24)');
        neb2.addColorStop(0.6, 'rgba(56, 189, 248, 0.1)');
        neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, w, h);
      } else if (currentTheme === 'synthwave') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#090214');
        bgGrad.addColorStop(0.35, '#2e0a44');
        bgGrad.addColorStop(0.55, '#831843');
        bgGrad.addColorStop(0.65, '#f43f5e');
        bgGrad.addColorStop(1, '#0f051d');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Retro Sun on Horizon
        const sunX = w * 0.5;
        const sunY = h * 0.52;
        const sunR = w * 0.17;
        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
        sunGrad.addColorStop(0, '#fef08a');
        sunGrad.addColorStop(0.5, '#f97316');
        sunGrad.addColorStop(1, '#f43f5e');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal scanline cutout strips on retro sun
        ctx.fillStyle = '#090214';
        for (let sl = 0; sl < 7; sl++) {
          const sliceY = sunY + (sl * 11) - 5;
          const sliceH = 2.5 + (sl * 1.1);
          ctx.fillRect(sunX - sunR - 10, sliceY, (sunR * 2) + 20, sliceH);
        }
      } else if (currentTheme === 'anime') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.3, '#3730a3');
        bgGrad.addColorStop(0.55, '#7c3aed');
        bgGrad.addColorStop(0.75, '#fb7185');
        bgGrad.addColorStop(1, '#fef08a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Stylized painterly cumulus sunset clouds
        ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
        for (let c = 0; c < 5; c++) {
          const cx = ((c * 170 + t * 15) % (w + 200)) - 100;
          const cy = h * 0.48 + Math.sin(c * 2) * 20;
          ctx.beginPath();
          ctx.arc(cx, cy, 55, 0, Math.PI * 2);
          ctx.arc(cx + 45, cy - 25, 45, 0, Math.PI * 2);
          ctx.arc(cx + 90, cy, 50, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentTheme === 'forest') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#040c0b');
        bgGrad.addColorStop(0.5, '#071f1a');
        bgGrad.addColorStop(1, '#03140e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Forest canopy bokeh orbs
        for (let b = 0; b < 12; b++) {
          const bx = ((b * 75 + t * 12) % (w + 100)) - 50;
          const by = (b * 45) % (h * 0.7);
          const bGrad = ctx.createRadialGradient(bx, by, 5, bx, by, 60);
          bGrad.addColorStop(0, 'rgba(163, 230, 53, 0.18)');
          bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, 60, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Cinematic default
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#05070e');
        bgGrad.addColorStop(0.5, '#0b0f22');
        bgGrad.addColorStop(1, '#05121e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();

      // 2. APPLY CAMERA MOTION TRANSFORM (Pan, Zoom, Tilt, Drone, Orbit, Static)
      ctx.save();
      let camOffsetX = 0;
      let camOffsetY = 0;
      let camScale = 1.0;
      let camAngle = 0;

      switch (clipMotion) {
        case 'pan':
          camOffsetX = Math.sin(clipProgress * Math.PI) * 90 * intensity;
          break;
        case 'zoom':
          camScale = 1.0 + clipProgress * 0.35 * intensity;
          break;
        case 'tilt':
          camOffsetY = (clipProgress - 0.5) * 80 * intensity;
          camAngle = (clipProgress - 0.5) * 0.03 * intensity;
          break;
        case 'drone':
          camOffsetX = Math.sin(clipProgress * Math.PI * 1.5) * 70 * intensity;
          camOffsetY = Math.cos(clipProgress * Math.PI) * 40 * intensity;
          camScale = 1.0 + clipProgress * 0.22 * intensity;
          camAngle = Math.sin(clipProgress * Math.PI) * 0.025 * intensity;
          break;
        case 'orbit':
          camOffsetX = Math.sin(clipProgress * Math.PI * 2) * 55 * intensity;
          camOffsetY = Math.cos(clipProgress * Math.PI * 2) * 25 * intensity;
          camAngle = Math.sin(clipProgress * Math.PI * 2) * 0.04 * intensity;
          camScale = 1.05 + Math.sin(clipProgress * Math.PI) * 0.1 * intensity;
          break;
        case 'static':
        default:
          break;
      }

      ctx.translate(w / 2 + camOffsetX, h / 2 + camOffsetY);
      ctx.rotate(camAngle);
      ctx.scale(camScale, camScale);
      ctx.translate(-w / 2, -h / 2);

      // 3. DRAW SCENE FOREGROUND GEOMETRY BY THEME
      if (currentTheme === 'cyberpunk') {
        // Skyscraper Silhouettes with illuminated window matrix
        const buildings = [
          { x: 30, w: 70, h: 260 }, { x: 110, w: 90, h: 360 }, { x: 210, w: 80, h: 300 },
          { x: 300, w: 110, h: 420 }, { x: 420, w: 95, h: 340 }, { x: 530, w: 85, h: 380 },
          { x: 625, w: 105, h: 440 }, { x: 740, w: 90, h: 310 }, { x: 840, w: 120, h: 390 }
        ];

        buildings.forEach((b, idx) => {
          const bx = b.x * (w / 960);
          const bw = b.w * (w / 960);
          const bh = b.h * (h / 540);
          const by = h - bh;

          // Building body
          ctx.fillStyle = idx % 2 === 0 ? '#080816' : '#0b0c1e';
          ctx.fillRect(bx, by, bw, bh);

          // Roof spire antenna with blinking beacon
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw / 2, by - 35);
          ctx.stroke();

          // Blinking light
          const beaconGlow = (Math.sin(t * 5 + idx) + 1) / 2;
          ctx.fillStyle = idx % 2 === 0 ? `rgba(0, 255, 255, ${beaconGlow})` : `rgba(255, 0, 127, ${beaconGlow})`;
          ctx.beginPath();
          ctx.arc(bx + bw / 2, by - 36, 4, 0, Math.PI * 2);
          ctx.fill();

          // Window Matrix
          const rows = Math.floor(bh / 20);
          const cols = Math.floor(bw / 16);
          for (let r = 2; r < rows; r++) {
            for (let c = 1; c < cols; c++) {
              const seed = (idx * 31 + r * 17 + c * 13) % 100;
              if (seed > 62) {
                const winX = bx + c * 16;
                const winY = by + r * 20;
                ctx.fillStyle = seed > 88 ? '#00ffff' : seed > 75 ? '#ff007f' : '#fef08a';
                ctx.fillRect(winX, winY, 7, 10);
              }
            }
          }
        });

        // 3 Flying Spinners (Hovercars) with blazing light trails
        for (let sp = 0; sp < 3; sp++) {
          const speed = (sp + 1) * 90;
          const spX = ((sp * 320 + t * speed) % (w + 240)) - 120;
          const spY = h * 0.32 + sp * 55 + Math.sin(t * 2 + sp) * 8;
          const trailColor = sp % 2 === 0 ? '#00ffff' : '#ff007f';

          // Light trail
          const trailGrad = ctx.createLinearGradient(spX - 70, spY, spX, spY);
          trailGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          trailGrad.addColorStop(1, trailColor);
          ctx.fillStyle = trailGrad;
          ctx.fillRect(spX - 70, spY - 2, 70, 4);

          // Vehicle body
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(spX, spY - 5, 26, 10);

          // Headlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(spX + 26, spY, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Wet neon rain streaks
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.lineWidth = 1.2;
        for (let r = 0; r < 25; r++) {
          const rx = ((r * 42 + t * 240) % (w + 100)) - 50;
          const ry = ((r * 38 + t * 500) % (h + 100)) - 50;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 5, ry + 22);
          ctx.stroke();
        }
      } else if (currentTheme === 'mountains') {
        // Mountain Ridge 1 (Distant)
        ctx.fillStyle = '#31123d';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * 0.65);
        ctx.lineTo(w * 0.22, h * 0.52);
        ctx.lineTo(w * 0.48, h * 0.62);
        ctx.lineTo(w * 0.72, h * 0.48);
        ctx.lineTo(w, h * 0.60);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Mountain Ridge 2 (Midground Alpine Peaks with Snow Crests)
        ctx.fillStyle = '#1c0f2b';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * 0.78);
        ctx.lineTo(w * 0.15, h * 0.58);
        ctx.lineTo(w * 0.35, h * 0.72);
        ctx.lineTo(w * 0.58, h * 0.54);
        ctx.lineTo(w * 0.82, h * 0.68);
        ctx.lineTo(w, h * 0.62);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Snow peaks
        ctx.fillStyle = '#fce7f3';
        ctx.beginPath();
        ctx.moveTo(w * 0.58, h * 0.54);
        ctx.lineTo(w * 0.55, h * 0.60);
        ctx.lineTo(w * 0.61, h * 0.59);
        ctx.closePath();
        ctx.fill();

        // Mountain Ridge 3 (Foreground Crag & Pines)
        ctx.fillStyle = '#080811';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h * 0.86);
        ctx.lineTo(w * 0.28, h * 0.76);
        ctx.lineTo(w * 0.62, h * 0.88);
        ctx.lineTo(w, h * 0.82);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Soaring FPV Drone with navigation lights
        const droneX = w * 0.42 + Math.sin(t * 1.5) * 120;
        const droneY = h * 0.36 + Math.cos(t * 1.8) * 45;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(droneX - 12, droneY - 3, 24, 6);
        ctx.fillStyle = '#a3e635'; // Green nav light
        ctx.beginPath();
        ctx.arc(droneX - 14, droneY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red nav light
        ctx.beginPath();
        ctx.arc(droneX + 14, droneY, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentTheme === 'ocean') {
        // Translucent Pulsing Jellyfish
        for (let j = 0; j < 4; j++) {
          const jx = (w * 0.22 + j * (w * 0.22) + Math.sin(t * 1.2 + j * 2) * 35);
          const jy = (h * 0.28 + j * 60 + Math.cos(t * 0.8 + j) * 40);
          const pulse = 1.0 + Math.sin(t * 3 + j) * 0.15;
          const jRadius = (35 + j * 5) * pulse;

          // Jellyfish Bell Dome
          const bellGrad = ctx.createRadialGradient(jx, jy, 5, jx, jy, jRadius);
          bellGrad.addColorStop(0, 'rgba(0, 255, 255, 0.75)');
          bellGrad.addColorStop(0.5, 'rgba(138, 43, 226, 0.45)');
          bellGrad.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
          ctx.fillStyle = bellGrad;
          ctx.beginPath();
          ctx.arc(jx, jy, jRadius, Math.PI, Math.PI * 2);
          ctx.fill();

          // Undulating tentacles
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.45)';
          ctx.lineWidth = 1.5;
          for (let tent = -2; tent <= 2; tent++) {
            ctx.beginPath();
            ctx.moveTo(jx + tent * (jRadius * 0.25), jy);
            for (let seg = 1; seg <= 6; seg++) {
              const segY = jy + seg * 14;
              const segX = jx + tent * (jRadius * 0.25) + Math.sin(t * 3 + seg * 0.6 + tent) * 9;
              ctx.lineTo(segX, segY);
            }
            ctx.stroke();
          }
        }

        // Rising Bubbles
        bubbles.forEach(b => {
          b.y -= b.speedY;
          if (b.y < -20) b.y = h + 20;
          const bx = b.x + Math.sin(t * b.wobble + b.phase) * 6;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx, b.y, b.radius, 0, Math.PI * 2);
          ctx.stroke();
          // Bubble highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(bx - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (currentTheme === 'space') {
        // Twinkling Starfield
        stars.forEach(s => {
          const twinkle = (Math.sin(t * s.speed * 3 + s.phase) + 1) / 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
          ctx.fill();
        });

        // Colossal Ringed Celestial Exoplanet
        const planetX = w * 0.74;
        const planetY = h * 0.35;
        const planetR = w * 0.14;

        // Back Ring Segment
        ctx.save();
        ctx.translate(planetX, planetY);
        ctx.rotate(-0.35);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.ellipse(0, 0, planetR * 1.9, planetR * 0.45, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Planet Sphere
        const planetGrad = ctx.createRadialGradient(planetX - planetR * 0.4, planetY - planetR * 0.4, planetR * 0.1, planetX, planetY, planetR);
        planetGrad.addColorStop(0, '#38bdf8');
        planetGrad.addColorStop(0.4, '#7c3aed');
        planetGrad.addColorStop(0.85, '#1e1b4b');
        planetGrad.addColorStop(1, '#050214');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Front Ring Segment
        ctx.save();
        ctx.translate(planetX, planetY);
        ctx.rotate(-0.35);
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.65)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.ellipse(0, 0, planetR * 1.9, planetR * 0.45, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();

        // Shooting Star / Meteor
        const meteorProgress = (t * 0.8) % 3;
        if (meteorProgress < 1.0) {
          const mX = w * 0.1 + meteorProgress * w * 0.6;
          const mY = h * 0.15 + meteorProgress * h * 0.4;
          const mGrad = ctx.createLinearGradient(mX - 90, mY - 60, mX, mY);
          mGrad.addColorStop(0, 'rgba(0, 255, 255, 0)');
          mGrad.addColorStop(1, '#ffffff');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(mX - 90, mY - 60);
          ctx.lineTo(mX, mY);
          ctx.stroke();
        }
      } else if (currentTheme === 'synthwave') {
        // 3D Perspective Laser Grid
        const gridHorizon = h * 0.58;
        const vanishX = w * 0.5;

        // Perspective converging lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        for (let l = -14; l <= 14; l++) {
          const bottomX = vanishX + l * (w * 0.08);
          ctx.beginPath();
          ctx.moveTo(vanishX, gridHorizon);
          ctx.lineTo(bottomX, h);
          ctx.stroke();
        }

        // Horizontal moving grid lines
        const gridSpeed = (t * 70) % 35;
        for (let row = 0; row < 14; row++) {
          const rowY = gridHorizon + Math.pow(row / 14, 2.2) * (h - gridHorizon) + gridSpeed * (row / 14);
          if (rowY < h) {
            ctx.strokeStyle = row % 2 === 0 ? 'rgba(255, 0, 127, 0.6)' : 'rgba(0, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(0, rowY);
            ctx.lineTo(w, rowY);
            ctx.stroke();
          }
        }

        // Speeding Cyber-Car silhouette with glowing light trails
        const carX = w * 0.5;
        const carY = h * 0.82;
        ctx.fillStyle = '#090314';
        ctx.fillRect(carX - 35, carY - 14, 70, 24);

        // Neon tail-lights
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(carX - 30, carY + 4, 16, 5);
        ctx.fillRect(carX + 14, carY + 4, 16, 5);

        // Blazing speed trails behind car
        const carTrail = ctx.createLinearGradient(carX, carY + 10, carX, h);
        carTrail.addColorStop(0, 'rgba(255, 0, 85, 0.7)');
        carTrail.addColorStop(1, 'rgba(255, 0, 85, 0)');
        ctx.fillStyle = carTrail;
        ctx.fillRect(carX - 28, carY + 9, 56, 35);
      } else if (currentTheme === 'anime') {
        // Floating Sakura Petals
        sakuraPetals.forEach(p => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rot += p.rotSpeed;
          if (p.x > w + 20) p.x = -20;
          if (p.y > h + 20) p.y = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = 'rgba(251, 113, 133, 0.75)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Distant hillside with Torii gate silhouette
        ctx.fillStyle = '#0e0b24';
        ctx.beginPath();
        ctx.moveTo(w * 0.65, h);
        ctx.lineTo(w * 0.65, h * 0.84);
        ctx.lineTo(w, h * 0.76);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Torii Gate at right
        const tgX = w * 0.84;
        const tgY = h * 0.75;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tgX - 16, tgY + 28);
        ctx.lineTo(tgX - 16, tgY);
        ctx.moveTo(tgX + 16, tgY + 28);
        ctx.lineTo(tgX + 16, tgY);
        ctx.moveTo(tgX - 24, tgY + 4);
        ctx.lineTo(tgX + 24, tgY + 4);
        ctx.moveTo(tgX - 28, tgY - 2);
        ctx.lineTo(tgX + 28, tgY - 2);
        ctx.stroke();
      } else {
        // Forest & Default: The Signature Gugnu Bioluminescent Forest
        // Mossy forest bough & emerald leaf
        const leafGrad = ctx.createLinearGradient(w * 0.2, h * 0.75, w * 0.7, h * 0.55);
        leafGrad.addColorStop(0, '#064e3b');
        leafGrad.addColorStop(0.5, '#047857');
        leafGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = leafGrad;
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h * 0.88);
        ctx.quadraticCurveTo(w * 0.45, h * 0.50, w * 0.78, h * 0.62);
        ctx.quadraticCurveTo(w * 0.50, h * 0.82, w * 0.05, h * 0.88);
        ctx.fill();

        // Leaf vein
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(w * 0.08, h * 0.86);
        ctx.quadraticCurveTo(w * 0.45, h * 0.56, w * 0.72, h * 0.63);
        ctx.stroke();

        // Perched Hero Gugnu (Firefly)
        const gx = w * 0.52;
        const gy = h * 0.56;
        const wingFlutter = Math.sin(t * 30) * 0.4;
        const pulse = (Math.sin(t * 3) + 1) / 2;

        // Abdomen Bioluminescent Lantern Glow
        const lanternGlow = ctx.createRadialGradient(gx + 12, gy + 4, 3, gx + 12, gy + 4, 65);
        lanternGlow.addColorStop(0, `rgba(163, 230, 53, ${0.85 + pulse * 0.15})`);
        lanternGlow.addColorStop(0.35, `rgba(0, 255, 255, ${0.4 + pulse * 0.2})`);
        lanternGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = lanternGlow;
        ctx.beginPath();
        ctx.arc(gx + 12, gy + 4, 65, 0, Math.PI * 2);
        ctx.fill();

        // Gugnu Body
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(gx - 6, gy, 12, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Gugnu Glowing Abdomen
        ctx.fillStyle = '#bef264';
        ctx.beginPath();
        ctx.ellipse(gx + 10, gy + 2, 14, 9, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Translucent Fluttering Wings
        ctx.save();
        ctx.translate(gx - 2, gy - 6);
        ctx.rotate(-0.4 + wingFlutter);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Swarming Fireflies (Gugnus)
        fireflies.forEach(f => {
          f.x += f.speedX;
          f.y += f.speedY;
          if (f.x < -10) f.x = w + 10;
          if (f.x > w + 10) f.x = -10;
          if (f.y < -10) f.y = h + 10;
          if (f.y > h + 10) f.y = -10;

          const fPulse = (Math.sin(t * f.pulseSpeed + f.phase) + 1) / 2;
          const rad = f.radius * (0.8 + fPulse * 0.5);

          const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad * 4);
          glow.addColorStop(0, f.glowColor);
          glow.addColorStop(0.3, f.glowColor);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(f.x, f.y, rad * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(f.x, f.y, rad * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.restore(); // Restore camera transform

      // 4. CINEMATIC VIGNETTE
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.78);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(2, 4, 8, 0.82)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // 5. ON-CANVAS HUD OVERLAYS
      // Top-Left: Recording Status & Camera Vector
      ctx.fillStyle = 'rgba(8, 10, 20, 0.72)';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, 16, 260, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 32, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`REC`, 38, 36);

      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`| ${clipMotion.toUpperCase()} SHOT`, 68, 36);

      ctx.fillStyle = '#a855f7';
      ctx.fillText(`| ${quality.toUpperCase()} 60FPS`, 150, 36);

      // Top-Right: Watermark-Free Gugnu Badge
      ctx.fillStyle = 'rgba(8, 10, 20, 0.72)';
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.4)';
      ctx.beginPath();
      ctx.roundRect(w - 230, 16, 214, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(w - 216, 32, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#bef264';
      ctx.fillText(`GUGNU AI • 100% FREE NO WM`, w - 204, 36);

      // Bottom-Left: Dynamic Scene & Prompt Info Card
      const sceneIndex = clips.findIndex(c => c.id === currentClip?.id);
      const sceneNum = sceneIndex >= 0 ? sceneIndex + 1 : 1;
      const cardW = Math.min(480, w - 40);
      ctx.fillStyle = 'rgba(8, 10, 24, 0.85)';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.roundRect(16, h - 72, cardW, 56, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`SCENE ${sceneNum}/${clips.length}: ${currentClip?.name || 'Gugnu Scene'}`, 28, h - 52);

      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const promptSnippet = currentClip?.sceneDescription || prompt;
      const truncated = promptSnippet.length > 58 ? promptSnippet.slice(0, 58) + '...' : promptSnippet;
      ctx.fillText(`${currentTheme.toUpperCase()} • "${truncated}"`, 28, h - 30);

      // Bottom-Center: Live Subtitle Overlay
      if (showSubtitles && currentSubtitle) {
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        const textMetrics = ctx.measureText(currentSubtitle.text);
        const subW = Math.min(w - 60, textMetrics.width + 36);
        const subX = (w - subW) / 2;
        const subY = h - 120;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(subX, subY, subW, 36, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(currentSubtitle.text, w / 2, subY + 23);
        ctx.textAlign = 'start';
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraMotion, currentTime, motionIntensity, totalDuration, clips, selectedClipId, showSubtitles, subtitles, prompt, quality]);

  // Current Subtitle
  const currentSubtitle = useMemo(() => {
    if (!showSubtitles) return null;
    return subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
  }, [currentTime, showSubtitles, subtitles]);

  // --- ACTIONS ---
  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    setEnhancedBadge(false);

    setTimeout(() => {
      let enhanced = prompt.trim();
      const cinematicAdditions = [
        "shot on Arri Alexa 65 with 35mm anamorphic lens, f/1.8",
        "volumetric god rays, atmospheric cinematic fog, ray-traced neon rim light",
        "masterpiece DaVinci Resolve color grading with electric violet (#8A2BE2) and cyan (#00FFFF) tones",
        "hyperrealistic 8k render, photorealistic textures, Octane Engine 5.4, ultra-smooth motion blur"
      ];

      const missing = cinematicAdditions.filter(item => !enhanced.toLowerCase().includes(item.split(' ')[0]));
      if (missing.length > 0) {
        enhanced = `${enhanced}, ${missing.slice(0, 3).join(', ')}`;
      } else {
        enhanced = `${enhanced}, glowing firefly bokeh lights, ultra-detailed cinematic depth of field, award-winning cinematography`;
      }

      setPrompt(enhanced);
      setIsEnhancing(false);
      setEnhancedBadge(true);
      setTimeout(() => setEnhancedBadge(false), 4000);
    }, 600);
  };

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStage('Initializing Gugnu Neural Engine & Parsing Camera Motion Vectors...');
    setIsPlaying(false);

    const stages = [
      { progress: 24, stage: 'Generating Keyframe Latents & Gugnu Firefly Glow...', delay: 700 },
      { progress: 56, stage: 'Synthesizing Optical Flow & 60FPS Neural Vectors...', delay: 1500 },
      { progress: 80, stage: `Upscaling to ${quality.toUpperCase()} Full HD Resolution...`, delay: 2300 },
      { progress: 94, stage: 'Mixing Audio Multi-Tracks & Synchronizing Timeline...', delay: 3000 },
      { progress: 100, stage: 'Generation Complete! 100% Watermark-Free Ready.', delay: 3600 }
    ];

    stages.forEach(item => {
      setTimeout(() => {
        setGenerationProgress(item.progress);
        setGenerationStage(item.stage);

        if (item.progress === 100) {
          setTimeout(() => {
            setIsGenerating(false);

            // Sequential generation logic: calculate start time offset if appending
            const hasExisting = clips.length > 0;
            const startOffset = (appendMode && hasExisting)
              ? Math.max(...clips.map(c => c.startTime + c.duration))
              : 0;

            const { clips: newClips, subtitles: newSubtitles } = generateClipsFromPrompt(
              prompt,
              duration,
              startOffset,
              cameraMotion,
              selectedStyle
            );

            if (appendMode && hasExisting) {
              setClips(prev => [...prev, ...newClips]);
              setSubtitles(prev => [...prev, ...newSubtitles]);
              setCurrentTime(startOffset);
            } else {
              setClips(newClips);
              setSubtitles(newSubtitles);
              setCurrentTime(0);
            }

            if (newClips.length > 0) {
              setSelectedClipId(newClips[0].id);
            }
            setIsPlaying(true);
          }, 600);
        }
      }, item.delay);
    });
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    initAudio();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sampleText = "Welcome to Gugnu AI Video Maker. Free HD text to video generator with live multi-track timeline editing.";
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.pitch = pitch;
      utterance.rate = speed;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (voiceGender === 'female') {
          const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
          if (femaleVoice) utterance.voice = femaleVoice;
        } else if (voiceGender === 'male') {
          const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }

      utterance.onend = () => setIsTestingVoice(false);
      utterance.onerror = () => setIsTestingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsTestingVoice(false), 1200);
    }
  };

  const handleSplitClip = () => {
    const activeClip = clips.find(c => currentTime > c.startTime && currentTime < c.startTime + c.duration);
    if (!activeClip) return;

    const cutPoint = currentTime - activeClip.startTime;
    if (cutPoint <= 0.5 || cutPoint >= activeClip.duration - 0.5) return;

    const firstHalf: VideoClip = {
      ...activeClip,
      duration: Math.round(cutPoint * 10) / 10
    };
    const secondHalf: VideoClip = {
      ...activeClip,
      id: 'clip-' + Date.now(),
      name: `${activeClip.name} (Split)`,
      startTime: Math.round(currentTime * 10) / 10,
      duration: Math.round((activeClip.duration - cutPoint) * 10) / 10,
      motion: cameraMotion === 'zoom' ? 'pan' : 'zoom',
      style: activeClip.style,
      color: 'from-cyan-600 to-teal-800'
    };

    const newClips: VideoClip[] = [];
    clips.forEach(c => {
      if (c.id === activeClip.id) {
        newClips.push(firstHalf, secondHalf);
      } else {
        newClips.push(c);
      }
    });

    setClips(newClips);
    setSelectedClipId(secondHalf.id);
  };

  const handleTrimClip = (delta: number) => {
    setClips(prev =>
      prev.map(c => {
        if (c.id === selectedClipId) {
          const newDur = Math.max(1, Math.round((c.duration + delta) * 10) / 10);
          return { ...c, duration: newDur };
        }
        return c;
      })
    );
  };

  const handleAddSubtitle = () => {
    const newStart = Math.round(currentTime * 10) / 10;
    const newEnd = Math.min(totalDuration, Math.round((newStart + 3) * 10) / 10);
    const newSub: SubtitleItem = {
      id: 'sub-' + Date.now(),
      startTime: newStart,
      endTime: newEnd,
      text: "Gugnu glowing in the night..."
    };
    setSubtitles(prev => [...prev, newSub].sort((a, b) => a.startTime - b.startTime));
  };

  const handleDeleteSubtitle = (id: string) => {
    setSubtitles(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSubtitleText = (id: string, text: string) => {
    setSubtitles(prev => prev.map(s => (s.id === id ? { ...s, text } : s)));
  };

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(10);
    setIsExportComplete(false);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExportComplete(true);
          triggerDownload();
          return 100;
        }
        return prev + 15;
      });
    }, 320);
  };

  const triggerDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Gugnu_AI_Video_${quality.toUpperCase()}_NoWatermark.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/webp');
    } catch {}
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitClip();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(m => !m);
      } else if (e.key === 'Home') {
        setCurrentTime(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, clips]);

  return (
    <div id="gugnu-app-root" className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col select-none overflow-x-hidden font-sans">
      {/* ========================================================================= */}
      {/* NAVBAR / HEADER WITH GLOWING FIREFLY (GUGNU) LOGO */}
      {/* ========================================================================= */}
      <header id="studio-header" className="h-16 border-b border-[#8A2BE2]/30 bg-[#0c0d18]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3.5">
          {/* Circular Glowing Firefly (Gugnu) Icon */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowLogoModal(true)}
            title="Click to customize Gugnu logo URL"
          >
            {/* Required <img> tag with circular glowing cyan/green border */}
            <img
              id="navbar-gugnu-logo"
              src={gugnuLogoUrl}
              alt="Gugnu AI Firefly Logo"
              onError={e => {
                // Graceful fallback to glowing firefly artwork if URL is not yet reachable
                (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
              }}
              className="w-10 h-10 object-cover border-2 border-cyan-400 rounded-full shadow-[0_0_15px_#00ffff] transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-cyan-400 via-white to-[#8A2BE2] bg-clip-text text-transparent">
                  Gugnu AI Video Maker
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-gradient-to-r from-[#8A2BE2]/30 to-cyan-500/20 border border-cyan-400/50 text-[#00FFFF] shadow-[0_0_8px_#00ffff40]">
                FREE HD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Free HD Text to Video Generator • No Watermark
            </p>
          </div>
        </div>

        {/* Center Indicators */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/70 border border-[#8A2BE2]/40 rounded-full px-4 py-1.5 text-xs text-slate-300 shadow-[0_0_15px_rgba(138,43,226,0.15)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00FFFF] shadow-[0_0_8px_#00ffff] animate-pulse" />
            <span className="font-mono text-cyan-300">Gugnu Neural RTX 4090</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FFFF]" />
            <span>100% Free Forever</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-violet-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-[#8A2BE2]" />
            <span>Zero Watermark</span>
          </div>
        </div>

        {/* Top Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo URL Settings Button */}
          <button
            id="btn-logo-settings"
            onClick={() => setShowLogoModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-[#8A2BE2]/30 border border-slate-700/80 text-cyan-300 hover:border-cyan-400 transition-all"
            title="Configure Gugnu Logo URL"
          >
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Logo Link</span>
          </button>

          <button
            id="btn-shortcuts"
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="btn-presets"
            onClick={() => setShowPromptLibrary(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-all hover:border-[#8A2BE2]/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8A2BE2]" />
            <span>Inspirations</span>
          </button>

          <button
            id="btn-export-header"
            onClick={handleStartExport}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#8A2BE2] to-cyan-500 hover:from-purple-600 hover:to-cyan-400 text-white shadow-lg shadow-[#8A2BE2]/40 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export HD Video</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN STUDIO WORKSPACE ================= */}
      <div id="studio-body" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ================= LEFT PANEL (CONTROLS) ================= */}
        <aside
          id="left-controls-panel"
          className="w-full lg:w-[410px] xl:w-[440px] bg-[#090b14] border-r border-[#8A2BE2]/20 flex flex-col shrink-0 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-4rem)] p-4 sm:p-5 gap-4.5"
        >
          {/* Header of Left Panel with Gugnu Firefly Mascot */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <img
                src={gugnuLogoUrl}
                alt="Gugnu Firefly Studio"
                onError={e => {
                  (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
                }}
                className="w-6 h-6 object-cover border border-cyan-400 rounded-full shadow-[0_0_8px_#00ffff]"
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Text-to-Video Studio
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">v2.4 Pro</span>
          </div>

          {/* 1. Text Prompt Input Box & Enhance Prompt Button */}
          <div id="section-prompt" className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FileVideo className="w-3.5 h-3.5 text-[#8A2BE2]" />
                <span>Text Prompt to Video</span>
              </label>
              <button
                id="btn-enhance-prompt"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-gradient-to-r from-[#8A2BE2]/40 to-cyan-500/30 hover:from-[#8A2BE2]/60 hover:to-cyan-500/50 border border-cyan-400/60 text-[#00FFFF] shadow-[0_0_10px_#00ffff30] transition-all hover:scale-105 active:scale-95"
              >
                <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin text-cyan-300' : 'text-[#00FFFF]'}`} />
                <span>{isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="input-text-prompt"
                rows={3}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe your video scene (e.g., A glowing firefly (Gugnu) in misty dark rain forest, bioluminescent lighting, 8k resolution...)"
                className="w-full rounded-xl bg-[#0f1222] border border-[#8A2BE2]/40 focus:border-[#00FFFF] p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all resize-none shadow-inner"
              />
              {enhancedBadge && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded bg-violet-900/90 border border-cyan-400/60 text-[10px] text-cyan-200 animate-bounce shadow-[0_0_10px_#00ffff40]">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>Cinematic Details Enhanced</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 text-[10px] font-medium shrink-0">Try:</span>
              <button
                onClick={() => setPrompt("A glowing firefly (Gugnu) illuminating a dark mystical forest in the rain, bioluminescent spores, 8k cinematic")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Gugnu Firefly
              </button>
              <button
                onClick={() => setPrompt("Cyberpunk Neo-Tokyo in rain with flying vehicles, neon reflections on wet asphalt, 8k cinematic masterpiece")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Cyberpunk
              </button>
              <button
                onClick={() => setPrompt("FPV drone soaring through Norwegian misty mountain peaks at golden hour, volumetric sun rays, ultra-detailed")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Drone Vista
              </button>
              <button
                onClick={() => setPrompt("Deep ocean trench with glowing bioluminescent jellyfish and hydrothermal coral reef, underwater marine photography")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Deep Ocean
              </button>
              <button
                onClick={() => setPrompt("Retro 80s synthwave neon grid highway towards giant magenta sunset, chrome wireframe mountains, outrun aesthetic")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Synthwave
              </button>
              <button
                onClick={() => setPrompt("Cosmic nebula deep space journey through glowing star clusters and spiral galaxy, James Webb telescope style")}
                className="shrink-0 px-2 py-0.5 rounded-full bg-slate-900 hover:bg-[#8A2BE2]/40 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                Deep Space
              </button>
            </div>
          </div>

          {/* 2. Visual Style Presets */}
          <div id="section-style" className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#00FFFF]" />
              <span>Cinematic Visual Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLE_PRESETS.map(s => {
                const isSelected = selectedStyle === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#8A2BE2]/60 to-cyan-950/60 border-cyan-400 shadow-md shadow-[#8A2BE2]/30'
                        : 'bg-[#0f1222] border-slate-800/80 hover:border-violet-700/50 text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-semibold leading-tight line-clamp-1">{s.name}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{s.tag}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Duration & Quality / Resolution */}
          <div className="grid grid-cols-2 gap-3">
            {/* Duration Selector */}
            <div id="section-duration" className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8A2BE2]" />
                <span>Duration</span>
              </label>
              <div className="grid grid-cols-5 gap-1 bg-[#0f1222] p-1 rounded-xl border border-slate-800">
                {[5, 10, 15, 30, 60].map(sec => (
                  <button
                    key={sec}
                    onClick={() => handleDurationChange(sec)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      duration === sec
                        ? 'bg-gradient-to-r from-[#8A2BE2] to-cyan-500 text-white shadow-sm shadow-[#8A2BE2]/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Quality & Resolution Selector (FREE) */}
            <div id="section-quality" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-[#00FFFF]" />
                  <span>Resolution</span>
                </label>
                <span className="text-[10px] font-extrabold text-[#00FFFF] bg-cyan-950/70 border border-cyan-800/80 px-1.5 py-0.2 rounded shadow-[0_0_5px_#00ffff40]">
                  FREE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-[#0f1222] p-1 rounded-xl border border-slate-800">
                {(['720p', '1080p', '4k'] as Quality[]).map(q => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      quality === q
                        ? 'bg-gradient-to-r from-[#8A2BE2] to-cyan-500 text-white shadow-sm shadow-[#8A2BE2]/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Aspect Ratio Selector */}
          <div id="section-aspect-ratio" className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Square className="w-3.5 h-3.5 text-[#8A2BE2]" />
              <span>Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '16:9', label: '16:9', sub: 'YouTube / TV', icon: <Monitor className="w-4 h-3 text-[#00FFFF]" /> },
                { id: '9:16', label: '9:16', sub: 'Shorts / Reels', icon: <Smartphone className="w-3 h-4 text-[#8A2BE2]" /> },
                { id: '1:1', label: '1:1', sub: 'Square Feed', icon: <Square className="w-3.5 h-3.5 text-slate-300" /> },
                { id: '4:5', label: '4:5', sub: 'Portrait Post', icon: <div className="w-3 h-3.5 border border-slate-300 rounded-[2px]" /> }
              ].map(ar => {
                const isSelected = aspectRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as AspectRatio)}
                    className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#8A2BE2]/50 to-cyan-950/60 border-cyan-400 shadow-md shadow-[#8A2BE2]/30'
                        : 'bg-[#0f1222] border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-center h-4">{ar.icon}</div>
                    <div className="text-xs font-bold">{ar.label}</div>
                    <div className="text-[9px] text-slate-400 leading-tight">{ar.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Camera Motion Controls */}
          <div id="section-camera-motion" className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00FFFF]" />
                <span>Camera Motion</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-300">{motionIntensity}% Dynamics</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'drone', name: 'Drone Shot', icon: <Compass className="w-3.5 h-3.5" /> },
                { id: 'pan', name: 'Pan Sweeping', icon: <MoveHorizontal className="w-3.5 h-3.5" /> },
                { id: 'zoom', name: 'Dolly Zoom', icon: <CircleDot className="w-3.5 h-3.5" /> },
                { id: 'tilt', name: 'Vertical Tilt', icon: <MoveVertical className="w-3.5 h-3.5" /> },
                { id: 'orbit', name: '360° Orbit', icon: <RotateCcw className="w-3.5 h-3.5" /> },
                { id: 'static', name: 'Tripod Static', icon: <Radio className="w-3.5 h-3.5" /> }
              ].map(m => {
                const isSelected = cameraMotion === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCameraMotion(m.id as CameraMotion)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#8A2BE2] to-indigo-700 border-cyan-400 text-white shadow-sm shadow-[#8A2BE2]/40'
                        : 'bg-[#0f1222] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className={isSelected ? 'text-cyan-300' : 'text-slate-400'}>{m.icon}</span>
                    <span className="text-[11px] font-medium">{m.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] text-slate-400">Subtle</span>
              <input
                type="range"
                min={20}
                max={100}
                value={motionIntensity}
                onChange={e => setMotionIntensity(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Dynamic</span>
            </div>
          </div>

          {/* 6. Voice Changer & Audio Options (with Rotary Knob Style Dials) */}
          <div id="section-voice-changer" className="p-3.5 rounded-xl bg-[#0f1222] border border-[#8A2BE2]/40 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-[#8A2BE2]" />
                <span>Voice Changing & Narration</span>
              </label>
              <button
                id="btn-test-voice"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[#00FFFF] transition-colors shadow-sm"
              >
                <Volume2 className={`w-3 h-3 ${isTestingVoice ? 'animate-bounce text-cyan-400' : ''}`} />
                <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>

            {/* Voice Gender Selection */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'female', label: 'Female (Aria)' },
                { id: 'male', label: 'Male (Marcus)' },
                { id: 'cyber', label: 'Cyber AI (Gugnu)' }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setVoiceGender(v.id as VoiceGender)}
                  className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${
                    voiceGender === v.id
                      ? 'bg-[#8A2BE2]/60 border-cyan-400 text-white shadow-[0_0_8px_#00ffff30]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Rotary Dials Visual (as shown in reference image) */}
            <div className="flex items-center justify-around py-1 bg-slate-950/60 rounded-xl border border-slate-800/80 p-2">
              {/* Dial 1: Pitch */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 rounded-full bg-slate-900 border-2 border-[#8A2BE2] flex items-center justify-center shadow-[0_0_10px_rgba(138,43,226,0.3)]">
                  <div
                    className="w-1.5 h-4 bg-cyan-400 rounded-full origin-bottom -translate-y-2 transition-transform"
                    style={{ transform: `rotate(${(pitch - 1) * 90}deg)` }}
                  />
                  <div className="absolute inset-2 rounded-full border border-slate-700" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Pitch: {pitch.toFixed(1)}x</span>
                <span className="text-[8px] text-slate-500">Low / High</span>
              </div>

              {/* Sound Wave Divider */}
              <div className="flex items-center gap-0.5 text-cyan-400 opacity-60">
                <span className="h-2 w-0.5 bg-cyan-400 rounded" />
                <span className="h-4 w-0.5 bg-cyan-400 rounded" />
                <span className="h-6 w-0.5 bg-cyan-400 rounded" />
                <span className="h-3 w-0.5 bg-cyan-400 rounded" />
              </div>

              {/* Dial 2: Speed */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                  <div
                    className="w-1.5 h-4 bg-[#8A2BE2] rounded-full origin-bottom -translate-y-2 transition-transform"
                    style={{ transform: `rotate(${(speed - 1) * 90}deg)` }}
                  />
                  <div className="absolute inset-2 rounded-full border border-slate-700" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Speed: {speed.toFixed(1)}x</span>
                <span className="text-[8px] text-slate-500">Slow / Fast</span>
              </div>
            </div>

            {/* Emotion Dropdown */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Emotion:</span>
              <select
                value={emotion}
                onChange={e => setEmotion(e.target.value as Emotion)}
                className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-200 outline-none focus:border-[#8A2BE2]"
              >
                <option value="cinematic">Cinematic Movie Narrator</option>
                <option value="excited">Excited & High Energy</option>
                <option value="whisper">Whisper & Mysterious</option>
                <option value="dramatic">Dramatic & Intense</option>
                <option value="neutral">Neutral Documentary</option>
                <option value="cheerful">Warm & Cheerful</option>
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Fine Pitch: <strong className="text-slate-200">{pitch.toFixed(1)}x</strong></span>
                <button onClick={() => setPitch(1.0)} className="text-[10px] text-[#00FFFF] hover:underline">Reset</button>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.5}
                step={0.1}
                value={pitch}
                onChange={e => setPitch(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                <span>Fine Speed: <strong className="text-slate-200">{speed.toFixed(1)}x</strong></span>
                <button onClick={() => setSpeed(1.0)} className="text-[10px] text-[#00FFFF] hover:underline">Reset</button>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* 7. SEQUENTIAL TIMELINE GENERATION & CTA BUTTON */}
          <div className="pt-1 space-y-2">
            {/* Sequential Mode Selector / Indicator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c1020] border border-cyan-900/40 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00FFFF]" />
                <div>
                  <div className="font-semibold text-slate-200 text-[11px] flex items-center gap-1.5">
                    <span>Sequential Multi-Clip Mode</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {clips.length} {clips.length === 1 ? 'scene' : 'scenes'} ({totalDuration}s)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {appendMode ? 'Appending new clips sequentially to timeline' : 'Replacing timeline on generate'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                id="btn-toggle-append-mode"
                onClick={() => setAppendMode(!appendMode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all border cursor-pointer ${
                  appendMode
                    ? 'bg-gradient-to-r from-cyan-950 to-violet-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_#00ffff30]'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {appendMode ? 'Sequential: ON' : 'Replace Mode'}
              </button>
            </div>

            <button
              id="btn-generate-video"
              onClick={handleGenerateVideo}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide bg-gradient-to-r from-[#8A2BE2] via-purple-600 to-cyan-500 hover:from-purple-600 hover:to-cyan-400 text-white shadow-xl shadow-[#8A2BE2]/35 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer border border-cyan-400/40"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing Video... {generationProgress}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#00FFFF] fill-[#00FFFF] group-hover:animate-bounce" />
                  <span>Generate AI Video (Free 1080p HD)</span>
                </>
              )}
            </button>

            {/* Generation Progress Bar */}
            {isGenerating && (
              <div className="mt-3 p-3 rounded-xl bg-violet-950/40 border border-[#8A2BE2]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-300 font-medium animate-pulse">{generationStage}</span>
                  <span className="font-mono font-bold text-violet-300">{generationProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8A2BE2] via-cyan-400 to-[#00FFFF] transition-all duration-300 rounded-full shadow-[0_0_10px_#00ffff]"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ================= RIGHT PANEL (PREVIEW & TIMELINE EDITOR) ================= */}
        <main id="right-workspace-panel" className="flex-1 flex flex-col bg-[#07080e] overflow-hidden">
          {/* ========================================================================= */}
          {/* STUDIO DASHBOARD / LIVE INTERACTIVE VIDEO CANVAS AREA */}
          {/* ========================================================================= */}
          <div
            id="video-player-container"
            className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#13122c]/60 via-[#07080e] to-[#040508] min-h-[300px]"
          >
            {/* View Mode Toggle: Live Video Scene vs Gugnu Firefly Spotlight (as in reference image) */}
            <div className="absolute top-4 left-4 z-20 flex items-center bg-black/60 backdrop-blur-md rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setDashboardViewMode('video')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  dashboardViewMode === 'video'
                    ? 'bg-gradient-to-r from-[#8A2BE2] to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Animated Preview
              </button>
              <button
                onClick={() => setDashboardViewMode('spotlight')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                  dashboardViewMode === 'spotlight'
                    ? 'bg-gradient-to-r from-[#8A2BE2] to-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Gugnu Spotlight</span>
              </button>
            </div>

            {/* Aspect Ratio Framing Box */}
            <div
              className={`relative overflow-hidden rounded-2xl border-2 border-[#8A2BE2]/40 shadow-2xl shadow-violet-950/60 bg-black flex items-center justify-center transition-all duration-300 max-h-full max-w-full ${
                aspectRatio === '16:9'
                  ? 'aspect-video w-full max-w-4xl'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16] h-[360px] sm:h-[420px]'
                  : aspectRatio === '1:1'
                  ? 'aspect-square h-[360px] sm:h-[400px]'
                  : 'aspect-[4/5] h-[360px] sm:h-[420px]'
              }`}
            >
              {/* Dynamic HTML5 Canvas (Always rendering animated scene & firefly motion) */}
              <canvas
                ref={canvasRef}
                width={854}
                height={480}
                className="w-full h-full object-cover"
              />

              {/* ========================================================================= */}
              {/* STUDIO DASHBOARD OVERLAY: GLOWING GUGNU FIREFLY LOGO AS CENTERPIECE */}
              {/* ========================================================================= */}
              {dashboardViewMode === 'spotlight' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
                  {/* Glowing Firefly Circular Logo as in Reference Photo */}
                  <div className="relative group cursor-pointer mb-3" onClick={() => setShowLogoModal(true)}>
                    <img
                      src={gugnuLogoUrl}
                      alt="Gugnu AI Firefly"
                      onError={e => {
                        (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
                      }}
                      className="w-28 h-28 sm:w-36 sm:h-36 object-cover border-2 border-cyan-400 rounded-full shadow-[0_0_25px_#00ffff] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute -inset-1 rounded-full border border-cyan-400/30 animate-ping pointer-events-none" />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-widest text-white drop-shadow-[0_0_12px_#00ffff]">
                    GUGNU AI VIDEO MAKER
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-300 font-mono mt-1 opacity-90">
                    Free HD Text to Video Generator • 1080p 60FPS
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setDashboardViewMode('video');
                        setIsPlaying(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Animated Timeline</span>
                    </button>
                    <button
                      onClick={() => setShowLogoModal(true)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:border-cyan-400 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Change Gugnu Logo Link</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subtitle Overlay Rendering on Screen */}
              {showSubtitles && currentSubtitle && (
                <div className="absolute bottom-12 inset-x-4 flex justify-center pointer-events-none z-10">
                  <div className="bg-black/80 backdrop-blur-md text-[#00FFFF] px-4 py-1.5 rounded-lg border border-cyan-400/40 text-xs sm:text-sm font-semibold tracking-wide shadow-xl max-w-[90%] text-center">
                    {currentSubtitle.text}
                  </div>
                </div>
              )}

              {/* Watermark-Free Guarantee Stamp with Mini Gugnu */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-cyan-400/50 text-[10px] text-[#00FFFF] font-bold tracking-wider pointer-events-none shadow-[0_0_10px_#00ffff30]">
                <img
                  src={gugnuLogoUrl}
                  alt="Gugnu"
                  onError={e => {
                    (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
                  }}
                  className="w-3.5 h-3.5 rounded-full border border-cyan-400 shadow-[0_0_5px_#00ffff]"
                />
                <span>NO WATERMARK • HD</span>
              </div>

              {/* Live Status indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 font-mono">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00FFFF] animate-pulse shadow-[0_0_8px_#00ffff]' : 'bg-amber-400'}`} />
                <span>{quality.toUpperCase()} • {fps}FPS</span>
              </div>

              {/* Center Play Button Overlay on hover or paused (in video view mode) */}
              {!isPlaying && dashboardViewMode === 'video' && (
                <div
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#8A2BE2] to-cyan-400 p-[2px] shadow-[0_0_20px_#00ffff] group-hover:scale-110 transition-transform">
                    <div className="w-full h-full bg-[#0c0d18]/90 rounded-full flex items-center justify-center pl-1">
                      <Play className="w-7 h-7 text-[#00FFFF] fill-[#00FFFF]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-cyan-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-cyan-400" /> : <Play className="w-4 h-4 fill-cyan-400" />}
                  </button>
                  <button
                    onClick={() => setCurrentTime(0)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
                    title="Rewind to Start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-300">
                    <strong className="text-cyan-300">{formatTime(currentTime)}</strong> / {formatTime(totalDuration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      showSubtitles ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-transparent border-slate-700 text-slate-500'
                    }`}
                  >
                    CC
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={e => {
                        setVolume(Number(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (canvasRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          canvasRef.current.requestFullscreen();
                        }
                      }
                    }}
                    className="p-1 rounded text-slate-300 hover:text-white"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BUILT-IN MULTI-TRACK TIMELINE EDITOR */}
          {/* ========================================================================= */}
          <div id="timeline-editor-wrapper" className="h-[280px] sm:h-[300px] border-t border-[#8A2BE2]/30 bg-[#0a0c16] flex flex-col shrink-0">
            {/* Timeline Toolbar Header */}
            <div className="h-10 px-4 border-b border-violet-950/60 bg-[#0e101f] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  id="tool-split"
                  onClick={handleSplitClip}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-[#8A2BE2]/40 border border-slate-700 hover:border-cyan-400 text-slate-200 transition-colors"
                  title="Split active clip at playhead (S)"
                >
                  <Split className="w-3 h-3 text-[#00FFFF]" />
                  <span>Split (S)</span>
                </button>

                <div className="flex items-center border border-slate-800 rounded-md overflow-hidden">
                  <button
                    id="tool-trim-minus"
                    onClick={() => handleTrimClip(-1)}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    title="Trim 1s"
                  >
                    Trim -1s
                  </button>
                  <button
                    id="tool-trim-plus"
                    onClick={() => handleTrimClip(1)}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-l border-slate-700"
                    title="Extend 1s"
                  >
                    Trim +1s
                  </button>
                </div>

                <button
                  id="tool-add-sub"
                  onClick={handleAddSubtitle}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-400 text-slate-200 transition-colors"
                >
                  <Type className="w-3 h-3 text-[#8A2BE2]" />
                  <span>+ Subtitle</span>
                </button>
              </div>

              {/* Center Playback Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-[#8A2BE2] hover:bg-purple-600 text-white flex items-center justify-center shadow-md shadow-[#8A2BE2]/40"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {formatTime(currentTime)}
                </span>
              </div>

              {/* Right Tools: Timeline Zoom & Track Tabs */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-[10px]">Zoom:</span>
                  <button
                    onClick={() => setTimelineZoom(z => Math.max(0.7, z - 0.2))}
                    className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono text-[10px] w-6 text-center">{timelineZoom.toFixed(1)}x</span>
                  <button
                    onClick={() => setTimelineZoom(z => Math.min(2.5, z + 0.2))}
                    className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      activeTab === 'editor' ? 'bg-[#8A2BE2] text-white' : 'text-slate-400'
                    }`}
                  >
                    Tracks
                  </button>
                  <button
                    onClick={() => setActiveTab('music')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      activeTab === 'music' ? 'bg-[#8A2BE2] text-white' : 'text-slate-400'
                    }`}
                  >
                    BGM
                  </button>
                  <button
                    onClick={() => setActiveTab('subtitles')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      activeTab === 'subtitles' ? 'bg-[#8A2BE2] text-white' : 'text-slate-400'
                    }`}
                  >
                    Subs
                  </button>
                </div>
              </div>
            </div>

            {/* TAB CONTENT: TIMELINE TRACKS */}
            {activeTab === 'editor' && (
              <div
                ref={timelineContainerRef}
                className="flex-1 overflow-x-auto overflow-y-hidden p-3 relative select-none"
              >
                <div
                  className="relative min-w-[700px] h-full"
                  style={{ width: `${Math.max(100, totalDuration * 40 * timelineZoom)}px` }}
                >
                  {/* Time Ruler */}
                  <div className="h-5 border-b border-slate-800 flex items-end text-[9px] font-mono text-slate-500 mb-2">
                    {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center cursor-pointer"
                        style={{ left: `${(i / totalDuration) * 100}%` }}
                        onClick={() => setCurrentTime(i)}
                      >
                        <div className="h-1.5 w-[1px] bg-slate-700" />
                        <span className="-translate-x-1/2">{i}s</span>
                      </div>
                    ))}
                  </div>

                  {/* Playhead Line */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-[#00FFFF] z-20 pointer-events-none shadow-[0_0_10px_#00ffff]"
                    style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-[#00FFFF] -translate-x-[5px] -translate-y-1 shadow-md shadow-[#00ffff]" />
                  </div>

                  {/* TRACK 1: VIDEO (V1) */}
                  <div className="mb-2 relative">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-violet-400 mb-1">
                      <Film className="w-3 h-3" />
                      <span>V1 • Video Track</span>
                    </div>
                    <div className="h-12 bg-slate-900/90 rounded-lg p-1 flex gap-1 relative border border-slate-800/80">
                      {clips.map(clip => {
                        const widthPct = (clip.duration / totalDuration) * 100;
                        const isSelected = selectedClipId === clip.id;
                        return (
                          <div
                            key={clip.id}
                            onClick={() => setSelectedClipId(clip.id)}
                            style={{ width: `${widthPct}%` }}
                            className={`h-full rounded-md bg-gradient-to-r ${clip.color} border p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:brightness-110 relative group ${
                              isSelected ? 'border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_10px_#00ffff30]' : 'border-violet-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-white truncate">
                              <span className="truncate">{clip.name}</span>
                              <span className="text-[9px] font-mono opacity-80 shrink-0">{clip.duration}s</span>
                            </div>
                            <div className="flex items-center gap-1 text-[8px] text-cyan-200">
                              <span className="px-1 py-0.2 rounded bg-black/40 uppercase">{clip.motion}</span>
                              <span className="px-1 py-0.2 rounded bg-black/40">{clip.style}</span>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/20 group-hover:bg-cyan-400 rounded-r cursor-ew-resize" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TRACK 2: AUDIO & BGM (A1) */}
                  <div className="mb-2 relative">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#00FFFF] mb-1">
                      <div className="flex items-center gap-1">
                        <AudioWaveform className="w-3 h-3" />
                        <span>A1 • Background Music ({BGM_TRACKS.find(b => b.id === selectedBgm)?.name})</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">Vol: {bgmVolume}%</span>
                    </div>
                    <div className="h-9 bg-slate-900/90 rounded-lg border border-slate-800/80 p-1 flex items-center relative overflow-hidden">
                      <div className="w-full h-full rounded bg-cyan-950/40 border border-cyan-900/40 flex items-center justify-around px-2">
                        {Array.from({ length: 48 }).map((_, idx) => {
                          const height = 15 + Math.sin(idx * 0.7) * 45 + Math.cos(idx * 1.2) * 25;
                          return (
                            <div
                              key={idx}
                              className="w-[2px] bg-cyan-400/60 rounded-full"
                              style={{ height: `${Math.max(15, height)}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* TRACK 3: SUBTITLES (S1) */}
                  <div className="relative">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 mb-1">
                      <Type className="w-3 h-3" />
                      <span>S1 • Subtitle Overlays</span>
                    </div>
                    <div className="h-8 bg-slate-900/90 rounded-lg border border-slate-800/80 p-1 relative flex items-center">
                      {subtitles.map(sub => {
                        const leftPct = (sub.startTime / totalDuration) * 100;
                        const widthPct = ((sub.endTime - sub.startTime) / totalDuration) * 100;
                        const isActive = currentTime >= sub.startTime && currentTime <= sub.endTime;
                        return (
                          <div
                            key={sub.id}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            className={`absolute h-6 rounded px-2 flex items-center border text-[9px] font-medium truncate cursor-pointer transition-all ${
                              isActive
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_8px_#00ffff40]'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="truncate">{sub.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BGM SELECTOR */}
            {activeTab === 'music' && (
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Select Royalty-Free Background Music:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">BGM Volume:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bgmVolume}
                      onChange={e => setBgmVolume(Number(e.target.value))}
                      className="w-24 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {BGM_TRACKS.map(track => {
                    const isSelected = selectedBgm === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => setSelectedBgm(track.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_10px_#00ffff20]'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Music className={`w-4 h-4 ${isSelected ? 'text-[#00FFFF]' : 'text-slate-500'}`} />
                          <div>
                            <div className="text-xs font-bold leading-tight">{track.name}</div>
                            <div className="text-[10px] text-slate-500">{track.genre} • {track.bpm} BPM</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-[#00FFFF]">{track.energy}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SUBTITLES EDITOR */}
            {activeTab === 'subtitles' && (
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Custom Subtitle Blocks:</span>
                  <button
                    onClick={handleAddSubtitle}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded bg-[#8A2BE2] hover:bg-purple-600 text-white shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Caption</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {subtitles.map(sub => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <span className="font-mono text-[10px] text-[#00FFFF] shrink-0">
                        {sub.startTime}s - {sub.endTime}s:
                      </span>
                      <input
                        type="text"
                        value={sub.text}
                        onChange={e => handleUpdateSubtitleText(sub.id, e.target.value)}
                        className="flex-1 bg-transparent text-slate-200 outline-none text-xs border-b border-transparent focus:border-cyan-400"
                      />
                      <button
                        onClick={() => handleDeleteSubtitle(sub.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Subtitle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= EXPORT BAR ================= */}
            <div id="export-bar" className="h-12 border-t border-[#8A2BE2]/40 bg-[#070912] px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 hidden sm:inline">Export Specification:</span>
                <span className="px-2 py-0.5 rounded bg-violet-950/80 border border-violet-800/60 font-mono text-[11px] text-[#00FFFF] shadow-[0_0_5px_#00ffff30]">
                  {quality.toUpperCase()} • 60 FPS • H.264
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>Free Commercial & Personal Use</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn-download-video"
                  onClick={handleStartExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-gradient-to-r from-cyan-400 via-indigo-600 to-[#8A2BE2] hover:from-cyan-300 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition-all border border-cyan-400/40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080p HD Video (No Watermark)</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMIZE GUGNU FIREFLY LOGO URL */}
      {/* ========================================================================= */}
      {showLogoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1224] border border-[#8A2BE2]/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={gugnuLogoUrl}
                  alt="Gugnu Preview"
                  onError={e => {
                    (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
                  }}
                  className="w-8 h-8 object-cover border-2 border-cyan-400 rounded-full shadow-[0_0_12px_#00ffff]"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-100">Gugnu Logo Image Link</h3>
                  <p className="text-xs text-slate-400">Easily update your firefly logo image URL</p>
                </div>
              </div>
              <button onClick={() => setShowLogoModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Logo Image URL (Placeholder: <code>https://i.ibb.co/gugnu-logo.jpg</code>):
                </label>
                <input
                  type="text"
                  value={customLogoInput}
                  onChange={e => setCustomLogoInput(e.target.value)}
                  placeholder="https://i.ibb.co/your-gugnu-image.jpg"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-[#00FFFF] outline-none"
                />
              </div>

              {/* Live Preview of the entered Logo */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-4">
                <img
                  src={customLogoInput}
                  alt="Logo Preview"
                  onError={e => {
                    (e.target as HTMLImageElement).src = FALLBACK_GUGNU_SVG;
                  }}
                  className="w-14 h-14 object-cover border-2 border-cyan-400 rounded-full shadow-[0_0_15px_#00ffff]"
                />
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div className="font-bold text-slate-200">Gugnu Glowing Circular Icon</div>
                  <div>Uses <code>border-2 border-cyan-400 rounded-full shadow-[0_0_15px_#00ffff]</code></div>
                  <div className="text-emerald-400 font-semibold">Active in Navbar & Studio Dashboard</div>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomLogoInput(DEFAULT_GUGNU_LOGO)}
                  className="text-[10px] text-cyan-400 underline"
                >
                  Reset to Placeholder URL
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setGugnuLogoUrl(customLogoInput.trim() || DEFAULT_GUGNU_LOGO);
                  setShowLogoModal(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#8A2BE2] to-cyan-500 hover:from-purple-600 hover:to-cyan-400 text-white shadow-md shadow-[#8A2BE2]/40"
              >
                Save & Apply Logo
              </button>
              <button
                onClick={() => setShowLogoModal(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXPORT / DOWNLOAD PROGRESS ================= */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1224] border border-[#8A2BE2]/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-[#8A2BE2] flex items-center justify-center">
                  <Download className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    {isExportComplete ? 'Export Ready!' : 'Rendering HD Video...'}
                  </h3>
                  <p className="text-xs text-slate-400">Gugnu Neural Video Encoder (1080p 60fps)</p>
                </div>
              </div>
              <button onClick={() => setIsExporting(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Output Resolution:</span>
                <span className="font-mono text-cyan-300">1920 x 1080 Full HD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Frame Rate:</span>
                <span className="font-mono text-cyan-300">60.0 FPS</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bitrate:</span>
                <span className="font-mono text-cyan-300">18.5 Mbps High Profile</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Watermark Status:</span>
                <span className="font-semibold text-emerald-400">Clean / Zero Watermark</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-violet-300 font-medium">
                  {isExportComplete ? 'Encoding complete! Download initiated.' : 'Compiling frames & mixing audio...'}
                </span>
                <span className="font-mono font-bold text-cyan-300">{exportProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8A2BE2] via-purple-500 to-[#00FFFF] transition-all duration-300 rounded-full shadow-[0_0_10px_#00ffff]"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={triggerDownload}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#8A2BE2] to-cyan-500 hover:from-purple-600 hover:to-cyan-400 text-white shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Video File</span>
              </button>
              <button
                onClick={() => setIsExporting(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: KEYBOARD SHORTCUTS ================= */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f1224] border border-[#8A2BE2]/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Studio Keyboard Shortcuts</span>
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'Spacebar', desc: 'Play / Pause Video' },
                { key: 'S', desc: 'Split clip at current playhead' },
                { key: 'M', desc: 'Mute / Unmute Audio' },
                { key: 'Home', desc: 'Rewind playhead to 00:00' }
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="font-mono text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {s.key}
                  </span>
                  <span className="text-slate-400">{s.desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROMPT INSPIRATION LIBRARY ================= */}
      {showPromptLibrary && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f1224] border border-[#8A2BE2]/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8A2BE2]" />
                <span>Cinematic Prompt Inspirations</span>
              </h3>
              <button onClick={() => setShowPromptLibrary(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPrompt(p);
                    setShowPromptLibrary(false);
                  }}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400 cursor-pointer text-xs text-slate-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-cyan-400">Prompt #{idx + 1}</span>
                    <span className="text-[10px] text-[#8A2BE2] opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to Apply →
                    </span>
                  </div>
                  <p className="line-clamp-2">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
