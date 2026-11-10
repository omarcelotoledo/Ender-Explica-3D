import React, { useLayoutEffect, useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { Easing, interpolate } from 'remotion';
import * as THREE from 'three';
import { CameraConfig } from '../../types';

interface CameraManagerProps {
  /** Enquadramento de destino do segmento atual. */
  cameraConfig: CameraConfig;
  /** Frame atual da composição (useCurrentFrame()). */
  frame: number;
  fps: number;
  /**
   * Enquadramento de onde a câmera parte (normalmente o do segmento anterior).
   * Sem ele, a câmera fica parada no cameraConfig (corte seco).
   */
  fromConfig?: CameraConfig;
  /** Frame em que o segmento atual começa. Dentro de um <Sequence>, deixe 0. */
  segmentStartFrame?: number;
}

type Vec3 = [number, number, number];

const lerpVec3 = (t: number, a: Vec3, b: Vec3): Vec3 =>
  [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Vec3;

export const CameraManager: React.FC<CameraManagerProps> = ({
  cameraConfig,
  frame,
  fps,
  fromConfig,
  segmentStartFrame = 0,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Progresso calculado só a partir do frame: mesmo resultado em qualquer
  // ordem de renderização do Remotion (sem lerp acumulado no useFrame).
  const localFrame = Math.max(0, frame - segmentStartFrame);
  const durationFrames = Math.max(1, Math.round(cameraConfig.duration * fps));
  const t = fromConfig
    ? interpolate(localFrame, [0, durationFrames], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.cubic),
      })
    : 1;

  const start = fromConfig ?? cameraConfig;
  const position = lerpVec3(t, start.position, cameraConfig.position);
  const target = lerpVec3(t, start.target, cameraConfig.target);
  const fov = start.fov + (cameraConfig.fov - start.fov) * t;

  useLayoutEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.set(...position);
    camera.fov = fov;
    camera.lookAt(...target);
    camera.updateProjectionMatrix();
  }, [position, target, fov]);

  return <PerspectiveCamera ref={cameraRef} makeDefault position={position} fov={fov} />;
};
