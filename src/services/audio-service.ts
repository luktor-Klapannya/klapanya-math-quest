import { 
  AudioSettings, 
  AudioSfxEvent, 
  ZoneMusicProfileId, 
  ZoneMusicDefinition 
} from '../types/audio';

const AUDIO_SETTINGS_KEY = 'klapanya_math_audio_settings_v1';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.85,
  uiVolume: 0.8,
  isMuted: false,
  isMusicEnabled: true,
  isSfxEnabled: true,
  isReducedSound: false,
};

export const ZONE_MUSIC_DATABASE: Record<ZoneMusicProfileId, ZoneMusicDefinition> = {
  TRAINING_DOJO: {
    id: 'TRAINING_DOJO',
    name: 'Frozen Temple of Concentration',
    thaiName: 'วิหารเหมันต์แห่งสมาธิ (Training Dojo)',
    tempoBpm: 60,
    moodDescription: 'Calm frozen temple, light percussion, focus-oriented',
    instrumentation: 'Tibetan Singing Bowls, Light Frosted Chimes, Soft Strings',
    loopToneFrequencies: [220, 261.63, 293.66, 329.63, 392.00],
  },
  FARMING_SHRINE: {
    id: 'FARMING_SHRINE',
    name: 'Aurora Pulse & Combo Surge',
    thaiName: 'ชีพจรแสงออโรร่า (Farming Shrine)',
    tempoBpm: 120,
    moodDescription: 'Faster aurora rhythm, energetic pulse, tempo increases during combo',
    instrumentation: 'Fast Arpeggios, Sub-bass Pulse, Crystal Claps',
    loopToneFrequencies: [293.66, 349.23, 440.00, 523.25, 587.33],
  },
  ONET_GATEWAY: {
    id: 'ONET_GATEWAY',
    name: 'Gate of Strict Examination',
    thaiName: 'บรรยากาศห้องสอบทางการ (O-NET Gateway)',
    tempoBpm: 50,
    moodDescription: 'Minimal, low-distraction, almost examination ambience',
    instrumentation: 'Soft Low Drone, Filtered White Ambience, Subdued Tonal Pads',
    loopToneFrequencies: [174.61, 220.00, 261.63],
  },
  BOSS_ARENA: {
    id: 'BOSS_ARENA',
    name: 'Citadel of the Ice Colossus',
    thaiName: 'สมรภูมิมหาบอสโบราณ (Boss Arena)',
    tempoBpm: 130,
    moodDescription: 'Cinematic tension, phase-based escalation, rage-phase variation',
    instrumentation: 'Heavy Cinematic Drums, Brass Stabs, Anvil Hits, Glacial Strings',
    loopToneFrequencies: [110.00, 130.81, 146.83, 164.81, 220.00],
  },
  GEOMETRY_RUINS: {
    id: 'GEOMETRY_RUINS',
    name: 'Echoes of Spatial Geometry',
    thaiName: 'ซากโบราณสถานมิติเรขาคณิต (Geometry Ruins)',
    tempoBpm: 70,
    moodDescription: 'Mysterious crystal ambience, spacious and analytical',
    instrumentation: 'Glass Harmonica, Resonance Filters, Ambient Shimmers',
    loopToneFrequencies: [261.63, 329.63, 392.00, 493.88, 523.25],
  },
  QUEST_BOARD: {
    id: 'QUEST_BOARD',
    name: 'Arctic Expedition Trail',
    thaiName: 'เส้นทางสำรวจหมู่บ้านหิมะ (Quest Board)',
    tempoBpm: 100,
    moodDescription: 'Expedition / village adventure, courageous and warm',
    instrumentation: 'Acoustic Guitar, Wood Flute, Light Tambourine',
    loopToneFrequencies: [261.63, 293.66, 329.63, 392.00, 440.00],
  },
  FINAL_TRIAL: {
    id: 'FINAL_TRIAL',
    name: 'Zenith of the Grandmaster',
    thaiName: 'การทดสอบสูงสุดของปรมาจารย์ (Final Trial)',
    tempoBpm: 40,
    moodDescription: 'Minimal ambient music only, allow full silence by default if preferred',
    instrumentation: 'Deep Resonating Drone, Soft Wind Breath, Minimal Piano',
    loopToneFrequencies: [130.81, 196.00, 261.63],
  },
  TOP_FORM: {
    id: 'TOP_FORM',
    name: 'Coronation of the Sovereign',
    thaiName: 'บทเพลงราชันผู้พิชิต (Top Form Sovereign)',
    tempoBpm: 110,
    moodDescription: 'Ceremonial victory theme, glorious brass and choral ascension',
    instrumentation: 'Cathedral Organ, Brass Fanfare, Choral Chants, Golden Chimes',
    loopToneFrequencies: [261.63, 329.63, 392.00, 523.25, 659.25],
  },
};

class AudioEngineService {
  private settings: AudioSettings;
  private currentZone: ZoneMusicProfileId = 'TRAINING_DOJO';
  private audioCtx: AudioContext | null = null;
  private isSynthesizerActive: boolean = false;
  private musicInterval: any = null;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
    try {
      const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (raw) return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
    } catch {
      // Fallback
    }
    return DEFAULT_AUDIO_SETTINGS;
  }

  public saveSettings(newSettings: Partial<AudioSettings>): AudioSettings {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (err) {
        console.warn('Could not save audio settings', err);
      }
    }
    return this.settings;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public getCurrentZone(): ZoneMusicProfileId {
    return this.currentZone;
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // --- Play Procedural Tone SFX ---
  public playSfx(event: AudioSfxEvent): void {
    if (this.settings.isMuted || !this.settings.isSfxEnabled) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const effectiveVolume = this.settings.masterVolume * this.settings.sfxVolume * (this.settings.isReducedSound ? 0.4 : 1.0);
    gainNode.gain.setValueAtTime(effectiveVolume * 0.15, ctx.currentTime);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (event) {
      case 'SFX_CORRECT': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc2.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now + 0.24);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.45);
        break;
      }
      case 'SFX_WRONG': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.linearRampToValueAtTime(146.83, now + 0.18);
        osc2.frequency.setValueAtTime(164.81, now);
        osc2.frequency.linearRampToValueAtTime(110.00, now + 0.22);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.28);
        osc2.stop(now + 0.35);
        break;
      }
      case 'SFX_CRITICAL': {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'SFX_ATTACK': {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'SFX_BOSS_HIT': {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'SFX_BOSS_DEFEAT':
      case 'SFX_TOP_FORM': {
        const chordFreqs = [261.63, 329.63, 392.00, 523.25];
        chordFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          osc.connect(gainNode);
          osc.start(now + idx * 0.08);
          osc.stop(now + 0.8);
        });
        break;
      }
      case 'SFX_UI_CLICK':
      default: {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
    }
  }

  // --- Set Zone Music Profile ---
  public setZoneMusic(zone: ZoneMusicProfileId): ZoneMusicDefinition {
    this.currentZone = zone;
    return ZONE_MUSIC_DATABASE[zone] || ZONE_MUSIC_DATABASE.TRAINING_DOJO;
  }
}

export const audioEngine = new AudioEngineService();
