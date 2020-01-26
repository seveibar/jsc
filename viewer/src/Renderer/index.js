// @flow weak

import React from "react"

const Drawing = ({}) => {}

export default ({ data, rootDrawingId, padding = 0 }) => {
  const rootDrawing = data[rootDrawingId]

  const getDrawing = ({
    x,
    y,
    width,
    height,
    paths = [],
    texts = [],
    ports = {},
    children = []
  }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        {paths.map((p, i) => (
          <path
            key={i}
            fill="none"
            strokeWidth={2 * (p.strokeWidth || 1)}
            stroke={p.stroke || "red"}
            d={p.d}
          />
        ))}
        {texts.map((t, i) => (
          <text
            key={i}
            style={{
              fontWeight: "bold",
              fontFamily: "sans-serif",
              fontSize: 14
            }}
            fill={t.fill || "red"}
            x={t.x}
            y={t.y}
          >
            {t.text}
          </text>
        ))}
        {Object.entries(ports).map(([name, { x, y, color }]) => (
          <rect
            style={{
              stroke: color,
              strokeWidth: 2,
              fill: "none"
            }}
            key={name}
            x={x - 5}
            y={y - 5}
            width={10}
            height={10}
          />
        ))}
        {children.map(c => getDrawing(data[c]))}
      </g>
    )
  }

  return (
    <div>
      <svg
        width={rootDrawing.width + rootDrawing.x + padding * 2}
        height={rootDrawing.height + rootDrawing.y + padding * 2}
      >
        <g transform={`translate(${padding} ${padding})`}>
          {getDrawing(rootDrawing)}
        </g>
      </svg>
    </div>
  )
}
