function validateBook(body) {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const genre = typeof body.genre === 'string' ? body.genre.trim() : '';
  const author = typeof body.author === 'string' ? body.author.trim() : '';

  if (!name) errors.push('Book name is required.');
  if (!genre) errors.push('Book genre is required.');
  if (!author) errors.push('Book author is required.');

  return { valid: errors.length === 0, errors, values: { name, genre, author } };
}

function validateReader(body) {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!name) errors.push('Reader name is required.');
  if (!email) errors.push('Reader email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  return { valid: errors.length === 0, errors, values: { name, email } };
}

module.exports = { validateBook, validateReader };
