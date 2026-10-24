/**
 * In-Memory Data Store & Business Rule Engine for MediCare Web Service
 * Follows Repository Pattern to decouple data storage from routing logic.
 */

const { 
  seedDoctors, 
  seedAppointments, 
  seedPrescriptions,
  seedPatients,
  seedLabCatalog,
  seedLabTests
} = require('../data/seedData');

class DataStore {
  constructor() {
    // Deep clone seeds to avoid accidental mutation of raw templates
    this.doctors = JSON.parse(JSON.stringify(seedDoctors));
    this.appointments = JSON.parse(JSON.stringify(seedAppointments));
    this.prescriptions = JSON.parse(JSON.stringify(seedPrescriptions));
    this.patients = JSON.parse(JSON.stringify(seedPatients || []));
    this.labCatalog = JSON.parse(JSON.stringify(seedLabCatalog || []));
    this.labTests = JSON.parse(JSON.stringify(seedLabTests || []));
    this.counter = 100;
    this.patientCounter = 10;
    this.labCounter = 710;
  }

  // ==========================================
  // DOCTOR OPERATIONS
  // ==========================================
  getAllDoctors(filters = {}) {
    let result = [...this.doctors];

    if (filters.specialization) {
      const spec = filters.specialization.toLowerCase();
      result = result.filter(d => d.specialization.toLowerCase().includes(spec));
    }

    if (filters.day) {
      const day = filters.day.toLowerCase();
      result = result.filter(d => 
        d.availableDays.some(ad => ad.toLowerCase() === day)
      );
    }

    if (filters.maxFee) {
      const max = Number(filters.maxFee);
      result = result.filter(d => d.consultationFee <= max);
    }

    return result;
  }

  getDoctorById(id) {
    return this.doctors.find(d => d.id === id);
  }

