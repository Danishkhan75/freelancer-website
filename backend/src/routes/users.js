import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { supabase } from '../server.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone_number, profile_image, bio, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', [
  body('name').optional().notEmpty(),
  body('phone_number').optional().isMobilePhone(),
  body('bio').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, phone_number, bio, profile_image } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ name, phone_number, bio, profile_image })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Get user
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (getUserError) throw getUserError;

    // Verify old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
