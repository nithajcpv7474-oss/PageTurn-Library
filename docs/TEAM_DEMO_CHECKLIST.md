# PageTurn Library — Team Demo Checklist

## Suggested 3-minute demo order

1. Introduce PageTurn Library and the paper-register problem.
2. Show the three SQLite tables: readers, books and loans.
3. Call `GET /books` and `GET /readers`.
4. Demonstrate `POST /books` and a validation failure.
5. Demonstrate genre search.
6. Demonstrate ascending and descending name sorting.
7. Demonstrate invalid `sort=colour` and show HTTP 400 with `Cannot sort by that field.`
8. Create a loan and show `GET /loans` returning both reader and book names.
9. Explain how to run the project and automated tests.

## Questions every member should prepare for

- What is Node.js?
- What is Express.js and why is it used?
- What is a route and what are request and response objects?
- What is SQLite?
- What is a primary key? What is a foreign key?
- Why are readers, books and loans separate tables?
- What is CRUD?
- What is a parameterized query and why is it important?
- What is an SQL JOIN?
- What is the difference between a route parameter and a query parameter?
- Why does a successful creation return 201?
- Why does an unknown sort field return 400?
- How does the API validate request data?