  createDoctor(doctorData) {
    this.counter += 1;
    const newDoctor = {
      id: `DOC-${this.counter}`,
      name: doctorData.name,
      specialization: doctorData.specialization,
      qualification: doctorData.qualification || 'MBBS, MD',
      experienceYears: Number(doctorData.experienceYears) || 5,
      consultationFee: Number(doctorData.consultationFee) || 500,
      contact: doctorData.contact || {
        email: `${doctorData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@medicare.org`,
        phone: "+91-9000000000",
        roomNo: "OPD-101"
      },
      availableDays: doctorData.availableDays || ["Monday", "Wednesday", "Friday"],
      availableSlots: doctorData.availableSlots || ["10:00 AM", "11:30 AM", "02:00 PM"],
      rating: 5.0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.doctors.push(newDoctor);
    return newDoctor;
  }

  // ==========================================
  // APPOINTMENT OPERATIONS (With Conflict Check)
  // ==========================================
  getAllAppointments(filters = {}) {
    let result = [...this.appointments];

    if (filters.doctorId) {
      result = result.filter(a => a.doctorId === filters.doctorId);
    }
    if (filters.status) {
      result = result.filter(a => a.status.toUpperCase() === filters.status.toUpperCase());
    }
    if (filters.date) {
      result = result.filter(a => a.appointmentDate === filters.date);
    }
    if (filters.patientPhone) {
      result = result.filter(a => a.patientPhone === filters.patientPhone);
    }

    return result;
  }

  getAppointmentById(id) {
    return this.appointments.find(a => a.id === id);
  }

  /**
   * Core Business Rule: Check if a doctor has an existing CONFIRMED appointment
   * on the specified date and timeslot (Double-booking prevention).
   */
  hasSlotConflict(doctorId, date, timeSlot, excludeAppointmentId = null) {
    return this.appointments.some(a => 
      a.doctorId === doctorId &&
      a.appointmentDate === date &&
      a.timeSlot.toUpperCase() === timeSlot.toUpperCase() &&
      a.status !== 'CANCELLED' &&
      a.id !== excludeAppointmentId
    );
  }

  createAppointment(payload) {
    const doctor = this.getDoctorById(payload.doctorId);
    if (!doctor) {
      throw { status: 404, message: `Doctor with ID ${payload.doctorId} does not exist.` };
    }

    // Check Slot Conflict
    if (this.hasSlotConflict(payload.doctorId, payload.appointmentDate, payload.timeSlot)) {
      throw { 
        status: 409, 
        message: `Schedule Conflict: ${doctor.name.startsWith('Dr.') ? doctor.name : 'Dr. ' + doctor.name} already has an active appointment on ${payload.appointmentDate} at ${payload.timeSlot}. Please select another time slot.` 
      };
    }

    const currentYear = new Date().getFullYear();
    const newIndex = String(this.appointments.length + 1).padStart(3, '0');
    const newAppointment = {
      id: `APT-${currentYear}-${newIndex}`,
      patientName: payload.patientName.trim(),
      patientAge: Number(payload.patientAge),
      patientGender: payload.patientGender,
      patientPhone: payload.patientPhone.trim(),
      patientEmail: payload.patientEmail ? payload.patientEmail.trim() : "",
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      appointmentDate: payload.appointmentDate,
      timeSlot: payload.timeSlot,
      symptoms: payload.symptoms || "General medical consultation",
      urgencyLevel: (payload.urgencyLevel || "NORMAL").toUpperCase(),
      status: "CONFIRMED",
      consultationFee: doctor.consultationFee,
      paymentStatus: payload.paymentStatus || "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.appointments.push(newAppointment);
    return newAppointment;
  }

  updateAppointmentStatus(id, newStatus, reason = "") {
    const appointment = this.getAppointmentById(id);
    if (!appointment) {
      throw { status: 404, message: `Appointment with ID ${id} not found.` };
    }

    const validStatuses = ["CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"];
    const statusUpper = newStatus.toUpperCase();

    if (!validStatuses.includes(statusUpper)) {
      throw { 
        status: 400, 
        message: `Invalid status '${newStatus}'. Allowed statuses are: ${validStatuses.join(', ')}` 
      };
    }

    if (appointment.status === 'COMPLETED' && statusUpper === 'CANCELLED') {
      throw { status: 400, message: "Cannot cancel an appointment that is already marked as COMPLETED." };
    }

    appointment.status = statusUpper;
    appointment.updatedAt = new Date().toISOString();
    if (reason) {
      appointment.statusChangeReason = reason;
    }

    return appointment;
  }

  rescheduleAppointment(id, newDate, newTimeSlot) {
    const appointment = this.getAppointmentById(id);
    if (!appointment) {
      throw { status: 404, message: `Appointment with ID ${id} not found.` };
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      throw { 
        status: 400, 
        message: `Cannot reschedule appointment with status '${appointment.status}'.` 
      };
    }

    // Conflict check on new date/slot
    if (this.hasSlotConflict(appointment.doctorId, newDate, newTimeSlot, id)) {
      throw { 
        status: 409, 
        message: `Slot Conflict: Doctor is already booked on ${newDate} at ${newTimeSlot}.` 
      };
    }

    const previousSchedule = {
      date: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    };

    appointment.appointmentDate = newDate;
    appointment.timeSlot = newTimeSlot;
    appointment.status = "RESCHEDULED";
    appointment.rescheduledHistory = appointment.rescheduledHistory || [];
    appointment.rescheduledHistory.push({
      ...previousSchedule,
      rescheduledAt: new Date().toISOString()
    });
    appointment.updatedAt = new Date().toISOString();

    return appointment;
  }

  deleteAppointment(id) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw { status: 404, message: `Appointment with ID ${id} not found.` };
    }
    const [removed] = this.appointments.splice(index, 1);
    return removed;
  }

