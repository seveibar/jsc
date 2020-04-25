// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Side", module).add("Basic", () => {
  const elm = jsc("side", null, jsc("capacitor"), jsc("capacitor"))
  return (
    <>
      <Renderer data={render(elm)} rootDrawingId="Si1" />
      <pre>{JSON.stringify(elm, null, "  ")}</pre>
      <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
    </>
  )
})
