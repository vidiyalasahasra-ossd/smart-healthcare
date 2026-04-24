const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@smarthealthcare.local';
const ADMIN_PASSWORD = 'Admin@12345';

async function ensureAdminUser() {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return User.create({
    name: 'System Admin',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    phone: '',
  });
}

module.exports = {
  ensureAdminUser,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};
