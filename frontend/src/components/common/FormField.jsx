import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const formInputBaseStyle = {
  width: '100%',
  padding: '8px 12px',
  backgroundColor: '#eff3f7',
  border: '1.5px solid transparent',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#1e293b',
  outline: 'none',
  transition: 'all 0.15s ease',
  boxSizing: 'border-box'
};

export const formLabelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px'
};

export const FormLabel = ({ label, required = false }) => {
  if (!label) return null;
  return (
    <label style={formLabelStyle}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
  );
};

export const FormInput = ({
  label,
  required = false,
  icon: LeftIcon = null,
  rightIcon: RightIcon = null,
  error = null,
  disabled = false,
  style = {},
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const currentStyle = {
    ...formInputBaseStyle,
    backgroundColor: disabled ? '#e2e8f0' : (isFocused ? '#ffffff' : '#eff3f7'),
    borderColor: isFocused ? '#1aa3b8' : 'transparent',
    boxShadow: isFocused ? '0 0 0 2.5px rgba(26, 163, 184, 0.2)' : 'none',
    paddingLeft: LeftIcon ? '34px' : (style.paddingLeft || '12px'),
    paddingRight: RightIcon ? '34px' : (style.paddingRight || '12px'),
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style
  };

  return (
    <div style={{ width: '100%' }}>
      {label && <FormLabel label={label} required={required} />}
      <div style={{ position: 'relative', width: '100%' }}>
        {LeftIcon && (
          <LeftIcon
            size={15}
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isFocused ? '#1aa3b8' : '#94a3b8',
              pointerEvents: 'none',
              transition: 'color 0.15s ease'
            }}
          />
        )}
        <input
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={currentStyle}
          className={className}
          {...props}
        />
        {RightIcon && (
          <RightIcon
            size={15}
            style={{
              position: 'absolute',
              right: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
      {error && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
};

export const FormSelect = ({
  label,
  required = false,
  icon: LeftIcon = null,
  options = [],
  children,
  error = null,
  disabled = false,
  style = {},
  className = '',
  onFocus,
  onBlur,
  placeholder = 'Select',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const currentStyle = {
    ...formInputBaseStyle,
    appearance: 'none',
    backgroundColor: disabled ? '#e2e8f0' : (isFocused ? '#ffffff' : '#eff3f7'),
    borderColor: isFocused ? '#1aa3b8' : 'transparent',
    boxShadow: isFocused ? '0 0 0 2.5px rgba(26, 163, 184, 0.2)' : 'none',
    paddingLeft: LeftIcon ? '34px' : '12px',
    paddingRight: '34px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    ...style
  };

  return (
    <div style={{ width: '100%' }}>
      {label && <FormLabel label={label} required={required} />}
      <div style={{ position: 'relative', width: '100%' }}>
        {LeftIcon && (
          <LeftIcon
            size={15}
            style={{
              position: 'absolute',
              left: '11px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isFocused ? '#1aa3b8' : '#94a3b8',
              pointerEvents: 'none'
            }}
          />
        )}
        <select
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={currentStyle}
          className={className}
          {...props}
        >
          {children ? (
            children
          ) : (
            <>
              {placeholder && <option value="">{placeholder}</option>}
              {options.map((opt) => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const lbl = typeof opt === 'object' ? opt.label : opt;
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
            </>
          )}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: 'absolute',
            right: '11px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
            pointerEvents: 'none'
          }}
        />
      </div>
      {error && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
};

export const FormTextarea = ({
  label,
  required = false,
  icon: LeftIcon = null,
  error = null,
  disabled = false,
  rows = 3,
  style = {},
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const currentStyle = {
    ...formInputBaseStyle,
    backgroundColor: disabled ? '#e2e8f0' : (isFocused ? '#ffffff' : '#eff3f7'),
    borderColor: isFocused ? '#1aa3b8' : 'transparent',
    boxShadow: isFocused ? '0 0 0 2.5px rgba(26, 163, 184, 0.2)' : 'none',
    paddingLeft: LeftIcon ? '34px' : '12px',
    resize: 'vertical',
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style
  };

  return (
    <div style={{ width: '100%' }}>
      {label && <FormLabel label={label} required={required} />}
      <div style={{ position: 'relative', width: '100%' }}>
        {LeftIcon && (
          <LeftIcon
            size={15}
            style={{
              position: 'absolute',
              left: '11px',
              top: '10px',
              color: isFocused ? '#1aa3b8' : '#94a3b8',
              pointerEvents: 'none'
            }}
          />
        )}
        <textarea
          rows={rows}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={currentStyle}
          className={className}
          {...props}
        />
      </div>
      {error && <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#ef4444' }}>{error}</p>}
    </div>
  );
};
