// @flow

import { RenderContext, RenderedElement } from "../types"
import { render } from "../index.js"
import { moveRenderedElementTo } from "../utils"
import {
  trimMat,
  getPositionsFromMat,
  getConnectionsFromMat,
  getGridRepresentation,
  isNode,
} from "../utils/layout-matrix"
import { useConnectionMedium } from "../hooks/use-connections"

const MIN_GRID_SIZE = 20

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  // Render children to determine size
  const { children } = element.props
  context._path.push(id)

  const layoutString = children[0]

  if (typeof layoutString !== "string")
    throw new Error(
      "Layout children must be a string that sort of represents a grid"
    )

  const gridRep = getGridRepresentation(layoutString)

  // Find all the children identifiers
  const gridCompIds = Array.from(new Set(gridRep.flatMap((r) => r))).filter(
    isNode
  )

  const gridIdPos = {}
  for (const gridCompId of gridCompIds) {
    const componentPositions = getPositionsFromMat(gridRep, gridCompId)
    // You can't do left/right or top/bottom matching if the component appears multiple times
    // or on multiple rows etc. So only place components that appear exactly
    // once into gridIdPos
    if (componentPositions.length === 1) {
      gridIdPos[gridCompId] = componentPositions[0]
    }
  }

  const gridIdConnectionList = {}
  for (const gridCompId of gridCompIds) {
    gridIdConnectionList[gridCompId] = getConnectionsFromMat(
      gridRep,
      gridCompId
    )
  }

  const { solveMedium } = useConnectionMedium({
    isConnectedFn: (a, b) => {
      if (a.componentIndex === b.componentIndex) return false

      const [A, B] = [
        gridCompIds[a.componentIndex],
        gridCompIds[b.componentIndex],
      ]

      const [Ay, Ax] = gridIdPos[A]
      const [By, Bx] = gridIdPos[B]

      const componentsConnected = gridIdConnectionList[A].includes(B)

      if (!componentsConnected) return false

      if (Ax < Bx) {
        if (a.name === "right" && b.name === "left") {
          return true
        }
      } else if (Ax > Bx) {
        if (a.name === "left" && b.name === "right") {
          return true
        }
      }

      if (Ay < By) {
        if (a.name === "right" && b.name === "left") {
          return true
        }
      } else if (Ay > By) {
        if (a.name === "left" && b.name === "right") {
          return true
        }
      }

      if (a.name === "left" || a.name === "right") return false

      return false
    },
  })

  for (const compId of gridCompIds) {
    const compChild = element.props[compId]
    render(context, compChild)
  }

  const renderedChildrenIds =
    context._renderPathElements[context._path.join(".")]

  if (renderedChildrenIds.length !== gridCompIds.length) {
    throw new Error(
      `Rendered children count (${renderedChildrenIds.length}) different from grid components in layout (${gridCompIds.length})`
    )
  }

  const childRenderingMap = {},
    childRenderingIdMap = {}
  for (let i = 0; i < gridCompIds.length; i++) {
    childRenderingIdMap[gridCompIds[i]] = renderedChildrenIds[i]
    childRenderingMap[gridCompIds[i]] =
      context.rendering[renderedChildrenIds[i]]
  }

  // Get the max size of each row, and each column
  let maxRowHeights = gridRep.map((r) => MIN_GRID_SIZE)
  let maxColWidths = gridRep[0].map((c) => MIN_GRID_SIZE)
  for (let ri = 0; ri < gridRep.length; ri++) {
    for (let ci = 0; ci < gridRep[ri].length; ci++) {
      const compId = gridRep[ri][ci]
      if (childRenderingMap[compId]) {
        const { width, height } = childRenderingMap[compId]
        maxRowHeights[ri] = Math.max(maxRowHeights[ri], height)
        maxColWidths[ci] = Math.max(maxColWidths[ci], width)
      }
    }
  }

  const cellStartPositions = []
  let currentX = 0,
    currentY = 0
  for (let ri = 0; ri < gridRep.length; ri++) {
    currentX = 0
    for (let ci = 0; ci < gridRep[ri].length; ci++) {
      const compId = gridRep[ri][ci]
      if (childRenderingMap[compId]) {
        moveRenderedElementTo(
          context,
          childRenderingIdMap[compId],
          currentX,
          currentY
        )
      }
      currentX += maxColWidths[ci]
    }
    currentY += maxRowHeights[ri]
  }
  const totalWidth = currentX
  const totalHeight = currentY

  solveMedium()

  context.rendering[id] = ({
    x: 0,
    y: 0,
    width: totalWidth,
    height: totalHeight,
    children: renderedChildrenIds,
  }: any)

  context._path.pop()
}
