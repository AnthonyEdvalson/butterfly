function Keypad({ onOperation, onEquals }) {
  const bitwiseOps = ['AND', 'OR', 'XOR', 'NOT']
  const shiftOps = ['<<', '>>', '>>>']
  const arithmeticOps = ['+', '-', '*', '/', '%']
  const actionOps = ['CLR', '±']

  return (
    <div className="keypad">
      <div className="keypad-row">
        {bitwiseOps.map(op => (
          <button key={op} className="keypad-btn op-bitwise" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
        {shiftOps.map(op => (
          <button key={op} className="keypad-btn op-shift" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
      </div>
      <div className="keypad-row">
        {arithmeticOps.map(op => (
          <button key={op} className="keypad-btn op-arithmetic" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
      </div>
      <div className="keypad-row">
        {actionOps.map(op => (
          <button key={op} className="keypad-btn op-action" onClick={() => onOperation(op)}>
            {op}
          </button>
        ))}
        <button className="keypad-btn op-equals" onClick={onEquals}>
          =
        </button>
      </div>
    </div>
  )
}

export default Keypad

