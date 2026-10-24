/**
 * Prescription Controller
 * Handles digital medical prescription creation, appointment linking,
 * and consultation records retrieval.
 */

const dataStore = require('../models/dataStore');

// GET /api/prescriptions
function getPrescriptions(req, res, next) {
  try {
    const { appointmentId, doctorId, patientName } = req.query;
    const prescriptions = dataStore.getAllPrescriptions({ appointmentId, doctorId, patientName });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/prescriptions/:id
function getPrescriptionById(req, res, next) {
  try {
    const { id } = req.params;
    const prescription = dataStore.getPrescriptionById(id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: `Prescription '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/appointments/:id/prescription
function createPrescriptionForAppointment(req, res, next) {
  try {
    const { id } = req.params; // appointmentId
    const payload = {
      ...req.body,
      appointmentId: id
    };

    const newPrescription = dataStore.createPrescription(payload);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: `Medical prescription successfully generated for Appointment ${id}. Appointment marked as COMPLETED.`,
      data: newPrescription
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescriptionForAppointment
};
