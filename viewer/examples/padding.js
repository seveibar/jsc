// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Padding", module).add("Basic", () => {
  const elm = jsc("padding", { amount: 50 }, jsc("capacitor"))
  return (
    <>
      <Renderer data={render(elm)} rootDrawingId="P1" />
      <pre>{JSON.stringify(elm, null, "  ")}</pre>
      <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
    </>
  )
})
