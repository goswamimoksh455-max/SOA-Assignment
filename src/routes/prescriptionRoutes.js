/**
 * Prescription Routes
 * Endpoints for retrieving digital medical prescriptions.
 */

const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

// GET /api/prescriptions - List all prescriptions with optional filters
router.get('/', prescriptionController.getPrescriptions);

// GET /api/prescriptions/:id - Retrieve specific prescription
router.get('/:id', prescriptionController.getPrescriptionById);

module.exports = router;
