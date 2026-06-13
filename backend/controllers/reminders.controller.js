const Reminder = require('../models/Reminder.model');
const nodemailer = require('nodemailer');

const buildWhatsAppLink = (phone, message) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned.replace('+', '')}?text=${encoded}`;
};

const getTransporter = async () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  // Dev fallback: Ethereal
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const buildEmailHtml = (coachName, clientName, message) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Arial, sans-serif; background: #0e0e0e; color: #f0ede6; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 32px auto; background: #161616; border: 1px solid #2a2a2a; border-radius: 6px; overflow: hidden; }
  .header { background: #c8f135; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 28px; color: #0e0e0e; font-family: monospace; letter-spacing: 2px; }
  .body { padding: 32px; }
  .body p { color: #888; font-size: 14px; line-height: 1.6; }
  .message { background: #1f1f1f; border-left: 3px solid #c8f135; padding: 16px 20px; border-radius: 4px; margin: 20px 0; }
  .message p { color: #f0ede6; margin: 0; font-size: 15px; }
  .footer { padding: 16px 32px; border-top: 1px solid #2a2a2a; color: #555; font-size: 12px; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>CoachSpace</h1></div>
  <div class="body">
    <p>Hi <strong style="color:#f0ede6">${coachName}</strong>,</p>
    <p>You have a reminder${clientName ? ` for <strong style="color:#c8f135">${clientName}</strong>` : ''}:</p>
    <div class="message"><p>${message.replace(/\n/g, '<br>')}</p></div>
    <p>This is an automated reminder from CoachSpace.</p>
  </div>
  <div class="footer">CoachSpace · Fitness Coaching Platform</div>
</div>
</body>
</html>`;

const sendEmailReminder = async (reminder, coach, client) => {
  try {
    const transporter = await getTransporter();
    const clientName = client ? `${client.firstName} ${client.lastName}` : null;
    const info = await transporter.sendMail({
      from: `"CoachSpace" <${process.env.SMTP_USER || 'noreply@coachspace.app'}>`,
      to: coach.email,
      subject: `Reminder: ${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}${clientName ? ` — ${clientName}` : ''}`,
      html: buildEmailHtml(`${coach.firstName} ${coach.lastName}`, clientName, reminder.message),
    });
    console.log('Email sent:', info.messageId);
    if (!process.env.SMTP_HOST) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
};

exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ coach: req.user._id })
      .populate('client', 'firstName lastName number')
      .sort({ scheduledFor: 1 });
    res.json({ success: true, reminders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createReminder = async (req, res) => {
  try {
    const { type, channel, message, scheduledFor, repeat, clientId } = req.body;
    if (!type || !channel || !message || !scheduledFor) {
      return res.status(400).json({ success: false, message: 'type, channel, message, scheduledFor are required' });
    }

    let whatsappLink = null;
    if ((channel === 'whatsapp' || channel === 'both') && clientId) {
      const Client = require('../models/Client.model');
      const client = await Client.findById(clientId);
      if (client?.number) {
        whatsappLink = buildWhatsAppLink(client.number, message);
      }
    }

    const reminder = new Reminder({
      coach: req.user._id,
      client: clientId || null,
      type,
      channel,
      message,
      scheduledFor: new Date(scheduledFor),
      repeat: repeat || 'none',
      whatsappLink,
    });
    await reminder.save();
    await reminder.populate('client', 'firstName lastName number');
    res.status(201).json({ success: true, reminder });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    ).populate('client', 'firstName lastName number');
    if (!reminder) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, reminder });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.triggerReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, coach: req.user._id })
      .populate('client', 'firstName lastName number');
    if (!reminder) return res.status(404).json({ success: false, message: 'Not found' });

    const User = require('../models/User.model');
    const coach = await User.findById(req.user._id);

    let emailSent = false;
    if (reminder.channel === 'email' || reminder.channel === 'both') {
      emailSent = await sendEmailReminder(reminder, coach, reminder.client);
    }

    reminder.status = emailSent || reminder.channel === 'whatsapp' ? 'sent' : 'failed';
    await reminder.save();

    res.json({ success: true, reminder, whatsappLink: reminder.whatsappLink });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// Called by cron — check for due reminders and send emails
exports.processDueReminders = async () => {
  try {
    const now = new Date();
    const due = await Reminder.find({
      status: 'pending',
      scheduledFor: { $lte: now },
      channel: { $in: ['email', 'both'] },
    }).populate('client', 'firstName lastName number').populate('coach');

    for (const reminder of due) {
      const User = require('../models/User.model');
      const coach = await User.findById(reminder.coach);
      if (!coach) continue;

      const sent = await sendEmailReminder(reminder, coach, reminder.client);
      reminder.status = sent ? 'sent' : 'failed';

      if (sent && reminder.repeat !== 'none') {
        const next = new Date(reminder.scheduledFor);
        if (reminder.repeat === 'daily')   next.setDate(next.getDate() + 1);
        if (reminder.repeat === 'weekly')  next.setDate(next.getDate() + 7);
        if (reminder.repeat === 'monthly') next.setMonth(next.getMonth() + 1);
        reminder.scheduledFor = next;
        reminder.status = 'pending';
      }

      await reminder.save();
    }
  } catch (err) {
    console.error('Reminder cron error:', err.message);
  }
};
