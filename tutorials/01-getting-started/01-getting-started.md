# 01 - Getting Started

JSC, or Javascript Circuit, is a new way of drawing schematics inspired by the modularity, power, and
encapsulation of react. JSC will allow you to create powerful schematic diagrams
and convert them into circuits. The community modules of JSC allow you to build
designs based off the designs of others.

## 1.1 Javascript and JSC

JSC, like jsx, is javascript with embedded XML (in fact, JSC _is_ jsx, just with
a different "interpreter"). Let's begin by defining a simple schematic component.

```javascript
import jsc, { useConnections } from "jsc"

const SimpleComponent = () => {
  const [positive, negative, led_positive] = useConnections(3)

  return (
    <box>
      <source positive negative />
      <resistor left={positive} right={led_positive} />
      <led cathode={led_positive} anode={negative} />
    </box>
  )
}

export default SimpleComponent
```

Check it out:

What just happened? Let's break it down line by line:

---

```javascript
import jsc, { useConnections } from "jsc"
```

Here we're importing all the "basics". **The `jsc` module is always required**. The `useConnections` hook will allow us to build some new connections with this component.

---

```javascript
const SimpleComponent = () => {
  // ...
}
```

Here we're declaring a javascript function. **Every component is just a function**. We need to make this function return other components or null to be valid.

---

```javascript
const [positive, negative, led_positive] = useConnections(3)
```

Here we're saying we'll need 3 connections, one to represent the positive line from our power source, one to represent the negative line from our power source, and one to represent the connection to the cathode of the led.

---

```javascript
return <box>{/* ... */}</box>
```

Our `SimpleComponent` will return it's subcomponents in a `box`. A `box` is just a container. It is outlined on a schematic.

---

```javascript
<source positive negative />
<resistor left={positive} right={led_positive} />
<led cathode={led_positive} anode={negative} />
```

Here we're connecting together all the subcomponents using the connections we defined earlier. We do this by setting attributes on each subcomponent to the connection we'd like that port to connect to. `source` `resistor` and `led` are three built-in components.
