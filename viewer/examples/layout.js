// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Layout", module)
  .add("Basic", () => {
    const elm = jsc(
      "layout",
      {
        A: jsc("capacitor"), // jsc("linear", null, jsc("resistor"), jsc("resistor")),
        B: jsc("capacitor"),
        C: jsc("capacitor", { rotate: true })
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
        C: jsc("capacitor", { rotate: true })
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
