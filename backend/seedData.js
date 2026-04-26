const Donor = require('./models/Donor');

function dAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const NAMES = [
  'Arjun Sharma','Priya Iyer','Ravi Kumar','Meera Nair','Suresh Patel',
  'Ananya Singh','Kiran Reddy','Deepika Joshi','Aakash Mehta','Sunita Devi',
  'Manish Gupta','Kavitha Krishnan','Rajesh Nair','Pooja Agarwal','Nikhil Verma',
  'Lakshmi Pillai','Sanjay Yadav','Rashida Begum','Vivek Chauhan','Sarita Mishra',
  'Rohit Saxena','Divya Menon','Amrit Singh','Tanya Sharma','Farhan Qureshi',
  'Sneha Iyer','Manoj Tiwari','Asha Rani','Vikram Bose','Nisha Kapoor',
  'Amit Jain','Rekha Menon','Sunil Dubey','Kaveri Rajan','Ashok Kumar',
  'Preethi Srinivasan','Gaurav Mishra','Sumita Roy','Ajay Pandey','Lalitha Devi',
  'Sachin Patil','Uma Shankar','Rajiv Gandhi','Chitra Suresh','Hemant Rao',
  'Vandana Mehta','Dinesh Choudhary','Anita Kumari','Pramod Sinha','Geetha Nair',
  'Bharat Patel','Sarla Gupta','Vinod Sharma','Kamala Devi','Pankaj Verma',
  'Shobha Iyer','Rajan Pillai','Sushmita Sen','Naresh Tiwari','Padma Laxmi',
  'Hardik Shah','Nandita Roy','Arun Menon','Savita Reddy','Girish Kumar',
  'Rani Devi','Sanjeev Joshi','Madhuri Dixit','Rajendra Singh','Usha Rani',
  'Tarun Bose','Seema Patel','Bhavesh Mehta','Jyoti Sharma','Ramesh Nair',
  'Alka Gupta','Sudhir Rao','Preeti Kapoor','Yogesh Kumar','Leela Devi',
  'Mohit Jain','Shanti Pillai','Harish Sinha','Mala Iyer','Devendra Patel',
  'Radha Menon','Sushil Kumar','Poonam Sharma','Virendra Singh','Kamla Nair',
  'Ritu Agarwal','Deepak Verma','Sunaina Roy','Arvind Chauhan','Geeta Mishra',
  'Vishal Tiwari','Pushpa Devi','Navin Rao','Champa Bai','Lokesh Patel',
  'Saroj Kumari','Mahesh Gupta','Rekha Joshi','Ramkumar Singh','Urvashi Menon',
  'Bhushan Mehta','Nalini Iyer','Chetan Sharma','Vimla Devi','Sohan Lal',
  'Sulekha Roy','Prabhat Kumar','Durga Patel','Satish Verma','Savitri Nair'
];

const CITIES = {
  'Maharashtra':    ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Thane'],
  'Karnataka':      ['Bengaluru','Mysuru','Hubballi','Mangaluru','Belagavi'],
  'Tamil Nadu':     ['Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli'],
  'Telangana':      ['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam'],
  'Kerala':         ['Kochi','Thiruvananthapuram','Kozhikode','Thrissur','Kollam'],
  'Gujarat':        ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar'],
  'Uttar Pradesh':  ['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Noida'],
  'Rajasthan':      ['Jaipur','Jodhpur','Udaipur','Kota','Ajmer'],
  'West Bengal':    ['Kolkata','Howrah','Durgapur','Asansol','Siliguri'],
  'Punjab':         ['Ludhiana','Amritsar','Jalandhar','Patiala','Chandigarh'],
  'Haryana':        ['Gurugram','Faridabad','Panipat','Ambala','Hisar'],
  'Madhya Pradesh': ['Bhopal','Indore','Gwalior','Jabalpur','Ujjain'],
  'Bihar':          ['Patna','Gaya','Bhagalpur','Muzaffarpur','Darbhanga'],
  'Odisha':         ['Bhubaneswar','Cuttack','Rourkela','Berhampur','Sambalpur'],
  'Assam':          ['Guwahati','Silchar','Dibrugarh','Jorhat']
};

const STATES  = Object.keys(CITIES);
const BLOODS  = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const GENDERS = ['Male','Female'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateDonors() {
  const donors = [];
  for (let i = 0; i < 200; i++) {
    const gender  = rand(GENDERS);
    const state   = rand(STATES);
    const city    = rand(CITIES[state]);
    const minDays = gender === 'Female' ? 120 : 90;
    // 70% eligible, 30% not
    const daysAgo = Math.random() < 0.7
      ? randInt(minDays, minDays + 200)
      : randInt(10, minDays - 1);

    const nameBase = NAMES[i % NAMES.length];
    // Make name unique by adding index suffix if needed
    const name = i < NAMES.length ? nameBase : `${nameBase} ${Math.floor(i / NAMES.length) + 1}`;

    donors.push({
      name,
      age:              randInt(18, 65),
      gender,
      bloodGroup:       rand(BLOODS),
      state,
      city,
      lastDonationDate: dAgo(daysAgo),
      contact:          `${rand(['98','97','96','95','94','93','92','91','90','89','88','87','86'])}${String(randInt(10000000, 99999999))}`,
      email:            `donor${i + 1}@lifelink.demo`,
      password:         'Demo@1234',
      isAvailable:      Math.random() > 0.15   // 85% available
    });
  }
  return donors;
}

module.exports = async function seedData() {
  const count = await Donor.countDocuments();

  // Always ensure admin account exists
  const bcrypt = require('bcryptjs');
  const ADMIN_EMAIL = 'admin@lifelink.com';
  let admin = await Donor.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    const hashed = await bcrypt.hash('Admin@1234', 10);
    admin = await Donor.create({
      name: 'LifeLink Admin',
      age: 30,
      gender: 'Male',
      bloodGroup: 'O+',
      state: 'Maharashtra',
      city: 'Mumbai',
      lastDonationDate: new Date(Date.now() - 100 * 86400000),
      contact: '9000000000',
      email: ADMIN_EMAIL,
      password: hashed,
      isAvailable: false,
      isAdmin: true
    });
    console.log(`🔐 Admin created → email: ${ADMIN_EMAIL}  password: Admin@1234`);
  }

  if (count >= 200) {
    console.log(`ℹ️  DB has ${count} donors — skipping seed`);
    return;
  }
  await Donor.deleteMany({ isAdmin: { $ne: true } }); // keep admin
  const donors  = generateDonors();
  // Hash passwords in bulk
  const hashed  = await Promise.all(donors.map(async d => ({
    ...d, password: await bcrypt.hash(d.password, 10)
  })));
  await Donor.insertMany(hashed, { ordered: false });
  console.log(`🌱 Seeded 200 donors (password: Demo@1234)`);
};
