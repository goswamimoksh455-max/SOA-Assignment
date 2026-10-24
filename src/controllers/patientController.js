/**
 * Patient Controller
 * Manages Master Patient Index (MPI) and Longitudinal Health Records (EHR)
 */

const dataStore = require('../models/dataStore');

// GET /api/patients
function getPatients(req, res, next) {
  try {
    const { search } = req.query;
    const patients = dataStore.getAllPatients({ search });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: patients.length,
      filters: { search: search || null },
      data: patients
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/patients/:phone/history
function getPatientHistory(req, res, next) {
  try {
    const { phone } = req.params;
    const record = dataStore.getPatientHistory(phone);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Longitudinal medical dossier retrieved for patient contact: ${phone}`,
      data: record
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/patients
function createOrUpdatePatient(req, res, next) {
  try {
    const patient = dataStore.createOrUpdatePatient(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Patient record successfully registered/updated in Master Patient Index.",
      data: patient
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPatients,
  getPatientHistory,
  createOrUpdatePatient
};
