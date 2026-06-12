const User = require('../models/User.model');
const Client = require('../models/Client.model');
const Measurement = require('../models/Measurement.model');

const numericFields = [
  'weight', 'height', 'bodyFat', 'muscleMass',
  'neck', 'shoulders', 'chest', 'waist', 'hips',
  'leftArm', 'rightArm', 'leftForearm', 'rightForearm',
  'leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'
];

const circumferenceFields = [
  'neck', 'shoulders', 'chest', 'waist', 'hips',
  'leftArm', 'rightArm', 'leftForearm', 'rightForearm',
  'leftThigh', 'rightThigh', 'leftCalf', 'rightCalf'
];

const calculateProgress = (baseline, current) => {
  if (baseline == null || current == null) return null;
  const change = current - baseline;
  const percentChange = baseline !== 0 ? ((change / baseline) * 100) : 0;
  return {
    baseline,
    current,
    change: Math.round(change * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100
  };
};

const getDirection = (field, change, goalType) => {
  if (change === 0 || change === null) return 'neutral';

  const isIncrease = change > 0;
  const isDecrease = change < 0;

  if (goalType === 'lose_fat') {
    if (field === 'weight' || field === 'bodyFat') {
      return isDecrease ? 'positive' : 'negative';
    }
    if (circumferenceFields.includes(field)) {
      return isDecrease ? 'positive' : 'negative';
    }
    if (field === 'muscleMass') {
      return isIncrease ? 'positive' : 'negative';
    }
  }

  if (goalType === 'gain_muscle') {
    if (field === 'muscleMass') {
      return isIncrease ? 'positive' : 'negative';
    }
    if (circumferenceFields.includes(field)) {
      return isIncrease ? 'positive' : 'negative';
    }
    if (field === 'bodyFat') {
      return isDecrease ? 'positive' : 'negative';
    }
  }

  if (goalType === 'body_recomp') {
    if (field === 'muscleMass') {
      return isIncrease ? 'positive' : 'negative';
    }
    if (field === 'bodyFat') {
      return isDecrease ? 'positive' : 'negative';
    }
  }

  if (goalType === 'maintenance') {
    return 'neutral';
  }

  return 'neutral';
};

const getProgressReport = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findOne({ _id: clientId, user: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const entries = await Measurement.find({ client: clientId }).sort({ date: 1 });
    if (entries.length === 0) {
      return res.status(404).json({ message: 'No measurements found for this client' });
    }

    const baseline = entries[0];
    const latest = entries[entries.length - 1];

    const progress = {
      clientId: client._id,
      clientName: `${client.firstName} ${client.lastName}`,
      baselineDate: baseline.date,
      latestDate: latest.date,
      totalEntries: entries.length,
      fields: {}
    };

    numericFields.forEach(field => {
      const baselineVal = baseline[field] != null ? baseline[field] : null;
      const currentVal = latest[field] != null ? latest[field] : null;
      const progressData = calculateProgress(baselineVal, currentVal);
      if (progressData) {
        const direction = getDirection(field, progressData.change, client.goalType);
        progress.fields[field] = {
          ...progressData,
          direction
        };
      }
    });

    if (latest.weight != null && latest.height != null && latest.height > 0) {
      const heightInMeters = latest.height / 100;
      const bmi = latest.weight / (heightInMeters * heightInMeters);
      progress.bmi = {
        value: Math.round(bmi * 100) / 100,
        category: getBMICategory(bmi)
      };
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Progress report error:', error);
    res.status(500).json({ message: 'Server error during progress report generation' });
  }
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};
 
const createClient = async (req, res) => {
    try {
        const data = req.body;
        const client = new Client({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            number: data.number,
            startDate: data.startDate,
            goalType: data.goalType,
            notes: data.notes,
            profileImage: data.profileImage,
            user: req.user._id,
        });
        await client.save();

        await User.findByIdAndUpdate(req.user._id, { $inc: { numClients: 1 } });

        const hasInitialMeasurement = [
            'weight','height','bodyFat','muscleMass',
            'neck','shoulders','chest','waist','hips',
            'leftArm','rightArm','leftForearm','rightForearm',
            'leftThigh','rightThigh','leftCalf','rightCalf',
        ].some(f => data[f] != null && data[f] !== '');

        if (hasInitialMeasurement) {
            const measurement = new Measurement({
                coach: req.user._id,
                client: client._id,
                weight: data.weight || null,
                height: data.height || null,
                bodyFat: data.bodyFat || null,
                muscleMass: data.muscleMass || null,
                neck: data.neck || null,
                shoulders: data.shoulders || null,
                chest: data.chest || null,
                waist: data.waist || null,
                hips: data.hips || null,
                leftArm: data.leftArm || null,
                rightArm: data.rightArm || null,
                leftForearm: data.leftForearm || null,
                rightForearm: data.rightForearm || null,
                leftThigh: data.leftThigh || null,
                rightThigh: data.rightThigh || null,
                leftCalf: data.leftCalf || null,
                rightCalf: data.rightCalf || null,
                photos: data.photos || [],
            });
            await measurement.save();
        }

        res.status(201).json({
            message: 'Client created successfully',
            client,
        });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ success: false, message: 'Server error during client creation' });
    }
};

