// Ren'Py script element types
export type RenpyElementType = 
  | 'dialogue'
  | 'character'
  | 'scene'
  | 'show'
  | 'hide'
  | 'menu'
  | 'label'
  | 'jump'
  | 'call'
  | 'play'
  | 'stop'
  | 'pause'
  | 'transition'
  | 'variable'
  | 'python'
  | 'if'
  | 'return';

export interface RenpyCharacter {
  id: string;
  name: string;
  color?: string;
  image?: string;
  who_suffix?: string;
  what_prefix?: string;
  what_suffix?: string;
}

export interface RenpyElement {
  id: string;
  type: RenpyElementType;
  content?: string;
  character?: string;
  image?: string;
  position?: 'left' | 'center' | 'right' | 'truecenter';
  transition?: string;
  audio?: string;
  channel?: 'music' | 'sound' | 'voice';
  choices?: MenuChoice[];
  label?: string;
  condition?: string;
  code?: string;
  variable?: string;
  value?: any;
  duration?: number;
}

export interface MenuChoice {
  id: string;
  text: string;
  condition?: string;
  actions: RenpyElement[];
}

export interface RenpyScript {
  characters: RenpyCharacter[];
  elements: RenpyElement[];
  assets: {
    images: Asset[];
    audio: Asset[];
    backgrounds: Asset[];
  };
}

export interface Asset {
  id: string;
  name: string;
  path: string;
  type: string;
}

export interface PreviewState {
  currentElementIndex: number;
  variables: Record<string, any>;
  visibleCharacters: Record<string, {
    character: string;
    image: string;
    position: string;
  }>;
  background?: string;
  backgroundMusic?: string;
  isPlaying: boolean;
}