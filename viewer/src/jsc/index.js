// @flow

type RenderedElement = {
  x: number,
  y: number,
  width: number,
  height: number,
  paths: Array<{ stroke: string, strokeWidth: number, d: string }>,
  texts: Array<{
    x: number,
    y: number,
    color: string
  }>,
  ports: {
    [string]: {
      x: number,
      y: number,
      color: string
    }
  },
  children: Array<string>
}

type CreatedElement = {
  type: string | Function,
  props: Object
}

type Rendering = {
  [string]: RenderedElement
}

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

type RenderContext = {
  rendering: Rendering,
  _path: Array<string>,
  _x: number,
  _y: number,
  _width: number,
  _height: number,
  _primitiveCount: { [string]: number }
}

function renderPrimitive(
  context: RenderContext,
  element: CreatedElement
): RenderedElement {
  context._primitiveCount[element.type] = context._primitiveCount[element.type]
    ? context._primitiveCount[element.type] + 1
    : 1

  const id = element.props.id || "C" + context._primitiveCount[element.type]

  switch (element.type) {
    case "linear": {
      // Render children to determine size

      // Move children into linear position

      // const rendered = ({
      //   width: 0,
      //   height: 0,
      //   children: []
      // }: any)
      return
    }
    case "capacitor": {
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
            text: "C" + context._primitiveCount[element.type],
            color: "red"
          }
        ],
        children: []
      }
      return
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
      _x: 0,
      _y: 0,
      _width: 0,
      _height: 0,
      _primitiveCount: {}
    }: RenderContext)
    isRoot = true
  } else {
    /*:: context = ((context:any):RenderContext) */
    context._path.push(
      typeof element.type === "function" ? element.type.name : element.type
    )
  }
  /*::
  context = ((context:any): RenderContext)
  element = ((element:any): CreatedElement)
  */

  if (typeof element.type === "function") {
    render(context, element.type(element.props))
  } else {
    renderPrimitive(context, element)
  }

  context._path.pop()

  if (isRoot) {
  }

  return context.rendering
}

export default render