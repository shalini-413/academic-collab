const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// Search Professors
router.get('/professors', verifyToken, async (req, res) => {
  try {
    const { q, university, country, type, payment } = req.query;

    let query = { role: 'Professor' };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { researchInterests: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (university) query.university = { $regex: university, $options: 'i' };
    if (country) query.country = { $regex: country, $options: 'i' };
    if (type) query.projectType = type;           // "remote" or "onsite"
    if (payment) query.paymentType = payment;     // "paid" or "unpaid"

    const professors = await User.find(query)
      .select('name email university country bio researchInterests skills')
      .sort({ createdAt: -1 });

    res.json(professors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;