const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

// @desc    Get all books with search, filter, sort, pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      availability,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // Search query (title, author, ISBN)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { ISBN: searchRegex },
        { category: searchRegex },
        { publisher: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All' && category !== '') {
      query.category = category;
    }

    // Availability filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'unavailable') {
      query.availableCopies = { $eq: 0 };
    }

    // Determine sort options
    let sortOptions = {};
    if (sortBy === 'popularity') {
      // We will sort after aggregation or default to availableCopies/title
      sortOptions = { availableCopies: order === 'asc' ? 1 : -1 };
    } else {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    const currentPage = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * pageSize;

    const [books, totalBooks, categories] = await Promise.all([
      Book.find(query).sort(sortOptions).skip(skip).limit(pageSize),
      Book.countDocuments(query),
      Book.distinct('category')
    ]);

    const totalPages = Math.ceil(totalBooks / pageSize);

    res.status(200).json({
      success: true,
      count: books.length,
      totalBooks,
      totalPages,
      currentPage,
      categories: categories.sort(),
      books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get borrow statistics for this book
    const borrowCount = await BorrowRecord.countDocuments({
      bookId: book._id,
      status: { $in: ['borrowed', 'returned', 'overdue'] }
    });

    const activeBorrows = await BorrowRecord.countDocuments({
      bookId: book._id,
      status: { $in: ['borrowed', 'overdue'] }
    });

    res.status(200).json({
      success: true,
      book,
      stats: {
        totalTimesBorrowed: borrowCount,
        currentlyIssued: activeBorrows
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin / Librarian)
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      ISBN,
      author,
      category,
      publisher,
      publicationYear,
      coverImage,
      description,
      totalCopies,
      shelfLocation
    } = req.body;

    if (!title || !ISBN || !author || !category || totalCopies === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, ISBN, Author, Category, and Total Copies are required'
      });
    }

    // Check duplicate ISBN
    const existingBook = await Book.findOne({ ISBN: ISBN.trim().toUpperCase() });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with ISBN ${ISBN} already exists.`
      });
    }

    const total = parseInt(totalCopies, 10);
    const available = req.body.availableCopies !== undefined ? parseInt(req.body.availableCopies, 10) : total;

    const book = await Book.create({
      title: title.trim(),
      ISBN: ISBN.trim().toUpperCase(),
      author: author.trim(),
      category: category.trim(),
      publisher: publisher ? publisher.trim() : 'Unknown',
      publicationYear: publicationYear ? parseInt(publicationYear, 10) : undefined,
      coverImage: coverImage && coverImage.trim() !== '' ? coverImage.trim() : undefined,
      description: description ? description.trim() : '',
      totalCopies: total,
      availableCopies: Math.min(total, Math.max(0, available)),
      shelfLocation: shelfLocation ? shelfLocation.trim() : 'General Stack A1'
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Admin / Librarian)
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check ISBN uniqueness if changed
    if (req.body.ISBN && req.body.ISBN.trim().toUpperCase() !== book.ISBN) {
      const duplicate = await Book.findOne({
        ISBN: req.body.ISBN.trim().toUpperCase(),
        _id: { $ne: book._id }
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `ISBN ${req.body.ISBN} is already in use by another book.`
        });
      }
      req.body.ISBN = req.body.ISBN.trim().toUpperCase();
    }

    // Handle copy adjustment safely
    if (req.body.totalCopies !== undefined) {
      const newTotal = parseInt(req.body.totalCopies, 10);
      const currentlyIssued = book.totalCopies - book.availableCopies;

      if (newTotal < currentlyIssued) {
        return res.status(400).json({
          success: false,
          message: `Total copies cannot be lower than currently issued copies (${currentlyIssued}).`
        });
      }

      // If availableCopies not explicitly sent, adjust relative to current issued
      if (req.body.availableCopies === undefined) {
        req.body.availableCopies = newTotal - currentlyIssued;
      }
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin / Librarian)
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Prevent deleting books with active borrowing records
    const activeBorrows = await BorrowRecord.countDocuments({
      bookId: book._id,
      status: { $in: ['pending', 'approved', 'borrowed', 'overdue'] }
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book '${book.title}' because it has ${activeBorrows} active borrow or pending request records.`
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
