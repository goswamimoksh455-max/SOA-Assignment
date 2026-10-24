/**
 * Initial Seed Data for MediCare Healthcare Web Service
 * Provides realistic medical domain data for doctors, appointments, and prescriptions.
 */

const seedDoctors = [
  {
    id: "DOC-101",
    name: "Dr. Ananya Sharma",
    specialization: "Cardiology",
    qualification: "MD, DM (Cardiology) - AIIMS",
    experienceYears: 12,
    consultationFee: 800,
    contact: {
      email: "ananya.sharma@medicare.org",
      phone: "+91-9876543210",
      roomNo: "OPD-204"
    },
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"],
    rating: 4.9,
    isActive: true
  },
  {
    id: "DOC-102",
    name: "Dr. Rajesh Kumar",
    specialization: "Orthopedics",
    qualification: "MS (Ortho), Fellowship in Joint Replacement",
    experienceYears: 15,
    consultationFee: 750,
    contact: {
      email: "rajesh.kumar@medicare.org",
      phone: "+91-9876543211",
      roomNo: "OPD-108"
    },
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["10:00 AM", "11:00 AM", "01:00 PM", "03:30 PM"],
    rating: 4.8,
    isActive: true
  },
  {
    id: "DOC-103",
    name: "Dr. Priya Nair",
    specialization: "Pediatrics",
    qualification: "MD (Pediatrics), DCH",
    experienceYears: 8,
    consultationFee: 600,
    contact: {
      email: "priya.nair@medicare.org",
      phone: "+91-9876543212",
      roomNo: "OPD-302"
    },
    availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    availableSlots: ["09:30 AM", "11:00 AM", "02:30 PM", "05:00 PM"],
    rating: 4.9,
    isActive: true
  },
  {
    id: "DOC-104",
    name: "Dr. Vikram Sethi",
    specialization: "Neurology",
    qualification: "DM (Neurology), MRCP",
    experienceYears: 18,
    consultationFee: 1000,
    contact: {
      email: "vikram.sethi@medicare.org",
      phone: "+91-9876543213",
      roomNo: "OPD-401"
    },
    availableDays: ["Wednesday", "Saturday"],
    availableSlots: ["10:30 AM", "12:00 PM", "03:00 PM"],
    rating: 4.7,
    isActive: true
  }
];

const seedAppointments = [
  {
    id: "APT-2026-001",
    patientName: "Rohan Verma",
    patientAge: 34,
    patientGender: "Male",
    patientPhone: "+91-9988776655",
    patientEmail: "rohan.verma@example.com",
    doctorId: "DOC-101",
    doctorName: "Dr. Ananya Sharma",
    specialization: "Cardiology",
    appointmentDate: "2026-10-20",
    timeSlot: "09:00 AM",
    symptoms: "Mild chest tightness after jogging, shortness of breath",
    urgencyLevel: "HIGH",
    status: "CONFIRMED", // CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED
    consultationFee: 800,
    paymentStatus: "PAID",
    createdAt: "2026-10-15T09:30:00Z",
    updatedAt: "2026-10-15T09:30:00Z"
  },
  {
    id: "APT-2026-002",
    patientName: "Meera Iyer",
    patientAge: 62,
    patientGender: "Female",
    patientPhone: "+91-9811223344",
    patientEmail: "meera.iyer@example.com",
    doctorId: "DOC-102",
    doctorName: "Dr. Rajesh Kumar",
    specialization: "Orthopedics",
    appointmentDate: "2026-10-21",
    timeSlot: "10:00 AM",
    symptoms: "Chronic knee joint stiffness in morning",
    urgencyLevel: "NORMAL",
    status: "COMPLETED",
    consultationFee: 750,
    paymentStatus: "PAID",
    createdAt: "2026-10-14T11:15:00Z",
    updatedAt: "2026-10-17T10:45:00Z"
  }
];

const seedPrescriptions = [
  {
    id: "RX-501",
    appointmentId: "APT-2026-002",
    doctorId: "DOC-102",
    doctorName: "Dr. Rajesh Kumar",
    patientName: "Meera Iyer",
    patientAge: 62,
    diagnosis: "Bilateral Osteoarthritis (Grade 2)",
    vitalSigns: {
      bloodPressure: "130/85 mmHg",
      pulseRate: "74 bpm",
      weightKg: 68
    },
    medicines: [
      {
        name: "Glucosamine Sulphate",
        dosage: "500 mg",
        frequency: "Once daily after breakfast",
        durationDays: 30
      },
      {
        name: "Aceclofenac + Paracetamol",
        dosage: "100mg / 325mg",
        frequency: "SOS (when pain is severe, after food)",
        durationDays: 5
      }
    ],
    lifestyleAdvice: "Low-impact quadriceps strengthening physiotherapy, avoid squatting.",
    followUpDate: "2026-11-20",
    issuedAt: "2026-10-17T10:45:00Z"
  }
];

