// @flow

import type { CreatedElement } from "../types"
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

  We could also have the graph be explicitly defined as a function. This is
  a better representation for n to n connections.

  It's actually possible to create ambiguous connection graphs which is bad
  unless the resolution method is very obvious.

  Returns a function that solves for the connections within the medium
*/
type ConnectionInfo = {|
  componentIndex: number,
  exposed?: boolean,
  name: string
|}
export const useConnectionMedium = (
  isConnectedFn: (a: ConnectionInfo, b: ConnectionInfo) => boolean
) => {
  const context = useRenderContext()

  if (!context._mediums) context._mediums = {}
  const mediumPath = context._path.join(".")
  context._mediums[mediumPath] = {
    isConnectedFn,
    notExplicitlyConnected: [],
    connectionDefinitions: {},
    solved: false
  }

  return {
    solveMedium: () => {
      const {
        notExplicitlyConnected,
        connectionDefinitions
      } = context._mediums[mediumPath]
      const { connections } = context

      let changeMade = true,
        iters = 0
      while (changeMade && iters < 10) {
        changeMade = false
        iters++
        for (const a of notExplicitlyConnected) {
          for (const b of notExplicitlyConnected) {
            if (connections[a] === connections[b]) continue
            if (
              isConnectedFn(connectionDefinitions[a], connectionDefinitions[b])
            ) {
              connections[b] = connections[a]
              changeMade = true
            }
          }
        }
      }

      if (iters === 10) {
        throw new Error(
          `Solving medium took more than 10 iterations. Is isConnectedFn deterministic?`
        )
      }

      context._mediums[mediumPath].solved = true
    }
  }
}

export const getNextConnectionId = (context, id) => {
  const connIdMap = Object.values(context.connections || {}).reduce(
    (acc, id) => {
      acc[id] = true
      return acc
    },
    {}
  )
  for (let i = 0; ; i++) {
    if (!connIdMap[`${id}_${i}`]) {
      return `${id}_${i}`
    }
  }
}

type ConnectionId = string

export const useConnections = (
  id: string,
  props: Object,
  conns: {
    [connName: string]: {
      exposed?: boolean,
      aliases?: Array<string>
    }
  }
): { [connName: string]: ConnectionId } => {
  // if (!conns) return useNewConnections(props)
  const context = useRenderContext()

  const renderPath = context._path.join(".")

  const componentIndex =
    (context._renderPathElements[renderPath] || []).length - 1

  const medium = (context._mediums || {})[renderPath]
  // const mediumRenderedChildrenSoFar = context._renderPathElements[
  //   renderPath
  // ].filter(Boolean)
  // .map(
  //   elmId =>
  //     context.rendering[elmId] && { ...context.rendering[elmId], id: elmId }
  // )
  // .filter(Boolean)

  if (!context.connections) context.connections = {}

  // if (medium) {
  //   medium.connections[id] = {}
  //   medium.connectionDefinitions[id] = conns
  // }

  const ret = {}
  for (let connName in conns) {
    const { exposed = false } = conns[connName]
    if (props[connName]) {
      // TODO check aliases
      // ret[connName] = props[connName]
      ret[connName] = `${id}_${connName}`
      context.connections[`${id}_${connName}`] = props[connName]
    } else if (exposed && medium) {
      // const currentElmIndex = mediumRenderedChildrenSoFar.length + 1
      // TODO check if i'm connected to anything in the medium
      // iterate over all rendered components, see if I'm connected to it

      // Search medium for compatible connections
      context.connections[`${id}_${connName}`] = getNextConnectionId(
        context,
        id
      )
      medium.connectionDefinitions[`${id}_${connName}`] = {
        componentIndex,
        name: connName,
        ...conns[connName]
      }
      medium.notExplicitlyConnected.push(`${id}_${connName}`)
      ret[connName] = `${id}_${connName}`
      // for (let i = 0; i < mediumRenderedChildrenSoFar.length; i++) {
      //   if (medium.isConnectedFn(i, currentElmIndex)) {
      //     // check if the current element and the connecting element share any
      //     // connections
      //
      //   }
      // }

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
      // context._connectionPathElements[renderPath].push({
      //   connName,
      //   ...conns[connName]
      // })
    } else {
      context.connections[`${id}_${connName}`] = getNextConnectionId(
        context,
        id
      )
      ret[connName] = `${id}_${connName}`
    }
  }
  return ret
}

export default useConnections
