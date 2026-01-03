import { useRef } from 'react'
import { formatValue } from '../utils/bitmath'

function DisplayRow({ label, value, base, bitWidth, signed, isActive, onSelect }) {
  const valueRef = useRef(null)
  const groupSize = base === 2 ? 4 : base === 16 ? 2 : 0

  const formatWithSpaces = (str) => {
    if (groupSize === 0) return str
    return str.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(' ') || str
  }

  const rawValue = formatValue(value, base, bitWidth, signed)
  const formatted = formatWithSpaces(rawValue)

  const handleClick = () => {
    onSelect(base)
    if (valueRef.current) {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(valueRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  return (
    <div 
      className={`display-row ${isActive ? 'active' : 'faded'}`}
      onClick={handleClick}
    >
      <span className="display-label">{label}</span>
      <span className="display-value" ref={valueRef}>{formatted}</span>
    </div>
  )
}

function Display({ value, bitWidth, signed, inputBase, onInputBaseChange }) {
  return (
    <div className="display">
      <DisplayRow
        label="HEX"
        value={value}
        base={16}
        bitWidth={bitWidth}
        signed={signed}
        isActive={inputBase === 16}
        onSelect={onInputBaseChange}
      />
      <DisplayRow
        label="DEC"
        value={value}
        base={10}
        bitWidth={bitWidth}
        signed={signed}
        isActive={inputBase === 10}
        onSelect={onInputBaseChange}
      />
      <DisplayRow
        label="BIN"
        value={value}
        base={2}
        bitWidth={bitWidth}
        signed={signed}
        isActive={inputBase === 2}
        onSelect={onInputBaseChange}
      />
    </div>
  )
}

export default Display
