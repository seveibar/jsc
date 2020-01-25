// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Resistor", module).add("Basic", () => {
  const elm = jsc("resistor")
  return (
    <>
      <pre>{JSON.stringify(elm, null, "  ")}</pre>
      <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      <Renderer data={render(elm)} rootDrawingId="R1" />
    </>
  )
})
