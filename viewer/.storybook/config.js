import { configure } from "@storybook/react"

function loadStories() {
  const importAll = r => r.keys().map(r)
  importAll(require.context("../examples", true, /\.js$/))
}

configure(loadStories, module)
