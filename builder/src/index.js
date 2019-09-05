const babel = require("@babel/core")

babel.transformSync(`const a = <div>asd</div>`, {
  plugins: []
})
