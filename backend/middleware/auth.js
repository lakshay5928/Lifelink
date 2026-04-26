const jwt   = require('jsonwebtoken');
const Donor = require('../models/Donor');

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Please login first.' });

  try {
    const { id } = jwt.verify(auth.split(' ')[1], global.JWT_SECRET);
    req.donor = await Donor.findById(id).select('-password');
    if (!req.donor) return res.status(401).json({ success: false, message: 'Account not found.' });
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
};
