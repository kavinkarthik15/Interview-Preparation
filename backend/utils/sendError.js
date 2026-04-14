/**
 * Send a standardised error response.
 * In production the raw error detail is omitted to avoid leaking internals.
 */
function sendError(res, statusCode, message, error) {
  const payload = { message };
  if (process.env.NODE_ENV !== 'production' && error) {
    payload.error = error.message || String(error);
  }
  return res.status(statusCode).json(payload);
}

module.exports = sendError;
