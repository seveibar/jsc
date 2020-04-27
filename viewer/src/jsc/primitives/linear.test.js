// @flow

import jsc, { createElement, render } from "../index.js"

test.skip("linear", () => {
  const { rendering } = render(jsc("linear", null))
  expect(rendering.Li1).toBeTruthy()
})

test("linear with elements", () => {
  const { rendering } = render(
    jsc("linear", {}, jsc("capacitor"), jsc("capacitor"))
  )
  expect(rendering.Li1).toBeTruthy()
  expect(rendering.C1).toBeTruthy()
  expect(rendering.C2).toBeTruthy()
  expect(rendering.C2.x).toBe(45)
  expect(rendering.C2.width).toBe(45)
})

test("nested linears", () => {
  const { rendering } = render(
    jsc(
      "linear",
      null,
      jsc("linear", null, jsc("capacitor")),
      jsc("linear", null, jsc("capacitor"))
    )
  )
})
