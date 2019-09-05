import test from "ava"
import { transpile } from "../src"

test("simple jsx compilation", t => {
  t.assert(
    transpile(
      `
import jsc from "jsc"

const SimpleComponent = () => (
  <box label="party time"/>
)

export default SimpleComponent
      `.trim()
    ) ===
      `
import jsc from "jsc";

const SimpleComponent = () => jsc("box", {
  label: "party time"
});

export default SimpleComponent;
    `.trim()
  )
})
