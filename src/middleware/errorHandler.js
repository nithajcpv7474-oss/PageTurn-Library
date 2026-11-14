function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique value already exists.'
    });
  }

  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({
      success: false,
      message: 'The referenced reader or book does not exist.'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
}

module.exports = { notFoundHandler, errorHandler };
