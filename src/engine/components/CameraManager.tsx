import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraConfig } from '../../types';
import * as THREE from 'three';

interface CameraManagerProps {
  cameraConfig: CameraConfig;
  frame: number;
  fps: number;
}

export const CameraManager: React.FC<CameraManagerProps> = ({ cameraConfig }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (cameraRef.current) {
      // Suavização da posição da câmera em tempo real (Lerp)
      cameraRef.current.position.lerp(
        new THREE.Vector3(...cameraConfig.position),
        0.05
      );
      cameraRef.current.lookAt(new THREE.Vector3(...cameraConfig.target));
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return <perspectiveCamera ref={cameraRef} makeDefault fov={cameraConfig.fov} />;
};