  // ==========================================
  // PRESCRIPTION OPERATIONS
  // ==========================================
  getAllPrescriptions(filters = {}) {
    let result = [...this.prescriptions];

    if (filters.appointmentId) {
      result = result.filter(p => p.appointmentId === filters.appointmentId);
    }
    if (filters.doctorId) {
      result = result.filter(p => p.doctorId === filters.doctorId);
    }
    if (filters.patientName) {
      const name = filters.patientName.toLowerCase();
      result = result.filter(p => p.patientName.toLowerCase().includes(name));
    }

    return result;
  }

  getPrescriptionById(id) {
    return this.prescriptions.find(p => p.id === id);
  }

  createPrescription(payload) {
    const appointment = this.getAppointmentById(payload.appointmentId);
    if (!appointment) {
      throw { status: 404, message: `Appointment with ID ${payload.appointmentId} does not exist.` };
    }

    // Prevent duplicate prescriptions for same appointment
    const existing = this.prescriptions.find(p => p.appointmentId === payload.appointmentId);
    if (existing) {
      throw { 
        status: 409, 
        message: `Prescription already exists for appointment ${payload.appointmentId} (Prescription ID: ${existing.id}).` 
      };
    }

    const rxId = `RX-${500 + this.prescriptions.length + 1}`;
    const newPrescription = {
      id: rxId,
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      patientAge: appointment.patientAge,
      diagnosis: payload.diagnosis,
      vitalSigns: payload.vitalSigns || {
        bloodPressure: "120/80 mmHg",
        pulseRate: "72 bpm",
        weightKg: 65
      },
      medicines: payload.medicines || [],
      lifestyleAdvice: payload.lifestyleAdvice || "Maintain balanced hydration and adequate rest.",
      followUpDate: payload.followUpDate || null,
      issuedAt: new Date().toISOString()
    };

    this.prescriptions.push(newPrescription);

    // Automatically transition the appointment status to COMPLETED
    appointment.status = "COMPLETED";
    appointment.updatedAt = new Date().toISOString();

    return newPrescription;
  }

  // ==========================================
  // PATIENT OPERATIONS (Master Patient Index)
  // ==========================================
  getAllPatients(filters = {}) {
    let result = this.patients.map(p => {
      const pAppts = this.appointments.filter(a => a.patientPhone === p.phone);
      const pRx = this.prescriptions.filter(rx => pAppts.some(a => a.id === rx.appointmentId) || rx.patientName.toLowerCase() === p.name.toLowerCase());
      const pLabs = this.labTests.filter(lt => lt.patientPhone === p.phone);
      const totalSpent = pAppts.filter(a => a.status !== 'CANCELLED').reduce((sum, a) => sum + (a.consultationFee || 0), 0);

      return {
        ...p,
        totalVisits: pAppts.length,
        totalPrescriptions: pRx.length,
        totalLabTests: pLabs.length,
        totalExpenditure: totalSpent,
        lastVisitDate: pAppts.length > 0 ? pAppts[pAppts.length - 1].appointmentDate : null
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.phone.includes(q) || 
        (p.bloodGroup && p.bloodGroup.toLowerCase().includes(q))
      );
    }

    return result;
  }

  getPatientByPhone(phone) {
    return this.patients.find(p => p.phone === phone);
  }

  getPatientHistory(phone) {
    const cleanPhone = phone.trim();
    let patient = this.getPatientByPhone(cleanPhone);

    const appointments = this.appointments.filter(a => a.patientPhone === cleanPhone);
    const apptIds = appointments.map(a => a.id);
    const prescriptions = this.prescriptions.filter(rx => apptIds.includes(rx.appointmentId) || (patient && rx.patientName.toLowerCase() === patient.name.toLowerCase()));
    const labTests = this.labTests.filter(lt => lt.patientPhone === cleanPhone);

    if (!patient && appointments.length === 0) {
      throw { status: 404, message: `No patient medical records found for contact number: ${phone}` };
    }

    // Auto-create patient record if they had booked appointments before
    if (!patient && appointments.length > 0) {
      const firstApt = appointments[0];
      patient = {
        id: `PAT-${this.patientCounter++}`,
        name: firstApt.patientName,
        phone: cleanPhone,
        email: firstApt.patientEmail || "",
        age: firstApt.patientAge,
        gender: firstApt.patientGender,
        bloodGroup: "Unknown",
        emergencyContact: "Not specified",
        allergies: [],
        chronicConditions: [],
        registeredAt: firstApt.createdAt
      };
      this.patients.push(patient);
    }

    // Chronological longitudinal timeline
    const timeline = [];

    appointments.forEach(a => {
      timeline.push({
        type: 'APPOINTMENT',
        date: a.appointmentDate,
        time: a.timeSlot,
        title: `Consultation with ${a.doctorName} (${a.specialization})`,
        status: a.status,
        details: a.symptoms,
        id: a.id
      });
    });

    prescriptions.forEach(rx => {
      timeline.push({
        type: 'PRESCRIPTION',
        date: rx.issuedAt.split('T')[0],
        time: rx.issuedAt.split('T')[1] ? rx.issuedAt.split('T')[1].substring(0, 5) : '',
        title: `Rx issued by ${rx.doctorName}`,
        status: 'DISPENSED',
        details: `Diagnosis: ${rx.diagnosis}. ${rx.medicines.length} medication(s) prescribed.`,
        id: rx.id
      });
    });

    labTests.forEach(lt => {
      timeline.push({
        type: 'LAB_TEST',
        date: lt.createdAt.split('T')[0],
        time: lt.createdAt.split('T')[1] ? lt.createdAt.split('T')[1].substring(0, 5) : '',
        title: `Diagnostic: ${lt.testName}`,
        status: lt.status,
        details: lt.resultData ? `Interpretation: ${lt.resultData.interpretation}. ${lt.resultData.findings}` : 'Pending specimen analysis',
        id: lt.id
      });
    });

    // Sort descending by date
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      patientProfile: patient,
      metrics: {
        totalConsultations: appointments.length,
        prescriptionsIssued: prescriptions.length,
        labTestsConducted: labTests.length,
        totalLifetimeSpend: appointments.filter(a => a.status !== 'CANCELLED').reduce((s, a) => s + (a.consultationFee || 0), 0)
      },
      appointments,
      prescriptions,
      labTests,
      timeline
    };
  }

