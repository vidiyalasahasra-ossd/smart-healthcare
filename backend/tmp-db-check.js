const mongoose = require('mongoose');
const User = require('./models/User');
const Doctor = require('./models/Doctor');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-system');
    const user = await User.findOne({ email: 'doc3@example.com' });
    console.log('user:', user);
    if (!user) {
      console.log('No such user doc3@example.com');
      process.exit(0);
    }
    const doctor = await Doctor.findOne({ user: user._id }).populate('user', 'name email role');
    console.log('doctor:', doctor);
  } catch(err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();