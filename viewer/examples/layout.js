// @flow

import React from "react"

import Renderer from "../src/Renderer"
import { storiesOf } from "@storybook/react"
import jsc, { render } from "../src/jsc/index.js"
import { useNewConnections } from "../src/jsc/hooks/use-connections.js"

storiesOf("Layout", module)
  .add("Basic", () => {
    const elm = jsc(
      "layout",
      {
        A: jsc("capacitor"),
        B: jsc("capacitor"),
        C: jsc("capacitor", { rotate: true }),
      },
      `
    A - B
        |
        C
  `
    )
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Implied Rotation (support?)", () => {
    const elm = jsc(
      "layout",
      {
        A: jsc("capacitor"),
        B: jsc("capacitor"),
        C: jsc("capacitor"),
      },
      `
    A - B
        |
        C
  `
    )
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Corner", () => {
    const elm = jsc(
      "layout",
      {
        A: jsc("linear", null, jsc("resistor"), jsc("resistor")),
        B: jsc("capacitor", { rotate: true }),
        C: jsc("capacitor", { rotate: true }),
      },
      `
    A ─ ┐
        B
        |
        C
  `
    )
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Bug 1", () => {
    const Component = () => {
      const [a, b] = useNewConnections(2)
      return jsc(
        "layout",
        {
          A: jsc("resistor", { right: a }),
          B: jsc("bug", {
            "1": a,
            "5": b,
            order: [1, 3, 2, 5, null, 4],
            ports: {
              "1": {
                label: "IN",
              },
              "3": {
                label: "EN",
              },
              "2": {
                label: "GND",
              },
              "5": {
                label: "OUT",
              },
              "4": {
                label: "NC/FB",
              },
            },
            label: "ASD1041",
          }),
          C: jsc("capacitor", { left: b }),
        },
        `
    A ─ B - C
  `
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Bug 2", () => {
    const Component = () => {
      const [a, b, c] = useNewConnections(3)
      return jsc(
        "layout",
        {
          A: jsc("resistor", { right: a }),
          B: jsc("bug", {
            "1": a,
            "5": b,
            "4": c,
            order: [1, 3, 2, 5, null, 4],
            ports: {
              "1": {
                label: "IN",
              },
              "3": {
                label: "EN",
              },
              "2": {
                label: "GND",
              },
              "5": {
                label: "OUT",
              },
              "4": {
                label: "NC/FB",
              },
            },
            label: "ASD1041",
          }),
          C: jsc("capacitor", { left: b }),
          D: jsc("capacitor", { left: c, rotate: true }),
        },
        `
    A ─ BBB - C
        BBB
        BBB - D
  `
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Bug 3", () => {
    const Component = () => {
      const [a, b, c, d, e] = useNewConnections(5)
      return jsc(
        "layout",
        {
          A: jsc("resistor", { right: a }),
          B: jsc("bug", {
            "1": a,
            "5": b,
            "4": c,
            "2": d,
            order: [1, 3, 2, 5, null, 4],
            ports: {
              "1": {
                label: "IN",
              },
              "3": {
                label: "EN",
              },
              "2": {
                label: "GND",
              },
              "5": {
                label: "OUT",
              },
              "4": {
                label: "NC/FB",
              },
            },
            label: "ASD1041",
          }),
          C: jsc("capacitor", { left: b }),
          D: jsc("capacitor", { left: c, right: e, rotate: true }),
          E: jsc("resistor", { left: d, right: e }),
        },
        `
    A---BBB---C
        BBB
    ----BBB---D----
    |             |
    -----E---------
  `
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  /*
  export const MyCircuit = () => {
    const [a,b,c,d,e] = useNewConnections(5)
    return (
      <layout
        A={<resistor right={a} />}
        B={
          <bug
            1={a}
            5={b}
            4={c}
            2={d}
            order={[1,3,2,5,null,4]}
            ports={{
              "1": { label: "IN" },
              "3": { label: "EN" },
              "2": { label: "GND" },
              "5": { label: "OUT" },
              "4": { label: "NC/FB" }
              },
            }}
            label="ASD1041"
          />
        }
        C={<capacitor left={b} />}
        D={<capacitor left={c} right={e} rotate />}
        E={<resistor left={d} right={e}  />}
      >
        A---BBB---C
            BBB
        ----BBB---D----
        |             |
        -----E---------
      </layout>
    )
  }
    

  */
  .add(
    "Block area linear elements with implicit connections (support?)",
    () => {
      const Component = () => {
        return jsc(
          "layout",
          {
            A: jsc("capacitor"), // jsc("linear", null, jsc("resistor"), jsc("resistor")),
            B: jsc("capacitor"),
            C: jsc("capacitor"),
          },
          `
      A - BBB
          BBB
          BBB
            |
            C
    `
        )
      }
      const elm = jsc(Component)
      return (
        <>
          <Renderer data={render(elm)} rootDrawingId="La1" />
          <pre>{JSON.stringify(elm, null, "  ")}</pre>
          <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
        </>
      )
    }
  )
  .add("Nested ports should align", () => {
    const Component = () => {
      const [a, b] = useNewConnections(2)
      return jsc(
        "layout",
        {
          A: jsc("bug", {
            "1": a,
            "2": b,
            order: [null, null, 1, 2],
            ports: {
              "1": {
                label: "1",
              },
              "2": {
                label: "2",
              },
            },
            label: "ASD1041",
          }),
          B: jsc(
            "linear",
            {},
            jsc("capacitor", { left: a }),
            jsc("capacitor", { right: b })
          ),
        },
        `
          AAA----|
          AAA    B
          AAA----|`
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
  .add("Overlapping if not pushed", () => {
    const Component = () => {
      const [a, b] = useNewConnections(2)
      return jsc(
        "layout",
        {
          A: jsc("bug", {
            "1": a,
            "2": b,
            order: [null, null, 1, 2],
            ports: {
              "1": {
                label: "1",
              },
              "2": {
                label: "2",
              },
            },
            label: "ASD1041",
          }),
          B: jsc(
            "linear",
            {},
            jsc("capacitor", { left: a }),
            jsc("capacitor", { right: b })
          ),
        },
        `
          AAA----|
          AAA    B
          AAA----|`
      )
    }
    const elm = jsc(Component)
    return (
      <>
        <Renderer data={render(elm)} rootDrawingId="La1" />
        <pre>{JSON.stringify(elm, null, "  ")}</pre>
        <pre>{JSON.stringify(render(elm), null, "  ")}</pre>
      </>
    )
  })