  createOrUpdatePatient(payload) {
    const existingIndex = this.patients.findIndex(p => p.phone === payload.phone.trim());
    if (existingIndex !== -1) {
      const existing = this.patients[existingIndex];
      this.patients[existingIndex] = {
        ...existing,
        name: payload.name ? payload.name.trim() : existing.name,
        age: payload.age ? Number(payload.age) : existing.age,
        gender: payload.gender || existing.gender,
        email: payload.email !== undefined ? payload.email : existing.email,
        bloodGroup: payload.bloodGroup || existing.bloodGroup,
        emergencyContact: payload.emergencyContact || existing.emergencyContact,
        allergies: payload.allergies || existing.allergies,
        chronicConditions: payload.chronicConditions || existing.chronicConditions,
        updatedAt: new Date().toISOString()
      };
      return this.patients[existingIndex];
    }

    const newPatient = {
      id: `PAT-${String(this.patientCounter++).padStart(3, '0')}`,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email ? payload.email.trim() : "",
      age: Number(payload.age),
      gender: payload.gender || "Other",
      bloodGroup: payload.bloodGroup || "Unknown",
      emergencyContact: payload.emergencyContact || "None",
      allergies: Array.isArray(payload.allergies) ? payload.allergies : [],
      chronicConditions: Array.isArray(payload.chronicConditions) ? payload.chronicConditions : [],
      registeredAt: new Date().toISOString()
    };

    this.patients.push(newPatient);
    return newPatient;
  }

  // ==========================================
  // CLINICAL LAB & DIAGNOSTIC OPERATIONS
  // ==========================================
  getLabCatalog() {
    return this.labCatalog;
  }

