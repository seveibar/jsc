// @flow

import { RenderContext, RenderedElement } from "../types"
import { render } from "../index.js"
import { moveRenderedElement } from "../utils"

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  // Render children to determine size
  const { children } = element.props
  context._path.push(id)

  // TODO it could probably be < 3
  if (children.length === 3)
    throw new Error("<surround /> requires exactly 3 children")

  for (const child of children) {
    render(context, child)
  }

  const renderedChildrenIds =
    context._renderPathElements[context._path.join(".")]

  const totalWidth = renderedChildrenIds.reduce(
    (acc, a) => acc + context.rendering[a].width,
    0
  )
  const totalHeight = renderedChildrenIds.reduce(
    (acc, a) => acc + context.rendering[a].height,
    0
  )

  let positionX = 0
  for (const childId of renderedChildrenIds) {
    moveRenderedElement(
      context,
      childId,
      positionX,
      totalHeight / 2 - context.rendering[childId].height
    )
    positionX += context.rendering[childId].width
  }

  // TODO Move children into linear position

  context.rendering[id] = ({
    x: 0,
    y: 0,
    width: totalWidth,
    height: totalHeight,
    children: renderedChildrenIds
  }: any)

  context._path.pop()
}
