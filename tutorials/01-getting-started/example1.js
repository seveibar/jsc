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
