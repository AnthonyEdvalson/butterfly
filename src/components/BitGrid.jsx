import { useRef, useEffect } from 'react'
import { toggleBit, getBit, setBit } from '../utils/bitmath'

function BitGrid({ value, bitWidth, signed, onValueChange }) {
  const dragState = useRef({ isDragging: false, dragValue: null })

  useEffect(() => {
    const handleMouseUp = () => {
      dragState.current.isDragging = false
      dragState.current.dragValue = null
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseDown = (bitIndex) => {
    const newValue = toggleBit(value, bitIndex, bitWidth)
    const newBitValue = getBit(newValue, bitIndex)
    dragState.current.isDragging = true
    dragState.current.dragValue = newBitValue
    onValueChange(newValue)
  }

  const handleMouseEnter = (bitIndex) => {
    if (dragState.current.isDragging && dragState.current.dragValue !== null) {
      const currentBit = getBit(value, bitIndex)
      if (currentBit !== dragState.current.dragValue) {
        const newValue = setBit(value, bitIndex, dragState.current.dragValue, bitWidth)
        onValueChange(newValue)
      }
    }
  }

  const bits = []
  for (let i = bitWidth - 1; i >= 0; i--) {
    bits.push({
      index: i,
      value: getBit(value, i),
      isSignBit: signed && i === bitWidth - 1
    })
  }

  const nibbles = []
  for (let i = 0; i < bits.length; i += 4) {
    nibbles.push(bits.slice(i, i + 4))
  }

  const columns = bitWidth === 8 ? 2 : 4

  return (
    <div className="bitgrid" data-columns={columns}>
      <div className="bitgrid-grid">
        {nibbles.map((nibble, nibbleIndex) => (
          <div key={nibbleIndex} className="bitgrid-nibble">
            {nibble.map((bit) => (
              <div key={bit.index} className="bitgrid-bit-col">
                <button
                  className={`bitgrid-bit ${bit.value === 1n ? 'bit-on' : 'bit-off'} ${bit.isSignBit ? 'bit-sign' : ''}`}
                  onMouseDown={() => handleMouseDown(bit.index)}
                  onMouseEnter={() => handleMouseEnter(bit.index)}
                >
                  {bit.value.toString()}
                </button>
                <span className="bitgrid-label">{bit.index}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BitGrid
