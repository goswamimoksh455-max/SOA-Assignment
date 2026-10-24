/**
 * Patient Routes
 * Endpoints for Master Patient Index and Longitudinal Medical Records.
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { validatePatient } = require('../middleware/validateRequest');

// GET /api/patients - List patients in master index
router.get('/', patientController.getPatients);

// GET /api/patients/:phone/history - 360-degree longitudinal health record
router.get('/:phone/history', patientController.getPatientHistory);

// POST /api/patients - Register or update patient profile
router.post('/', validatePatient, patientController.createOrUpdatePatient);

module.exports = router;
