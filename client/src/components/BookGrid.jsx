import React from 'react';
import BookCard from './BookCard';
import { BookX } from 'lucide-react';

const BookGrid = ({ books, loading, onWishlist, onExchangeRequest, columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) => {
  if (loading) {
    return (
      <div className={`grid ${columns} gap-6`}>
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="bg-[#15171E] rounded-3xl p-6 space-y-4 animate-pulse border border-white/10 shadow-xl">
            <div className="aspect-[16/10] bg-[#1F2430] rounded-2xl" />
            <div className="h-5 bg-[#1F2430] rounded-xl w-3/4" />
            <div className="h-3.5 bg-[#1F2430] rounded-lg w-1/2" />
            <div className="h-10 bg-[#1F2430] rounded-2xl w-full pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center glass-panel rounded-3xl border border-white/10 my-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#1F2430] border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4">
          <BookX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white font-serif">No Books Found in this View</h3>
        <p className="text-sm text-gray-400 max-w-md mt-2 leading-relaxed">
          Try adjusting your search criteria, clearing active filters, or exploring nearby readers to discover available books.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${columns} gap-6`}>
      {books.map(book => (
        <BookCard
          key={book._id}
          book={book}
          onWishlist={onWishlist}
          onExchangeRequest={onExchangeRequest}
        />
      ))}
    </div>
  );
};

export default BookGrid;
