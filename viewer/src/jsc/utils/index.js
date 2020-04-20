// @flow

import type { RenderContext } from "../types"

export function moveRenderedElementTo(
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
    const childElm = context.rendering[childId]
    moveRenderedElementTo(context, childId, childElm.x + dx, childElm.y + dy)
  }
}

const swapXYsInSVGPath = d => {
  let mode = null,
    nums = []
  let newD = []
  for (let i = 0; i < d.length; i++) {
    if (/\s/.test(d[i])) continue
    if (/[MmLl]/.test(d[i])) {
      mode = d[i]
      nums = []
      newD.push(mode)
      continue
    }
    let numString = d.slice(i).split(" ")[0]
    i += numString.length - 1
    nums.push(parseFloat(numString))
    if (nums.length === 2) {
      newD.push(nums[1])
      newD.push(nums[0])
    }
  }
  console.log(d, newD.join(" "))
  return newD.join(" ")
}

export function rotateRenderedElement(
  context: RenderContext,
  elementId: string,
  degrees: number,
  { skipText }: { skipText?: boolean } = {}
) {
  let rotations = degrees / 90
  if (rotations !== Math.round(rotations))
    throw new Error(
      `Can only rotate by degrees divisible by 90 degrees (given ${degrees})`
    )
  while (rotations < 0) {
    rotations += 4
  }

  for (; rotations > 0; rotations--) {
    const elm = context.rendering[elementId]
    const { paths, ports, texts } = elm
    if (paths) {
      for (const path of paths) {
        path.d = swapXYsInSVGPath(path.d)
      }
    }
    if (ports) {
      for (const portName in ports) {
        const port = ports[portName]
        ;[port.x, port.y] = [port.y, port.x]
      }
    }
    if (!skipText && texts) {
      for (const text of texts) {
        ;[text.x, text.y] = [text.y, text.x]
      }
    }
  }
}
