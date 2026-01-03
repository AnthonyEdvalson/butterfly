function Settings({ bitWidth, onBitWidthChange, signed, onSignedChange }) {
  const bitWidths = [8, 16, 32, 64]

  return (
    <div className="settings">
      <div className="settings-group">
        {bitWidths.map(w => (
          <button
            key={w}
            className={`settings-btn ${bitWidth === w ? 'active' : ''}`}
            onClick={() => onBitWidthChange(w)}
          >
            {w}
          </button>
        ))}
        <button
          className={`settings-btn ${signed ? 'active' : ''}`}
          onClick={() => onSignedChange(!signed)}
          title={signed ? 'Signed' : 'Unsigned'}
        >
          ±
        </button>
      </div>
    </div>
  )
}

export default Settings
