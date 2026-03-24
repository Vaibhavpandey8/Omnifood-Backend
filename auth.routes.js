const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyEmail, updateProfile } = require('./auth.controller');
const { protect } = require('./auth.middleware');
const passport = require('./passport');
const generateToken = require('./generateToken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/verify-email', verifyEmail);
router.put('/profile', protect, updateProfile);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const photo = req.user.photo || '';
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&name=${encodeURIComponent(req.user.fullName)}&photo=${encodeURIComponent(photo)}`);
  }
);

module.exports = router;
