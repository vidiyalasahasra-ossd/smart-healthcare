const axios = require('axios');
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const email = 'testdoc' + Date.now() + '@example.com';
    const registerData = {
      name: 'Test Doctor',
      email,
      password: 'password123',
      role: 'doctor',
      phone: '1234567890',
      specialization: 'General Medicine',
      experience: 10,
      qualification: 'MBBS',
      about: 'Test doctor'
    };

    console.log('registerData', registerData);

    const reg = await axios.post(base + '/auth/register', registerData);
    console.log('register status', reg.status);
    console.log('register body', reg.data);
    const token = reg.data.token;
    console.log('token', token);

    const profile = await axios.get(base + '/doctors/profile/me', {
      headers: { Authorization: 'Bearer ' + token }
    });

    console.log('profile status', profile.status);
    console.log('profile body', profile.data);
  } catch (err) {
    if (err.response) {
      console.error('API error status', err.response.status);
      console.error('API error body', err.response.data);
    } else {
      console.error('Error', err.message);
    }
  }
})();