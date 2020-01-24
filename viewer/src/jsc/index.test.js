// @flow

import jsc, { createElement, render } from "./index.js"

test.skip("capacitor", () => {
  const rendering = jsc(createElement("capacitor", {}))
  expect(rendering.C1)
})

test.skip("resistor", () => {
  const rendering = jsc(createElement("resistor", {}))
  expect(rendering.R1)
})

test("linear", () => {
  const rendering = jsc(
    createElement(
      "linear",
      {},
      createElement("capacitor", {}),
      createElement("resistor", {})
    )
  )
  console.log(rendering)
  // expect(rendering.R1)
})
