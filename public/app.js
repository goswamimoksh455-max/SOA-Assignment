/**
 * MediCare Web Service - Client Application Controller
 * Monochromatic Uber-Style UI Architecture
 */

const BASE_URL = window.location.origin;

// State caches
let cachedDoctors = [];
let cachedAppointments = [];
let cachedPatients = [];
let cachedLabCatalog = [];
let cachedLabOrders = [];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadHospitalAnalytics();
  loadDoctors();
  loadAppointments();
  loadPrescriptions();
  loadPatients();
  loadLabCatalog();
  loadLabOrders();
});

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  const activePane = document.getElementById(`tab-${tabId}`);
  if (activePane) activePane.classList.add('active');

  const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (tabId === 'dashboard') loadHospitalAnalytics();
  if (tabId === 'doctors') loadDoctors();
  if (tabId === 'appointments') loadAppointments();
  if (tabId === 'prescriptions') loadPrescriptions();
  if (tabId === 'patients') loadPatients();
  if (tabId === 'lab') {
    loadLabCatalog();
    loadLabOrders();
  }
}

// ==========================================
// TOAST NOTIFICATIONS & IN-APP MODAL ENGINE
// ==========================================
function showToast(message, isError = false) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;

  toast.textContent = message;
  toast.style.borderColor = isError ? '#ff5252' : '#ffffff';
  toast.style.color = isError ? '#ff9999' : '#ffffff';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function openModal(title, bodyHtml, footerHtml = '') {
  const modal = document.getElementById('appModal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const footerEl = document.getElementById('modalFooter');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;

  footerEl.innerHTML = `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
    ${footerHtml}
  `;

  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('appModal');
  if (modal) modal.classList.remove('open');
}

// ==========================================
// 1. HOSPITAL ANALYTICS & STATS
// ==========================================
async function loadHospitalAnalytics() {
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/summary`);
    const json = await res.json();
    if (!json.success) return;

    const { overview, doctorWorkload } = json.data;

    // Update Hero KPI Tiles
    const statDocs = document.getElementById('statDoctors');
    const statApts = document.getElementById('statAppointments');
    const statRx = document.getElementById('statPrescriptions');
    const statPatients = document.getElementById('statPatients');
    const statLab = document.getElementById('statLabTests');
    const statRev = document.getElementById('statRevenue');

    if (statDocs) statDocs.textContent = overview.totalDoctors;
    if (statApts) statApts.textContent = overview.totalAppointments;
    if (statRx) statRx.textContent = overview.totalPrescriptionsIssued;
    if (statPatients) statPatients.textContent = overview.totalRegisteredPatients || 3;
    if (statLab) statLab.textContent = overview.totalLabTestsOrdered || 2;
    if (statRev) statRev.textContent = overview.totalEstimatedRevenue;

    // Render Specialist Workload Cards
    const container = document.getElementById('doctorWorkloadContainer');
    if (!container) return;

    container.innerHTML = doctorWorkload.map(dw => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${dw.doctorName}</span>
          <span class="badge badge-white">${dw.specialization}</span>
        </div>
        <div class="item-subtext">Doctor ID: ${dw.doctorId}</div>
        <div class="item-spec-grid">
          <div><strong>Total Bookings:</strong> ${dw.totalBookings}</div>
          <div><strong>Completed:</strong> ${dw.completedConsultations}</div>
          <div><strong>Revenue Generated:</strong> INR ${dw.revenueContributed.toLocaleString('en-IN')}</div>
          <div><strong>Room Status:</strong> ACTIVE</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

// ==========================================
// 2. SPECIALIST DIRECTORY
// ==========================================
async function loadDoctors() {
  try {
    const specInput = document.getElementById('filterSpecialization');
    const filter = specInput ? specInput.value.trim() : '';
    const url = filter ? `${BASE_URL}/api/doctors?specialization=${encodeURIComponent(filter)}` : `${BASE_URL}/api/doctors`;

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) return;

    cachedDoctors = json.data;

    const container = document.getElementById('doctorsListContainer');
    if (container) {
      if (cachedDoctors.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No specialists found matching filter.</p>`;
      } else {
        container.innerHTML = cachedDoctors.map(doc => `
          <div class="item-card">
            <div class="item-header">
              <span class="item-title">${doc.name}</span>
              <span class="badge badge-white">Rating ${doc.rating}</span>
            </div>
            <div class="item-subtext">${doc.specialization} • ${doc.qualification}</div>
            <div class="item-spec-grid">
              <div><strong>Consultation Fee:</strong> INR ${doc.consultationFee}</div>
              <div><strong>Experience:</strong> ${doc.experienceYears} Years</div>
              <div><strong>Room:</strong> ${doc.contact.roomNo}</div>
              <div><strong>Available Days:</strong> ${doc.availableDays.join(', ')}</div>
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary);">
              <strong>Time Slots:</strong> ${doc.availableSlots.map(s => `<span class="badge badge-outline" style="margin: 2px;">${s}</span>`).join(' ')}
            </div>
          </div>
        `).join('');
      }
    }

    // Populate Doctor Dropdown in Appointments form
    const docSelect = document.getElementById('aptDoctorSelect');
    if (docSelect) {
      docSelect.innerHTML = cachedDoctors.map(d => `
        <option value="${d.id}">${d.name} (${d.specialization}) - INR ${d.consultationFee}</option>
      `).join('');
    }
  } catch (err) {
    console.error("Error fetching doctors:", err);
  }
}

