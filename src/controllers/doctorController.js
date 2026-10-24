/**
 * Doctor Controller
 * Handles doctor listing, filtering, detail retrieval, and doctor registration.
 */

const dataStore = require('../models/dataStore');

// GET /api/doctors
function getDoctors(req, res, next) {
  try {
    const { specialization, day, maxFee } = req.query;
    const doctors = dataStore.getAllDoctors({ specialization, day, maxFee });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: doctors.length,
      filters: { specialization, day, maxFee },
      data: doctors
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/doctors/:id
function getDoctorById(req, res, next) {
  try {
    const { id } = req.params;
    const doctor = dataStore.getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: `Doctor with ID '${id}' was not found in the registry.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/doctors
function createDoctor(req, res, next) {
  try {
    const newDoctor = dataStore.createDoctor(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Doctor successfully onboarded into MediCare registry.",
      data: newDoctor
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor
};
