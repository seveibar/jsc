// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Ground (gnd)", module).add("Basic", () => {
  const elm = jsc("gnd")
  return (
    <>
      <Renderer data={render(elm)} rootDrawingId="Gnd1" />
      <pre>{JSON.stringify(elm, null, "  ")}</pre>
      <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
    </>
  )
})
