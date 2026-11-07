import React from 'react';
import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import styles from '../FreeLayoutBoard.module.css';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ scale, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className={styles.zoomControls}>
      <button className={styles.zoomButton} onClick={onZoomIn} title="Zoom In">
        <IconZoomIn size={20} />
      </button>
      <div className={styles.zoomLevel}>
        {Math.round(scale * 100)}%
      </div>
      <button className={styles.zoomButton} onClick={onZoomOut} title="Zoom Out">
        <IconZoomOut size={20} />
      </button>
    </div>
  );
}
