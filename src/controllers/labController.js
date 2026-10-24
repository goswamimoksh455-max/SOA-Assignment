/**
 * Clinical Diagnostic Lab & Pathology Controller
 * Manages diagnostic test investigations, catalog queries, and pathology results.
 */

const dataStore = require('../models/dataStore');

// GET /api/lab-tests/catalog
function getLabCatalog(req, res, next) {
  try {
    const catalog = dataStore.getLabCatalog();
    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: catalog.length,
      data: catalog
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/lab-tests
function getLabTests(req, res, next) {
  try {
    const { status, patientPhone, urgency } = req.query;
    const tests = dataStore.getAllLabTests({ status, patientPhone, urgency });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: tests.length,
      filters: { status, patientPhone, urgency },
      data: tests
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/lab-tests/:id
function getLabTestById(req, res, next) {
  try {
    const { id } = req.params;
    const test = dataStore.getLabTestById(id);

    if (!test) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: `Diagnostic test order with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: test
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/lab-tests
function createLabTest(req, res, next) {
  try {
    const newTest = dataStore.createLabTest(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Diagnostic test order created successfully for ${newTest.patientName}. Specimen required: ${newTest.specimenRequired}`,
      data: newTest
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/lab-tests/:id/result
function updateLabTestResult(req, res, next) {
  try {
    const { id } = req.params;
    const updatedTest = dataStore.updateLabTestResult(id, req.body);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Clinical laboratory results and pathology findings successfully logged for test ID: ${id}`,
      data: updatedTest
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLabCatalog,
  getLabTests,
  getLabTestById,
  createLabTest,
  updateLabTestResult
};
