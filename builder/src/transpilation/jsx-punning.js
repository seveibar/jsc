// @flow weak

const jsx = require("@babel/plugin-syntax-jsx").default
const { types: t } = require("@babel/core")

module.exports = api => {
  const visitor = {
    JSXOpeningElement({ node }) {
      node.attributes = node.attributes.map(attribute => {
        if (attribute.value === null) {
          const name = attribute.name.name
          const id = t.jSXIdentifier(name)
          const expression = t.jSXExpressionContainer(t.identifier(name))
          const nextAttribute = t.jSXAttribute(id, expression)
          return nextAttribute
        } else {
          return attribute
        }
      })
    }
  }

  return {
    inherits: jsx,
    visitor
  }
}
