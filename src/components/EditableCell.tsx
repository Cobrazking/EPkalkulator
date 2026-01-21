import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'percent';
  className?: string;
  placeholder?: string;
}

const EditableCell: React.FC<EditableCellProps> = memo(({ 
  value, 
  onChange, 
  type = 'text',
  className = '',
  placeholder = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);
  
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    
    let finalValue: string | number = editValue;
    
    if (type === 'number' || type === 'percent') {
      // Replace comma with period for parsing
      const normalizedValue = editValue.replace(',', '.');
      const numericValue = parseFloat(normalizedValue.replace(/[^0-9.-]/g, ''));
      
      if (!isNaN(numericValue)) {
        finalValue = numericValue;
      } else {
        finalValue = typeof value === 'number' ? value : 0;
        setEditValue(finalValue.toString());
      }
    }
    
    onChange(finalValue);
  }, [editValue, type, value, onChange]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value.toString());
    }
  }, [handleBlur, value]);

  const getDisplayValue = useCallback(() => {
    if (type === 'percent') {
      return `${value} %`;
    }
    return value;
  }, [type, value]);

  const alignmentClass = type === 'number' || type === 'percent' ? 'justify-center text-center' : 'justify-start text-left';
  
  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`min-h-[40px] lg:min-h-[40px] min-h-[44px] flex items-center w-full ${alignmentClass} ${className}`}
    >
      {isEditing ? (
        <motion.input
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 lg:px-2 lg:py-1 rounded text-text-primary border-none focus:ring-2 focus:ring-primary-400 bg-background text-base lg:text-sm ${type === 'number' || type === 'percent' ? 'text-center font-sans' : 'text-left'}`}
          placeholder={placeholder}
          inputMode={type === 'number' || type === 'percent' ? 'decimal' : 'text'}
        />
      ) : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`w-full truncate text-base lg:text-sm ${type === 'number' || type === 'percent' ? 'text-center font-sans' : 'text-left'}`}
        >
          {value === '' ? (
            <span className="text-text-muted italic">{placeholder}</span>
          ) : (
            getDisplayValue()
          )}
        </motion.span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value &&
         prevProps.type === nextProps.type &&
         prevProps.className === nextProps.className &&
         prevProps.placeholder === nextProps.placeholder;
});

export default EditableCell;