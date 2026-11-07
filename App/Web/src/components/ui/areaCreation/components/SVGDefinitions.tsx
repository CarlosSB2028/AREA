import React from 'react';

export default function SVGDefinitions() {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L12,4 z"
          fill="#4DABF7"
          stroke="white"
          strokeWidth="0.5"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
        />
      </marker>

      <marker
        id="arrowhead-green"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L12,4 z"
          fill="#51CF66"
          stroke="white"
          strokeWidth="0.5"
        />
      </marker>

      <marker
        id="arrowhead-yellow"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L12,4 z"
          fill="#FFD43B"
          stroke="white"
          strokeWidth="0.5"
        />
      </marker>

      <marker
        id="arrowhead-red"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L12,4 z"
          fill="#FF6B6B"
          stroke="white"
          strokeWidth="0.5"
        />
      </marker>

      <marker
        id="arrowhead-purple"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M0,0 L0,8 L12,4 z"
          fill="#9775FA"
          stroke="white"
          strokeWidth="0.5"
        />
      </marker>

      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  );
}