async function handleCreateDoctor(event) {
  event.preventDefault();
  const payload = {
    name: document.getElementById('docName').value.trim(),
    specialization: document.getElementById('docSpec').value.trim(),
    consultationFee: Number(document.getElementById('docFee').value),
    qualification: document.getElementById('docQual').value.trim(),
    experienceYears: Number(document.getElementById('docExp').value)
  };

  try {
    const res = await fetch(`${BASE_URL}/api/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      showToast(`Specialist onboarded: ${json.data.name} (ID: ${json.data.id})`);
      document.getElementById('formAddDoctor').reset();
      loadDoctors();
      loadHospitalAnalytics();
    } else {
      showToast(`Error: ${json.message}`, true);
    }
  } catch (err) {
    showToast(`Request failed: ${err.message}`, true);
  }
}

// ==========================================
// 3. APPOINTMENTS & CONFLICT PREVENTION
// ==========================================
async function loadAppointments() {
  try {
    const res = await fetch(`${BASE_URL}/api/appointments`);
    const json = await res.json();
    if (!json.success) return;

    cachedAppointments = json.data;
    const container = document.getElementById('appointmentsListContainer');
    if (!container) return;

    if (cachedAppointments.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No appointments booked yet.</p>`;
      return;
    }

    container.innerHTML = cachedAppointments.map(apt => {
      let badgeClass = 'badge-white';
      if (apt.status === 'CONFIRMED') badgeClass = 'badge-confirmed';
      if (apt.status === 'COMPLETED') badgeClass = 'badge-completed';
      if (apt.status === 'CANCELLED') badgeClass = 'badge-cancelled';
      if (apt.status === 'RESCHEDULED') badgeClass = 'badge-rescheduled';

      const isHighUrgency = apt.urgencyLevel === 'HIGH' || apt.urgencyLevel === 'EMERGENCY';

      return `
        <div class="item-card">
          <div class="item-header">
            <span class="item-title">${apt.patientName} (${apt.patientAge}y/${apt.patientGender})</span>
            <span class="badge ${badgeClass}">${apt.status}</span>
          </div>
          <div class="item-subtext">
            DATE: ${apt.appointmentDate} | TIME: ${apt.timeSlot} • Attending: ${apt.doctorName}
          </div>
          <div class="item-spec-grid">
            <div><strong>Token / ID:</strong> <code>${apt.id}</code></div>
            <div><strong>Urgency:</strong> <span class="badge ${isHighUrgency ? 'badge-critical' : 'badge-outline'}">${apt.urgencyLevel}</span></div>
            <div><strong>Contact:</strong> ${apt.patientPhone}</div>
            <div><strong>Fee:</strong> INR ${apt.consultationFee} (${apt.paymentStatus})</div>
          </div>
          <div style="font-size: 0.775rem; color: var(--text-secondary); margin-top: 0.4rem;">
            <strong>Chief Symptoms:</strong> ${apt.symptoms}
          </div>
          <div class="item-actions">
            ${apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' ? `
              <button class="btn btn-outline btn-sm" onclick="openRescheduleModal('${apt.id}')">Reschedule</button>
              <button class="btn btn-outline btn-sm" onclick="openPrescriptionModal('${apt.id}')">Issue Rx</button>
              <button class="btn btn-outline btn-sm" onclick="openNewLabOrderModal('${apt.patientPhone}', '${apt.patientName}', '${apt.id}')">Order Lab</button>
              <button class="btn btn-danger btn-sm" onclick="openCancelModal('${apt.id}')">Cancel</button>
            ` : `
              <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Final State: ${apt.status}</span>
            `}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error("Error loading appointments:", err);
  }
}

async function handleBookAppointment(event) {
  event.preventDefault();

  const payload = {
    patientName: document.getElementById('aptPatientName').value.trim(),
    patientAge: Number(document.getElementById('aptPatientAge').value),
    patientGender: document.getElementById('aptPatientGender').value,
    patientPhone: document.getElementById('aptPatientPhone').value.trim(),
    urgencyLevel: document.getElementById('aptUrgency').value,
    doctorId: document.getElementById('aptDoctorSelect').value,
    appointmentDate: document.getElementById('aptDate').value,
    timeSlot: document.getElementById('aptTimeSlot').value,
    symptoms: document.getElementById('aptSymptoms').value.trim()
  };

  try {
    const res = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (res.status === 201) {
      openModal(
        'Booking Confirmed',
        `
        <div style="line-height: 1.6; font-size: 0.85rem;">
          <p><strong>Status:</strong> HTTP 201 Created</p>
          <p><strong>Token ID:</strong> <code>${json.data.id}</code></p>
          <p><strong>Patient:</strong> ${json.data.patientName}</p>
          <p><strong>Attending Doctor:</strong> ${json.data.doctorName}</p>
          <p><strong>Slot:</strong> ${json.data.appointmentDate} at ${json.data.timeSlot}</p>
          <p><strong>Fee:</strong> INR ${json.data.consultationFee}</p>
        </div>
        `
      );
      loadAppointments();
      loadPatients();
      loadHospitalAnalytics();
    } else if (res.status === 409) {
      openModal(
        'Collision Integrity Violation (HTTP 409 Conflict)',
        `
        <div style="line-height: 1.6; font-size: 0.85rem; color: #ff9999;">
          <p><strong>Double-Booking Prevention Triggered:</strong></p>
          <p>${json.message}</p>
          <p style="margin-top: 0.5rem; color: var(--text-secondary);">Please select another time slot or consultation date for this doctor.</p>
        </div>
        `
      );
    } else {
      showToast(`Error (${res.status}): ${json.message}`, true);
    }
  } catch (err) {
    showToast(`Request error: ${err.message}`, true);
  }
}

// Reschedule Modal
function openRescheduleModal(appointmentId) {
  const bodyHtml = `
    <form id="formRescheduleModal" onsubmit="submitReschedule(event, '${appointmentId}')">
      <div class="form-group">
        <label>Appointment Reference ID</label>
        <input type="text" value="${appointmentId}" disabled>
      </div>
      <div class="form-group">
        <label>New Consultation Date</label>
        <input type="date" id="modalRescheduleDate" required value="2026-10-28">
      </div>
      <div class="form-group">
        <label>New Time Slot</label>
        <select id="modalRescheduleSlot" required>
          <option value="09:00 AM">09:00 AM</option>
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:30 AM">11:30 AM</option>
          <option value="02:00 PM">02:00 PM</option>
          <option value="04:00 PM">04:00 PM</option>
        </select>
      </div>
      <button type="submit" id="btnSubmitReschedule" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnSubmitReschedule').click()">Confirm Reschedule</button>
  `;

  openModal(`Reschedule Consultation: ${appointmentId}`, bodyHtml, footerHtml);
}

async function submitReschedule(event, id) {
  event.preventDefault();
  const newDate = document.getElementById('modalRescheduleDate').value;
  const newTimeSlot = document.getElementById('modalRescheduleSlot').value;

  try {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/reschedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDate, newTimeSlot })
    });
    const json = await res.json();
    closeModal();

    if (res.ok) {
      showToast(json.message);
      loadAppointments();
    } else {
      showToast(`Error (${res.status}): ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// Issue Prescription Modal
function openPrescriptionModal(appointmentId) {
  const apt = cachedAppointments.find(a => a.id === appointmentId);
  const patientName = apt ? apt.patientName : "Patient";

  const bodyHtml = `
    <form id="formPrescriptionModal" onsubmit="submitPrescription(event, '${appointmentId}')">
      <div class="form-group">
        <label>Patient Reference</label>
        <input type="text" value="${patientName} (${appointmentId})" disabled>
      </div>
      <div class="form-group">
        <label>Clinical Diagnosis</label>
        <input type="text" id="modalDiagnosis" required value="Acute Respiratory Tract Infection with dry cough">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Blood Pressure</label>
          <input type="text" id="modalBP" value="122/80 mmHg">
        </div>
        <div class="form-group">
          <label>Pulse Rate</label>
          <input type="text" id="modalPulse" value="76 bpm">
        </div>
      </div>
      <div class="form-group">
        <label>Prescribed Pharmaceutical Regimen</label>
        <textarea id="modalMeds" rows="3" required style="font-family: var(--font-mono); font-size: 0.78rem;">Amoxicillin 500mg | Twice daily after food | 7 days
Levocetirizine 5mg | Once daily at bedtime | 10 days</textarea>
        <span style="font-size: 0.7rem; color: var(--text-muted);">Format: Medicine Name | Dosage & Frequency | Days</span>
      </div>
      <div class="form-group">
        <label>Lifestyle & Clinical Advice</label>
        <input type="text" id="modalAdvice" value="Adequate hydration, warm fluids, avoid sudden temperature changes.">
      </div>
      <div class="form-group">
        <label>Follow-Up Date</label>
        <input type="date" id="modalFollowUp" value="2026-11-05">
      </div>
      <button type="submit" id="btnSubmitPrescription" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnSubmitPrescription').click()">Issue Digital Prescription</button>
  `;

  openModal(`Issue Electronic Prescription (Rx)`, bodyHtml, footerHtml);
}

async function submitPrescription(event, id) {
  event.preventDefault();
  const diagnosis = document.getElementById('modalDiagnosis').value.trim();
  const bp = document.getElementById('modalBP').value.trim();
  const pulse = document.getElementById('modalPulse').value.trim();
  const medsRaw = document.getElementById('modalMeds').value.trim();
  const advice = document.getElementById('modalAdvice').value.trim();
  const followUp = document.getElementById('modalFollowUp').value;

  const medicines = medsRaw.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split('|').map(s => s.trim());
    return {
      name: parts[0] || "Medication",
      dosage: parts[1] || "As advised",
      frequency: parts[1] || "Standard dose",
      durationDays: parseInt(parts[2]) || 7
    };
  });

  const payload = {
    diagnosis,
    vitalSigns: { bloodPressure: bp, pulseRate: pulse, weightKg: 68 },
    medicines,
    lifestyleAdvice: advice,
    followUpDate: followUp || null
  };

  try {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    closeModal();

    if (res.status === 201) {
      showToast(json.message);
      loadAppointments();
      loadPrescriptions();
      loadPatients();
      loadHospitalAnalytics();
      switchTab('prescriptions');
    } else {
      showToast(`Error (${res.status}): ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// Cancel Modal
function openCancelModal(appointmentId) {
  const bodyHtml = `
    <form id="formCancelModal" onsubmit="submitCancel(event, '${appointmentId}')">
      <div class="form-group">
        <label>Appointment Reference ID</label>
        <input type="text" value="${appointmentId}" disabled>
      </div>
      <div class="form-group">
        <label>Reason for Cancellation</label>
        <input type="text" id="modalCancelReason" required value="Patient personal schedule conflict">
      </div>
      <button type="submit" id="btnSubmitCancel" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-danger btn-sm" onclick="document.getElementById('btnSubmitCancel').click()">Confirm Cancellation</button>
  `;

  openModal(`Cancel Appointment: ${appointmentId}`, bodyHtml, footerHtml);
}

async function submitCancel(event, id) {
  event.preventDefault();
  const reason = document.getElementById('modalCancelReason').value.trim();

  try {
    const res = await fetch(`${BASE_URL}/api/appointments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: "CANCELLED", reason })
    });
    const json = await res.json();
    closeModal();

    if (res.ok) {
      showToast(`Appointment ${id} status updated to CANCELLED.`);
      loadAppointments();
      loadPatients();
      loadHospitalAnalytics();
    } else {
      showToast(`Error: ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// ==========================================
// 4. PRESCRIPTIONS LEDGER
// ==========================================
async function loadPrescriptions() {
  try {
    const res = await fetch(`${BASE_URL}/api/prescriptions`);
    const json = await res.json();
    if (!json.success) return;

    const container = document.getElementById('prescriptionsContainer');
    if (!container) return;

    if (json.data.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No medical prescriptions issued yet.</p>`;
      return;
    }

    container.innerHTML = json.data.map(rx => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">Rx Record: ${rx.patientName} (${rx.patientAge} Years)</span>
          <span class="badge badge-white">ID: ${rx.id}</span>
        </div>
        <div class="item-subtext">Issued by ${rx.doctorName} • Linked Consultation: <code>${rx.appointmentId}</code></div>
        <div style="background: var(--bg-black); padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.8rem; border: 1px solid var(--border-subtle);">
          <div><strong>Diagnosis:</strong> <span style="color: #ffffff;">${rx.diagnosis}</span></div>
          <div style="margin-top: 0.25rem;"><strong>Vital Signs:</strong> BP: ${rx.vitalSigns.bloodPressure} | Pulse: ${rx.vitalSigns.pulseRate} | Weight: ${rx.vitalSigns.weightKg} kg</div>
        </div>
        <div style="margin-top: 0.5rem;">
          <strong style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary);">Prescribed Regimen:</strong>
          <ul style="margin-left: 1.25rem; font-size: 0.8rem; color: #e5e5e5; margin-top: 0.25rem;">
            ${rx.medicines.map(m => `
              <li><strong>${m.name}</strong> - ${m.dosage} (${m.frequency}) for ${m.durationDays} days</li>
            `).join('')}
          </ul>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.76rem; color: var(--text-muted);">
          <div><strong>Lifestyle Guidance:</strong> ${rx.lifestyleAdvice}</div>
          <div><strong>Follow-up Scheduled:</strong> ${rx.followUpDate || 'None'}</div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading prescriptions:", err);
  }
}

// ==========================================
// 5. PATIENT RECORDS (NEW FUNCTIONALITY 1)
// ==========================================
async function loadPatients() {
  try {
    const filterInput = document.getElementById('filterPatients');
    const query = filterInput ? filterInput.value.trim() : '';
    const url = query ? `${BASE_URL}/api/patients?search=${encodeURIComponent(query)}` : `${BASE_URL}/api/patients`;

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) return;

    cachedPatients = json.data;
    const container = document.getElementById('patientsListContainer');
    if (!container) return;

    if (cachedPatients.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No patient records match the search filter.</p>`;
      return;
    }

    container.innerHTML = cachedPatients.map(p => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${p.name} (${p.age}y / ${p.gender})</span>
          <span class="badge badge-white">Blood: ${p.bloodGroup}</span>
        </div>
        <div class="item-subtext">Phone: ${p.phone} • Emergency: ${p.emergencyContact}</div>
        <div class="item-spec-grid">
          <div><strong>Total Visits:</strong> ${p.totalVisits}</div>
          <div><strong>Prescriptions:</strong> ${p.totalPrescriptions}</div>
          <div><strong>Lab Orders:</strong> ${p.totalLabTests}</div>
          <div><strong>Lifetime Spend:</strong> INR ${p.totalExpenditure}</div>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.35rem;">
          <div><strong>Allergies:</strong> ${p.allergies && p.allergies.length ? p.allergies.join(', ') : 'None documented'}</div>
          <div><strong>Chronic Conditions:</strong> ${p.chronicConditions && p.chronicConditions.length ? p.chronicConditions.join(', ') : 'None documented'}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary btn-sm" onclick="viewPatientHistory('${p.phone}')">View Dossier Timeline</button>
          <button class="btn btn-outline btn-sm" onclick="openNewLabOrderModal('${p.phone}', '${p.name}', 'DIRECT-OPD')">Order Diagnostic Test</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading patients:", err);
  }
}

async function viewPatientHistory(phone) {
  try {
    const res = await fetch(`${BASE_URL}/api/patients/${encodeURIComponent(phone)}/history`);
    const json = await res.json();
    if (!json.success) {
      showToast(json.message, true);
      return;
    }

    const { patientProfile, metrics, timeline } = json.data;

    // Update Subtitle & Badges
    document.getElementById('activePatientSubtitle').textContent = `Dossier: ${patientProfile.name} | Phone: ${patientProfile.phone}`;
    const statsBox = document.getElementById('patientDossierStats');
    statsBox.style.display = 'block';
    document.getElementById('dossierSpendBadge').textContent = `Spend: INR ${metrics.totalLifetimeSpend}`;

    const container = document.getElementById('patientDossierContainer');
    if (!container) return;

    if (timeline.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No historical events recorded for this patient.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="margin-bottom: 1rem; padding: 0.85rem; background: var(--bg-black); border: 1px solid var(--border-subtle); border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
          <span><strong>Blood Group:</strong> ${patientProfile.bloodGroup}</span>
          <span><strong>Age / Gender:</strong> ${patientProfile.age} / ${patientProfile.gender}</span>
        </div>
        <div style="font-size: 0.775rem; color: var(--text-secondary);">
          <div><strong>Known Allergies:</strong> ${patientProfile.allergies.join(', ') || 'None'}</div>
          <div><strong>Chronic Conditions:</strong> ${patientProfile.chronicConditions.join(', ') || 'None'}</div>
        </div>
      </div>

      <div class="timeline-container">
        ${timeline.map(ev => `
          <div class="timeline-event">
            <div class="timeline-date">${ev.date} ${ev.time ? `• ${ev.time}` : ''} [${ev.type}]</div>
            <div class="timeline-title">${ev.title}</div>
            <div class="timeline-body">
              <div><strong>Status:</strong> <span class="badge badge-white">${ev.status}</span></div>
              <div style="margin-top: 0.25rem;">${ev.details}</div>
              <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">REF ID: ${ev.id}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    showToast(`Error viewing history: ${err.message}`, true);
  }
}

function openNewPatientModal() {
  const bodyHtml = `
    <form id="formNewPatient" onsubmit="submitNewPatient(event)">
      <div class="form-group">
        <label>Full Patient Name</label>
        <input type="text" id="modalPatientName" required placeholder="e.g. Priya Desai">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Contact Phone</label>
          <input type="text" id="modalPatientPhone" required placeholder="+91-9876543200">
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="modalPatientEmail" placeholder="priya.desai@example.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Age</label>
          <input type="number" id="modalPatientAge" required value="32">
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="modalPatientGender">
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Blood Group</label>
          <select id="modalPatientBlood">
            <option value="O+">O+</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
            <option value="O-">O-</option>
            <option value="A-">A-</option>
            <option value="B-">B-</option>
            <option value="AB-">AB-</option>
          </select>
        </div>
        <div class="form-group">
          <label>Emergency Contact</label>
          <input type="text" id="modalPatientEmergency" value="+91-9876543299">
        </div>
      </div>
      <div class="form-group">
        <label>Allergies (comma separated)</label>
        <input type="text" id="modalPatientAllergies" value="Penicillin, Peanuts">
      </div>
      <div class="form-group">
        <label>Chronic Medical Conditions (comma separated)</label>
        <input type="text" id="modalPatientConditions" value="Mild Bronchial Asthma">
      </div>
      <button type="submit" id="btnSubmitNewPatient" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnSubmitNewPatient').click()">Save to Master Patient Index</button>
  `;

  openModal('Register Master Patient Record', bodyHtml, footerHtml);
}

async function submitNewPatient(event) {
  event.preventDefault();
  const name = document.getElementById('modalPatientName').value.trim();
  const phone = document.getElementById('modalPatientPhone').value.trim();
  const email = document.getElementById('modalPatientEmail').value.trim();
  const age = Number(document.getElementById('modalPatientAge').value);
  const gender = document.getElementById('modalPatientGender').value;
  const bloodGroup = document.getElementById('modalPatientBlood').value;
  const emergencyContact = document.getElementById('modalPatientEmergency').value.trim();
  const allergiesRaw = document.getElementById('modalPatientAllergies').value.trim();
  const conditionsRaw = document.getElementById('modalPatientConditions').value.trim();

  const allergies = allergiesRaw ? allergiesRaw.split(',').map(s => s.trim()) : [];
  const chronicConditions = conditionsRaw ? conditionsRaw.split(',').map(s => s.trim()) : [];

  const payload = {
    name,
    phone,
    email,
    age,
    gender,
    bloodGroup,
    emergencyContact,
    allergies,
    chronicConditions
  };

  try {
    const res = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    closeModal();

    if (res.status === 201) {
      showToast(json.message);
      loadPatients();
      loadHospitalAnalytics();
    } else {
      showToast(`Error: ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// ==========================================
// 6. DIAGNOSTIC LAB ORDERS (NEW FUNCTIONALITY 2)
// ==========================================
async function loadLabCatalog() {
  try {
    const res = await fetch(`${BASE_URL}/api/lab-tests/catalog`);
    const json = await res.json();
    if (!json.success) return;

    cachedLabCatalog = json.data;
    const container = document.getElementById('labCatalogContainer');
    if (!container) return;

    container.innerHTML = cachedLabCatalog.map(item => `
      <div class="item-card">
        <div class="item-header">
          <span class="item-title">${item.name}</span>
          <span class="badge badge-white">INR ${item.price}</span>
        </div>
        <div class="item-subtext">Code: <code>${item.code}</code> • Category: ${item.category} • Turnaround: ${item.turnaroundHours}h</div>
        <div class="item-spec-grid">
          <div><strong>Specimen:</strong> ${item.specimen}</div>
          <div><strong>Standard Reference:</strong> ${item.normalRange}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-outline btn-sm" onclick="openNewLabOrderModal('', '', '', '${item.code}')">Order Investigation</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Error loading lab catalog:", err);
  }
}

async function loadLabOrders() {
  try {
    const filterStatus = document.getElementById('filterLabStatus');
    const status = filterStatus ? filterStatus.value : '';
    const url = status ? `${BASE_URL}/api/lab-tests?status=${encodeURIComponent(status)}` : `${BASE_URL}/api/lab-tests`;

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) return;

    cachedLabOrders = json.data;
    const container = document.getElementById('labOrdersContainer');
    if (!container) return;

    if (cachedLabOrders.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No diagnostic orders recorded matching filter.</p>`;
      return;
    }

    container.innerHTML = cachedLabOrders.map(order => {
      const isCompleted = order.status === 'COMPLETED';
      let interpBadge = 'badge-white';
      if (order.resultData) {
        if (order.resultData.interpretation === 'ABNORMAL') interpBadge = 'badge-rescheduled';
        if (order.resultData.interpretation === 'CRITICAL') interpBadge = 'badge-critical';
      }

      return `
        <div class="item-card">
          <div class="item-header">
            <span class="item-title">${order.testName}</span>
            <span class="badge ${isCompleted ? 'badge-completed' : 'badge-rescheduled'}">${order.status}</span>
          </div>
          <div class="item-subtext">Patient: ${order.patientName} (${order.patientPhone}) • Order ID: <code>${order.id}</code></div>
          <div class="item-spec-grid">
            <div><strong>Urgency:</strong> ${order.urgency}</div>
            <div><strong>Specimen Required:</strong> ${order.specimenRequired}</div>
            <div><strong>Ordered At:</strong> ${order.createdAt.split('T')[0]}</div>
            <div><strong>Linked Consultation:</strong> ${order.appointmentId}</div>
          </div>
          ${order.resultData ? `
            <div style="background: var(--bg-black); padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.8rem; border: 1px solid var(--border-subtle);">
              <div><strong>Pathology Interpretation:</strong> <span class="badge ${interpBadge}">${order.resultData.interpretation}</span></div>
              <div style="margin-top: 0.25rem;"><strong>Clinical Findings:</strong> ${order.resultData.findings}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">Remarks: ${order.resultData.technicianRemarks}</div>
            </div>
          ` : `
            <div class="item-actions">
              <button class="btn btn-primary btn-sm" onclick="openLogLabResultModal('${order.id}')">Log Pathology Findings</button>
            </div>
          `}
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error("Error loading lab orders:", err);
  }
}

function openNewLabOrderModal(patientPhone = '', patientName = '', appointmentId = '', defaultCode = 'LAB-CBC') {
  const catalogOptions = cachedLabCatalog.map(c => `
    <option value="${c.code}" ${c.code === defaultCode ? 'selected' : ''}>${c.name} (${c.code}) - INR ${c.price}</option>
  `).join('');

  const bodyHtml = `
    <form id="formNewLabOrder" onsubmit="submitNewLabOrder(event)">
      <div class="form-group">
        <label>Diagnostic Test Profile</label>
        <select id="modalLabTestCode" required>
          ${catalogOptions}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Patient Full Name</label>
          <input type="text" id="modalLabPatientName" required value="${patientName || 'Rohan Verma'}">
        </div>
        <div class="form-group">
          <label>Patient Contact Phone</label>
          <input type="text" id="modalLabPatientPhone" required value="${patientPhone || '+91-9988776655'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Linked Consultation ID</label>
          <input type="text" id="modalLabAptId" value="${appointmentId || 'DIRECT-OPD'}">
        </div>
        <div class="form-group">
          <label>Investigation Urgency</label>
          <select id="modalLabUrgency">
            <option value="NORMAL">NORMAL</option>
            <option value="HIGH">HIGH (Priority)</option>
            <option value="STAT">STAT / CRITICAL</option>
          </select>
        </div>
      </div>
      <button type="submit" id="btnSubmitLabOrder" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnSubmitLabOrder').click()">Submit Lab Order</button>
  `;

  openModal('Order Clinical Diagnostic Investigation', bodyHtml, footerHtml);
}

async function submitNewLabOrder(event) {
  event.preventDefault();
  const testCode = document.getElementById('modalLabTestCode').value;
  const patientName = document.getElementById('modalLabPatientName').value.trim();
  const patientPhone = document.getElementById('modalLabPatientPhone').value.trim();
  const appointmentId = document.getElementById('modalLabAptId').value.trim();
  const urgency = document.getElementById('modalLabUrgency').value;

  const payload = {
    testCode,
    patientName,
    patientPhone,
    appointmentId,
    urgency
  };

  try {
    const res = await fetch(`${BASE_URL}/api/lab-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    closeModal();

    if (res.status === 201) {
      showToast(json.message);
      loadLabOrders();
      loadPatients();
      loadHospitalAnalytics();
      switchTab('lab');
    } else {
      showToast(`Error: ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

function openLogLabResultModal(testId) {
  const order = cachedLabOrders.find(o => o.id === testId);
  const testName = order ? order.testName : "Diagnostic Test";

  const bodyHtml = `
    <form id="formLogLabResult" onsubmit="submitLabResult(event, '${testId}')">
      <div class="form-group">
        <label>Investigation Reference</label>
        <input type="text" value="${testName} (${testId})" disabled>
      </div>
      <div class="form-group">
        <label>Clinical Findings / Observations</label>
        <textarea id="modalLabFindings" rows="3" required placeholder="Detailed clinical results...">Hemoglobin: 14.2 g/dL, WBC: 7,200 /uL, Platelets: 240,000 /uL. Morphology normal.</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Diagnostic Interpretation</label>
          <select id="modalLabInterpretation">
            <option value="NORMAL">NORMAL</option>
            <option value="ABNORMAL">ABNORMAL</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <div class="form-group">
          <label>Technician / Pathologist Remarks</label>
          <input type="text" id="modalLabRemarks" value="Verified by Senior Pathologist Dr. N. Rao.">
        </div>
      </div>
      <button type="submit" id="btnSubmitLabResult" style="display: none;"></button>
    </form>
  `;

  const footerHtml = `
    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnSubmitLabResult').click()">Log Findings &amp; Complete Order</button>
  `;

  openModal(`Log Pathology Results: ${testId}`, bodyHtml, footerHtml);
}

async function submitLabResult(event, id) {
  event.preventDefault();
  const findings = document.getElementById('modalLabFindings').value.trim();
  const interpretation = document.getElementById('modalLabInterpretation').value;
  const technicianRemarks = document.getElementById('modalLabRemarks').value.trim();

  const payload = {
    findings,
    interpretation,
    technicianRemarks
  };

  try {
    const res = await fetch(`${BASE_URL}/api/lab-tests/${id}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    closeModal();

    if (res.ok) {
      showToast(json.message);
      loadLabOrders();
      loadPatients();
      loadHospitalAnalytics();
    } else {
      showToast(`Error: ${json.message}`, true);
    }
  } catch (err) {
    showToast(err.message, true);
  }
}

// ==========================================
// 7. INTERACTIVE API CONSOLE (POSTMAN SIMULATOR)
// ==========================================
async function runPreset(action) {
  const methodEl = document.getElementById('consoleMethod');
  const urlEl = document.getElementById('consoleUrl');
  const statusEl = document.getElementById('consoleStatus');
  const timeEl = document.getElementById('consoleTime');
  const reqBodyEl = document.getElementById('consoleRequestBody');
  const resBodyEl = document.getElementById('consoleResponseBody');

  let method = 'GET';
  let endpoint = '/api/doctors';
  let body = null;

  switch (action) {
    case 'GET_DOCTORS':
      method = 'GET';
      endpoint = '/api/doctors';
      break;

    case 'POST_DOCTOR':
      method = 'POST';
      endpoint = '/api/doctors';
      body = {
        name: "Dr. Sunita Kapoor",
        specialization: "Dermatology",
        qualification: "MD (Dermatology), DVD",
        experienceYears: 10,
        consultationFee: 700,
        availableDays: ["Tuesday", "Friday"],
        availableSlots: ["11:00 AM", "03:00 PM"]
      };
      break;

    case 'POST_APPOINTMENT_SUCCESS':
      method = 'POST';
      endpoint = '/api/appointments';
      body = {
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
      };
      break;

    case 'POST_APPOINTMENT_CONFLICT':
      method = 'POST';
      endpoint = '/api/appointments';
      body = {
        patientName: "Kavita Rao",
        patientAge: 42,
        patientGender: "Female",
        patientPhone: "+91-9876599881",
        doctorId: "DOC-101",
        appointmentDate: "2026-10-20", // Pre-existing appointment slot
        timeSlot: "09:00 AM",
        symptoms: "Routine cardiac screening"
      };
      break;

    case 'PUT_RESCHEDULE':
      method = 'PUT';
      endpoint = '/api/appointments/APT-2026-001/reschedule';
      body = {
        newDate: "2026-10-27",
        newTimeSlot: "02:00 PM"
      };
      break;

    case 'POST_PRESCRIPTION':
      method = 'POST';
      endpoint = '/api/appointments/APT-2026-001/prescription';
      body = {
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
          },
          {
            name: "Magnesium Complex",
            dosage: "250 mg",
            frequency: "Once daily at bedtime",
            durationDays: 15
          }
        ],
        lifestyleAdvice: "Reduce dietary sodium intake. Practice 20 mins deep breathing daily.",
        followUpDate: "2026-11-20"
      };
      break;

    case 'GET_PATIENTS':
      method = 'GET';
      endpoint = '/api/patients';
      break;

    case 'GET_PATIENT_HISTORY':
      method = 'GET';
      endpoint = '/api/patients/+91-9988776655/history';
      break;

    case 'GET_LAB_CATALOG':
      method = 'GET';
      endpoint = '/api/lab-tests/catalog';
      break;

    case 'POST_LAB_TEST':
      method = 'POST';
      endpoint = '/api/lab-tests';
      body = {
        testCode: "LAB-CBC",
        patientName: "Arjun Mehta",
        patientPhone: "+91-9876500112",
        appointmentId: "APT-2026-001",
        urgency: "HIGH"
      };
      break;

    case 'GET_ANALYTICS':
      method = 'GET';
      endpoint = '/api/analytics/summary';
      break;

    case 'DELETE_APPOINTMENT':
      method = 'DELETE';
      endpoint = '/api/appointments/APT-2026-001';
      break;
  }

  // Update Console View
  methodEl.textContent = method;
  urlEl.textContent = `${BASE_URL}${endpoint}`;
  reqBodyEl.textContent = body ? JSON.stringify(body, null, 2) : "None (GET/DELETE request)";
  resBodyEl.textContent = "Executing HTTP request...";

  const startTime = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const json = await res.json();

    statusEl.textContent = `${res.status} ${getStatusText(res.status)}`;
    statusEl.className = res.status >= 400 ? 'badge badge-cancelled' : 'badge badge-confirmed';
    timeEl.textContent = `${duration}ms`;
    resBodyEl.textContent = JSON.stringify(json, null, 2);

    // Refresh state if mutations were performed
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      loadDoctors();
      loadAppointments();
      loadPrescriptions();
      loadPatients();
      loadLabOrders();
      loadHospitalAnalytics();
    }
  } catch (err) {
    statusEl.textContent = "NETWORK_ERROR";
    statusEl.className = 'badge badge-cancelled';
    resBodyEl.textContent = `Network / Execution Error: ${err.message}`;
  }
}

function getStatusText(code) {
  switch (code) {
    case 200: return 'OK';
    case 201: return 'Created';
    case 400: return 'Bad Request';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    default: return '';
  }
}
