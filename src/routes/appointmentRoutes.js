/**
 * Appointment Routes
 * Endpoints for appointment booking, status updates, rescheduling, and cancellation.
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const prescriptionController = require('../controllers/prescriptionController');
const { 
  validateAppointment, 
  validateReschedule, 
  validatePrescription 
} = require('../middleware/validateRequest');

// GET /api/appointments - List appointments with optional filters
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/:id - Retrieve specific appointment
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments - Book new appointment with conflict check
router.post('/', validateAppointment, appointmentController.createAppointment);

// PATCH /api/appointments/:id/status - Update appointment status (CONFIRMED/COMPLETED/CANCELLED)
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// PUT /api/appointments/:id/reschedule - Reschedule appointment date and slot
router.put('/:id/reschedule', validateReschedule, appointmentController.rescheduleAppointment);

// DELETE /api/appointments/:id - Delete an appointment record
router.delete('/:id', appointmentController.deleteAppointment);

// POST /api/appointments/:id/prescription - Issue digital prescription for an appointment
router.post('/:id/prescription', validatePrescription, prescriptionController.createPrescriptionForAppointment);

module.exports = router;
