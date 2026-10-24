/**
 * Appointment Controller
 * Manages appointment booking, query filters, conflict prevention,
 * status updates, and rescheduling.
 */

const dataStore = require('../models/dataStore');

// GET /api/appointments
function getAppointments(req, res, next) {
  try {
    const { doctorId, status, date, patientPhone } = req.query;
    const appointments = dataStore.getAllAppointments({ doctorId, status, date, patientPhone });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      count: appointments.length,
      filters: { doctorId, status, date, patientPhone },
      data: appointments
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/appointments/:id
function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;
    const appointment = dataStore.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        error: "Not Found",
        message: `Appointment '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/appointments
function createAppointment(req, res, next) {
  try {
    const newAppointment = dataStore.createAppointment(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Appointment successfully booked and confirmed.",
      data: newAppointment
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/appointments/:id/status
function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        error: "Bad Request",
        message: "Field 'status' is required in request body (e.g., CONFIRMED, COMPLETED, CANCELLED)."
      });
    }

    const updated = dataStore.updateAppointmentStatus(id, status, reason);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Appointment ${id} status updated to '${status.toUpperCase()}'.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/appointments/:id/reschedule
function rescheduleAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot } = req.body;

    const rescheduled = dataStore.rescheduleAppointment(id, newDate, newTimeSlot);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Appointment ${id} successfully rescheduled to ${newDate} at ${newTimeSlot}.`,
      data: rescheduled
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/appointments/:id
function deleteAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteAppointment(id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Appointment ${id} has been permanently deleted from records.`,
      deletedRecord: deleted
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment
};
