// @flow weak

import React from "react"

const Drawing = ({}) => {}

export default ({ data, rootDrawingId, padding = 0 }) => {
  const { rendering, connections = {} } = data
  const rootDrawing = rendering[rootDrawingId]

  const getComponentDrawings = ({
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
      <>
        <g key={"tl"} transform={`translate(${x},${y})`}>
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
        </g>
        {children.map(c => getComponentDrawings(rendering[c]))}
      </>
    )
  }

  const getAllPorts = (child, childId) => {
    return Object.entries(child.ports || {})
      .map(([name, { connection, x, y }]) => {
        return { name, connection, x, y, componentId: childId }
      })
      .concat(
        (child.children || []).flatMap(c => {
          return getAllPorts(rendering[c], c)
        })
      )
  }

  const getConnectionDrawings = rootDrawing => {
    const allPorts = getAllPorts(rootDrawing, rootDrawingId).map(p => ({
      ...p,
      cg: connections[p.connection],
      absX: p.x + rendering[p.componentId].x,
      absY: p.y + rendering[p.componentId].y
    }))

    const connectionGroups = Array.from(new Set(allPorts.map(p => p.cg)))
    const comps = []

    for (const cg of connectionGroups) {
      const portsInCG = allPorts.filter(p => p.cg === cg)
      if (portsInCG.length <= 1) continue

      const isConnected = {}
      const inTree = [portsInCG[0]]
      const outOfTree = portsInCG.slice(1)

      // Prim's Algorithm to connect all nodes
      // TODO optimize
      while (inTree.length < portsInCG.length) {
        let closestOut = 0,
          closestIn = 0,
          closestDistance = Infinity
        for (let i = 0; i < outOfTree.length; i++) {
          for (let u = 0; u < inTree.length; u++) {
            const dx = inTree[u].absX - outOfTree[i].absX
            const dy = inTree[u].absY - outOfTree[i].absY
            const d = Math.sqrt(dx ** 2 + dy ** 2)
            if (d < closestDistance) {
              closestOut = i
              closestIn = u
              closestDistance = d
            }
          }
        }

        const [inNode, outNode] = [inTree[closestIn], outOfTree[closestOut]]
        inTree.push(outNode)
        outOfTree.splice(closestOut, 1)

        comps.push(
          <line
            x1={inNode.absX}
            y1={inNode.absY}
            x2={outNode.absX}
            y2={outNode.absY}
            stroke="green"
            strokeWidth={2}
            fill="none"
          />
        )
      }
    }
    return comps
  }

  return (
    <div>
      <svg
        width={rootDrawing.width + rootDrawing.x + padding * 2}
        height={rootDrawing.height + rootDrawing.y + padding * 2}
      >
        <g transform={`translate(${padding} ${padding})`}>
          {getComponentDrawings(rootDrawing)}
          {getConnectionDrawings(rootDrawing)}
        </g>
      </svg>
    </div>
  )
}
