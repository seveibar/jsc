// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"

storiesOf("Bug", module)
  .add("Basic", () => {
    const elm = jsc("bug", {
      order: [1, 3, 2, 5, null, 4],
      ports: {},
      label: "ASD1041",
    })
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="B1" padding={50} />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Internal Labels", () => {
    const elm = jsc("bug", {
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
    })
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="B1" padding={50} />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