const getClients = async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 20);
        const skip  = (page - 1) * limit;
        const search = req.query.search || '';

        const filter = { user: req.user._id };
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName:  { $regex: search, $options: 'i' } },
            ];
        }

        const [clients, total] = await Promise.all([
            Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Client.countDocuments(filter),
        ]);

        res.status(200).json({ clients, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ success: false, message: 'Server error during fetching clients' });
    }
};

const getClientById = async (req, res) => {
    try {

        const clientId = req.params.id;
        const client = await Client.findOne({ _id: clientId, user: req.user._id });
        const measurements = await Measurement.find({ client: clientId }).sort({ createdAt: -1 });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        console.log('Client found:', client);
        console.log('Measurements found:', measurements);
        res.status(200).json({ client, measurements });

    } catch (error) {
        console.error('Get client by ID error:', error);
        res.status(500).json({ message: 'Server error during fetching client' });
    }
};


const addMeasurement = async (req, res) => {
    try { 
        const clientId = req.params.clientId;
        const client = await Client.findOne({ _id: clientId, user: req.user._id });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const data = req.body;
        const measurement = new Measurement({
            coach: req.user._id,
            client: clientId,
            date: data.date,
            weight: data.weight,
            height: data.height,
            bodyFat: data.bodyFat,
            muscleMass: data.muscleMass,
            neck: data.neck,
            shoulders: data.shoulders,
            chest: data.chest,
            waist: data.waist,
            hips: data.hips,
            leftArm: data.leftArm,
            rightArm: data.rightArm,
            leftForearm: data.leftForearm,
            rightForearm: data.rightForearm,
            leftThigh: data.leftThigh,
            rightThigh: data.rightThigh,
            leftCalf: data.leftCalf,
            rightCalf: data.rightCalf,
            notes: data.notes,
            photos: data.photos || [],
        });

        await measurement.save();
        res.status(201).json({
            message: 'Measurement added successfully',
            measurement,
        });
    } catch (error) {
        console.error('Add measurement error:', error);
        res.status(500).json({ message: 'Server error during adding measurement' });
    }
}


const updateMeasurement = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const measurementId = req.params.measurementId;
        const client = await Client.findOne({ _id: clientId, user: req.user._id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const measurement = await Measurement.findOne({ _id: measurementId, client: clientId });
        if (!measurement) {
            return res.status(404).json({ message: 'Measurement not found' });
        }

        const data = req.body;

        measurement.weight = data.weight != null ? data.weight : measurement.weight;
        measurement.height = data.height != null ? data.height : measurement.height;
        measurement.bodyFat = data.bodyFat != null ? data.bodyFat : measurement.bodyFat;
        measurement.muscleMass = data.muscleMass != null ? data.muscleMass : measurement.muscleMass;
        measurement.neck = data.neck != null ? data.neck : measurement.neck;
        measurement.shoulders = data.shoulders != null ? data.shoulders : measurement.shoulders;
        measurement.chest = data.chest != null ? data.chest : measurement.chest;
        measurement.waist = data.waist != null ? data.waist : measurement.waist;
        measurement.hips = data.hips != null ? data.hips : measurement.hips;
        measurement.leftArm = data.leftArm != null ? data.leftArm : measurement.leftArm;
        measurement.rightArm = data.rightArm != null ? data.rightArm : measurement.rightArm;
        measurement.leftForearm = data.leftForearm != null ? data.leftForearm : measurement.leftForearm;
        measurement.rightForearm = data.rightForearm != null ? data.rightForearm : measurement.rightForearm;
        measurement.leftThigh = data.leftThigh != null ? data.leftThigh : measurement.leftThigh;
        measurement.rightThigh = data.rightThigh != null ? data.rightThigh : measurement.rightThigh;
        measurement.leftCalf = data.leftCalf != null ? data.leftCalf : measurement.leftCalf;
        measurement.rightCalf = data.rightCalf != null ? data.rightCalf : measurement.rightCalf;
        if (data.notes !== undefined) measurement.notes = data.notes;
        if (data.photos !== undefined) measurement.photos = data.photos;

        await measurement.save();
        res.status(200).json({
            message: 'Measurement updated successfully',
            measurement,
        });
    } catch (error) {
        console.error('Update measurement error:', error);
        res.status(500).json({ message: 'Server error during updating measurement' });
    }
}

