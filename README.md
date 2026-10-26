# Athena — Library Management System (MERN Full Stack)

A modern, responsive, full-stack **Library Management System** built with MongoDB, Express.js, React.js, and Node.js. The platform streamlines book inventory, borrowing requests, automated due date tracking, return processing, overdue calculation with configurable penalty rates, real-time in-app notifications, and CSV report exports.

---

## 1. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Hot Toast, Recharts
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `morgan`, `express-rate-limit`
- **Database:** MongoDB with Mongoose ORM
- **Styling & Theme:** Professional Navy Blue (`#0F172A`, `#1E293B`, `#2563EB`), crisp white cards, and light slate accents (`#F8FAFC`)

---

## 2. User Roles & Pre-Seeded Test Credentials

| Role | Email | Password | Permissions & Features |
|---|---|---|---|
| **Admin / Librarian** | `admin@library.com` | `Admin@123` | Full dashboard analytics, Add/Edit/Delete books, Approve/Reject requests, Direct issue, Return desk, Overdue penalties, User accounts, CSV report exports, System settings |
| **Student** | `student@library.com` | `Student@123` | Browse catalogue, search & filter books, submit borrowing requests, view active loans & due dates, view borrowing history, cancel pending requests |
| **Student (Alt)** | `sarah@library.com` | `Student@123` | Has an active overdue book for testing late fee calculation and penalty alerts |
| **Staff / Faculty** | `staff@library.com` | `Staff@123` | Browse catalogue, faculty checkouts, view active departmental loans & borrowing history |

---

## 3. Key Features

### A. Authentication & Role-Based Authorization
- Secure JWT-based authentication stored in `localStorage` with Axios interceptors.
- Role-based route protection for both frontend pages and backend REST APIs.
- Public registration restricted strictly to **Students** and **Staff** (Admin creation is secured).
- One-click demo credentials autofill on the login screen for rapid testing.

### B. Dynamic Catalogue & Book Management
- Instant search by title, author, or ISBN.
- Filter by category and real-time shelf stock availability.
- Multi-field sorting (Title, publication year, inventory count, date added).
- Full CRUD operations with protection against deleting books with active loans.
- Atomic updates preventing race conditions and inventory inconsistencies on concurrent borrows.

### C. Borrowing, Loans & Return Desk
- Students/Staff can submit borrow requests with optional notes.
- Librarians review pending requests, approve loans (auto-calculating 14-day due date), or decline with feedback.
- Dedicated **Return Desk** allowing librarians to scan/search loans and restock inventory in 1 click.
- Automated overdue monitoring and late fee calculation (default: ₹5 per day, dynamically configurable by Admin).

### D. Visual Analytics & Reports
- Admin Dashboard featuring Recharts:
  - Popular books horizontal bar chart
  - Monthly borrowing and return trends area chart
  - Category distribution pie chart
- Comprehensive report tables with date range filters:
  - Circulation activity report
  - Top borrowed books report
  - Overdue books and defaulters report
  - User directory report
- One-click **Export to CSV** for all tabular data.

### E. In-App Notifications
- Real-time notifications for borrow requests, approvals, rejections, checkouts, returns, and overdue alerts.
- Unread notification badges, dropdown preview in the navbar, and a dedicated notification feed.

---

## 4. Complete List of 21 Frontend Pages

1. **Landing Page** (`/`): Hero showcase, search bar, highlights, featured books, and quick credentials.
2. **Login Page** (`/login`): Authentication with role autofill shortcuts.
3. **Registration Page** (`/register`): Student & Staff registration with ID numbers and validation.
4. **Admin Dashboard** (`/admin/dashboard`): 8 KPI metric cards, Recharts visualizations, and live activity feed.
5. **Student Dashboard** (`/student/dashboard`): Student loan overview, countdown badges, and recommended reading.
6. **Staff Dashboard** (`/staff/dashboard`): Faculty loan tracker and departmental requisitions.
7. **Book Catalogue** (`/books`): Search, category chips, stock filters, sorting, and book cards.
8. **Book Details Page** (`/books/:id`): Full synopsis, shelf coordinates, inventory progress bar, and borrow action.
9. **Add Book Page** (`/admin/books/add`): Comprehensive form for new volumes with live image preview.
10. **Edit Book Page** (`/admin/books/edit/:id`): Update book metadata and copy numbers safely.
11. **Manage Books Page** (`/admin/books`): Admin table with search, direct loan issue, edit, and delete.
12. **Borrowing Requests Page** (`/admin/borrowing/requests`): Review, approve, or reject student requisitions.
13. **Issued Books Page** (`/admin/borrowing/issued`): Monitor all active physical checkouts with due date countdowns.
14. **Return Management Page** (`/admin/borrowing/returns`): Circulation return desk with instant check-in.
15. **Overdue Books Page** (`/admin/borrowing/overdue`): Track overdue books, view calculated late fees, and export CSV.
16. **Borrowing History Page** (`/borrowing/history`): Filterable loan archive for admins and personal history for students.
17. **User Management Page** (`/admin/users`): Manage accounts, view patron stats, suspend/activate, and add members.
18. **Reports & Analytics Page** (`/admin/reports`): Filterable tabular reports with instant CSV export.
19. **Notifications Page** (`/notifications`): Complete in-app alerts inbox with read/unread filters.
20. **Profile & Settings Page** (`/profile` & `/admin/settings`): Profile edit, password change, and Admin library policy editor.
21. **404 Not Found Page** (`*`): Styled error page with easy navigation recovery.

