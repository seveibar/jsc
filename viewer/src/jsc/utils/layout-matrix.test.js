// @flow

import {
  convertBoxBugToDenseLetter,
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

  console.log(connections)
})

test.skip("should be able to convert box-style bug to dense letter", () => {
  convertBoxBugToDenseLetter(`
        --------
    A - |      | - C
        |  B   |
        |      | - D
        --------
  `)
})
