// @flow

import type { CreatedElement } from "../types"
import useRenderContext from "./use-render-context"
import range from "lodash/range"

// TODO remove, this is probably not the right approach
export const useNewConnections = (n: number | Array<string>) => {
  const context = useRenderContext()
  return range(n).map(() =>
    getNextConnectionId(context, context._lastRenderedElementId)
  )
  // const { connections, _connectionPrefixCounter } = context
  // let prefixes
  // if (typeof n === "number") {
  //   prefixes = []
  //   for (let i = 0; i < n; i++) {
  //     prefixes.push("C")
  //   }
  // } else {
  //   prefixes = n
  // }
  //
  // let returnAr = []
  // for (const prefix of prefixes) {
  //   const nextPrefixNumber = (_connectionPrefixCounter[prefix] || 0) + 1
  //   const connId = `${prefix}${nextPrefixNumber}`
  //   connections[connId] = { id: connId }
  //   _connectionPrefixCounter[prefix] = nextPrefixNumber
  //   returnAr.push(connId)
  // }
  // return returnAr
}

/*
  This is a layout, linear or box that gives child connections a way to connect

  Returns a function that solves for the connections within the medium
*/
type ConnectionInfo = {|
  componentIndex: number,
  exposed?: boolean,
  name: string,
  numConnected?: number,
  connName?: string,
|}
export const useConnectionMedium = ({
  id: mediumId,
  isConnectedFn = () => false,
  isExposedFn = () => false,
}: {
  id: string,
  isConnectedFn: (a: ConnectionInfo, b: ConnectionInfo) => boolean,
  isExposedFn: (a: ConnectionInfo) => boolean,
}) => {
  const context = useRenderContext()

  if (!context._mediums) context._mediums = {}
  const mediumPath = context._path.join(".")
  context._mediums[mediumPath] = {
    isConnectedFn,
    isExposedFn,
    notExplicitlyConnected: [],
    connectionDefinitions: {},
    solved: false,
  }

  return {
    solveMedium: () => {
      const {
        notExplicitlyConnected,
        connectionDefinitions,
      } = context._mediums[mediumPath]
      const { connections } = context

      // const childMediumConnections = []
      // // look for solved child mediums
      // for (const otherMediumPath in context._mediums) {
      //   if (otherMediumPath === mediumPath) continue
      //   if (!otherMediumPath.startsWith(mediumPath)) continue
      //   // context._mediums[otherMediumPath]
      //
      //   const childMedium = context._mediums[otherMediumPath]
      //
      //   // Add each non-conflicting connection to childMediumConnections
      //   // and connectionDefinitions, and derive new component index based
      //   // on medium position in rendered children
      //   const otherMediumComponentId = otherMediumPath.split(".").pop()
      //
      //
      //
      //   // childMediumConnections.push(...childMedium.exposed)
      //   console.log(
      //     mediumPath,
      //     otherMediumPath,
      //     componentIndex
      //   )
      //   // console.log(mediumPath, {
      //   //   otherMediumPath,
      //   //   otherMedium: context._mediums[otherMediumPath]
      //   // })
      // }

      const availableConnections = notExplicitlyConnected
      // .concat(
      //   childMediumConnections
      // )

      // SOLVE looking at children
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

      const parentMediumPath = context._path.slice(0, -1).join(".")
      const parentMedium = context._mediums[parentMediumPath]

      if (parentMedium) {
        for (const connName of notExplicitlyConnected) {
          const connId = connections[connName]
          const numConnections = Object.values(connections).reduce(
            (acc, cid) => acc + (cid === connId ? 1 : 0),
            0
          )
          const exposedConnObj = {
            ...connectionDefinitions[connName],
            numConnections,
          }
          console.log(
            "checking if is exposed",
            exposedConnObj,
            mediumPath,
            parentMediumPath,
            isExposedFn(exposedConnObj),
            connName,
            parentMedium.notExplicitlyConnected,
            !parentMedium.notExplicitlyConnected.includes(connName)
          )

          if (
            isExposedFn(exposedConnObj) &&
            !parentMedium.notExplicitlyConnected.includes(connName)
          ) {
            console.log(parentMediumPath, exposedConnObj)
            // exposedConnections[connName] = exposedConnObj
            parentMedium.connectionDefinitions[connName] = {
              ...exposedConnObj,
              componentIndex:
                (context._renderPathElements[parentMediumPath] || []).length -
                1,
            }
            parentMedium.notExplicitlyConnected.push(connName)
          }
        }
      }

      context._mediums[mediumPath].solved = true
    },
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
    if (!connIdMap[`cgid_${id}_${i}`]) {
      return `cgid_${id}_${i}`
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
      aliases?: Array<string>,
    },
  }
): { [connName: string]: ConnectionId } => {
  // if (!conns) return useNewConnections(props)
  const context = useRenderContext()

  const renderPath = context._path.join(".")

  const componentIndex =
    (context._renderPathElements[renderPath] || []).length - 1

  const medium = (context._mediums || {})[renderPath]

  if (!context.connections) context.connections = {}

  const ret = {}
  for (let connName in conns) {
    const { exposed = false } = conns[connName]
    if (props[connName]) {
      // TODO check aliases
      ret[connName] = `${id}_${connName}`
      context.connections[`${id}_${connName}`] = props[connName]
    } else if (exposed && medium) {
      context.connections[`${id}_${connName}`] = getNextConnectionId(
        context,
        id
      )
      medium.connectionDefinitions[`${id}_${connName}`] = {
        componentIndex,
        name: connName,
        ...conns[connName],
      }
      medium.notExplicitlyConnected.push(`${id}_${connName}`)
      ret[connName] = `${id}_${connName}`
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
