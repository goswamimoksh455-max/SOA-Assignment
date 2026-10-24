/**
 * Automated Verification Script for MediCare RESTful Web Service
 * Runs end-to-end HTTP requests against the API to validate all functionalities.
 * Includes tests for the 2 new services: Patient Master Index & Diagnostic Lab Investigations.
 */

const http = require('http');

const BASE_HOST = 'localhost';
const BASE_PORT = 3000;

let testServerInstance = null;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function ensureServerRunning() {
  try {
    await request('GET', '/api');
    return;
  } catch (err) {
    // Server not running, boot it
    const { server } = require('../server');
    testServerInstance = server;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function runTests() {
  await ensureServerRunning();

  console.log('====================================================');
  console.log('[TEST RUNNER] Starting Verification Suite for MediCare Web Service');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${err.message}`);
    }
  }

  // 1. Root API Info
  await test('1. GET /api - Retrieve Service Metadata Contract', async () => {
    const res = await request('GET', '/api');
    if (res.statusCode !== 200 || !res.body.endpoints) {
      throw new Error(`Expected 200 with endpoints, got ${res.statusCode}`);
    }
  });

  // 2. Doctor Directory
  await test('2. GET /api/doctors - Fetch Doctors with cardiology filter', async () => {
    const res = await request('GET', '/api/doctors?specialization=cardio');
    if (res.statusCode !== 200 || res.body.count === 0) {
      throw new Error(`Expected doctors list, got count: ${res.body.count}`);
    }
  });

  // 3. Register Doctor
  let createdDocId = null;
  await test('3. POST /api/doctors - Onboard New Specialist Doctor', async () => {
    const res = await request('POST', '/api/doctors', {
      name: "Dr. Sunita Kapoor",
      specialization: "Dermatology",
      qualification: "MD (Dermatology), DVD",
      experienceYears: 10,
      consultationFee: 700,
      availableDays: ["Tuesday", "Friday"],
      availableSlots: ["11:00 AM", "03:00 PM"]
    });
    if (res.statusCode !== 201 || !res.body.data.id) {
      throw new Error(`Expected 201 Created, got ${res.statusCode}`);
    }
    createdDocId = res.body.data.id;
  });

  // 4. Book Appointment
  let createdAptId = null;
  await test('4. POST /api/appointments - Book Appointment with Conflict Prevention', async () => {
    const res = await request('POST', '/api/appointments', {
      patientName: "Arjun Mehta",
      patientAge: 29,
      patientGender: "Male",
      patientPhone: "+91-9876500112",
      patientEmail: "arjun.m@example.com",
      doctorId: "DOC-101",
      appointmentDate: "2026-10-25",
      timeSlot: "11:30 AM",
      symptoms: "Elevated resting heart rate and mild dizziness",
      urgencyLevel: "HIGH"
    });
    if (res.statusCode !== 201 || !res.body.data.id) {
      throw new Error(`Expected 201 Created, got ${res.statusCode}`);
    }
    createdAptId = res.body.data.id;
  });

  // 5. Conflict Test (Double booking prevention)
  await test('5. POST /api/appointments [CONFLICT] - Prevent Double-Booking on Same Slot', async () => {
    const res = await request('POST', '/api/appointments', {
      patientName: "Kavita Rao",
      patientAge: 42,
      patientGender: "Female",
      patientPhone: "+91-9876599881",
      doctorId: "DOC-101",
      appointmentDate: "2026-10-25", // Same date and slot
      timeSlot: "11:30 AM",
      symptoms: "Routine cardiac screening"
    });
    if (res.statusCode !== 409) {
      throw new Error(`Expected 409 Conflict, got ${res.statusCode}`);
    }
  });

  // 6. Reschedule Appointment
  await test('6. PUT /api/appointments/:id/reschedule - Reschedule Appointment Slot', async () => {
    const res = await request('PUT', `/api/appointments/${createdAptId}/reschedule`, {
      newDate: "2026-10-27",
      newTimeSlot: "02:00 PM"
    });
    if (res.statusCode !== 200 || res.body.data.status !== 'RESCHEDULED') {
      throw new Error(`Expected 200 with status RESCHEDULED, got ${res.statusCode}`);
    }
  });

  // 7. Issue Prescription
  let createdRxId = null;
  await test('7. POST /api/appointments/:id/prescription - Issue Electronic Prescription', async () => {
    const res = await request('POST', `/api/appointments/${createdAptId}/prescription`, {
      diagnosis: "Sinus Tachycardia with stress-induced hypertension",
      vitalSigns: {
        bloodPressure: "135/88 mmHg",
        pulseRate: "94 bpm",
        weightKg: 74
      },
      medicines: [
        {
          name: "Bisoprolol Fumarate",
          dosage: "2.5 mg",
          frequency: "Once daily morning after food",
          durationDays: 30
        }
      ],
      lifestyleAdvice: "Reduce dietary sodium intake. Practice 20 mins deep breathing daily.",
      followUpDate: "2026-11-20"
    });
    if (res.statusCode !== 201 || !res.body.data.id) {
      throw new Error(`Expected 201 Created with Rx ID, got ${res.statusCode}`);
    }
    createdRxId = res.body.data.id;
  });

  // 8. Retrieve Prescription
  await test('8. GET /api/prescriptions/:id - Retrieve Medical Prescription Record', async () => {
    const res = await request('GET', `/api/prescriptions/${createdRxId}`);
    if (res.statusCode !== 200 || res.body.data.diagnosis !== 'Sinus Tachycardia with stress-induced hypertension') {
      throw new Error(`Expected 200 with diagnosis details, got ${res.statusCode}`);
    }
  });

  // 9. NEW FEATURE 1: Patient Master Index & Longitudinal Medical Dossier
  await test('9. GET /api/patients - Master Patient Index Registry Listing', async () => {
    const res = await request('GET', '/api/patients');
    if (res.statusCode !== 200 || !Array.isArray(res.body.data) || res.body.data.length === 0) {
      throw new Error(`Expected 200 with patient list, got ${res.statusCode}`);
    }
  });

  await test('10. GET /api/patients/:phone/history - Longitudinal Medical Timeline Dossier', async () => {
    const res = await request('GET', '/api/patients/+91-9988776655/history');
    if (res.statusCode !== 200 || !res.body.data.timeline || !res.body.data.metrics) {
      throw new Error(`Expected 200 with timeline and metrics, got ${res.statusCode}`);
    }
  });

  // 11. NEW FEATURE 2: Clinical Diagnostic Lab Catalog & Test Order
  let createdLabTestId = null;
  await test('11. GET /api/lab-tests/catalog - Diagnostic Investigation Catalog', async () => {
    const res = await request('GET', '/api/lab-tests/catalog');
    if (res.statusCode !== 200 || res.body.data.length === 0) {
      throw new Error(`Expected 200 with diagnostic catalog items, got ${res.statusCode}`);
    }
  });

  await test('12. POST /api/lab-tests - Order Diagnostic Clinical Investigation', async () => {
    const res = await request('POST', '/api/lab-tests', {
      testCode: "LAB-CBC",
      patientName: "Arjun Mehta",
      patientPhone: "+91-9876500112",
      appointmentId: createdAptId,
      urgency: "HIGH"
    });
    if (res.statusCode !== 201 || !res.body.data.id) {
      throw new Error(`Expected 201 Created with lab test order ID, got ${res.statusCode}`);
    }
    createdLabTestId = res.body.data.id;
  });

  await test('13. PATCH /api/lab-tests/:id/result - Log Specimen Findings & Interpretation', async () => {
    const res = await request('PATCH', `/api/lab-tests/${createdLabTestId}/result`, {
      findings: "WBC: 6,800/uL, Hemoglobin: 14.5 g/dL, Platelets: 230,000/uL. Normal limits.",
      interpretation: "NORMAL",
      technicianRemarks: "Verified by Clinical Pathologist"
    });
    if (res.statusCode !== 200 || res.body.data.status !== 'COMPLETED') {
      throw new Error(`Expected 200 with COMPLETED lab order status, got ${res.statusCode}`);
    }
  });

  // 14. Hospital Analytics Summary
  await test('14. GET /api/analytics/summary - Hospital Workload & Financial Analytics', async () => {
    const res = await request('GET', '/api/analytics/summary');
    if (res.statusCode !== 200 || !res.body.data.overview.totalAppointments) {
      throw new Error(`Expected 200 with overview metrics, got ${res.statusCode}`);
    }
  });

  // 15. Delete Appointment
  await test('15. DELETE /api/appointments/:id - Delete Appointment Audit Record', async () => {
    const res = await request('DELETE', `/api/appointments/${createdAptId}`);
    if (res.statusCode !== 200) {
      throw new Error(`Expected 200 Deleted, got ${res.statusCode}`);
    }
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED (${(passed/total * 100).toFixed(0)}%)`);
  console.log('====================================================');

  if (testServerInstance) {
    testServerInstance.close();
  }

  if (passed === total) {
    console.log('[SUCCESS] ALL SERVICE ENDPOINTS VERIFIED SUCCESSFULLY.\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