---

## 5. RESTful API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student or staff
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Get current user profile (Private)
- `PUT /api/auth/profile` — Update user details or change password (Private)
- `POST /api/auth/logout` — Logout session (Private)

### Books (`/api/books`)
- `GET /api/books` — Get books with search, category, availability, sort, and pagination
- `GET /api/books/:id` — Get single book details and borrow stats
- `POST /api/books` — Create book (Admin)
- `PUT /api/books/:id` — Update book (Admin)
- `DELETE /api/books/:id` — Delete book (Admin, guarded against active loans)

### Borrowing & Returns (`/api/borrowing`)
- `POST /api/borrowing/request` — Submit borrow request (Student/Staff)
- `GET /api/borrowing/my-records` — Get logged-in user's records (Private)
- `PATCH /api/borrowing/:id/cancel` — Cancel own pending request (Student/Staff)
- `GET /api/borrowing/requests` — View all borrowing requests (Admin)
- `PATCH /api/borrowing/:id/approve` — Approve request & issue book (Admin)
- `PATCH /api/borrowing/:id/reject` — Reject request with note (Admin)
- `POST /api/borrowing/issue` — Directly issue book to a patron (Admin)
- `PATCH /api/borrowing/:id/return` — Process return & calculate late fee (Admin)
- `GET /api/borrowing/overdue` — List overdue loans with accrued penalties (Admin)
- `GET /api/borrowing/history` — Complete circulation history (Admin)

### Users (`/api/users`)
- `GET /api/users` — Get all users with filters (Admin)
- `POST /api/users` — Create user account (Admin)
- `GET /api/users/:id` — Get user profile and loan stats (Admin)
- `PATCH /api/users/:id` — Update status (active/suspended) or details (Admin)
- `DELETE /api/users/:id` — Delete user account (Admin, guarded against active loans)

### Dashboard & Reports (`/api/dashboard` & `/api/reports`)
- `GET /api/dashboard/stats` — Role-aware dashboard metrics & charts
- `GET /api/reports/borrowing` — Circulation activity report (Admin)
- `GET /api/reports/popular-books` — Top borrowed books report (Admin)
- `GET /api/reports/overdue` — Overdue loans report (Admin)
- `GET /api/reports/users` — Patron directory report (Admin)

### Notifications & Settings (`/api/notifications` & `/api/settings`)
- `GET /api/notifications` — Get user's notifications
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all notifications read
- `DELETE /api/notifications/:id` — Remove notification
- `GET /api/settings` — Get system borrowing days and late fee rate
- `PUT /api/settings` — Update library settings (Admin)

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)

### 1. Clone the repository
```bash
git clone <repository_url>
cd library-management-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/library_management_db
JWT_SECRET=athena_library_jwt_super_secret_production_key_2026
CLIENT_URL=http://localhost:5173
PORT=5000
BORROW_DAYS=14
DAILY_LATE_FEE=5
NODE_ENV=development
```

Seed the database with sample books, accounts, and borrowing history:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# or for development with hot reload:
npm run dev
```
The server will start at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The frontend Vite application will start at `http://localhost:5173`.

---

## 7. Security Architecture
- Password hashing with salted `bcryptjs` (salt rounds: 10).
- JWT expiration set to 30 days.
- Rate limiting on authentication routes (50 requests per 15-minute window) using `express-rate-limit`.
- Security HTTP headers injected with `helmet`.
- Database-level unique constraints and compound indexes on `User`, `Book`, and `BorrowRecord`.
- Cross-account access forbidden; students cannot access other students' borrowing records or admin endpoints.
