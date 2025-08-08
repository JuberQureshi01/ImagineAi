
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/order', authMiddleware, async (req, res) => {
  try {
    // Generate a short, unique receipt ID that is guaranteed to be under 40 characters.
    const receiptId = `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const options = {
      amount: 1200 * 100, // Amount in paise (e.g., ₹1200)
      currency: 'INR',
      receipt: receiptId,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send('Error creating order');

    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment and upgrade user to "pro"
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const userId = req.user.id;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ msg: "Missing payment details" });
  }

  try {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: 'Transaction not legit!' });
    }

    // --- Payment is verified ---
    // Use a transaction to update user plan and record the payment
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Record the successful payment
      await tx.payment.create({
        data: {
          userId: userId,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          amount: 1200 * 100,
          currency: 'INR',
          status: 'success',
        },
      });

      // 2. Upgrade the user's plan to "pro"
      const user = await tx.user.update({
        where: { id: userId },
        data: { plan: 'pro' },
      });
      return user;
    });

    res.json({
      msg: 'Payment successful! Your plan has been upgraded to Pro.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
      },
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;