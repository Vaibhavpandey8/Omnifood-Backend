const User = require('./user.model');
const generateToken = require('./generateToken');
const { sendVerificationEmail } = require('./email');
const crypto = require('crypto');

// @desc    Register
// @route   POST /api/users/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      fullName,
      email,
      password,
      verificationToken,
      isVerified: true, // Development mein true rakho
    });

    // Email try karo but fail hone pe bhi signup success ho
    try {
      await sendVerificationEmail(email, fullName, verificationToken);
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email?token=xxx
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect('http://localhost:5173?verified=true');

  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/users/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first!' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      token,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName },
      { new: true }
    );
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      photo: user.photo,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Me
// @route   GET /api/users/me
const getMe = async (req, res) => {
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    photo: req.user.photo,
  });
};

module.exports = { register, login, getMe, verifyEmail, updateProfile };
