import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  value = '',
  onChange,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  debounce = 300,
  autoFocus = false,
  icon,
  clearButton = true,
  suggestions = [],
  showSuggestions = false,
  onSuggestionClick,
  ...rest
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Generate the class names
  const searchBarClasses = ['search-bar position-relative', className].filter(Boolean).join(' ');
  const searchInputClasses = ['form-control search-input', inputClassName].filter(Boolean).join(' ');
  const searchButtonClasses = ['btn btn-primary search-button', buttonClassName].filter(Boolean).join(' ');

  // Update internal state when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Auto focus the input if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // Call the external onChange handler if provided
    if (onChange) {
      onChange(e);
    }

    // Show suggestions list if there are suggestions and input is not empty
    if (showSuggestions && suggestions.length > 0) {
      setShowSuggestionsList(newValue.trim() !== '');
    }

    // Debounce the search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounce);
  };

  // Handle suggestions click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(typeof suggestion === 'string' ? suggestion : suggestion.label);
    setShowSuggestionsList(false);
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    
    if (onSearch) {
      onSearch(typeof suggestion === 'string' ? suggestion : suggestion.label);
    }
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && suggestions.length > 0 && searchTerm.trim() !== '') {
      setShowSuggestionsList(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(document.activeElement)) {
        setShowSuggestionsList(false);
      }
    }, 150);
  };

  // Handle clearing the search input
  const handleClear = () => {
    setSearchTerm('');
    setShowSuggestionsList(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSearch) {
      onSearch('');
    }
    if (onChange) {
      // Create a synthetic event
      const event = {
        target: { value: '' },
        preventDefault: () => {}
      };
      onChange(event);
    }
  };

  // Handle pressing enter in suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={searchBarClasses} {...rest}>
      <form onSubmit={handleSubmit} className="d-flex">
        <div className="position-relative flex-grow-1">
          <input
            ref={inputRef}
            type="text"
            className={searchInputClasses}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {clearButton && searchTerm && (
            <button
              type="button"
              className="btn btn-sm position-absolute top-50 end-0 translate-middle-y bg-transparent border-0 text-secondary"
              onClick={handleClear}
              style={{ right: '10px' }}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
              <span className="visually-hidden">Clear search</span>
            </button>
          )}
          {/* Suggestions dropdown */}
          {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="position-absolute w-100 mt-1 shadow bg-white rounded z-index-dropdown"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              <ul className="list-group list-group-flush">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {typeof suggestion === 'string' ? suggestion : suggestion.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className={searchButtonClasses}>
          {icon || (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          )}
          <span className="visually-hidden">Search</span>
        </button>
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  debounce: PropTypes.number,
  autoFocus: PropTypes.bool,
  icon: PropTypes.node,
  clearButton: PropTypes.bool,
  suggestions: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.any
      })
    ])
  ),
  showSuggestions: PropTypes.bool,
  onSuggestionClick: PropTypes.func
};

export default SearchBar;
