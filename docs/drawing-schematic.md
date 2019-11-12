# Drawing A Schematic Compilation Process

## 1 Drawings

Each component is turned into a drawing. This is the first stage.

```javascript
// drawing
{
  "x": 0,
  "y": 0,
  "width": 0,
  "height": 0,
  "ports": {
    "left": { "x": 0, "y": 0 },
    "right": { "x": 10, "y": 0 },
  },
  "lines": [],
  "componentName": "Resistor1",
  "children": ["drawingid2", "drawingid3"]
}
```

## 2 Connections

After all the drawings are placed. Connections are drawn by the global connection drawer.

```javascript
// connection map
{
  Connection1: {
    connectsTo: [{ drawingId: "drawingid1", portId: "port2" }]
  }
}
```

<!-- This was the old spec, I don't see how it's better... -->

<!-- ```javascript
// connection
{
  "connectionName": "Connection1",
  "connectsTo": [{ drawingId: "", portId: "" }]
}
```
 -->

# Alternative Drawing Format

```javascript
{
  "drawingid1": {
    "x": 0,
    "y": 0,
    "width": 0,
    "height": 0,
    "ports": {
      "left": { "x": 0, "y": 0 },
      "right": { "x": 10, "y": 0 },
    },
    paths: [],
    texts: [],
    "children": ["drawingid2", "drawingid3"],

    "componentName": "Resistor1",
    // alternately, "connectionName"
  },
  // ...
}
```
