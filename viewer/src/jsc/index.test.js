// @flow

import jsc, { createElement, render } from "./index.js"

test("basic1", () => {
  // console.log(createElement("capacitor", {}))
  console.log(jsc(createElement("capacitor", {})))
})
