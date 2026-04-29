import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../server.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Submit contact form
router.post('/contact', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('message').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, message, subject } = req.body;

    // Save to database
    const { data: submission, error } = await supabase
      .from('form_submissions')
      .insert([{
        name,
        email,
        phone_number: phoneNumber,
        message,
        subject: subject || 'Contact Form Submission',
        form_type: 'contact',
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation to user
    await sendEmail({
      to: email,
      subject: 'We received your message',
      template: 'contact-confirmation',
      data: { name }
    });

    // Send notification to admin
    await sendEmail({
      to: [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2],
      subject: `New Contact Form Submission from ${name}`,
      template: 'admin-contact-notification',
      data: { name, email, phoneNumber, message, subject }
    });

    res.status(201).json({
      message: 'Form submitted successfully',
      submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get form submissions (admin only)
router.get('/submissions/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: submissions, error, count } = await supabase
      .from('form_submissions')
      .select('*', { count: 'exact' })
      .eq('form_type', type)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ submissions, total: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update form submission status
router.put('/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: submission, error } = await supabase
      .from('form_submissions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Submission updated',
      submission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
