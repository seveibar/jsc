// @flow

import jsc, { createElement, render } from "../index.js"

test("layout with elements", () => {
  const elm = jsc(
    "layout",
    {
      A: jsc("capacitor"), // jsc("linear", null, jsc("resistor"), jsc("resistor")),
      B: jsc("capacitor"),
      C: jsc("capacitor", { rotate: true }),
    },
    `
    A - B
        |
        C
  `
  )
  const { rendering, connections } = render(elm)
  expect(Object.keys(rendering)).toContain("C1")
  expect(Object.keys(rendering)).toContain("C2")
  expect(Object.keys(rendering)).toContain("C3")
  expect(Object.keys(rendering)).toContain("La1")
  expect(connections).toEqual({
    C1_left: "cgid_C1_0",
    C1_right: "cgid_C1_1",
    C2_left: "cgid_C1_1",
    C2_right: "cgid_C2_1",
    C3_left: "cgid_C2_1",
    C3_right: "cgid_C3_1",
  })
})

test.skip("layout with area block with linear elements", () => {
  const elm = jsc(
    "layout",
    {
      A: jsc("capacitor"), // jsc("linear", null, jsc("resistor"), jsc("resistor")),
      B: jsc("capacitor"),
      C: jsc("capacitor", { rotate: true }),
    },
    `
    A - BBB
        BBB
        BBB
          |
          C
  `
  )
  const { rendering, connections } = render(elm)
  expect(Object.keys(rendering)).toContain("C1")
  expect(Object.keys(rendering)).toContain("C2")
  expect(Object.keys(rendering)).toContain("C3")
  expect(Object.keys(rendering)).toContain("La1")
  expect(connections).toEqual({
    C1_left: "cgid_C1_0",
    C1_right: "cgid_C1_1",
    C2_left: "cgid_C1_1",
    C2_right: "cgid_C2_1",
    C3_left: "cgid_C2_1",
    C3_right: "cgid_C3_1",
  })
})
