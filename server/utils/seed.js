require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const Notification = require('../models/Notification');
const Setting = require('../models/Setting');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_management_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      BorrowRecord.deleteMany({}),
      Notification.deleteMany({}),
      Setting.deleteMany({})
    ]);

    console.log('Creating System Settings...');
    const settings = await Setting.create({
      key: 'system_settings',
      borrowDays: 14,
      dailyLateFee: 5,
      maxBooksPerUser: 5,
      libraryName: 'Athena Central University Library',
      libraryEmail: 'librarian@athenalibrary.edu'
    });

    console.log('Seeding Users...');
    // Create Admin, Students, and Staff
    const adminUser = await User.create({
      name: 'Eleanor Vance',
      email: 'admin@library.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1-555-0199',
      accountStatus: 'active'
    });

    const studentAlex = await User.create({
      name: 'Alex Johnson',
      email: 'student@library.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2024-001',
      phone: '+1-555-0101',
      accountStatus: 'active'
    });

    const studentSarah = await User.create({
      name: 'Sarah Miller',
      email: 'sarah@library.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2024-042',
      phone: '+1-555-0102',
      accountStatus: 'active'
    });

    const studentDavid = await User.create({
      name: 'David Kim',
      email: 'david@library.com',
      password: 'Student@123',
      role: 'student',
      studentId: 'STU-2024-089',
      phone: '+1-555-0103',
      accountStatus: 'active'
    });

    const staffRobert = await User.create({
      name: 'Prof. Robert Langdon',
      email: 'staff@library.com',
      password: 'Staff@123',
      role: 'staff',
      staffId: 'STF-ENG-108',
      phone: '+1-555-0155',
      accountStatus: 'active'
    });

    const staffEmily = await User.create({
      name: 'Dr. Emily Watson',
      email: 'emily@library.com',
      password: 'Staff@123',
      role: 'staff',
      staffId: 'STF-SCI-204',
      phone: '+1-555-0156',
      accountStatus: 'active'
    });

    console.log('Seeding Books Collection...');
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        ISBN: '978-0132350884',
        author: 'Robert C. Martin',
        category: 'Computer Science',
        publisher: 'Prentice Hall',
        publicationYear: 2008,
        coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
        description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost due to poorly written code. Clean Code teaches the principles, patterns, and practices of writing clean code.',
        totalCopies: 6,
        availableCopies: 4,
        shelfLocation: 'Stack CS-101'
      },
      {
        title: 'Designing Data-Intensive Applications',
        ISBN: '978-1449373320',
        author: 'Martin Kleppmann',
        category: 'Computer Science',
        publisher: "O'Reilly Media",
        publicationYear: 2017,
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
        description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In addition, we have an overwhelming variety of tools: RDBMS, NoSQL datastores, stream processors, and message brokers.',
        totalCopies: 5,
        availableCopies: 3,
        shelfLocation: 'Stack CS-104'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        ISBN: '978-0136042594',
        author: 'Stuart Russell & Peter Norvig',
        category: 'Artificial Intelligence',
        publisher: 'Pearson',
        publicationYear: 2020,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        description: 'The long-anticipated revision of this best-selling book offers the most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence. Covers machine learning, probabilistic reasoning, robotics, and natural language processing.',
        totalCopies: 4,
        availableCopies: 2,
        shelfLocation: 'Rack AI-202'
      },
      {
        title: 'Deep Learning',
        ISBN: '978-0262035613',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        category: 'Artificial Intelligence',
        publisher: 'MIT Press',
        publicationYear: 2016,
        coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600',
        description: 'An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives.',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Rack AI-205'
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        ISBN: '978-0262046305',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        category: 'Computer Science',
        publisher: 'MIT Press',
        publicationYear: 2022,
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
        description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
        totalCopies: 8,
        availableCopies: 7,
        shelfLocation: 'Stack CS-201'
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        ISBN: '978-0135957059',
        author: 'David Thomas & Andrew Hunt',
        category: 'Computer Science',
        publisher: 'Addison-Wesley',
        publicationYear: 2019,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
        description: 'Illustrates the best approaches and major pitfalls of many different aspects of software development. Whether you’re a new coder, an experienced programmer, or a manager responsible for software projects, use these lessons daily.',
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Stack CS-108'
      },
      {
        title: 'To Kill a Mockingbird',
        ISBN: '978-0060935467',
        author: 'Harper Lee',
        category: 'Literature',
        publisher: 'Harper Perennial Modern Classics',
        publicationYear: 1960,
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. Compassionate, dramatic, and deeply moving, "To Kill a Mockingbird" takes readers to the roots of human behavior.',
        totalCopies: 7,
        availableCopies: 6,
        shelfLocation: 'Bay LIT-301'
      },
      {
        title: '1984',
        ISBN: '978-0451524935',
        author: 'George Orwell',
        category: 'Literature',
        publisher: 'Signet Classic',
        publicationYear: 1949,
        coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
        description: 'A startling and haunting novel that depicts totalitarian society under constant surveillance by Big Brother and the Party, introducing iconic ideas like Newspeak and doublethink.',
        totalCopies: 6,
        availableCopies: 5,
        shelfLocation: 'Bay LIT-304'
      },
      {
        title: 'A Brief History of Time',
        ISBN: '978-0553380163',
        author: 'Stephen Hawking',
        category: 'Physics & Science',
        publisher: 'Bantam Books',
        publicationYear: 1998,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
        description: 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking explores profound questions about the universe, black holes, time travel, and the nature of God.',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Section SCI-401'
      },
      {
        title: 'Cosmos',
        ISBN: '978-0345539434',
        author: 'Carl Sagan',
        category: 'Physics & Science',
        publisher: 'Ballantine Books',
        publicationYear: 1980,
        coverImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=600',
        description: 'The story of fifteen billion years of cosmic evolution transforming matter and life into consciousness, of how science and civilization grew up together.',
        totalCopies: 3,
        availableCopies: 3,
        shelfLocation: 'Section SCI-403'
      },
      {
        title: 'Thinking, Fast and Slow',
        ISBN: '978-0374533557',
        author: 'Daniel Kahneman',
        category: 'Psychology',
        publisher: 'Farrar, Straus and Giroux',
        publicationYear: 2011,
        coverImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600',
        description: 'Takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.',
        totalCopies: 5,
        availableCopies: 4,
        shelfLocation: 'Shelf PSY-501'
      },
      {
        title: 'Principles of Economics',
        ISBN: '978-0357038314',
        author: 'N. Gregory Mankiw',
        category: 'Business & Economics',
        publisher: 'Cengage Learning',
        publicationYear: 2020,
        coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600',
        description: 'The most popular introductory economics textbook in the world, renowned for its clear and concise presentation of fundamental economic principles.',
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Hall ECON-601'
      },
      {
        title: 'Linear Algebra and Its Applications',
        ISBN: '978-0134022697',
        author: 'David C. Lay, Steven R. Lay, Judi J. McDonald',
        category: 'Mathematics',
        publisher: 'Pearson',
        publicationYear: 2015,
        coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
        description: 'Linear algebra is relatively easy for students during the early stages of the course, when the material is presented in a familiar, concrete setting. This textbook balances abstract vector concepts with matrix computations.',
        totalCopies: 4,
        availableCopies: 4,
        shelfLocation: 'Stack MATH-701'
      },
      {
        title: 'Zero to One: Notes on Startups, or How to Build the Future',
        ISBN: '978-0804139298',
        author: 'Peter Thiel & Blake Masters',
        category: 'Business & Economics',
        publisher: 'Crown Business',
        publicationYear: 2014,
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
        description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. In Zero to One, legendary entrepreneur and investor Peter Thiel shows how we can find singular ways to create those new things.',
        totalCopies: 4,
        availableCopies: 3,
        shelfLocation: 'Hall ECON-605'
      }
    ];

    const books = await Book.insertMany(booksData);
    console.log(`Created ${books.length} books.`);

    console.log('Seeding Borrow Records...');
    const now = new Date();

    // 1. Alex Johnson - Currently borrowed (active, on-time)
    const issueDate1 = new Date(now);
    issueDate1.setDate(issueDate1.getDate() - 5);
    const dueDate1 = new Date(issueDate1);
    dueDate1.setDate(dueDate1.getDate() + 14);

    const record1 = await BorrowRecord.create({
      userId: studentAlex._id,
      bookId: books[0]._id, // Clean Code
      requestDate: new Date(issueDate1.getTime() - 24 * 60 * 60 * 1000),
      issueDate: issueDate1,
      dueDate: dueDate1,
      status: 'borrowed',
      processedBy: adminUser._id,
      adminNotes: 'Issued in good condition.'
    });

    // 2. Sarah Miller - Overdue book! (issued 20 days ago, due 6 days ago)
    const issueDate2 = new Date(now);
    issueDate2.setDate(issueDate2.getDate() - 20);
    const dueDate2 = new Date(issueDate2);
    dueDate2.setDate(dueDate2.getDate() + 14); // 6 days overdue
    const daysOverdue = Math.ceil((now - dueDate2) / (1000 * 60 * 60 * 24));
    const lateFee2 = daysOverdue * settings.dailyLateFee;

    const record2 = await BorrowRecord.create({
      userId: studentSarah._id,
      bookId: books[1]._id, // Designing Data-Intensive Applications
      requestDate: new Date(issueDate2.getTime() - 24 * 60 * 60 * 1000),
      issueDate: issueDate2,
      dueDate: dueDate2,
      status: 'overdue',
      lateFee: lateFee2,
      processedBy: adminUser._id,
      adminNotes: 'Automated overdue notification sent.'
    });

    // 3. Prof Robert Langdon - Active borrow
    const issueDate3 = new Date(now);
    issueDate3.setDate(issueDate3.getDate() - 3);
    const dueDate3 = new Date(issueDate3);
    dueDate3.setDate(dueDate3.getDate() + 14);

    const record3 = await BorrowRecord.create({
      userId: staffRobert._id,
      bookId: books[2]._id, // AI Russell & Norvig
      requestDate: issueDate3,
      issueDate: issueDate3,
      dueDate: dueDate3,
      status: 'borrowed',
      processedBy: adminUser._id,
      adminNotes: 'Faculty checkout.'
    });

    // 4. David Kim - Returned book (with completed return)
    const issueDate4 = new Date(now);
    issueDate4.setDate(issueDate4.getDate() - 25);
    const dueDate4 = new Date(issueDate4);
    dueDate4.setDate(dueDate4.getDate() + 14);
    const returnDate4 = new Date(issueDate4);
    returnDate4.setDate(returnDate4.getDate() + 10); // returned on time

    const record4 = await BorrowRecord.create({
      userId: studentDavid._id,
      bookId: books[4]._id, // CLRS
      requestDate: issueDate4,
      issueDate: issueDate4,
      dueDate: dueDate4,
      returnDate: returnDate4,
      status: 'returned',
      lateFee: 0,
      processedBy: adminUser._id,
      adminNotes: 'Returned in pristine condition.'
    });

    // 5. Sarah Miller - Pending Request (awaiting librarian approval)
    const record5 = await BorrowRecord.create({
      userId: studentSarah._id,
      bookId: books[8]._id, // A Brief History of Time
      requestDate: new Date(),
      status: 'pending',
      userNotes: 'Required for physics seminar presentation.'
    });

    // 6. David Kim - Pending Request
    const record6 = await BorrowRecord.create({
      userId: studentDavid._id,
      bookId: books[10]._id, // Thinking, Fast and Slow
      requestDate: new Date(),
      status: 'pending',
      userNotes: 'Behavioral economics elective.'
    });

    // 7. Dr. Emily Watson - Active borrow
    const issueDate7 = new Date(now);
    issueDate7.setDate(issueDate7.getDate() - 7);
    const dueDate7 = new Date(issueDate7);
    dueDate7.setDate(dueDate7.getDate() + 14);

    const record7 = await BorrowRecord.create({
      userId: staffEmily._id,
      bookId: books[13]._id, // Zero to One
      requestDate: issueDate7,
      issueDate: issueDate7,
      dueDate: dueDate7,
      status: 'borrowed',
      processedBy: adminUser._id
    });

    console.log('Seeding Notifications...');
    await Notification.create([
      {
        userId: studentAlex._id,
        title: 'Book Issued Successfully',
        message: `'Clean Code' has been issued to you. Due date is ${dueDate1.toLocaleDateString()}.`,
        type: 'book_issued',
        isRead: true
      },
      {
        userId: studentSarah._id,
        title: 'URGENT: Book Overdue',
        message: `'Designing Data-Intensive Applications' was due on ${dueDate2.toLocaleDateString()}. Daily fee: ₹${settings.dailyLateFee}. Current fee: ₹${lateFee2}. Please return promptly.`,
        type: 'overdue',
        isRead: false
      },
      {
        userId: studentSarah._id,
        title: 'Borrow Request Received',
        message: "Your request for 'A Brief History of Time' has been submitted and is awaiting librarian approval.",
        type: 'borrow_request',
        isRead: false
      },
      {
        userId: studentDavid._id,
        title: 'Return Confirmed',
        message: "Your return of 'Introduction to Algorithms (CLRS)' has been processed. Thank you!",
        type: 'book_returned',
        isRead: true
      },
      {
        userId: staffRobert._id,
        title: 'Faculty Borrowing Activated',
        message: "'Artificial Intelligence: A Modern Approach' is now on loan to you.",
        type: 'book_issued',
        isRead: false
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Default credentials for testing:');
    console.log('  Admin:   admin@library.com   / Admin@123');
    console.log('  Student: student@library.com / Student@123');
    console.log('  Student: sarah@library.com   / Student@123');
    console.log('  Staff:   staff@library.com   / Staff@123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
