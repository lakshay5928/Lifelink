const Donor = require('../models/Donor');

const daysSince = d => Math.floor((Date.now() - new Date(d)) / 86400000);

// Simulate SMS — logs to console like real SMS would
function simulateSMS(donor, bloodGroup, requesterCity) {
  const msg = `[LifeLink EMERGENCY] Urgent ${bloodGroup} blood needed in ${requesterCity}. You are a registered donor nearby. Please contact the hospital immediately or call the requester. - LifeLink`;
  console.log(`\n📱 SMS → +91${donor.contact} (${donor.name})`);
  console.log(`   "${msg}"\n`);
  return { to: donor.contact, name: donor.name, status: 'sent', message: msg };
}

// GET /api/donors  — all donors (public)
exports.getAll = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: donors.length,
      donors: donors.map(d => ({ ...d.toJSON(), isEligible: d.isEligible, daysSince: daysSince(d.lastDonationDate) }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/donors/search  — filtered (public)
exports.search = async (req, res) => {
  try {
    const { bloodGroup, state, city } = req.query;
    const q = { isAvailable: true };
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (state)      q.state      = state;
    if (city)       q.city       = city;

    const donors  = await Donor.find(q).sort({ createdAt: -1 });
    const eligible = donors.filter(d => d.isEligible).map(d => ({
      ...d.toJSON(), isEligible: true, daysSince: daysSince(d.lastDonationDate)
    }));

    res.json({ success: true, count: eligible.length, donors: eligible });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/donors/emergency  — find nearest top 10 + simulate SMS
exports.emergency = async (req, res) => {
  try {
    const { bloodGroup, state, city, message: reqMsg } = req.body;

    // Find matching available+eligible donors in same city first, then state
    const byCity  = await Donor.find({ isAvailable: true, bloodGroup, city,  state });
    const byState = await Donor.find({ isAvailable: true, bloodGroup, state, city: { $ne: city } });

    // Merge: city first (nearest), then state
    const allMatching = [...byCity, ...byState].filter(d => d.isEligible);

    // Top 10
    const top10 = allMatching.slice(0, 10);

    // Simulate SMS to each
    const smsResults = top10.map(d => simulateSMS(d, bloodGroup, city || state));

    console.log(`\n🚨 EMERGENCY BROADCAST — ${bloodGroup} needed in ${city || state}`);
    console.log(`   Alerted ${top10.length} donors (top 10 nearest)\n`);

    res.json({
      success: true,
      alertedCount: top10.length,
      message: top10.length > 0
        ? `🚨 SMS alert sent to ${top10.length} nearest donor${top10.length !== 1 ? 's' : ''} in ${city || state}!`
        : `⚠️ No eligible donors found for ${bloodGroup} in ${city || state}.`,
      donors: top10.map(d => ({
        name:       d.name,
        bloodGroup: d.bloodGroup,
        city:       d.city,
        state:      d.state,
        contact:    d.contact,
        smsStatus:  'sent'
      })),
      smsLog: smsResults
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/donors/availability  — toggle own availability [protected]
exports.toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findById(req.donor._id);
    donor.isAvailable = !donor.isAvailable;
    await donor.save();
    res.json({
      success: true,
      isAvailable: donor.isAvailable,
      message: donor.isAvailable
        ? '🟢 You are now visible in donor searches.'
        : '🔴 You are now hidden from donor searches.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/donors/me  — update own profile [protected]
exports.updateMe = async (req, res) => {
  try {
    const allowed = ['name','age','bloodGroup','state','city','lastDonationDate','contact'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const donor = await Donor.findByIdAndUpdate(req.donor._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', donor: donor.toJSON() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
