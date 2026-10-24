/**
 * Clinical Diagnostic Lab Routes
 * Endpoints for ordering tests, catalog inspection, and recording specimen findings.
 */

const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { validateLabTest, validateLabResult } = require('../middleware/validateRequest');

// GET /api/lab-tests/catalog - Diagnostic catalog
router.get('/catalog', labController.getLabCatalog);

// GET /api/lab-tests - List ordered lab tests
router.get('/', labController.getLabTests);

// GET /api/lab-tests/:id - Single test order details
router.get('/:id', labController.getLabTestById);

// POST /api/lab-tests - Order diagnostic test
router.post('/', validateLabTest, labController.createLabTest);

// PATCH /api/lab-tests/:id/result - Log lab findings
router.patch('/:id/result', validateLabResult, labController.updateLabTestResult);

module.exports = router;
