/**
 * MediCare Healthcare Web Service - Main Application Entrypoint
 * Developed for SOA / Web Services Course (IA2 Assessment)
 * 
 * Features:
 * 1. Doctor Directory & Availability Management
 * 2. Appointment Scheduling with Automated Slot Conflict Prevention
 * 3. Clinical Consultation & Digital E-Prescription Generation
 * 4. Appointment Lifecycle (Status updates, Rescheduling, Cancellation)
 * 5. Hospital Analytics & Performance Metrics
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const config = require('./src/config/config');

// Import Routes
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const labRoutes = require('./src/routes/labRoutes');

// Import Middlewares
const requestLogger = require('./src/middleware/requestLogger');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ==========================================
// CORE MIDDLEWARE SETUP
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve Static Frontend Dashboard
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// API INFORMATION ROOT ENDPOINT
// ==========================================
app.get('/api', (req, res) => {
  res.status(200).json({
    service: config.APP_NAME,
    version: config.VERSION,
    status: 'ACTIVE',
    description: 'RESTful Service-Oriented Web Application for Healthcare Operations, Clinical Diagnostics & Patient Records',
    documentationUrl: `${config.HOST}:${config.PORT}/`,
    endpoints: {
      doctors: {
        list: 'GET /api/doctors',
        details: 'GET /api/doctors/:id',
        create: 'POST /api/doctors'
      },
      appointments: {
        list: 'GET /api/appointments',
        details: 'GET /api/appointments/:id',
        book: 'POST /api/appointments',
        updateStatus: 'PATCH /api/appointments/:id/status',
        reschedule: 'PUT /api/appointments/:id/reschedule',
        cancel: 'DELETE /api/appointments/:id',
        issuePrescription: 'POST /api/appointments/:id/prescription'
      },
      prescriptions: {
        list: 'GET /api/prescriptions',
        details: 'GET /api/prescriptions/:id'
      },
      patients: {
        list: 'GET /api/patients',
        history: 'GET /api/patients/:phone/history',
        register: 'POST /api/patients'
      },
      labTests: {
        catalog: 'GET /api/lab-tests/catalog',
        list: 'GET /api/lab-tests',
        details: 'GET /api/lab-tests/:id',
        order: 'POST /api/lab-tests',
        recordResult: 'PATCH /api/lab-tests/:id/result'
      },
      analytics: {
        hospitalSummary: 'GET /api/analytics/summary'
      }
    }
  });
});

// ==========================================
// MOUNT API ROUTES
// ==========================================
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/lab-tests', labRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==========================================
// 404 NOT FOUND HANDLER
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'Not Found',
    message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`
  });
});

// ==========================================
// CENTRALIZED ERROR HANDLER
// ==========================================
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const server = app.listen(config.PORT, () => {
  console.log('\n======================================================');
  console.log(`[SERVICE] ${config.APP_NAME} v${config.VERSION}`);
  console.log(`[SERVER] Running at http://localhost:${config.PORT}`);
  console.log(`[DASHBOARD] Interface available at http://localhost:${config.PORT}`);
  console.log(`[API SPEC] Root contract at http://localhost:${config.PORT}/api`);
  console.log('======================================================\n');
});

module.exports = { app, server };
