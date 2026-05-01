export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err);
  if (req.xhr || req.headers.accept?.includes('json')) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
  res.redirect('/admin/pageError');
};
