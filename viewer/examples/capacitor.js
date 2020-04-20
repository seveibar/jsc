// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Capacitor", module)
  .add("Basic", () => {
    const elm = jsc("capacitor")
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="C1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Rotated 90 degrees", () => {
    const elm = jsc("capacitor", { rotation: 90 })
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="C1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
