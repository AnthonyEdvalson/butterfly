interface NumPadProps {
  inputBase: number;
  supportsDecimal: boolean;
  supportsNegation: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onNegate: () => void;
  visible: boolean;
}

function NumPad({ inputBase, supportsDecimal, supportsNegation, onDigit, onBackspace, onNegate, visible }: NumPadProps) {
  const visibilityClass = visible ? 'mobile-visible' : '';
  const showDecimal = supportsDecimal && inputBase === 10;
  const showNegate = supportsNegation && inputBase === 10;

  if (inputBase === 2) {
    return (
      <div className={`numpad ${visibilityClass}`}>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('0')}>0</button>
          <button className="numpad-btn" onClick={() => onDigit('1')}>1</button>
          <button className="numpad-btn numpad-action" onClick={onBackspace}>⌫</button>
        </div>
      </div>
    );
  }

  if (inputBase === 16) {
    return (
      <div className={`numpad ${visibilityClass}`}>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('A')}>A</button>
          <button className="numpad-btn" onClick={() => onDigit('B')}>B</button>
          <button className="numpad-btn" onClick={() => onDigit('C')}>C</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('D')}>D</button>
          <button className="numpad-btn" onClick={() => onDigit('E')}>E</button>
          <button className="numpad-btn" onClick={() => onDigit('F')}>F</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('7')}>7</button>
          <button className="numpad-btn" onClick={() => onDigit('8')}>8</button>
          <button className="numpad-btn" onClick={() => onDigit('9')}>9</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('4')}>4</button>
          <button className="numpad-btn" onClick={() => onDigit('5')}>5</button>
          <button className="numpad-btn" onClick={() => onDigit('6')}>6</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn" onClick={() => onDigit('1')}>1</button>
          <button className="numpad-btn" onClick={() => onDigit('2')}>2</button>
          <button className="numpad-btn" onClick={() => onDigit('3')}>3</button>
        </div>
        <div className="numpad-row">
          <button className="numpad-btn numpad-wide" onClick={() => onDigit('0')}>0</button>
          <button className="numpad-btn numpad-action" onClick={onBackspace}>⌫</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`numpad ${visibilityClass}`}>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => onDigit('7')}>7</button>
        <button className="numpad-btn" onClick={() => onDigit('8')}>8</button>
        <button className="numpad-btn" onClick={() => onDigit('9')}>9</button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => onDigit('4')}>4</button>
        <button className="numpad-btn" onClick={() => onDigit('5')}>5</button>
        <button className="numpad-btn" onClick={() => onDigit('6')}>6</button>
      </div>
      <div className="numpad-row">
        <button className="numpad-btn" onClick={() => onDigit('1')}>1</button>
        <button className="numpad-btn" onClick={() => onDigit('2')}>2</button>
        <button className="numpad-btn" onClick={() => onDigit('3')}>3</button>
      </div>
      <div className="numpad-row">
        {
            showDecimal ? (
                <>
                    <button className="numpad-btn" onClick={() => onDigit('.')}>.</button>
                    <button className="numpad-btn" onClick={() => onDigit('0')}>0</button>
                    <button className="numpad-btn numpad-action" onClick={onBackspace}>⌫</button>
                </>
            ) : (
                <>
                    <button className="numpad-btn numpad-wide" onClick={() => onDigit('0')}>0</button>
                    <button className="numpad-btn numpad-action" onClick={onBackspace}>⌫</button>
                </>
            )
        }
      </div>
    </div>
  );
}

export default NumPad;

