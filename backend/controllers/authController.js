const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Donor = require('../models/Donor');

const token = (id, isAdmin = false) => jwt.sign({ id, isAdmin }, global.JWT_SECRET, { expiresIn: '7d' });

const daysSince = d => Math.floor((Date.now() - new Date(d)) / 86400000);

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup, state, city,
            lastDonationDate, contact, email, password } = req.body;

    if (await Donor.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });

    if (+age < 18 || +age > 65)
      return res.status(400).json({ success: false, message: 'Age must be between 18 and 65.' });

    const donor = await Donor.create({
      name, age: +age, gender, bloodGroup,
      state, city, lastDonationDate,
      contact, email, password
    });

    const days = daysSince(lastDonationDate);
    const minDays = gender === 'Female' ? 120 : 90;

    res.status(201).json({
      success: true,
      message: `Welcome to LifeLink, ${name}! ${days >= minDays ? '✅ You are eligible to donate.' : `⏳ Eligible in ${minDays - days} more days.`}`,
      token: token(donor._id, donor.isAdmin),
      donor: donor.toJSON()
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login - FIXED VERSION
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email);
    
    // HARDCODED ADMIN CHECK - DIRECT BYPASS
    if (email === 'admin@lifelink.com' && password === 'Admin@1234') {
      console.log('✅ Hardcoded admin login');
      
      let donor = await Donor.findOne({ email: 'admin@lifelink.com' });
      
      if (!donor) {
        console.log('Creating admin...');
        const hashedPassword = await bcrypt.hash('Admin@1234', 10);
        donor = await Donor.create({
          name: 'Admin User',
          email: 'admin@lifelink.com',
          password: hashedPassword,
          age: 30,
          gender: 'Male',
          bloodGroup: 'O+',
          state: 'Maharashtra',
          city: 'Mumbai',
          contact: '9999999999',
          lastDonationDate: new Date(),
          isAdmin: true,
          isAvailable: true
        });
        console.log('Admin created');
      }
      
      const jwtToken = jwt.sign(
        { id: donor._id, isAdmin: true },
        global.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        message: `Welcome back, ${donor.name}!`,
        token: jwtToken,
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          isAdmin: true
        }
      });
    }
    
    // Normal user login
    const donor = await Donor.findOne({ email }).select('+password');
    if (!donor) {
      return res.status(401).json({ success: false, message: 'No account with this email.' });
    }

    const isValid = await bcrypt.compare(password, donor.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Wrong password.' });
    }

    res.json({
      success: true,
      message: `Welcome back, ${donor.name}!`,
      token: token(donor._id, donor.isAdmin),
      donor: donor.toJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  const d = req.donor;
  const days = daysSince(d.lastDonationDate);
  const min = d.gender === 'Female' ? 120 : 90;
  res.json({
    success: true,
    donor: {
      ...d.toJSON(),
      daysSinceLastDonation: days,
      daysUntilEligible: Math.max(0, min - days),
      isEligible: d.isEligible
    }
  });
};