// @flow

import { RenderContext, RenderedElement } from "../types"
import { useConnections } from "../hooks/use-connections.js"

const rowHeight = 30
const bugWidth = 80
const linePadding = 30

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  const { order, ports, label } = element.props
  if (!order) throw new Error(`Bug requires "order"`)
  if (!ports) throw new Error(`Bug requires "ports"`)
  if (!label) throw new Error(`Bug requires "label"`)

  const useConnectionDef = {}
  for (const o of order) {
    if (o === null) continue
    useConnectionDef[o] = {
      exposed: true,
      aliases: [`p${o}`]
    }
  }

  const connIds = useConnections(id, element.props, useConnectionDef)

  const rowCount = Math.ceil(order.length / 2)
  const bugHeight = rowHeight * rowCount

  const renderedPorts = {}

  for (let i = 0; i < order.length; i++) {
    const o = order[i]
    if (o === null) continue
    const left = i < 3
    const rowi = i % (order.length / 2)
    renderedPorts[o] = {
      x: left ? linePadding - 15 : bugWidth + linePadding + 15,
      y: rowi * rowHeight + linePadding + rowHeight / 2,
      color: "blue",
      connection: connIds[o]
    }
  }

  context.rendering[id] = {
    x: 0,
    y: 0,
    width: bugWidth + linePadding * 2,
    height: bugHeight + linePadding * 2,
    paths: [
      {
        stroke: "red",
        strokeWidth: 1,
        d: `M ${linePadding} ${linePadding} L ${linePadding} ${linePadding +
          bugHeight} ${linePadding + bugWidth} ${linePadding +
          bugHeight} ${linePadding + bugWidth} ${linePadding} Z`
      },
      ...order
        .map((o, i) => {
          if (o === null) return null
          const left = i < 3
          const rowi = i % (order.length / 2)
          return {
            stroke: "red",
            strokeWidth: 1,
            d: `M ${linePadding + (left ? 0 : bugWidth)} ${linePadding +
              rowHeight / 2 +
              rowHeight * rowi} l ${left ? -15 : 15} 0`
          }
        })
        .filter(Boolean)
    ],
    ports: renderedPorts,
    texts: [
      {
        x: 25,
        y: 10,
        text: id,
        color: "red"
      },
      ...order
        .flatMap((o, i) => {
          if (o === null) return null
          const left = i < 3
          return [
            {
              x: renderedPorts[o].x + (left ? 5 : -13),
              y: renderedPorts[o].y - 4,
              color: "red",
              text: o
            },
            {
              x: renderedPorts[o].x + (left ? 5 : -13),
              y: renderedPorts[o].y - 4,
              color: "red",
              text: o
            }
          ].filter(Boolean)
        })
        .filter(Boolean)
    ],
    children: []
  }
}
