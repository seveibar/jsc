// @flow

import {
  convertBoxStyleToDenseLetter,
  getGridRepresentation,
  getConnectionsFromMat,
} from "./layout-matrix"

test("should be able to interpret dense letter syntax", () => {
  const denseLetterLayout = `
    A - BB
        BB - C
  `
  const grid = getGridRepresentation(denseLetterLayout)

  const connections = getConnectionsFromMat(grid, "B")

  expect(connections).toContain("A")
  expect(connections).toContain("C")
  expect(connections).not.toContain("B")
})

test("should be able to convert box-style bug to dense letter", () => {
  expect(
    convertBoxStyleToDenseLetter(
      getGridRepresentation(`
        --------
    A - |      | - C
        |  B   |
        |      | - D
        --------
  `)
    )
  ).toEqual(
    getGridRepresentation(`
    BBBBBBBB
A - BBBBBBBB - C
    BBBBBBBB
    BBBBBBBB - D
    BBBBBBBB
`)
  )
})
