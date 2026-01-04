
export interface PhotoAnalysis {
  lighting: string;
  composition: string;
  optics: string;
  color: string;
  suggestions: string[];
}

export interface PhotoState {
  originalUrl: string | null;
  editedUrl: string | null;
  isAnalyzing: boolean;
  isProcessing: boolean;
  analysis: PhotoAnalysis | null;
  error: string | null;
}

export enum EditMode {
  AUTO = 'auto',
  CUSTOM = 'custom'
}

export type AspectRatio = "1:1" | "4:3" | "16:9" | "3:4" | "9:16";
