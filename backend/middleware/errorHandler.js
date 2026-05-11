// 404 handler
export function notFound(req, res, next) {
  res.status(404).json({ error: `Route bulunamadı: ${req.originalUrl}` });
}

// Global error handler
export function errorHandler(err, req, res, next) {
  console.error('❌ Hata:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
