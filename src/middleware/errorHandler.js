/**
 * Global Centralized Error Handling Middleware
 * Ensures consistent JSON response contract across all errors.
 */

function errorHandler(err, req, res, next) {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: getErrorName(statusCode),
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}

function getErrorName(status) {
  switch (status) {
    case 400: return 'Bad Request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 422: return 'Unprocessable Entity';
    default: return 'Internal Server Error';
  }
}

module.exports = errorHandler;
