const Donor = require('../models/Donor');
const bcrypt = require('bcryptjs');

// GET /api/admin/donors — all donors with full info
exports.getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json({ success: true, count: donors.length, donors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/donors/:id — single donor
exports.getDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found.' });
    res.json({ success: true, donor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/donors — create donor (admin can create any donor)
exports.createDonor = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, state, city,
            lastDonationDate, contact, email, password } = req.body;

    if (await Donor.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const donor = await Donor.create({
      name, age: +age, gender, bloodGroup,
      state, city, lastDonationDate,
      contact, email, password
    });

    res.status(201).json({ success: true, message: 'Donor created.', donor: donor.toJSON() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/donors/:id — update any donor
exports.updateDonor = async (req, res) => {
  try {
    const allowed = ['name','age','gender','bloodGroup','state','city',
                     'lastDonationDate','contact','email','isAvailable'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    // Handle password update separately (needs hashing)
    if (req.body.password && req.body.password.length >= 6) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const donor = await Donor.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found.' });

    res.json({ success: true, message: 'Donor updated.', donor: donor.toJSON() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/donors/:id — delete donor
exports.deleteDonor = async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.donor._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });

    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found.' });

    res.json({ success: true, message: `Donor "${donor.name}" deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const total      = await Donor.countDocuments();
    const available  = await Donor.countDocuments({ isAvailable: true });
    const byBlood    = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byState    = await Donor.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json({ success: true, stats: { total, available, unavailable: total - available, byBlood, byState } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
