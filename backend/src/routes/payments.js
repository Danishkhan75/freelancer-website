import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../server.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', description, email, phoneNumber } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: 'Amount and email required' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      description,
      receipt: `receipt_${Date.now()}`,
      customer_notify: 1
    });

    // Save order to database
    const { data: dbOrder, error } = await supabase
      .from('payments')
      .insert([{
        razorpay_order_id: order.id,
        amount,
        currency,
        email,
        phone_number: phoneNumber,
        status: 'pending',
        description
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      dbOrderId: dbOrder.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id,
        razorpay_signature
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (error) throw error;

    // Send confirmation emails
    await sendEmail({
      to: payment.email,
      subject: 'Payment Confirmation - Freelancer Services',
      template: 'payment-confirmation',
      data: {
        amount: payment.amount,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      }
    });

    // Send admin notification
    await sendEmail({
      to: [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2],
      subject: 'New Payment Received',
      template: 'admin-payment-notification',
      data: {
        amount: payment.amount,
        email: payment.email,
        orderId: razorpay_order_id
      }
    });

    res.json({
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Razorpay events
router.post('/webhook', async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.authorized') {
      const { payment } = payload;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'authorized' })
        .eq('razorpay_payment_id', payment.id);
    }

    res.json({ status: 'received' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
