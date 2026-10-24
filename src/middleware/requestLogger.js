/**
 * Request Logger Middleware
 * Provides real-time request tracking with timestamps and response duration.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${color}${res.statusCode}${reset} (${duration}ms)`
    );
  });

  next();
}

module.exports = requestLogger;
