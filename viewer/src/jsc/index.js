// @flow

import type {
  RenderContext,
  RenderedElement,
  CreatedElement,
  Rendering
} from "./types"

import createLinearRenderedElement from "./primitives/linear.js"
import createResistorRenderedElement from "./primitives/resistor.js"
import createCapacitorRenderedElement from "./primitives/capacitor.js"
import createSideRenderedElement from "./primitives/side.js"
import createSurroundRenderedElement from "./primitives/surround.js"
import createBugRenderedElement from "./primitives/bug.js"
import createPaddingRenderedElement from "./primitives/padding.js"
import createLayoutRenderedElement from "./primitives/layout.js"

import { moveRenderedElementTo } from "./utils"
import { renderContext } from "./hooks/use-render-context.js"

export function createElement(
  type: string | Function,
  props?: Object = {},
  ...children: Array<any>
): CreatedElement {
  return {
    type,
    props: {
      ...props,
      children
    }
  }
}

type Connection = {}

export function useConnections(n: number): Array<Connection> {
  return []
}

const primitivePrefixes = {
  capacitor: "C",
  resistor: "R",
  linear: "Li",
  layout: "La",
  side: "Si",
  surround: "Su",
  bug: "B",
  padding: "P"
}

function renderPrimitive(
  context: RenderContext,
  element: CreatedElement
): RenderedElement {
  if (typeof element === "string") return

  context._primitiveCount[element.type] = context._primitiveCount[element.type]
    ? context._primitiveCount[element.type] + 1
    : 1

  const id =
    element.props.id ||
    primitivePrefixes[element.type] + context._primitiveCount[element.type]
  context._lastRenderedElementId = id

  if (context.rendering[id]) throw new Error(`Id conflict "${id}"`)

  context._renderPathElements[context._path.join(".")] = (
    context._renderPathElements[context._path.join(".")] || []
  ).concat([id])

  switch (element.type) {
    case "linear": {
      return createLinearRenderedElement(context, element, id)
    }
    case "capacitor": {
      return createCapacitorRenderedElement(context, element, id)
    }
    case "resistor": {
      return createResistorRenderedElement(context, element, id)
    }
    case "side": {
      return createSideRenderedElement(context, element, id)
    }
    case "surround": {
      return createSurroundRenderedElement(context, element, id)
    }
    case "bug": {
      return createBugRenderedElement(context, element, id)
    }
    case "padding": {
      return createPaddingRenderedElement(context, element, id)
    }
    case "layout": {
      return createLayoutRenderedElement(context, element, id)
    }
    default: {
      throw new Error(`Unknown Primitive: "${element.type}"`)
    }
  }
}

export function render(
  context: RenderContext | CreatedElement,
  element?: CreatedElement
): Rendering {
  let isRoot = false
  if (!element) {
    element = (context: any)
    context = ({
      _path: ["root"],
      rendering: {},
      _renderPathElements: {},
      _x: 0,
      _y: 0,
      _width: 0,
      _height: 0,
      _primitiveCount: {},
      _lastRenderedElementId: "root",
      _connections: {}
    }: RenderContext)
    isRoot = true
  }
  /*::
  context = ((context:any): RenderContext)
  element = ((element:any): CreatedElement)
  */

  if (isRoot) {
    renderContext.value = context
  }

  if (element.props.rotate === true && element.props.rotation === undefined) {
    element.props.rotation = 90
  }

  if (typeof element.type === "function") {
    render(context, element.type(element.props))
  } else {
    renderPrimitive(context, element)
  }

  if (isRoot) {
  }

  return context.rendering
}

export default createElement
