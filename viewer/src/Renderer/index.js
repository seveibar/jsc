// @flow weak

import React from "react"

const Drawing = ({}) => {}

export default ({ data, rootDrawingId }) => {
  const rootDrawing = data[rootDrawingId]

  const getDrawing = ({
    x,
    y,
    width,
    height,
    paths = [],
    texts = [],
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
            style={{
              fontWeight: "bold",
              fontFamily: "sans-serif",
              fontSize: 14
            }}
            key={i}
            fill={t.fill || "red"}
            x={t.x}
            y={t.y}
          >
            {t.text}
          </text>
        ))}
        {children.map(c => getDrawing(data[c]))}
      </g>
    )
  }

  return (
    <div>
      <svg width={rootDrawing.width} height={rootDrawing.height}>
        {getDrawing(rootDrawing)}
      </svg>
    </div>
  )
}
