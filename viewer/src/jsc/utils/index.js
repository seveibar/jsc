// @flow

export function moveRenderedElement(
  context: RenderContext,
  elementId: string,
  x: number,
  y: number
) {
  const elm = context.rendering[elementId]
  const dx = x - elm.x
  const dy = y - elm.y
  elm.x = x
  elm.y = y
  for (const childId of context.rendering[elementId].children || []) {
    const childElm = context.rendering[elementId]
    moveRenderedElement(context, childId, childElm.x + dx, childElm.y + dy)
  }
}
