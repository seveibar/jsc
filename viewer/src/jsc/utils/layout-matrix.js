// @flow weak

import cloneDeep from "lodash/cloneDeep"

export const isWhitespace = (s) => !s || /\s/.test(s)
export const isNode = (s) => /[a-zA-Z0-9]/.test(s)
export const isConnector = (s) => !isWhitespace(s) && !isNode(s)

/**
Converts Box Style:
    --------
A - |      | - C
    |  B   |
    |      | - D
    --------
Into Dense Letter:
    BBBBBBBB
A - BBBBBBBB - C
    BBBBBBBB
    BBBBBBBB - D
    BBBBBBBB
**/
export const convertBoxStyleToDenseLetter = (grid) => {
  // 1) find all horizontal continuous lines, note the position and width
  const horizontalContLines = []
  for (let rowi = 0; rowi < grid.length; rowi++) {
    const row = grid[rowi]
    let currentLineStart = null
    let currentLineWidth = 0
    for (let coli = 0; coli < row.length; coli++) {
      if (isConnector(row[coli])) {
        if (currentLineStart === null) {
          currentLineStart = coli
          currentLineWidth = 1
        } else {
          currentLineWidth += 1
        }
      } else {
        // Width must be greater than 2
        if (currentLineWidth > 2) {
          horizontalContLines.push({
            rowi,
            coli: currentLineStart,
            width: currentLineWidth,
          })
        }
        currentLineWidth = 0
        currentLineStart = null
      }
    }
  }
  // 2) Filter to those with a matching horizontal line with vertical connecting
  //    lines, call the pair of horizontal lines matching a "box"
  let connectionBoxes = []
  for (let i = 0; i < horizontalContLines.length; i++) {
    // Find next possible pair
    let matchingLine = null
    for (let u = i + 1; u < horizontalContLines.length; u++) {
      const [li, lu] = [horizontalContLines[i], horizontalContLines[u]]
      if (
        li.width === lu.width &&
        li.coli == lu.coli &&
        lu.rowi > li.rowi + 2
      ) {
        // Check if vertical line exists
        let verticalLineExists = true
        for (let k = i + 1; k < u; k++) {
          if (
            !isConnector(grid[li.coli][k]) ||
            !isConnector(grid[li.coli + li.width][k])
          ) {
            verticalLineExists = false
            break
          }
        }
        if (verticalLineExists) {
          connectionBoxes.push({
            rowi: li.rowi,
            coli: li.coli,
            width: li.width,
            height: lu.rowi - li.rowi + 1,
            node: null,
          })
        }
      }
    }
  }
  // 3) Explore inside, make sure it contains exactly one Node
  for (const box of connectionBoxes) {
    for (
      let rowi = box.rowi + 1;
      rowi < box.rowi + box.height - 1 && !box.invalid;
      rowi++
    ) {
      for (
        let coli = box.coli + 1;
        coli < box.coli + box.width - 1 && !box.invalid;
        coli++
      ) {
        if (isConnector(grid[rowi][coli])) {
          box.invalidReason = `no inside connectors ${rowi}, ${coli}`
          box.invalid = true
          break
        }
        if (isNode(grid[rowi][coli])) {
          if (box.node) {
            box.invalidReason = "only one node per box"
            box.invalid = true
            break
          }
          box.node = grid[rowi][coli]
        }
      }
    }
    if (!box.node) box.invalid = true
  }
  connectionBoxes = connectionBoxes.filter((b) => !b.invalid)

  // 4) Fill boxes with the contained node
  const newGrid = cloneDeep(grid)
  for (const box of connectionBoxes) {
    for (let rowi = box.rowi; rowi < box.rowi + box.height; rowi++) {
      for (let coli = box.coli; coli < box.coli + box.width; coli++) {
        newGrid[rowi][coli] = box.node
      }
    }
  }

  return newGrid
}

export const getGridRepresentation = (layoutString) =>
  trimMat(layoutString.split("\n").map((l) => l.split("")))

export const trimMat = (mat) => {
  const initialTotalColumns = Math.max(...mat.map((r) => r.length))
  for (let ci = initialTotalColumns - 1; ci >= 0; ci--) {
    if (mat.every((r) => isWhitespace(r[ci]))) {
      mat.forEach((r) => r.splice(ci, 1))
    }
  }

  for (let ri = mat.length - 1; ri >= 0; ri--) {
    if (mat[ri].every(isWhitespace)) {
      mat.splice(ri, 1)
    }
  }

  // Make sure every row is the same length
  const longestNumberOfColumns = Math.max(...mat.map((r) => r.length))
  for (const row of mat) {
    while (row.length < longestNumberOfColumns) row.push(" ")
  }

  return mat
}

export const getPositionsFromMat = (mat, node) => {
  let nodePositions = []
  for (let i = 0; i < mat.length; i++) {
    for (let u = 0; u < mat[0].length; u++) {
      if (mat[i][u] === node) {
        nodePositions.push([i, u])
      }
    }
  }
  return nodePositions
}

export const getConnectionsFromMat = (mat, node) => {
  const nodePositions = getPositionsFromMat(mat, node)
  if (nodePositions.length === 0) return []
  const connections = new Set()
  const traversed = {}

  const traverse = (pos) => {
    const surroundings = [
      [pos[0] - 1, pos[1]],
      [pos[0] + 1, pos[1]],
      [pos[0], pos[1] - 1],
      [pos[0], pos[1] + 1],
    ].filter(([r, c]) => {
      if (r < 0 || r >= mat.length) return false
      if (c < 0 || c >= mat[0].length) return false
      if (traversed[[r, c]]) return false
      return true
    })
    for (const spos of surroundings) {
      traversed[spos] = true
      const char = mat[spos[0]][spos[1]]
      if (isConnector(char)) {
        traverse(spos)
      } else if (isNode(char)) {
        connections.add(char)
      }
    }
  }

  for (const nodePos of nodePositions) {
    traversed[nodePos] = true
    traverse(nodePos)
  }

  // Shouldn't return self as connection
  connections.delete(node)

  return Array.from(connections)
}