const deleteMeasurement = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const measurementId = req.params.measurementId;
        const client = await Client.findOne({ _id: clientId, user: req.user._id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const measurement = await Measurement.findOneAndDelete({ _id: measurementId, client: clientId });
        if (!measurement) {
            return res.status(404).json({ message: 'Measurement not found' });
        }

        res.status(200).json({
            message: 'Measurement deleted successfully',
            measurement,
        });
    } catch (error) {
        console.error('Delete measurement error:', error);
        res.status(500).json({ message: 'Server error during deleting measurement' });
    }
}

const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const client = await Client.findOneAndDelete({ _id: clientId, user: req.user._id });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        await Measurement.deleteMany({ client: clientId });
        await User.findByIdAndUpdate(req.user._id, { $inc: { numClients: -1 } });
        res.status(200).json({
            success: true,
            message: 'Client deleted successfully',
            client,
        });

    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ success: false, message: 'Server error during deleting client' });
    }
}

const generatePDFReport = async (req, res) => {
    try {
        const PDFDocument = require('pdfkit');
        const { clientId } = req.params;

        const client  = await Client.findOne({ _id: clientId, user: req.user._id });
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

        const measurements = await Measurement.find({ client: clientId }).sort({ date: 1 });
        const coach = req.user;

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${client.firstName}_${client.lastName}_report.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(28).font('Helvetica-Bold').text('COACHSPACE', 50, 50);
        doc.fontSize(12).font('Helvetica').fillColor('#666').text('Progress Report', 50, 85);
        doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#cccc33').lineWidth(2).stroke();

        // Client info
        doc.moveDown(2).fontSize(20).font('Helvetica-Bold').fillColor('#000')
           .text(`${client.firstName} ${client.lastName}`);
        doc.fontSize(11).font('Helvetica').fillColor('#444')
           .text(`Goal: ${(client.goalType || '').replace(/_/g, ' ')}`)
           .text(`Start Date: ${client.startDate ? new Date(client.startDate).toLocaleDateString() : '—'}`)
           .text(`Report Date: ${new Date().toLocaleDateString()}`);

        if (measurements.length > 1) {
            const baseline = measurements[0];
            const latest   = measurements[measurements.length - 1];

            doc.moveDown().fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Measurements Summary');
            doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor('#ddd').lineWidth(1).stroke();
            doc.moveDown(0.5);

            const fields = ['weight','height','bodyFat','muscleMass','chest','waist','hips','leftArm','rightArm'];
            fields.forEach(f => {
                const b = baseline[f]; const l = latest[f];
                if (b == null && l == null) return;
                const change = (b != null && l != null) ? (l - b).toFixed(1) : '—';
                const sign = change > 0 ? '+' : '';
                doc.fontSize(10).font('Helvetica').fillColor('#333')
                   .text(`${f}: ${b ?? '—'} → ${l ?? '—'}  (${sign}${change})`, { continued: false });
            });

            if (latest.weight && latest.height && latest.height > 0) {
                const bmi = latest.weight / Math.pow(latest.height / 100, 2);
                doc.moveDown().fontSize(12).font('Helvetica-Bold').text(`BMI: ${bmi.toFixed(1)}`);
            }
        } else {
            doc.moveDown().fontSize(11).font('Helvetica').fillColor('#666').text('Insufficient measurements for progress comparison.');
        }

        // Coach info
        doc.moveDown(3).fontSize(10).font('Helvetica').fillColor('#888')
           .text(`Coach: ${coach.firstName} ${coach.lastName}`)
           .text(`Contact: ${coach.email} | ${coach.phoneNumber}`);

        doc.end();
    } catch (error) {
        console.error('PDF report error:', error);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error generating PDF' });
    }
};

const updateHealthProfile = async (req, res) => {
    try {
        const { clientId } = req.params;
        const client = await Client.findOne({ _id: clientId, user: req.user._id });
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

        const { medicalNotes, injuries, healthQuestionnaire } = req.body;
        if (medicalNotes !== undefined) client.medicalNotes = medicalNotes;
        if (injuries !== undefined) client.injuries = injuries;
        if (healthQuestionnaire !== undefined) client.healthQuestionnaire = { ...client.healthQuestionnaire, ...healthQuestionnaire };

        await client.save();
        res.status(200).json({ success: true, client });
    } catch (error) {
        console.error('Update health profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        const client = await Client.findOneAndUpdate(
            { _id: clientId, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
        res.status(200).json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createClient,
    getClients,
    getClientById,
    getProgressReport,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    deleteClient,
    updateHealthProfile,
    updateClient,
    generatePDFReport,
};