  getAllLabTests(filters = {}) {
    let result = [...this.labTests];

    if (filters.status) {
      result = result.filter(t => t.status.toUpperCase() === filters.status.toUpperCase());
    }
    if (filters.patientPhone) {
      result = result.filter(t => t.patientPhone === filters.patientPhone);
    }
    if (filters.urgency) {
      result = result.filter(t => t.urgency.toUpperCase() === filters.urgency.toUpperCase());
    }

    return result;
  }

  getLabTestById(id) {
    return this.labTests.find(t => t.id === id);
  }

  createLabTest(payload) {
    const catalogItem = this.labCatalog.find(c => c.code === payload.testCode);
    if (!catalogItem) {
      throw { status: 404, message: `Diagnostic test code '${payload.testCode}' not found in catalog.` };
    }

    const currentYear = new Date().getFullYear();
    const testId = `TEST-${currentYear}-${this.labCounter++}`;

    const newLabTest = {
      id: testId,
      patientName: payload.patientName.trim(),
      patientPhone: payload.patientPhone.trim(),
      appointmentId: payload.appointmentId || "OPD-DIRECT",
      doctorName: payload.doctorName || "Attending Physician",
      testCode: catalogItem.code,
      testName: catalogItem.name,
      category: catalogItem.category,
      price: catalogItem.price,
      urgency: (payload.urgency || "NORMAL").toUpperCase(),
      status: "ORDERED",
      specimenRequired: catalogItem.specimen,
      createdAt: new Date().toISOString()
    };

    this.labTests.push(newLabTest);
    return newLabTest;
  }

  updateLabTestResult(id, resultData) {
    const test = this.getLabTestById(id);
    if (!test) {
      throw { status: 404, message: `Lab test order with ID ${id} not found.` };
    }

    test.status = "COMPLETED";
    test.specimenCollectedAt = test.specimenCollectedAt || new Date().toISOString();
    test.resultData = {
      findings: resultData.findings,
      interpretation: (resultData.interpretation || "NORMAL").toUpperCase(),
      technicianRemarks: resultData.technicianRemarks || "Standard reference protocol verified.",
      verifiedAt: new Date().toISOString()
    };
    test.updatedAt = new Date().toISOString();

    return test;
  }

  // ==========================================
  // HOSPITAL ANALYTICS & METRICS
  // ==========================================
  getHospitalSummary() {
    const totalAppointments = this.appointments.length;
    const confirmedCount = this.appointments.filter(a => a.status === 'CONFIRMED').length;
    const completedCount = this.appointments.filter(a => a.status === 'COMPLETED').length;
    const cancelledCount = this.appointments.filter(a => a.status === 'CANCELLED').length;
    const rescheduledCount = this.appointments.filter(a => a.status === 'RESCHEDULED').length;

    const totalRevenue = this.appointments
      .filter(a => a.status !== 'CANCELLED')
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    // Workload breakdown by doctor
    const doctorWorkload = this.doctors.map(doc => {
      const docAppts = this.appointments.filter(a => a.doctorId === doc.id);
      return {
        doctorId: doc.id,
        doctorName: doc.name,
        specialization: doc.specialization,
        totalBookings: docAppts.length,
        completedConsultations: docAppts.filter(a => a.status === 'COMPLETED').length,
        revenueContributed: docAppts
          .filter(a => a.status !== 'CANCELLED')
          .reduce((sum, a) => sum + (a.consultationFee || 0), 0)
      };
    });

    return {
      overview: {
        totalDoctors: this.doctors.length,
        totalRegisteredPatients: this.patients.length,
        totalAppointments,
        confirmedAppointments: confirmedCount,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledCount,
        rescheduledAppointments: rescheduledCount,
        totalPrescriptionsIssued: this.prescriptions.length,
        totalLabTestsOrdered: this.labTests.length,
        completedLabTests: this.labTests.filter(t => t.status === 'COMPLETED').length,
        totalEstimatedRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        systemHealth: "100% OPERATIONAL",
        generatedAt: new Date().toISOString()
      },
      doctorWorkload
    };
  }
}

// Export singleton instance
module.exports = new DataStore();
