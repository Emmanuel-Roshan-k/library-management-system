const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide book title'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters']
    },
    ISBN: {
      type: String,
      required: [true, 'Please provide an ISBN'],
      unique: true,
      uppercase: true,
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Please provide author name'],
      trim: true,
      maxlength: [150, 'Author name cannot exceed 150 characters']
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true
    },
    publisher: {
      type: String,
      trim: true,
      default: 'Unknown'
    },
    publicationYear: {
      type: Number,
      min: [1000, 'Year must be after 1000'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in future']
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
    },
    description: {
      type: String,
      default: ''
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please provide total copies'],
      min: [1, 'Total copies must be at least 1']
    },
    availableCopies: {
      type: Number,
      required: [true, 'Please provide available copies'],
      min: [0, 'Available copies cannot be negative']
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: 'General Stack A1'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high performance search & filtering
bookSchema.index({ title: 'text', author: 'text', category: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ availableCopies: 1 });

module.exports = mongoose.model('Book', bookSchema);
