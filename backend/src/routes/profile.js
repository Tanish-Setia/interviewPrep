const express = require('express');
const { auth } = require('../middlewares/auth');
const Profile = require('../models/Profile');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const {
      fullName,
      phone,
      location,
      headline,
      bio,
      experience,
      education,
      skills
    } = req.body;

    if (fullName) profile.fullName = fullName;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (experience) profile.experience = experience;
    if (education) profile.education = education;
    if (skills) profile.skills = skills;

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;