// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"
import { useNewConnections } from "../src/jsc/hooks/use-connections.js"

storiesOf("Layout", module)
  .add("Basic", () => {
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
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Corner", () => {
    const elm = jsc(
      "layout",
      {
        A: jsc("linear", null, jsc("resistor"), jsc("resistor")),
        B: jsc("capacitor", { rotate: true }),
        C: jsc("capacitor", { rotate: true }),
      },
      `
    A ─ ┐
        B
        |
        C
  `
    )
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Bug 1", () => {
    const Component = () => {
      const [a, b] = useNewConnections(2)
      return jsc(
        "layout",
        {
          A: jsc("resistor", { right: a }),
          B: jsc("bug", {
            "1": a,
            "5": b,
            order: [1, 3, 2, 5, null, 4],
            ports: {
              "1": {
                label: "IN",
              },
              "3": {
                label: "EN",
              },
              "2": {
                label: "GND",
              },
              "5": {
                label: "OUT",
              },
              "4": {
                label: "NC/FB",
              },
            },
            label: "ASD1041",
          }),
          C: jsc("capacitor", { left: b }),
        },
        `
    A ─ B - C
  `
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Bug 2", () => {
    const Component = () => {
      const [a, b, c] = useNewConnections(3)
      return jsc(
        "layout",
        {
          A: jsc("resistor", { right: a }),
          B: jsc("bug", {
            "1": a,
            "5": b,
            "4": c,
            order: [1, 3, 2, 5, null, 4],
            ports: {
              "1": {
                label: "IN",
              },
              "3": {
                label: "EN",
              },
              "2": {
                label: "GND",
              },
              "5": {
                label: "OUT",
              },
              "4": {
                label: "NC/FB",
              },
            },
            label: "ASD1041",
          }),
          C: jsc("capacitor", { left: b }),
          D: jsc("capacitor", { left: c }),
        },
        `
    A ─ BBB - C
        BBB
        BBB - D
  `
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
