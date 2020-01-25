// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"

storiesOf("Capacitor", module).add("Basic", () => (
  <Renderer
    data={{
      capacitor: {
        x: 0,
        y: 0,
        width: 45,
        height: 30,
        paths: [
          { stroke: "red", strokeWidth: 1, d: "M 0 15 l 12 0" },
          { stroke: "red", strokeWidth: 2, d: "M 12 0 l 0 30" },
          { stroke: "red", strokeWidth: 2, d: "M 18 0 l 0 30" },
          { stroke: "red", strokeWidth: 1, d: "M 18 15 l 12 0" }
        ],
        texts: [{ x: 25, y: 10, text: "C1" }]
      }
    }}
    rootDrawingId="capacitor"
  />
))
