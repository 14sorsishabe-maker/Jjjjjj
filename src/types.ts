export type YasminMood = 'loving' | 'happy' | 'caring' | 'playful' | 'thinking' | 'shy' | 'sad';

export type ActionType = 
  | 'NONE'
  | 'OPEN_APP'
  | 'YOUTUBE_SEARCH'
  | 'CALL'
  | 'SMS'
  | 'TORCH_TOGGLE'
  | 'VOLUME_CONTROL'
  | 'BATTERY_CHECK'
  | 'DEVICE_INFO'
  | 'GESTURE_SCROLL'
  | 'GESTURE_TAP'
  | 'ALARM'
  | 'TAKE_PHOTO';

export interface ActionPayload {
  type: ActionType;
  params: {
    appName?: string;
    query?: string;
    contactName?: string;
    phoneNumber?: string;
    message?: string;
    torchState?: boolean;
    volumeLevel?: number;
    scrollDirection?: 'up' | 'down';
    confirmRequired?: boolean;
    [key: string]: any;
  };
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'yasmin';
  text: string;
  timestamp: number;
  mood?: YasminMood;
  action?: ActionPayload;
  audioBase64?: string;
}

export interface UserRelationship {
  nickname: string;
  level: number;
  xp: number;
  loveMeter: number; // 0 - 100%
  moodHistory: YasminMood[];
  favoriteThings: string[];
}

export interface DeviceState {
  batteryLevel: number;
  isCharging: boolean;
  torchOn: boolean;
  volume: number;
  isOnline: boolean;
  activeApp: string | null;
  accessibilityEnabled: boolean;
  backgroundServiceEnabled: boolean;
}

export interface AndroidProjectCodeFile {
  path: string;
  filename: string;
  category: 'manifest' | 'kotlin' | 'gradle' | 'resource' | 'doc';
  content: string;
  description: string;
}
