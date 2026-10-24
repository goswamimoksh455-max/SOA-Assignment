/**
 * Analytics Controller
 * Provides hospital administrator insights, appointment statistics,
 * doctor workload summaries, and revenue metrics.
 */

const dataStore = require('../models/dataStore');

// GET /api/analytics/summary
function getHospitalSummary(req, res, next) {
  try {
    const summary = dataStore.getHospitalSummary();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Hospital analytics and workload report retrieved successfully.",
      data: summary
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHospitalSummary
};
