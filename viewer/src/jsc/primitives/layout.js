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
import * as kiwi from "kiwi.js"

const MIN_GRID_SIZE = 20

const findClosestManhattanPoints = (A, B) => {
  let currentClosestDist = Infinity
  let currentPair = [null, null]
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      const [a, b] = [A[i], B[j]]
      const dist = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
      if (dist < currentClosestDist) {
        currentPair = [A[i], B[j]]
        currentClosestDist = dist
      }
    }
  }
  return currentPair
}

const getCellWidthAtPos = (gridRep, ri, ci) => {
  const compId = gridRep[ri][ci]
  let width = 1
  let currentColIndex = ci - 1
  while (currentColIndex >= 0 && gridRep[ri][currentColIndex] === compId) {
    width++
    currentColIndex--
  }
  currentColIndex = ci + 1
  while (
    currentColIndex < gridRep[0].length &&
    gridRep[ri][currentColIndex] === compId
  ) {
    width++
    currentColIndex++
  }
  return width
}
const getCellHeightAtPos = (gridRep, ri, ci) => {
  const compId = gridRep[ri][ci]
  let height = 1
  let currentRowIndex = ri - 1
  while (currentRowIndex >= 0 && gridRep[currentRowIndex][ci] === compId) {
    height++
    currentRowIndex--
  }
  currentRowIndex = ri + 1
  while (
    currentRowIndex < gridRep.length &&
    gridRep[currentRowIndex][ci] === compId
  ) {
    height++
    currentRowIndex++
  }
  return height
}

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

      // Don't handle if componnent has multiple positions (dense letter, box-style etc.)
      if (!gridIdPos[A]) return false
      if (!gridIdPos[B]) return false

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
    childRenderingIdMap = {},
    renderedChildIdToCompId = {}
  for (let i = 0; i < gridCompIds.length; i++) {
    childRenderingIdMap[gridCompIds[i]] = renderedChildrenIds[i]
    childRenderingMap[gridCompIds[i]] =
      context.rendering[renderedChildrenIds[i]]
    renderedChildIdToCompId[renderedChildrenIds[i]] = gridCompIds[i]
  }

  // Get the max size of each row, and each column
  let maxRowHeights = gridRep.map((r) => MIN_GRID_SIZE)
  let maxColWidths = gridRep[0].map((c) => MIN_GRID_SIZE)
  for (let ri = 0; ri < gridRep.length; ri++) {
    for (let ci = 0; ci < gridRep[ri].length; ci++) {
      // TODO manage if component is divided across multiple cells
      const compId = gridRep[ri][ci]
      const cellWidth = getCellWidthAtPos(gridRep, ri, ci)
      const cellHeight = getCellHeightAtPos(gridRep, ri, ci)
      if (childRenderingMap[compId]) {
        const { width, height } = childRenderingMap[compId]
        maxRowHeights[ri] = Math.max(maxRowHeights[ri], height / cellWidth)
        maxColWidths[ci] = Math.max(maxColWidths[ci], width / cellHeight)
      }
    }
  }

  // Move rendered elements into correct positions based on cell sizes
  let cellStartPositions = []
  let currentX = 0,
    currentY = 0,
    movedElements = {}
  for (let ri = 0; ri < gridRep.length; ri++) {
    currentX = 0
    for (let ci = 0; ci < gridRep[ri].length; ci++) {
      const compId = gridRep[ri][ci]
      if (childRenderingMap[compId] && !movedElements[compId]) {
        moveRenderedElementTo(
          context,
          childRenderingIdMap[compId],
          currentX,
          currentY
        )
        movedElements[compId] = true
      }
      currentX += maxColWidths[ci]
    }
    currentY += maxRowHeights[ri]
  }
  let totalWidth = currentX
  let totalHeight = currentY

  solveMedium()

  // Vertically align elements to align with ports with two constraints:
  // 1) An element cannot overlap another element
  // 2) An element cannot go outside the totalWidth or totalHeight
  // Method:
  // * Consider all ports unconstrained initially
  // * If an element can't be moved consider all ports constrained
  // * Iteratively move elements that are not aligned with a connection until
  //   no elements can be moved
  //     * For an element to not be aligned, it must have a connection with an
  //       element in another grid cell and of it's connections none of the
  //       connecting ports are at the same X or Y
  // Using constraint optimization, consider port 2 of elm 1's position to be...
  // [elm1_x + elm1_port2_x, elm1_y + elm1_port2_y]
  // We then want to create a constraint system like...
  // elm1_x + elm1_w <= totalWidth
  // elm1_x >= 0
  // elm1_y + elm1_w <= totalHeight
  // elm1_y >= 0
  // You'll also need 4 * n^2 constraints that make sure elements don't overlap
  // This is how you would optimize a horizontal port relationship
  // min(elm1_x + elm1_port2_y - elm2_y - elm2_port1_y)
  const solver = new kiwi.Solver()
  const solverVarMap = {}
  for (const renderedChildId of renderedChildrenIds) {
    const posXVar = new kiwi.Variable()
    const posYVar = new kiwi.Variable()
    solver.addEditVariable(posXVar, kiwi.Strength.weak)
    solver.addEditVariable(posYVar, kiwi.Strength.weak)
    solver.suggestValue(posXVar, context.rendering[renderedChildId].x)
    solver.suggestValue(posYVar, context.rendering[renderedChildId].y)
    solverVarMap[renderedChildId + "_x"] = posXVar
    solverVarMap[renderedChildId + "_y"] = posYVar
    // Add element x,y bound constraints
    solver.addConstraint(
      new kiwi.Constraint(posXVar, kiwi.Operator.Ge, 0, kiwi.Strength.strong)
    )
    solver.addConstraint(
      new kiwi.Constraint(posYVar, kiwi.Operator.Ge, 0, kiwi.Strength.strong)
    )
    // TODO? x + width <= totalWidth
    // TODO? y + height <= totalHeight
  }
  // new kiwi.Variable([name])
  // new kiwi.Expression(ar) where ar has numbers, variables, expressions or tuples that will be multiplied
  // new kiwi.Constraint(expression, operator, [rhs], [strength])
  // solver.addConstraint(constraint)
  // solver.addEditVariable(variable, strength)
  // solver.suggestValue(variable, value)
  // solver.updateVariables()
  // Strength.required, Strength.strong, Strength.medium, Strength.weak

  // 1) Collect all ports
  // 2) Get all port pairs
  // 3) Determine grid cells of each port pair
  // 4) Filter to port pairs with horizontally adjacent grid cells TODO vertical
  // 5) Add weak constraint

  // 1) Find any connecting ports that span adjacent grid cells
  const allPorts = renderedChildrenIds.flatMap((childId) =>
    Object.entries(context.rendering[childId].ports).map(
      ([portName, portValue]) => ({
        childId,
        elmCompId: renderedChildIdToCompId[childId],
        portName,
        dx: portValue.x,
        dy: portValue.y,
        portId: portValue.connection,
        cgId: context.connections[portValue.connection],
      })
    )
  )
  // 2) Find all connection groups with exactly two ports connected
  // 3) Find grid delta between ports
  const pairedPorts = []
  for (let i = 0; i < allPorts.length - 1; i++) {
    for (let u = i + 1; u < allPorts.length; u++) {
      const [porti, portu] = [allPorts[i], allPorts[u]]
      if (porti.cgId === portu.cgId) {
        let elm1Positions = getPositionsFromMat(gridRep, porti.elmCompId)
        let elm2Positions = getPositionsFromMat(gridRep, portu.elmCompId)
        const [p1, p2] = findClosestManhattanPoints(
          elm1Positions,
          elm2Positions
        )
        const [gridDy, gridDx] = [p2[0] - p1[0], p2[1] - p1[1]]
        // Don't add ports that are diagonal on the grid to pairedPorts
        if (gridDy !== 0 && gridDx !== 0) continue
        pairedPorts.push({
          port1: porti,
          port2: portu,
          align: gridDx === 0 ? "vertical" : "horizontal",
        })
      }
    }
  }

  // This is useful for debugging constraint layout
  solver.updateVariables()
  const beforeVars = {}
  for (const [varName, solverVar] of Object.entries(solverVarMap)) {
    beforeVars[varName] = solverVar.value()
  }

  // 5) Add weak constraints for horizontal / vertical alignment
  for (const { port1, port2, align } of pairedPorts) {
    if (align === "horizontal") {
      solver.addConstraint(
        new kiwi.Constraint(
          solverVarMap[`${port1.childId}_y`].plus(port1.dy),
          kiwi.Operator.Eq,
          solverVarMap[`${port2.childId}_y`].plus(port2.dy),
          kiwi.Strength.medium
        )
      )
    } else {
      // TODO add constraint for vertical
    }
  }

  solver.updateVariables()

  // This is useful for debugging constraint layout
  const outputTable = []
  for (const [varName, solverVar] of Object.entries(solverVarMap)) {
    outputTable.push({
      varName,
      beforeVal: beforeVars[varName],
      afterVal: solverVar.value(),
    })
  }
  console.table(outputTable)

  // Move rendered elements (again)
  for (let childId of renderedChildrenIds) {
    moveRenderedElementTo(
      context,
      childId,
      solverVarMap[`${childId}_x`].value(),
      solverVarMap[`${childId}_y`].value()
    )
  }

  // TODO Recompute totalWidth, totalHeight

  context.rendering[id] = ({
    x: 0,
    y: 0,
    width: totalWidth,
    height: totalHeight,
    children: renderedChildrenIds,
  }: any)

  context._path.pop()
}
