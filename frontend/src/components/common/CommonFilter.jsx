import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Filter, Search, Check, X, ChevronDown, Loader2 } from 'lucide-react';

export const CommonFilter = ({
  label = null,
  placeholder = 'All Options',
  options = [],
  value = '',
  defaultValue = '',
  multiple = false,
  searchable = true,
  searchPlaceholder = 'Search options...',
  showCount = true,
  loading = false,
  disabled = false,
  clearable = true,
  icon: Icon = Filter,
  style = {},
  onChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options array into { value, label, count } format
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.id,
          label: String(opt.label || opt.name || opt.class_name || opt.category_name || opt.role_name || opt.title || opt.value || opt.id || ''),
          count: opt.count !== undefined ? opt.count : null,
          disabled: !!opt.disabled
        };
      }
      return { value: opt, label: String(opt), count: null, disabled: false };
    });
  }, [options]);

  const cleanOptions = useMemo(() => {
    return normalizedOptions.filter(opt => opt.value !== '' && opt.value !== null && opt.value !== undefined);
  }, [normalizedOptions]);

  const isFiltered = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined && value !== defaultValue;
  }, [value, multiple, defaultValue]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return cleanOptions;
    const term = searchTerm.toLowerCase();
    return cleanOptions.filter(opt => opt.label.toLowerCase().includes(term));
  }, [cleanOptions, searchTerm]);

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const selectedVals = Array.isArray(value) ? value.map(String) : [];
      return cleanOptions.filter(opt => selectedVals.includes(String(opt.value)));
    }
    return cleanOptions.find(opt => String(opt.value) === String(value)) || null;
  }, [cleanOptions, value, multiple]);

  const totalItemsCount = useMemo(() => {
    const hasCounts = cleanOptions.some(opt => typeof opt.count === 'number');
    if (hasCounts) {
      return cleanOptions.reduce((acc, curr) => acc + (curr.count || 0), 0);
    }
    return cleanOptions.length;
  }, [cleanOptions]);

  const triggerLabel = useMemo(() => {
    if (multiple) {
      const count = Array.isArray(value) ? value.length : 0;
      if (count === 0) return `${placeholder} ${showCount && totalItemsCount > 0 ? `(${totalItemsCount})` : ''}`;
      if (count === 1 && selectedOptions.length === 1) return selectedOptions[0].label;
      return `${count} Selected`;
    }

    if (selectedOptions) {
      const countStr = showCount && selectedOptions.count !== null ? ` (${selectedOptions.count})` : '';
      return `${selectedOptions.label}${countStr}`;
    }

    const totalStr = showCount && totalItemsCount > 0 ? ` (${totalItemsCount})` : '';
    return `${placeholder}${totalStr}`;
  }, [multiple, value, selectedOptions, placeholder, showCount, totalItemsCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      if (searchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 40);
      }
    } else {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const handleOptionClick = (optionValue) => {
    if (disabled) return;
    if (multiple) {
      const currentVals = Array.isArray(value) ? [...value] : [];
      const index = currentVals.findIndex(v => String(v) === String(optionValue));
      let newVals;
      if (index >= 0) {
        newVals = currentVals.filter((_, i) => i !== index);
      } else {
        newVals = [...currentVals, optionValue];
      }
      if (onChange) onChange(newVals);
    } else {
      if (onChange) onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleSelectAllOrReset = () => {
    if (multiple) {
      if (Array.isArray(value) && value.length === cleanOptions.length) {
        if (onChange) onChange([]);
      } else {
        if (onChange) onChange(cleanOptions.map(opt => opt.value));
      }
    } else {
      if (onChange) onChange('');
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange(multiple ? [] : '');
    }
    setIsOpen(false);
  };

  // Internal styles object
  const styles = {
    container: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      textAlign: 'left',
      fontFamily: 'Inter, system-ui, sans-serif',
      ...style
    },
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#334155',
      whiteSpace: 'nowrap'
    },
    triggerButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '5px 12px',
      fontSize: '12px',
      fontWeight: '600',
      borderRadius: '9999px',
      border: isFiltered ? '1px solid #60a5fa' : '1px solid #cbd5e1',
      backgroundColor: isFiltered ? '#eff6ff' : '#ffffff',
      color: isFiltered ? '#1e40af' : '#334155',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      minWidth: '170px',
      outline: 'none',
      transition: 'all 0.15s ease-in-out',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    },
    popoverCard: {
      position: 'absolute',
      left: 0,
      top: '100%',
      marginTop: '6px',
      width: '240px',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      zIndex: 999,
      overflow: 'hidden'
    },
    searchContainer: {
      padding: '8px',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: '#f8fafc',
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    searchInput: {
      width: '100%',
      paddingLeft: '28px',
      paddingRight: '24px',
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '12px',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '6px',
      outline: 'none',
      color: '#1e293b'
    },
    searchIcon: {
      position: 'absolute',
      left: '16px',
      color: '#94a3b8',
      pointerEvents: 'none'
    },
    optionsList: {
      maxHeight: '220px',
      overflowY: 'auto',
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    optionItem: (isSelected, isHighlighted, isOptDisabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 10px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: isSelected ? '700' : '500',
      cursor: isOptDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: isSelected ? '#1d4ed8' : isHighlighted ? '#f1f5f9' : 'transparent',
      color: isSelected ? '#ffffff' : isOptDisabled ? '#94a3b8' : '#1e293b',
      transition: 'background-color 0.1s ease'
    }),
    badge: (isSelected) => ({
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '9999px',
      backgroundColor: isSelected ? '#1e40af' : '#e2e8f0',
      color: isSelected ? '#ffffff' : '#475569'
    }),
    clearBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2px',
      borderRadius: '50%',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <div style={styles.wrapper}>
        {Icon && <Icon size={15} style={{ color: '#475569', flexShrink: 0 }} />}

        {label && (
          <span style={styles.label}>{label}:</span>
        )}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(prev => !prev)}
            style={styles.triggerButton}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {triggerLabel}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {loading ? (
                <Loader2 size={13} style={{ color: '#2563eb', animation: 'spin 1s linear infinite' }} />
              ) : (
                <>
                  {isFiltered && clearable && (
                    <span
                      onClick={handleClear}
                      title="Clear filter"
                      style={styles.clearBtn}
                    >
                      <X size={11} />
                    </span>
                  )}
                  <ChevronDown
                    size={13}
                    style={{
                      color: isOpen ? '#2563eb' : '#94a3b8',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </>
              )}
            </div>
          </button>

          {/* Absolute Dropdown Overlay */}
          {isOpen && (
            <div style={styles.popoverCard}>
              {searchable && (
                <div style={styles.searchContainer}>
                  <Search size={13} style={styles.searchIcon} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    style={styles.searchInput}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              <div style={styles.optionsList}>
                {/* Reset / All Option */}
                <div
                  onClick={handleSelectAllOrReset}
                  style={styles.optionItem((!multiple && !isFiltered) || (multiple && Array.isArray(value) && value.length === cleanOptions.length), highlightedIndex === 0, false)}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {multiple ? (Array.isArray(value) && value.length === cleanOptions.length ? 'Deselect All' : 'Select All') : placeholder}
                    {!multiple && showCount && totalItemsCount > 0 ? ` (${totalItemsCount})` : ''}
                  </span>
                  {((!multiple && !isFiltered) || (multiple && Array.isArray(value) && value.length === cleanOptions.length)) && (
                    <Check size={13} style={{ color: '#ffffff', marginLeft: '6px', flexShrink: 0 }} />
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', color: '#94a3b8', gap: '6px', fontSize: '12px' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Loading options...</span>
                  </div>
                ) : filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, index) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.map(String).includes(String(opt.value))
                      : String(opt.value) === String(value);
                    const isHighlighted = highlightedIndex === index + 1;

                    return (
                      <div
                        key={String(opt.value)}
                        onClick={() => !opt.disabled && handleOptionClick(opt.value)}
                        style={styles.optionItem(isSelected, isHighlighted, opt.disabled)}
                      >
                        <div style={{ display: 'flex', items: 'center', gap: '8px', overflow: 'hidden' }}>
                          {multiple && (
                            <div
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '3px',
                                border: isSelected ? '1px solid #ffffff' : '1px solid #cbd5e1',
                                backgroundColor: isSelected ? '#ffffff' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {isSelected && <Check size={10} style={{ color: '#1d4ed8' }} />}
                            </div>
                          )}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          {showCount && opt.count !== null && (
                            <span style={styles.badge(isSelected)}>
                              {opt.count}
                            </span>
                          )}
                          {!multiple && isSelected && <Check size={13} style={{ color: '#ffffff' }} />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    No matching options
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
