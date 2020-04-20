// @flow

import { RenderContext, RenderedElement } from "../types"
import { render } from "../index.js"
import { moveRenderedElementTo } from "../utils"

export default (
  context: RenderContext,
  element: RenderedElement,
  id: string
) => {
  // Render children to determine size
  const { children, amount } = element.props
  if (!amount) throw new Error(`"amount" of padding is required`)
  if (children.length !== 1)
    throw new Error(`<padding /> can only have one child`)

  context._path.push(id)

  render(context, children[0])

  const renderedChildId =
    context._renderPathElements[context._path.join(".")][0]

  moveRenderedElementTo(context, renderedChildId, amount / 2, amount / 2)

  // TODO Move children into linear position
  const renderedChild = context.rendering[renderedChildId]

  context.rendering[id] = ({
    x: 0,
    y: 0,
    width: renderedChild.width + amount,
    height: renderedChild.height + amount,
    children: [renderedChildId]
  }: any)

  context._path.pop()
}
