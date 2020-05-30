// @flow weak

export const isWhitespace = (s) => !s || /\s/.test(s)
export const isNode = (s) => /[a-zA-Z0-9]/.test(s)
export const isConnector = (s) => !isWhitespace(s) && !isNode(s)

export const convertBoxBugToDenseLetter = (layoutString) => {}

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
