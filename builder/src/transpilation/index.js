const babel = require("@babel/core")

const transpile = code => {
  return babel.transformSync(code, {
    plugins: [
      require("@babel/plugin-syntax-jsx"),
      require("./jsx-punning.js"),
      [
        require("@babel/plugin-transform-react-jsx"),
        {
          pragma: "jsc"
        }
      ]
    ]
  }).code
}

module.exports = { transpile }
