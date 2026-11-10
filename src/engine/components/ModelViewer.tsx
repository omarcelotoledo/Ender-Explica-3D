import React from 'react';
import { interpolate, spring } from 'remotion';
import { Part3DConfig, Scene3DStructure } from '../../types';

interface ModelViewerProps {
  sceneData: Scene3DStructure;
  activePartId: string;
  actionType: string;
  frame: number;
  fps: number;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  sceneData,
  activePartId,
  actionType,
  frame,
  fps,
}) => {
  const progress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <group>
      {sceneData.parts.map((part: Part3DConfig) => {
        const isSelected = part.id === activePartId;
        const isExploded = actionType === 'DISMANTLE' || (actionType === 'HIGHLIGHT_PART' && !isSelected);

        // Interpolação Smooth de posição (Default vs Exploded)
        const posX = interpolate(progress, [0, 1], [isExploded ? part.explodedPosition[0] : part.defaultPosition[0], part.defaultPosition[0]]);
        const posY = interpolate(progress, [0, 1], [isExploded ? part.explodedPosition[1] : part.defaultPosition[1], part.defaultPosition[1]]);
        const posZ = interpolate(progress, [0, 1], [isExploded ? part.explodedPosition[2] : part.defaultPosition[2], part.defaultPosition[2]]);

        // Destaque visual
        const opacity = actionType === 'XRAY_MODE' && !isSelected ? 0.15 : part.opacity;
        const color = isSelected ? '#ff3366' : part.color;

        return (
          <mesh key={part.id} position={[posX, posY, posZ]}>
            <boxGeometry args={part.dimensions} />
            <meshStandardMaterial
              color={color}
              transparent={opacity < 1}
              opacity={opacity}
              wireframe={actionType === 'XRAY_MODE' && !isSelected}
              roughness={0.3}
              metalness={part.materialType === 'STEEL' ? 0.8 : 0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};
