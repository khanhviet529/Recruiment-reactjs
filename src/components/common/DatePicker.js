import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatePicker = ({
  selectedDate,
  onChange,
  className = '',
  placeholderText = 'Select a date...',
  isClearable = true,
  showTimeSelect = false,
  dateFormat = 'dd/MM/yyyy',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  name,
  id,
  label,
  error,
  helpText,
  inline = false,
  popperPlacement = 'bottom-start',
  filterDate,
  showMonthYearPicker = false,
  showYearPicker = false,
  ...rest
}) => {
  // Generate container classes
  const containerClasses = ['date-picker-container mb-3', className]
    .filter(Boolean)
    .join(' ');

  // Generate input classes
  const inputClasses = [
    'form-control',
    error ? 'is-invalid' : null
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        className={inputClasses}
        placeholderText={placeholderText}
        isClearable={isClearable}
        showTimeSelect={showTimeSelect}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        name={name}
        id={id || name}
        required={required}
        inline={inline}
        popperPlacement={popperPlacement}
        filterDate={filterDate}
        showMonthYearPicker={showMonthYearPicker}
        showYearPicker={showYearPicker}
        {...rest}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {helpText && <div className="form-text">{helpText}</div>}
    </div>
  );
};

CustomDatePicker.propTypes = {
  selectedDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholderText: PropTypes.string,
  isClearable: PropTypes.bool,
  showTimeSelect: PropTypes.bool,
  dateFormat: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.node,
  error: PropTypes.string,
  helpText: PropTypes.node,
  inline: PropTypes.bool,
  popperPlacement: PropTypes.string,
  filterDate: PropTypes.func,
  showMonthYearPicker: PropTypes.bool,
  showYearPicker: PropTypes.bool
};

export default CustomDatePicker;
