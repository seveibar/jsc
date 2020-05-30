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

  return mat
}

export const getPosFromMat = (mat, node) => {
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

export const getConnectionsFromMat = (mat, node) => {
  const nodePos = getPosFromMat(mat, node)
  if (!nodePos) return []
  const connections = []
  const traversed = {}
  traversed[nodePos] = true

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
        connections.push(char)
      }
    }
  }
  traverse(nodePos)
  return connections
}
