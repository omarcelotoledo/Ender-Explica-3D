export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration: number;
}

export interface ScriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  narrationText: string;
  highlightWords: string[];
  actionType: 'ASSEMBLE' | 'DISMANTLE' | 'HIGHLIGHT_PART' | 'CAMERA_ZOOM' | 'XRAY_MODE';
  targetPartId: string;
  cameraConfig: CameraConfig;
  calloutText?: string;
  sfxTrigger?: 'WHOOSH' | 'MECHANICAL_CLICK' | 'IMPACT_THUD';
}

export interface FullScriptResponse {
  title: string;
  targetSubject: string;
  totalDurationSeconds: number;
  commentHookTag: string;
  segments: ScriptSegment[];
}

export interface Part3DConfig {
  id: string;
  name: string;
  category: 'FOUNDATION' | 'STRUCTURE' | 'CORE' | 'FACADE' | 'DAMPER' | 'EQUIPMENT';
  defaultPosition: [number, number, number];
  explodedPosition: [number, number, number];
  dimensions: [number, number, number];
  color: string;
  materialType: 'STANDARD' | 'GLASS' | 'CONCRETE' | 'STEEL' | 'EMISSIVE';
  opacity: number;
}

export interface Scene3DStructure {
  parts: Part3DConfig[];
  environment: {
    backgroundColor: string;
    ambientLightIntensity: number;
    directionalLightPos: [number, number, number];
  };
}
