// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"
import { useNewConnections } from "../src/jsc/hooks/use-connections.js"

storiesOf("useConnections", module).add("Basic", () => {
  const Component = () => {
    const [a] = useNewConnections(1)
    console.log({ a })
    return jsc(
      "linear",
      null,
      jsc("resistor", {
        left: a,
      }),
      jsc("capacitor", {
        right: a,
        rotate: true,
      })
    )
  }
  const elm = jsc(Component)
  return (
    <div>
      <Renderer data={render(elm)} rootDrawingId="Li1" />
      <pre>{JSON.stringify(elm, null, "  ")}</pre>
      <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
    </div>
  )
})
