import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-1.5 my-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Trang trước"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map(pageNum => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
            currentPage === pageNum
              ? 'bg-[#ea580c] text-white shadow-sm shadow-orange-500/20'
              : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
          }`}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Trang sau"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
