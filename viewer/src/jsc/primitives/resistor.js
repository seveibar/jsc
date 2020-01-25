// @flow

import { RenderContext, RenderedElement } from "../types"

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  context.rendering[id] = {
    x: 0,
    y: 0,
    width: 45,
    height: 30,
    paths: [{ stroke: "red", strokeWidth: 1, d: "M 0 15 l 25 0" }],
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
}
