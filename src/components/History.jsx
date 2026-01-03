import { formatValue } from '../utils/bitmath'

function History({ history, bitWidth, signed, inputBase, operand, operation, onEntryClick }) {
  const displayBase = inputBase === 2 ? 16 : inputBase
  const prefix = displayBase === 16 ? '0x' : ''

  const fmt = (value) => prefix + formatValue(value, displayBase, bitWidth, signed)

  const formatEntry = (entry) => {
    const a = fmt(entry.a)
    const result = fmt(entry.result)
    
    if (entry.b === null) {
      return `${entry.op}(${a}) = ${result}`
    }
    
    const b = fmt(entry.b)
    return `${a} ${entry.op} ${b} = ${result}`
  }

  if (operation && operand !== null) {
    return (
      <div className="history history-pending">
        {fmt(operand)} {operation}
      </div>
    )
  }

  if (history.length === 0) {
    return <div className="history history-empty">—</div>
  }

  const entry = history[history.length - 1]

  return (
    <div className="history">
      <button
        className="history-entry"
        onClick={() => onEntryClick(entry)}
      >
        {formatEntry(entry)}
      </button>
    </div>
  )
}

export default History
