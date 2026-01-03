import { useState, useCallback, useEffect } from 'react'
import Settings from './components/Settings'
import History from './components/History'
import Display from './components/Display'
import BitGrid from './components/BitGrid'
import Keypad from './components/Keypad'
import { mask, parseValue, performOperation, performUnaryOperation } from './utils/bitmath'

const KEY_TO_OP = {
  '+': '+',
  '-': '-',
  '*': '*',
  '/': '/',
  '%': '%',
  '&': 'AND',
  '|': 'OR',
  '^': 'XOR',
  '~': 'NOT',
  '<': '<<',
  '>': '>>',
}

const VALID_CHARS = {
  2: /^[01]$/,
  10: /^[0-9]$/,
  16: /^[0-9a-fA-F]$/i,
}

function App() {
  const [value, setValue] = useState(0n)
  const [operand, setOperand] = useState(null)
  const [operation, setOperation] = useState(null)
  const [bitWidth, setBitWidth] = useState(32)
  const [signed, setSigned] = useState(true)
  const [history, setHistory] = useState([])
  const [inputMode, setInputMode] = useState(false)
  const [inputBase, setInputBase] = useState(10)
  const [inputBuffer, setInputBuffer] = useState('')

  const handleValueChange = useCallback((newValue) => {
    setValue(mask(newValue, bitWidth))
  }, [bitWidth])

  const handleBitWidthChange = useCallback((newWidth) => {
    setBitWidth(newWidth)
    setValue(prev => mask(prev, newWidth))
    if (operand !== null) {
      setOperand(prev => mask(prev, newWidth))
    }
  }, [operand])

  const handleSignedChange = useCallback((newSigned) => {
    setSigned(newSigned)
  }, [])

  const handleOperation = useCallback((op) => {
    setInputBuffer('')
    
    if (op === 'NOT' || op === 'CLR' || op === '±') {
      const result = performUnaryOperation(value, op, bitWidth)
      if (op !== 'CLR') {
        setHistory(prev => [...prev.slice(-19), {
          a: value,
          op,
          b: null,
          result
        }])
      }
      setValue(result)
      setOperand(null)
      setOperation(null)
      setInputMode(false)
      return
    }

    if (operation && operand !== null) {
      const result = performOperation(operand, operation, value, bitWidth, signed)
      setHistory(prev => [...prev.slice(-19), {
        a: operand,
        op: operation,
        b: value,
        result
      }])
      setValue(result)
      setOperand(result)
      setOperation(op)
    } else {
      setOperand(value)
      setOperation(op)
    }
    setInputMode(true)
  }, [value, operand, operation, bitWidth, signed])

  const handleEquals = useCallback(() => {
    setInputBuffer('')
    
    if (operation && operand !== null) {
      const result = performOperation(operand, operation, value, bitWidth, signed)
      setHistory(prev => [...prev.slice(-19), {
        a: operand,
        op: operation,
        b: value,
        result
      }])
      setValue(result)
      setOperand(null)
      setOperation(null)
      setInputMode(false)
    }
  }, [value, operand, operation, bitWidth, signed])

  const handleHistoryClick = useCallback((entry) => {
    setValue(entry.result)
    setOperand(null)
    setOperation(null)
    setInputMode(false)
    setInputBuffer('')
  }, [])

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges()
  }

  const appendDigit = useCallback((char) => {
    clearSelection()
    let newBuffer
    if (inputMode) {
      newBuffer = char.toUpperCase()
      setInputMode(false)
    } else {
      newBuffer = inputBuffer + char.toUpperCase()
    }
    setInputBuffer(newBuffer)
    const parsed = parseValue(newBuffer, inputBase, bitWidth, signed)
    setValue(parsed)
  }, [inputBuffer, inputBase, bitWidth, signed, inputMode])

  const deleteDigit = useCallback(() => {
    clearSelection()
    if (inputBuffer.length > 0) {
      const newBuffer = inputBuffer.slice(0, -1)
      setInputBuffer(newBuffer)
      if (newBuffer.length > 0) {
        const parsed = parseValue(newBuffer, inputBase, bitWidth, signed)
        setValue(parsed)
      } else {
        setValue(0n)
      }
    }
  }, [inputBuffer, inputBase, bitWidth, signed])

  const toggleNegative = useCallback(() => {
    if (inputBase !== 10 || !signed) return
    
    if (inputBuffer.startsWith('-')) {
      const newBuffer = inputBuffer.slice(1)
      setInputBuffer(newBuffer)
      const parsed = parseValue(newBuffer, inputBase, bitWidth, signed)
      setValue(parsed)
    } else {
      const newBuffer = '-' + inputBuffer
      setInputBuffer(newBuffer)
      const parsed = parseValue(newBuffer, inputBase, bitWidth, signed)
      setValue(parsed)
    }
  }, [inputBuffer, inputBase, bitWidth, signed])

  const handlePaste = useCallback((text) => {
    clearSelection()
    const cleaned = text.trim().toUpperCase()
    const parsed = parseValue(cleaned, inputBase, bitWidth, signed)
    setValue(parsed)
    setInputBuffer(cleaned)
    setInputMode(false)
  }, [inputBase, bitWidth, signed])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key

      if (VALID_CHARS[inputBase]?.test(key)) {
        e.preventDefault()
        appendDigit(key)
        return
      }

      if (key === 'Backspace') {
        e.preventDefault()
        deleteDigit()
        return
      }

      if (key === 'Escape') {
        e.preventDefault()
        handleOperation('CLR')
        return
      }

      if (key === 'Enter' || key === '=') {
        e.preventDefault()
        handleEquals()
        return
      }

      // Handle minus as negative sign in decimal mode when buffer is empty or starting new input
      if (key === '-' && inputBase === 10 && signed && (inputBuffer === '' || inputMode)) {
        e.preventDefault()
        if (inputMode) {
          setInputBuffer('-')
          setInputMode(false)
          setValue(0n)
        } else {
          toggleNegative()
        }
        return
      }

      if (KEY_TO_OP[key]) {
        e.preventDefault()
        handleOperation(KEY_TO_OP[key])
        return
      }
    }

    const handlePasteEvent = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }
      e.preventDefault()
      const text = e.clipboardData?.getData('text')
      if (text) {
        handlePaste(text)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('paste', handlePasteEvent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('paste', handlePasteEvent)
    }
  }, [inputBase, inputBuffer, inputMode, signed, appendDigit, deleteDigit, handleOperation, handleEquals, toggleNegative, handlePaste])

  return (
    <div className="calculator">
      <Settings
        bitWidth={bitWidth}
        onBitWidthChange={handleBitWidthChange}
        signed={signed}
        onSignedChange={handleSignedChange}
      />
      <History
        history={history}
        bitWidth={bitWidth}
        signed={signed}
        inputBase={inputBase}
        operand={operand}
        operation={operation}
        onEntryClick={handleHistoryClick}
      />
      <Display
        value={value}
        bitWidth={bitWidth}
        signed={signed}
        inputBase={inputBase}
        onInputBaseChange={setInputBase}
      />
      <BitGrid
        value={value}
        bitWidth={bitWidth}
        signed={signed}
        onValueChange={handleValueChange}
      />
      <Keypad
        onOperation={handleOperation}
        onEquals={handleEquals}
      />
    </div>
  )
}

export default App
