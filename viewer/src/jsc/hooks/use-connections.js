// @flow

import useRenderContext from "./use-render-context"

// TODO remove, this is probably not the right approach
export const useNewConnections = (n: number | Array<string>) => {
  const context = useRenderContext()
  const { connections, _connectionPrefixCounter } = context
  let prefixes
  if (typeof n === "number") {
    prefixes = []
    for (let i = 0; i < n; i++) {
      prefixes.push("C")
    }
  } else {
    prefixes = n
  }

  let returnAr = []
  for (const prefix of prefixes) {
    const nextPrefixNumber = (_connectionPrefixCounter[prefix] || 0) + 1
    const connId = `${prefix}${nextPrefixNumber}`
    connections[connId] = { id: connId }
    _connectionPrefixCounter[prefix] = nextPrefixNumber
    returnAr.push(connId)
  }
  return returnAr
}

/*
  This is a layout, linear or box that gives child connections a way to connect

  the connectionGraph is specified using render order. To express a linear
  component with 3 children, you would write...
  useConnectionMedium([[1],[0,2],[1]])

  It's actually possible to create ambiguous connection graphs which is bad
  unless the resolution method is very obvious.
*/
export const useConnectionMedium = (connectionGraph: Array<number>) => {
  const context = useRenderContext()
}

export const useConnections = (
  props: Object,
  conns: {
    [connName: string]: {
      accessibleToParent?: boolean,
      aliases?: Array<string>
    }
  }
) => {
  // if (!conns) return useNewConnections(props)
  const context = useRenderContext()

  const renderPath = context._path.join(".")
  if (!context._connectionPathElements) context._connectionPathElements = {}

  const elemId = context._lastRenderedElementId
  // if (!context._connectionPathElements[renderPath])
  //   context._connectionPathElements[renderPath] = []
  // if (!context._connectableComponents[

  const ret = {}
  for (let connName in conns) {
    const { accessibleToParent } = conns[connName]
    if (props[connName]) {
      // TODO check aliases
      ret[connName] = props[connName]
    } else if (accessibleToParent) {
      /*
       Okay, a little bedtime note:
       So we're collecting all the connections together that belong to a parent,
       this is good. But there's much more to do:

       Think about the linear case. You can't just connect to ANY connection in
       the parent. You can only connect to adjacent elements. Generalizing
       further, you could construct a relationship table (or graph) that shows
       what elements can connect to which other elements. The parent should
       probably explicitly initialize this with a hook or context. The idea is
       the parent, be it linear or layout or box, would determine who can connect
       to who. For a box, anybody can connect to anybody. For linear, adjacent
       elements. For layout, anything with lines connecting them.
      */

      // Instead of tracking all the 'parent accessible' connections, just
      // search for a compatible connection in the parent. If not found,
      // create an "empty" connection so that the next useConnection can search
      // for the created connection
      context._connectionPathElements[renderPath].push({
        connName,
        ...conns[connName]
      })
    }
  }
  return ret
}

// export default useConnections
