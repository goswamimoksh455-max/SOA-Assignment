/**
 * Request Validation Middleware for MediCare Web Service
 * Enforces strong input data contracts before passing requests to controllers.
 */

function validateDoctor(req, res, next) {
  const { name, specialization, consultationFee } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push("Field 'name' is required and must be at least 3 characters.");
  }
  if (!specialization || typeof specialization !== 'string' || specialization.trim().length < 2) {
    errors.push("Field 'specialization' is required (e.g. Cardiology, Orthopedics, Dermatology).");
  }
  if (consultationFee !== undefined && (isNaN(consultationFee) || Number(consultationFee) < 0)) {
    errors.push("Field 'consultationFee' must be a valid positive number.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Doctor validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validateAppointment(req, res, next) {
  const { patientName, patientAge, patientPhone, doctorId, appointmentDate, timeSlot } = req.body;
  const errors = [];

  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    errors.push("Field 'patientName' is required.");
  }
  if (!patientAge || isNaN(patientAge) || Number(patientAge) <= 0 || Number(patientAge) > 130) {
    errors.push("Field 'patientAge' must be a valid positive number between 1 and 130.");
  }
  if (!patientPhone || typeof patientPhone !== 'string' || patientPhone.trim().length < 8) {
    errors.push("Field 'patientPhone' is required with a valid contact number.");
  }
  if (!doctorId || typeof doctorId !== 'string') {
    errors.push("Field 'doctorId' is required (e.g., DOC-101).");
  }
  if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
    errors.push("Field 'appointmentDate' is required in YYYY-MM-DD format (e.g., 2026-10-25).");
  }
  if (!timeSlot || typeof timeSlot !== 'string') {
    errors.push("Field 'timeSlot' is required (e.g., '10:00 AM', '02:00 PM').");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Appointment validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validatePrescription(req, res, next) {
  const { diagnosis, medicines } = req.body;
  const errors = [];

  if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length < 3) {
    errors.push("Field 'diagnosis' is required and must describe medical condition.");
  }
  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    errors.push("Field 'medicines' must be a non-empty array of prescribed medications.");
  } else {
    medicines.forEach((med, idx) => {
      if (!med.name || typeof med.name !== 'string') {
        errors.push(`Medicine at index ${idx} requires a valid 'name'.`);
      }
      if (!med.dosage || typeof med.dosage !== 'string') {
        errors.push(`Medicine at index ${idx} requires a valid 'dosage' (e.g. '500mg').`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Prescription validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validateReschedule(req, res, next) {
  const { newDate, newTimeSlot } = req.body;
  const errors = [];

  if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    errors.push("Field 'newDate' is required in YYYY-MM-DD format.");
  }
  if (!newTimeSlot || typeof newTimeSlot !== 'string') {
    errors.push("Field 'newTimeSlot' is required (e.g., '11:30 AM').");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Reschedule validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validatePatient(req, res, next) {
  const { name, phone, age } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push("Field 'name' is required (minimum 2 characters).");
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
    errors.push("Field 'phone' is required with a valid contact number.");
  }
  if (!age || isNaN(age) || Number(age) <= 0 || Number(age) > 130) {
    errors.push("Field 'age' must be a valid positive number between 1 and 130.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Patient validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validateLabTest(req, res, next) {
  const { patientName, patientPhone, testCode } = req.body;
  const errors = [];

  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    errors.push("Field 'patientName' is required.");
  }
  if (!patientPhone || typeof patientPhone !== 'string' || patientPhone.trim().length < 8) {
    errors.push("Field 'patientPhone' is required.");
  }
  if (!testCode || typeof testCode !== 'string') {
    errors.push("Field 'testCode' is required (e.g., 'LAB-CBC', 'LAB-ECG', 'LAB-LIPID').");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Lab test order validation failed",
      validationErrors: errors
    });
  }

  next();
}

function validateLabResult(req, res, next) {
  const { findings, interpretation } = req.body;
  const errors = [];

  if (!findings || typeof findings !== 'string' || findings.trim().length < 3) {
    errors.push("Field 'findings' is required detailing laboratory findings.");
  }
  if (interpretation && !['NORMAL', 'ABNORMAL', 'CRITICAL'].includes(interpretation.toUpperCase())) {
    errors.push("Field 'interpretation' must be one of: 'NORMAL', 'ABNORMAL', 'CRITICAL'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      error: "Bad Request",
      message: "Lab test result validation failed",
      validationErrors: errors
    });
  }

  next();
}

module.exports = {
  validateDoctor,
  validateAppointment,
  validatePrescription,
  validateReschedule,
  validatePatient,
  validateLabTest,
  validateLabResult
};
