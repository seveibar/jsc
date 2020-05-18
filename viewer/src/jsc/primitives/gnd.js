// @flow

import { useConnections } from "../hooks/use-connections.js"
import { RenderContext, RenderedElement } from "../types"
import { rotateRenderedElement } from "../utils"

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  const { rotation = 0 } = element.props
  const { gnd } = useConnections(id, element.props, {
    gnd: {
      exposed: true,
      aliases: ["gnd", "dgnd"],
    },
  })

  context.rendering[id] = {
    x: 0,
    y: 0,
    width: 60,
    height: 30,
    paths: [
      { stroke: "red", strokeWidth: 1, d: "M 0 15 l 18 0" },
      { stroke: "red", strokeWidth: 2, d: "M 18 0 l 0 30" },
    ],
    ports: {
      gnd: {
        x: 0,
        y: 15,
        color: "blue",
        connection: gnd,
      },
    },
    texts: [
      {
        x: 25,
        y: 10,
        text: id,
        color: "red",
      },
    ],
    children: [],
  }
  if (rotation !== 0)
    rotateRenderedElement(context, id, rotation, { skipText: true })
}
