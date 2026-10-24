/**
 * Doctor Routes
 * Endpoints for doctor directory and registration.
 */

const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { validateDoctor } = require('../middleware/validateRequest');

// GET /api/doctors - List all doctors with optional filters
router.get('/', doctorController.getDoctors);

// GET /api/doctors/:id - Retrieve specific doctor details
router.get('/:id', doctorController.getDoctorById);

// POST /api/doctors - Register a new doctor
router.post('/', validateDoctor, doctorController.createDoctor);

module.exports = router;
