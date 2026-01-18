# Expense Tracker

A production-ready full-stack expense tracking application built for reliability and correctness under real-world conditions like network retries, refreshes, and slow connections.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel-ready

## ✨ Features

- ✅ Add expenses with amount, category, description, and date
- ✅ View expenses sorted by date (newest/oldest)
- ✅ Filter expenses by category
- ✅ Calculate total of visible expenses
- ✅ Idempotent API for safe retries
- ✅ Integer-based money storage (no floating-point errors)
- ✅ Real-time validation

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expenses-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # MONGO_URI=your_mongodb_connection_string
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🧠 Key Design Decisions

### 1. **Integer Money Storage (No Floats!)**

**Why?** Floating-point arithmetic is imprecise (`0.1 + 0.2 = 0.30000000000000004`).

**Solution**: Store amounts as **cents (integers)**.

### 2. **Idempotency Keys for Retry Safety**

**Why?** Network failures, slow connections, or accidental double-clicks can cause duplicate submissions.

**Solution**: Every form submission generates a unique UUID (`idempotencyKey`) that:

- Persists across retries (only rotated on success)
- Is sent in the `Idempotency-Key` header
- Backend checks if an expense with this key already exists:
  - **Exists**: Return the existing record (200 OK)
  - **New**: Create new expense (201 Created)

### 3. **Cached MongoDB Connection**

**Why?** Next.js hot-reloads in development can create new connections on every change, exhausting database limits.

**Solution**: Cache connection globally using `global.mongooseCache`.


## ⚖️ Trade-offs & What I Did **NOT** Implement

| Feature                | Decision                      | Reason                                                     |
| ---------------------- | ----------------------------- | ---------------------------------------------------------- |
| **Authentication**     | ❌ Not implemented            | Out of scope for MVP                                       |
| **Pagination**         | ❌ Not implemented            | Works fine for small datasets; would add for 1000+ records |
| **Edit/Delete**        | ❌ Not implemented            | Focus was on reliable creation & viewing                   |
| **Advanced Filtering** | ❌ Date range, multi-category | Basic category filter sufficient for demo                  |
| **UI Polish**          | Minimal styling               | Prioritized correctness over aesthetics                    |
| **Unit Tests**         | ❌ Not implemented            | Would add for production (Jest/React Testing Library)      |


**Built By Sarvesh with ❤️ for correctness over complexity**
