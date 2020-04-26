// @flow

import { RenderContext, RenderedElement } from "../types"
import { render } from "../index.js"
import { moveRenderedElementTo } from "../utils"
import { useConnectionMedium } from "../hooks/use-connections"

const isWhitespace = s => !s || /\s/.test(s)
const isNode = s => /[a-zA-Z0-9]/.test(s)
const isConnector = s => !isWhitespace(s) && !isNode(s)

const trimMat = mat => {
  const initialTotalColumns = Math.max(...mat.map(r => r.length))
  for (let ci = initialTotalColumns - 1; ci >= 0; ci--) {
    if (mat.every(r => isWhitespace(r[ci]))) {
      mat.forEach(r => r.splice(ci, 1))
    }
  }

  for (let ri = mat.length - 1; ri >= 0; ri--) {
    if (mat[ri].every(isWhitespace)) {
      mat.splice(ri, 1)
    }
  }

  return mat
}

const getPosFromMat = (mat, node) => {
  let nodePos = null
  for (let i = 0; i < mat.length; i++) {
    for (let u = 0; u < mat[0].length; u++) {
      if (mat[i][u] === node) {
        nodePos = [i, u]
        i = mat.length
        break
      }
    }
  }
  return nodePos
}

const getConnectionsFromMat = (mat, node) => {
  const nodePos = getPosFromMat(mat, node)
  if (!nodePos) return []
  const connections = []
  const traversed = {}
  traversed[nodePos] = true

  const traverse = pos => {
    const surroundings = [
      [pos[0] - 1, pos[1]],
      [pos[0] + 1, pos[1]],
      [pos[0], pos[1] - 1],
      [pos[0], pos[1] + 1]
    ].filter(([r, c]) => {
      if (r < 0 || r >= mat.length) return false
      if (c < 0 || c >= mat[0].length) return false
      if (traversed[[r, c]]) return false
      return true
    })
    for (let pos of surroundings) {
      traversed[pos] = true
      const char = mat[pos[0]][pos[1]]
      if (isConnector(char)) {
        traverse(pos)
      } else if (isNode(char)) {
        connections.push(char)
      }
    }
  }
  traverse(nodePos)
  return connections
}

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

  const gridRep = trimMat(layoutString.split("\n").map(l => l.split("")))

  // Find all the children identifiers
  const gridCompIds = Array.from(new Set(gridRep.flatMap(r => r))).filter(
    isNode
  )

  const gridIdPos = {}
  for (const gridCompId of gridCompIds) {
    gridIdPos[gridCompId] = getPosFromMat(gridRep, gridCompId)
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
        gridCompIds[b.componentIndex]
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
    }
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
  let maxRowHeights = gridRep.map(r => MIN_GRID_SIZE)
  let maxColWidths = gridRep[0].map(c => MIN_GRID_SIZE)
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
    children: renderedChildrenIds
  }: any)

  context._path.pop()
}
