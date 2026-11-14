# PageTurn Library — Backend Development Fundamentals

A REST API for a small book-lending library. This project covers Node.js, Express, SQLite, relational tables, CRUD, joins, validation, query parameters, HTTP status codes, API testing, and the assignment's sorted-list twist.

## 1. Requirements

- Node.js 18 or newer
- npm
- Postman (for manual API testing)

Check installation:

```bash
node -v
npm -v
```

## 2. Install and run

Open a terminal in the `pageturn-library` project folder:

```bash
npm install
npm run db:init
npm start
```

The server runs at:

```text
http://localhost:3000
```

Open `http://localhost:3000` in a browser to see the API welcome message. Keep the terminal running while testing.

For automatic restart during development:

```bash
npm run dev
```

## 3. Database design

The SQLite database contains three related tables:

### readers
- `id`: primary key
- `name`: reader name
- `email`: unique email address
- `created_at`: record creation time

### books
- `id`: primary key
- `name`: book name
- `genre`: book genre
- `author`: author name
- `available`: 1 means available; 0 means currently lent out
- `created_at`: record creation time

### loans
- `id`: primary key
- `reader_id`: foreign key referencing `readers.id`
- `book_id`: foreign key referencing `books.id`
- `loan_date`: lending date
- `return_date`: return date, empty until returned
- `status`: `borrowed` or `returned`

Relationship: one reader can have many loan records, and one book can appear in multiple loan records over time.

## 4. API endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint | Purpose | Success status |
|---|---|---|---|
| GET | `/` | API welcome message | 200 |
| GET | `/readers` | Get all readers | 200 |
| GET | `/readers/:id` | Get one reader | 200 |
| POST | `/readers` | Add a reader | 201 |
| GET | `/books` | Get all books | 200 |
| GET | `/books/:id` | Get one book | 200 |
| POST | `/books` | Add a book | 201 |
| PUT | `/books/:id` | Update a book | 200 |
| DELETE | `/books/:id` | Delete a book | 200 |
| GET | `/loans` | Get loans with reader and book names (JOIN) | 200 |
| POST | `/loans` | Lend an available book | 201 |
| PATCH | `/loans/:id/return` | Mark a loan as returned | 200 |

## 5. Example requests

### Add a book — `POST /books`

Choose Body → raw → JSON in Postman:

```json
{
  "name": "The Hobbit",
  "genre": "Fantasy",
  "author": "J. R. R. Tolkien"
}
```

### Update a book — `PUT /books/1`

```json
{
  "name": "The Hobbit - Updated",
  "genre": "Fantasy",
  "author": "J. R. R. Tolkien"
}
```

### Search by genre

```text
GET http://localhost:3000/books?genre=Fiction
```

### Assignment twist: sorted lists

Ascending:

```text
GET http://localhost:3000/books?sort=name&order=asc
```

Expected: HTTP 200; book names appear A to Z.

Descending:

```text
GET http://localhost:3000/books?sort=name&order=desc
```

Expected: HTTP 200; book names appear Z to A.

Invalid sort field:

```text
GET http://localhost:3000/books?sort=colour
```

Expected response:

```json
{
  "success": false,
  "message": "Cannot sort by that field."
}
```

Expected status: HTTP 400.

### Loan JOIN endpoint

```text
GET http://localhost:3000/loans
```

The response includes `reader_name` and `book_name`, retrieved by joining the three relational tables.

### Create a loan — `POST /loans`

```json
{
  "reader_id": 1,
  "book_id": 1
}
```

A successful loan changes the book's `available` value to `0`. Return the book using `PATCH /loans/1/return`.

## 6. Validation and status codes

- `200 OK`: request completed successfully.
- `201 Created`: a new reader, book, or loan was created.
- `400 Bad Request`: invalid input or unsupported sort field.
- `404 Not Found`: requested record or route does not exist.
- `409 Conflict`: duplicate email, unavailable book, already returned loan, or book linked to a loan.
- `500 Internal Server Error`: unexpected server error.

Book name, genre, and author are required for both create and update. Reader name and a valid email are required when creating a reader.

SQL values are passed through prepared statements to avoid SQL injection. The sort column is checked against an allow-list before it is added to the SQL statement.

## 7. Run automated tests

Stop the normal server if it is running in the same terminal, then run:

```bash
npm test
```

The tests use a separate in-memory SQLite database and check:
- Get all books
- Sort ascending and descending
- Invalid sort field returns 400 and the required message
- Search by genre
- Validation on book creation
- Add a book
- Loan JOIN returns reader and book names

## 8. Postman collection

Import `postman/PageTurn-Library.postman_collection.json` into Postman.

1. Open Postman.
2. Select Import.
3. Choose the JSON collection file.
4. Confirm the base URL is `http://localhost:3000`.
5. Start the Node server.
6. Run the requests.

For a clean demonstration, test GET books, ascending sort, descending sort, invalid sort, genre search, validation error, create book, create loan, and the JOIN endpoint.

## 9. Suggested team split

Use the six roles shown in the assignment brief:

1. **Server and routes:** Express setup, middleware, route mounting, HTTP methods and status codes.
2. **Database:** SQLite setup, three tables, primary/foreign keys, constraints and queries.
3. **REST endpoints:** CRUD routes and the loan JOIN endpoint.
4. **Validation and search:** input checks, clear errors, parameterized genre search.
5. **Twist rule:** implement and demonstrate all three sorting tests.
6. **Postman and README:** import collection, test endpoints, record evidence and explain how to run.

Each member should understand their own part and be able to explain how it connects to the complete application.

## 10. Submission checklist

- [ ] Project runs locally with `npm install` and `npm start`.
- [ ] SQLite database has readers, books and loans tables.
- [ ] Books GET all, GET one, POST, PUT and DELETE work.
- [ ] Reader and loan routes work.
- [ ] Loans JOIN includes reader and book names.
- [ ] Validation returns clear error messages.
- [ ] Genre query search works.
- [ ] All three sorted-list tests pass.
- [ ] Postman collection is imported and tested.
- [ ] README explains setup, endpoints and tests.
- [ ] Push the project to GitHub and submit its link.

## Notes

The database file is created locally when the project starts or when `npm run db:init` is run. It is intentionally excluded from Git so the project can create its own database on another computer. Sample data is inserted by `npm run db:init`.
