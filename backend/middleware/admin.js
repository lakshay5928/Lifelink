// Must be used AFTER auth middleware
module.exports = (req, res, next) => {
  if (!req.donor || !req.donor.isAdmin)
    return res.status(403).json({ success: false, message: 'Admin access only.' });
  next();
};
