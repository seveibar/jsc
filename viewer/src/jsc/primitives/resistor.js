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
    width: 60,
    height: 30,
    paths: [
      {
        stroke: "red",
        strokeWidth: 1,
        d: "M 0 15 l 10 0 l 0 -6 l 20 0 l 0 12 l -20 0 l 0 -6 m 20 0 l 10 0"
      }
    ],
    ports: {
      left: {
        x: 0,
        y: 15,
        color: "blue"
      },
      right: {
        x: 40,
        y: 15,
        color: "blue"
      }
    },
    texts: [
      {
        x: 25,
        y: 8,
        text: id,
        color: "red"
      }
    ],
    children: []
  }
}
