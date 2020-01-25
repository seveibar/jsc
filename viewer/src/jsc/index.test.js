// @flow

import jsc, { createElement, render } from "./index.js"

test("capacitor", () => {
  const rendering = jsc(createElement("capacitor", {}))
  expect(rendering.C1)
})

test("resistor", () => {
  const rendering = jsc(createElement("resistor", {}))
  expect(rendering.R1)
})

test("linear", () => {
  const rendering = jsc(
    createElement(
      "linear",
      {},
      createElement("resistor", {}),
      createElement("resistor", {})
    )
  )
  expect(rendering.R1)
  expect(rendering.R2)
  expect(rendering.L1)
})
