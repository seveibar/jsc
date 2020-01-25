export type RenderedElement = {
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

export type CreatedElement = {
  type: string | Function,
  props: Object
}

export type Rendering = {
  [string]: RenderedElement
}

export type RenderContext = {
  rendering: Rendering,
  _path: Array<string>,
  _x: number,
  _y: number,
  _width: number,
  _height: number,
  _primitiveCount: { [string]: number }
}
