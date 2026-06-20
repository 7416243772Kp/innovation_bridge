const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Innovation = require('../models/Innovation');
const FundingRecord = require('../models/FundingRecord');
const Notification = require('../models/Notification');

// Initialize Razorpay SDK
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Route: POST /api/funding/create-order
// Purpose: Generates a unique Razorpay Order ID for the checkout overlay
router.post('/create-order', async (req, res) => {
    try {
        const { amount, innovationId, funderName, funderEmail } = req.body;

        // Razorpay expects amount in paise (multiply INR by 100)
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_inn_${innovationId.substring(0, 8)}`
        };

        const order = await razorpay.orders.create(options);

        // Save preliminary record
        const record = new FundingRecord({
            innovation: innovationId,
            funderName,
            funderEmail,
            amount,
            razorpayOrderId: order.id
        });
        await record.save();

        res.status(200).json({ success: true, orderId: order.id, amount: order.amount });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route: POST /api/funding/verify
// Purpose: Cryptographically confirms payment success & updates platform totals
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, innovationId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Funding Record status
            const record = await FundingRecord.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { razorpayPaymentId: razorpay_payment_id, status: 'Successful' },
                { new: true }
            );

            // 2. Add amount to the Innovation's total funding raised
            const innovation = await Innovation.findById(innovationId).populate('innovator');
            innovation.fundingRaised += record.amount;
            await innovation.save();

            // 3. Trigger Notification to Innovator
            const note = new Notification({
                recipient: innovation.innovator._id,
                senderCompanyName: record.funderName,
                type: 'Funding',
                message: `Congratulations! ${record.funderName} just funded your project with ₹${record.amount}.`,
                innovationTitle: innovation.originalTitle
            });
            await note.save();

            res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;