const seedPatients = [
  {
    id: "PAT-001",
    name: "Rohan Verma",
    phone: "+91-9988776655",
    email: "rohan.verma@example.com",
    age: 34,
    gender: "Male",
    bloodGroup: "B+",
    emergencyContact: "+91-9988776600",
    allergies: ["Penicillin", "Dust Mites"],
    chronicConditions: ["Hypertension (Borderline)"],
    registeredAt: "2026-01-10T08:30:00Z"
  },
  {
    id: "PAT-002",
    name: "Meera Iyer",
    phone: "+91-9811223344",
    email: "meera.iyer@example.com",
    age: 62,
    gender: "Female",
    bloodGroup: "O+",
    emergencyContact: "+91-9811223300",
    allergies: ["Sulfa Drugs"],
    chronicConditions: ["Osteoarthritis", "Type 2 Diabetes"],
    registeredAt: "2026-02-15T10:00:00Z"
  },
  {
    id: "PAT-003",
    name: "Arjun Mehta",
    phone: "+91-9876500112",
    email: "arjun.m@example.com",
    age: 29,
    gender: "Male",
    bloodGroup: "A+",
    emergencyContact: "+91-9876500199",
    allergies: ["None"],
    chronicConditions: ["Sinus Tachycardia"],
    registeredAt: "2026-03-01T14:20:00Z"
  }
];

const seedLabCatalog = [
  {
    code: "LAB-CBC",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    turnaroundHours: 4,
    price: 350,
    specimen: "Whole Blood (EDTA)",
    normalRange: "WBC: 4.5-11.0 x10^3/uL, Hb: 13.5-17.5 g/dL, Platelets: 150-450 x10^3/uL"
  },
  {
    code: "LAB-LIPID",
    name: "Lipid Profile Panel",
    category: "Biochemistry",
    turnaroundHours: 6,
    price: 700,
    specimen: "Serum (Fasting 12h)",
    normalRange: "Cholesterol: <200 mg/dL, Triglycerides: <150 mg/dL, HDL: >40 mg/dL, LDL: <100 mg/dL"
  },
  {
    code: "LAB-HBA1C",
    name: "Glycated Hemoglobin (HbA1c)",
    category: "Endocrinology",
    turnaroundHours: 3,
    price: 500,
    specimen: "Whole Blood (EDTA)",
    normalRange: "Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: >=6.5%"
  },
  {
    code: "LAB-ECG",
    name: "12-Lead Electrocardiogram (ECG)",
    category: "Cardiology Diagnostic",
    turnaroundHours: 1,
    price: 400,
    specimen: "Non-Invasive Surface Electrodes",
    normalRange: "Normal sinus rhythm, HR 60-100 bpm, Normal axis"
  },
  {
    code: "LAB-XRAY",
    name: "Digital X-Ray Bilateral Knees (AP & Lateral)",
    category: "Radiology",
    turnaroundHours: 2,
    price: 900,
    specimen: "Radiological Imaging",
    normalRange: "Preserved joint spaces, no osteophytes, no cortical erosion"
  }
];

const seedLabTests = [
  {
    id: "TEST-2026-701",
    patientName: "Rohan Verma",
    patientPhone: "+91-9988776655",
    appointmentId: "APT-2026-001",
    doctorName: "Dr. Ananya Sharma",
    testCode: "LAB-ECG",
    testName: "12-Lead Electrocardiogram (ECG)",
    urgency: "HIGH",
    status: "COMPLETED",
    specimenRequired: "Non-Invasive Surface Electrodes",
    specimenCollectedAt: "2026-10-20T09:30:00Z",
    resultData: {
      findings: "Sinus tachycardia at 104 bpm. No acute ST-elevation or ischemic changes.",
      interpretation: "ABNORMAL",
      technicianRemarks: "Reviewed by Cardiologist Dr. Ananya Sharma.",
      verifiedAt: "2026-10-20T10:15:00Z"
    },
    createdAt: "2026-10-20T09:15:00Z"
  },
  {
    id: "TEST-2026-702",
    patientName: "Meera Iyer",
    patientPhone: "+91-9811223344",
    appointmentId: "APT-2026-002",
    doctorName: "Dr. Rajesh Kumar",
    testCode: "LAB-XRAY",
    testName: "Digital X-Ray Bilateral Knees (AP & Lateral)",
    urgency: "NORMAL",
    status: "COMPLETED",
    specimenRequired: "Radiological Imaging",
    specimenCollectedAt: "2026-10-21T10:30:00Z",
    resultData: {
      findings: "Medial joint space narrowing bilaterally with subchondral sclerosis.",
      interpretation: "ABNORMAL",
      technicianRemarks: "Consistent with Grade 2 osteoarthritis.",
      verifiedAt: "2026-10-21T11:45:00Z"
    },
    createdAt: "2026-10-21T10:15:00Z"
  }
];

module.exports = {
  seedDoctors,
  seedAppointments,
  seedPrescriptions,
  seedPatients,
  seedLabCatalog,
  seedLabTests
};
