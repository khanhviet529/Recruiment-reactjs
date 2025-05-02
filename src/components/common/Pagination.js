import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  size = 'md',
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  siblingCount = 1,
  ariaLabel = 'pagination'
}) => {
  // Don't render pagination if there's only 1 page
  if (totalPages <= 1) return null;

  // Calculate range of visible page numbers
  const getPageNumbers = () => {
    // Calculate range
    const totalNumbers = siblingCount * 2 + 3; // siblings on both sides + current + first + last
    const totalBlocks = totalNumbers + 2; // +2 for the '...' blocks

    if (totalPages <= totalBlocks) {
      // If we have enough space to show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Special case: show more pages on the right if we're near the beginning
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from(
        { length: Math.min(totalNumbers, totalPages) }, 
        (_, i) => i + 1
      );
      return [...leftRange, '...', totalPages];
    }

    // Special case: show more pages on the left if we're near the end
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from(
        { length: Math.min(totalNumbers, totalPages) },
        (_, i) => totalPages - i
      ).reverse();
      return [1, '...', ...rightRange];
    }

    // Default case: show dots on both sides
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, '...', ...middleRange, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page) => {
    if (page !== currentPage && page !== '...') {
      onPageChange(page);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  const paginationClasses = classNames(
    'pagination',
    {
      'pagination-sm': size === 'sm',
      'pagination-lg': size === 'lg'
    },
    className
  );

  return (
    <nav aria-label={ariaLabel}>
      <ul className={paginationClasses}>
        {/* First Page Button */}
        {showFirstLast && (
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handleFirst}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <span aria-hidden="true">&laquo;&laquo;</span>
            </button>
          </li>
        )}

        {/* Previous Button */}
        {showPrevNext && (
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handlePrev}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }
          return (
            <li 
              key={page} 
              className={`page-item ${currentPage === page ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageClick(page)}
                aria-current={currentPage === page ? 'page' : null}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next Button */}
        {showPrevNext && (
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handleNext}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        )}

        {/* Last Page Button */}
        {showFirstLast && (
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handleLast}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              <span aria-hidden="true">&raquo;&raquo;</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showFirstLast: PropTypes.bool,
  showPrevNext: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  siblingCount: PropTypes.number,
  ariaLabel: PropTypes.string
};

export default Pagination;
