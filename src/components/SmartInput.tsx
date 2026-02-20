/**
 * [INPUT]: 依赖 react 的 useState/useEffect/useRef/useCallback
 * [OUTPUT]: 对外提供 SmartInput 组件和 SmartTagInput 组件
 * [POS]: components/SmartInput，智能输入组件库，支持历史检索和自动补全
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  inputClassName?: string;
  onSelect?: (value: string) => void;
  onCreateNew?: (value: string) => void;
  showCreateHint?: boolean;
}

export function SmartInput({
  value,
  onChange,
  suggestions,
  placeholder,
  icon,
  inputClassName = '',
  onSelect,
  onCreateNew,
  showCreateHint = true,
}: SmartInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  const showDropdown = isOpen && filteredSuggestions.length > 0;
  const showCreateOption = showCreateHint && value.trim() && !suggestions.some(
    s => s.toLowerCase() === value.toLowerCase()
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((suggestion: string) => {
    onSelect?.(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onSelect, onChange]);

  const handleCreate = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onCreateNew?.(trimmed);
      onChange(trimmed);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value, onCreateNew, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (filteredSuggestions.length > 0 || showCreateOption)) {
      setIsOpen(true);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const max = showCreateOption ? filteredSuggestions.length : filteredSuggestions.length - 1;
        return prev < max ? prev + 1 : 0;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const max = showCreateOption ? filteredSuggestions.length : filteredSuggestions.length - 1;
        return prev > 0 ? prev - 1 : max;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      } else if (highlightedIndex === filteredSuggestions.length && showCreateOption) {
        handleCreate();
      } else if (showCreateOption) {
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{icon}</div>}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (filteredSuggestions.length > 0 || showCreateOption) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={icon ? `w-full pl-9 pr-3 py-2 ${inputClassName}` : `w-full px-3 py-2 ${inputClassName}`}
          placeholder={placeholder}
        />
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-grey-900 border border-border dark:border-grey-700 rounded-lg shadow-lg overflow-hidden"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-fill-tertiary dark:hover:bg-grey-800 transition-colors ${
                  index === highlightedIndex ? 'bg-fill-tertiary dark:bg-grey-800' : ''
                }`}
              >
                <span className="text-text-primary dark:text-text-primary-dark">{suggestion}</span>
                {index === highlightedIndex && <Check size={14} className="text-primary" />}
              </button>
            ))}
            {showCreateOption && (
              <button
                type="button"
                onClick={handleCreate}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-fill-tertiary dark:hover:bg-grey-800 transition-colors border-t border-border dark:border-grey-700 ${
                  highlightedIndex === filteredSuggestions.length ? 'bg-fill-tertiary dark:bg-grey-800' : ''
                }`}
              >
                <Plus size={14} className="text-primary" />
                <span className="text-text-secondary dark:text-text-secondary-dark">创建 "{value.trim()}"</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SmartTagInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedTags: { id: string; label: string; category: string; color: string }[];
  onRemoveTag: (tagId: string) => void;
  suggestions: string[];
  placeholder?: string;
  tagColor?: string;
  onAddTag: (label: string) => void;
}

export function SmartTagInput({
  value,
  onChange,
  selectedTags,
  onRemoveTag,
  suggestions,
  placeholder = '输入...',
  tagColor = '#007AFF',
  onAddTag,
}: SmartTagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(value.toLowerCase()) && !selectedTags.some(t => t.label.toLowerCase() === s.toLowerCase())
  );

  const showDropdown = isOpen && filteredSuggestions.length > 0;
  const showCreateOption = value.trim() && !suggestions.some(
    s => s.toLowerCase() === value.toLowerCase()
  ) && !selectedTags.some(t => t.label.toLowerCase() === value.toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((suggestion: string) => {
    onAddTag(suggestion);
    onChange('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, [onAddTag, onChange]);

  const handleCreate = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed) {
      onAddTag(trimmed);
      onChange('');
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value, onAddTag, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSelect(filteredSuggestions[highlightedIndex]);
      } else if (showCreateOption) {
        handleCreate();
      }
    } else if (e.key === 'Backspace' && !value && selectedTags.length > 0) {
      onRemoveTag(selectedTags[selectedTags.length - 1].id);
    } else if (e.key === 'ArrowDown' && showDropdown) {
      e.preventDefault();
      const max = showCreateOption ? filteredSuggestions.length : filteredSuggestions.length - 1;
      setHighlightedIndex(prev => prev < max ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp' && showDropdown) {
      e.preventDefault();
      const max = showCreateOption ? filteredSuggestions.length : filteredSuggestions.length - 1;
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : max);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="bg-grey-50 dark:bg-grey-800 border border-border dark:border-grey-700 rounded-lg p-2 min-h-[38px] flex flex-wrap gap-1.5 relative">
      {selectedTags.map(tag => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium text-white"
          style={{ backgroundColor: tag.color }}
        >
          {tag.label}
          <button type="button" onClick={() => onRemoveTag(tag.id)} className="hover:opacity-80">
            <X size={11} />
          </button>
        </span>
      ))}
      <div className="relative flex-1 min-w-[60px]">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (filteredSuggestions.length > 0 || showCreateOption) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-sm min-w-[60px] flex-1 focus:outline-none text-text-primary dark:text-text-primary-dark placeholder:text-text-tertiary w-full"
          placeholder={selectedTags.length === 0 ? placeholder : ''}
        />

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-grey-900 border border-border dark:border-grey-700 rounded-lg shadow-lg overflow-hidden"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-fill-tertiary dark:hover:bg-grey-800 transition-colors ${
                    index === highlightedIndex ? 'bg-fill-tertiary dark:bg-grey-800' : ''
                  }`}
                >
                  <span className="text-text-primary dark:text-text-primary-dark">{suggestion}</span>
                  {index === highlightedIndex && <Check size={14} className="text-primary" />}
                </button>
              ))}
              {showCreateOption && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-fill-tertiary dark:hover:bg-grey-800 transition-colors border-t border-border dark:border-grey-700 ${
                    highlightedIndex === filteredSuggestions.length ? 'bg-fill-tertiary dark:bg-grey-800' : ''
                  }`}
                >
                  <Plus size={14} className="text-primary" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">创建 "{value.trim()}"</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
