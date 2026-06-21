import React, { useState } from 'react';

interface SecretCodeInputProps {
  title: string;
  subtitle?: string;
  onSubmit: (code: string) => void;
  disabled?: boolean;
}

export const SecretCodeInput: React.FC<SecretCodeInputProps> = ({
  title,
  subtitle,
  onSubmit,
  disabled = false,
}) => {
  const [code, setCode] = useState<string>('');
  const [showCode, setShowCode] = useState<boolean>(false);

  const handleDigitPress = (digit: string) => {
    if (code.length < 4 && !disabled) {
      setCode((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (code.length > 0 && !disabled) {
      setCode((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!disabled) {
      setCode('');
    }
  };

  const handleConfirm = () => {
    if (code.length === 4 && !disabled) {
      onSubmit(code);
    }
  };

  // Build character boxes
  const renderDigitBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 4; i++) {
      const char = code[i] || '';
      const isFilled = char !== '';
      
      let displayValue = '';
      if (isFilled) {
        displayValue = showCode ? char : '●';
      }

      boxes.push(
        <div
          key={i}
          className={`digit-box ${isFilled ? 'filled' : ''}`}
          style={{
            width: '56px',
            height: '68px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `2px solid ${isFilled ? 'var(--neon-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: showCode ? '1.8rem' : '1.2rem',
            fontWeight: 800,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: isFilled ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {displayValue}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
          {subtitle}
        </p>
      )}

      {/* Code Display Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div className="code-display" style={{ margin: 0, gap: '10px' }}>
          {renderDigitBoxes()}
        </div>
        
        {/* Toggle visibility button */}
        <button
          type="button"
          onClick={() => setShowCode(!showCode)}
          disabled={code.length === 0}
          className="btn"
          style={{
            padding: '10px',
            height: '44px',
            width: '44px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            opacity: code.length === 0 ? 0.4 : 1,
            cursor: code.length === 0 ? 'not-allowed' : 'pointer',
          }}
          title={showCode ? 'Ocultar código' : 'Mostrar código'}
        >
          {showCode ? '🔒' : '👁️'}
        </button>
      </div>

      {/* Numeric Keypad */}
      <div className="numpad" style={{ width: '100%', gap: '10px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            className="numpad-btn"
            onClick={() => handleDigitPress(num.toString())}
            disabled={disabled || code.length >= 4}
            style={{ padding: '14px', fontSize: '1.25rem' }}
          >
            {num}
          </button>
        ))}
        
        {/* Clear Button */}
        <button
          type="button"
          className="numpad-btn"
          onClick={handleClear}
          disabled={disabled || code.length === 0}
          style={{ padding: '14px', fontSize: '0.95rem', textTransform: 'uppercase', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          Limpiar
        </button>

        {/* 0 Button */}
        <button
          type="button"
          className="numpad-btn"
          onClick={() => handleDigitPress('0')}
          disabled={disabled || code.length >= 4}
          style={{ padding: '14px', fontSize: '1.25rem' }}
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          className="numpad-btn"
          onClick={handleBackspace}
          disabled={disabled || code.length === 0}
          style={{ padding: '14px', fontSize: '1.25rem' }}
        >
          ⌫
        </button>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        className="btn btn-cyan"
        onClick={handleConfirm}
        disabled={disabled || code.length !== 4}
        style={{
          width: '100%',
          marginTop: '24px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          boxShadow: code.length === 4 ? 'var(--shadow-cyan)' : 'none',
        }}
      >
        Confirmar Código
      </button>
    </div>
  );
};
