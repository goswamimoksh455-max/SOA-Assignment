/**
 * Analytics Routes
 * Endpoints for hospital administration and metrics reporting.
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/summary - Comprehensive hospital overview and doctor workload
router.get('/summary', analyticsController.getHospitalSummary);

module.exports = router;
