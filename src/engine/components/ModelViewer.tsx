import React from 'react';
import { interpolate, spring } from 'remotion';
import { Part3DConfig, Scene3DStructure } from '../../types';

interface ModelViewerProps {
  sceneData: Scene3DStructure;
  activePartId: string;
  actionType: string;
  /** Frame atual da composição (useCurrentFrame()). */
  frame: number;
  fps: number;
  /**
   * Frame em que o segmento atual começa. A animação usa o frame relativo
   * (frame - segmentStartFrame), então cada segmento anima do zero.
   * Se o componente já estiver dentro de um <Sequence>, deixe 0.
   */
  segmentStartFrame?: number;
}

type Vec3 = [number, number, number];

/** Posição inicial e final de cada peça conforme a ação do segmento. */
function getPartPath(part: Part3DConfig, actionType: string, isSelected: boolean): { from: Vec3; to: Vec3 } {
  const assembled = part.defaultPosition;
  const exploded = part.explodedPosition;

  switch (actionType) {
    case 'ASSEMBLE':
      // Peças vêm da posição explodida e se encaixam no lugar
      return { from: exploded, to: assembled };
    case 'DISMANTLE':
      // Peças saem do lugar e se afastam
      return { from: assembled, to: exploded };
    case 'HIGHLIGHT_PART':
      // A peça destacada fica no lugar; as demais se afastam
      return isSelected ? { from: assembled, to: assembled } : { from: assembled, to: exploded };
    default:
      // CAMERA_ZOOM / XRAY_MODE: modelo montado e parado
      return { from: assembled, to: assembled };
  }
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  sceneData,
  activePartId,
  actionType,
  frame,
  fps,
  segmentStartFrame = 0,
}) => {
  const localFrame = Math.max(0, frame - segmentStartFrame);

  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  return (
    <group>
      {sceneData.parts.map((part: Part3DConfig) => {
        const isSelected = part.id === activePartId;
        const { from, to } = getPartPath(part, actionType, isSelected);

        // Interpolação suave de posição (determinística por frame)
        const position = [0, 1, 2].map((axis) =>
          interpolate(progress, [0, 1], [from[axis], to[axis]])
        ) as Vec3;

        // Destaque visual
        const isXray = actionType === 'XRAY_MODE' && !isSelected;
        const opacity = isXray ? 0.15 : part.opacity;
        const color = isSelected ? '#ff3366' : part.color;

        return (
          <mesh key={part.id} position={position}>
            <boxGeometry args={part.dimensions} />
            <meshStandardMaterial
              color={color}
              transparent={opacity < 1}
              opacity={opacity}
              wireframe={isXray}
              roughness={0.3}
              metalness={part.materialType === 'STEEL' ? 0.8 : 0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};
