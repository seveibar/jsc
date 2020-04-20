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
  const { left, right } = useConnections(element.props, {
    left: {
      accessibleToParent: true,
      aliases: []
    },
    right: {
      accessibleToParent: true,
      aliases: []
    }
  })
  context.rendering[id] = {
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
    ports: {
      left: {
        x: 0,
        y: 15,
        color: "blue"
      },
      right: {
        x: 30,
        y: 15,
        color: "blue"
      }
    },
    texts: [
      {
        x: 25,
        y: 10,
        text: id,
        color: "red"
      }
    ],
    children: []
  }
  if (rotation !== 0)
    rotateRenderedElement(context, id, rotation, { skipText: true })
}
