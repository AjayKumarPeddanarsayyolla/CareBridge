import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

async function main() {
  console.log('[Seed] Starting database seeding for CareBridge (PostgreSQL & Prisma)...');

  const forceClean = process.argv.includes('--clean') || process.argv.includes('--force');
  const existingUsersCount = await prisma.user.count();

  if (existingUsersCount > 0 && !forceClean) {
    console.log(`[Seed] Notice: Database already contains ${existingUsersCount} user records.`);
    console.log('[Seed] Preserving existing database records (safety mode active).');
    console.log('[Seed] If you explicitly want to wipe and reseed initial demo data, run:');
    console.log('       node prisma/seed.js --clean');
    return;
  }

  if (forceClean) {
    console.log('[Seed] --clean flag detected. Wiping existing records for fresh demo reset...');
    // Clean all existing tables in reverse dependency order
    await prisma.notificationDelivery.deleteMany();
    await prisma.emergencyAlertRecipient.deleteMany();
    await prisma.emergencyAlert.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.chatConversation.deleteMany();
    await prisma.aIInteraction.deleteMany();
    await prisma.knowledgeChunk.deleteMany();
    await prisma.knowledgeDocument.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.securityEvent.deleteMany();
    await prisma.doctorRating.deleteMany();
    await prisma.consultationNote.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.appointmentStatusHistory.deleteMany();
    await prisma.paymentEvent.deleteMany();
    await prisma.paymentAttempt.deleteMany();
    await prisma.paymentOrder.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.healthCase.deleteMany();
    await prisma.guardianPermission.deleteMany();
    await prisma.guardianRelationship.deleteMany();
    await prisma.guardianInvitation.deleteMany();
    await prisma.emergencyContact.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.doctorAvailability.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.firstAidGuide.deleteMany();
    await prisma.emergencyWarning.deleteMany();
    await prisma.symptom.deleteMany();
    console.log('[Seed] Cleared existing records.');
  }

  // Pre-hash passwords
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const docPass = await bcrypt.hash('Doctor@123', 10);
  const patientPass = await bcrypt.hash('Patient@123', 10);
  const guardianPass = await bcrypt.hash('Family@123', 10);

  // 1. Create Admin
  const adminUser = await prisma.user.create({
    data: {
      fullName: 'CareBridge Administrator',
      email: 'admin@carebridge.com',
      mobile: '+1 (555) 019-2834',
      passwordHash: adminPass,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. Create Doctors
  const drSarahUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Sarah Jenkins, MD',
      email: 'dr.sarah@carebridge.com',
      mobile: '+1 (555) 234-5678',
      passwordHash: docPass,
      role: 'DOCTOR',
      status: 'ACTIVE'
    }
  });

  const drMarcusUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Marcus Chen, MD',
      email: 'dr.marcus@carebridge.com',
      mobile: '+1 (555) 345-6789',
      passwordHash: docPass,
      role: 'DOCTOR',
      status: 'ACTIVE'
    }
  });

  const drEmilyUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Emily Rodriguez, MD',
      email: 'dr.emily@carebridge.com',
      mobile: '+1 (555) 456-7890',
      passwordHash: docPass,
      role: 'DOCTOR',
      status: 'ACTIVE'
    }
  });

  const drAlexUser = await prisma.user.create({
    data: {
      fullName: 'Dr. Alex Vance, MD',
      email: 'dr.alex@carebridge.com',
      mobile: '+1 (555) 567-8901',
      passwordHash: docPass,
      role: 'DOCTOR',
      status: 'PENDING_VERIFICATION'
    }
  });

  // Doctor Profiles
  const drSarahProfile = await prisma.doctorProfile.create({
    data: {
      userId: drSarahUser.id,
      specialization: 'Cardiology',
      qualification: 'MD, FACC - Cardiovascular Diseases',
      experienceYears: 14,
      licenseNumber: 'MD-CARDIO-89412',
      hospitalAffiliation: 'Metropolitan Heart & Vascular Institute',
      consultationFee: 75.0,
      biography:
        'Board-certified cardiologist specializing in preventive cardiology, hypertension management, arrhythmia triage, and cardiovascular wellness counseling.',
      verificationStatus: 'VERIFIED',
      verifiedById: adminUser.id,
      verifiedAt: new Date(),
      averageRating: 4.9,
      totalRatings: 18,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      availableHoursStart: '09:00',
      availableHoursEnd: '16:00',
      consultationModes: ['CHAT', 'VIDEO_LINK', 'IN_PERSON_OFFLINE']
    }
  });

  const drMarcusProfile = await prisma.doctorProfile.create({
    data: {
      userId: drMarcusUser.id,
      specialization: 'Dermatology',
      qualification: 'MD, FAAD - Clinical & Aesthetic Dermatology',
      experienceYears: 10,
      licenseNumber: 'MD-DERM-44219',
      hospitalAffiliation: 'St. Jude Dermatology Center',
      consultationFee: 65.0,
      biography:
        'Specialist in dermatological conditions, eczema, inflammatory rashes, acute skin allergies, and benign lesion triage.',
      verificationStatus: 'VERIFIED',
      verifiedById: adminUser.id,
      verifiedAt: new Date(),
      averageRating: 4.8,
      totalRatings: 14,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableHoursStart: '10:00',
      availableHoursEnd: '18:00',
      consultationModes: ['CHAT', 'VIDEO_LINK']
    }
  });

  const drEmilyProfile = await prisma.doctorProfile.create({
    data: {
      userId: drEmilyUser.id,
      specialization: 'General Medicine',
      qualification: 'MD, General Practitioner & Family Health',
      experienceYears: 8,
      licenseNumber: 'MD-GEN-99014',
      hospitalAffiliation: 'CareBridge Community Medical Center',
      consultationFee: 50.0,
      biography:
        'Dedicated to primary triage, pediatric common ailments, acute viral illness guidance, and family preventative medicine.',
      verificationStatus: 'VERIFIED',
      verifiedById: adminUser.id,
      verifiedAt: new Date(),
      averageRating: 5.0,
      totalRatings: 22,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableHoursStart: '08:30',
      availableHoursEnd: '17:00',
      consultationModes: ['CHAT', 'VIDEO_LINK', 'IN_PERSON_OFFLINE']
    }
  });

  await prisma.doctorProfile.create({
    data: {
      userId: drAlexUser.id,
      specialization: 'Pediatrics',
      qualification: 'MD, Board Certified Pediatrician',
      experienceYears: 5,
      licenseNumber: 'MD-PED-55120',
      hospitalAffiliation: 'Children Hope Regional Clinic',
      consultationFee: 60.0,
      biography: 'Pediatric care specialist reviewing newborn development, infant nutrition, and childhood infections.',
      verificationStatus: 'PENDING',
      availableDays: ['Tuesday', 'Thursday', 'Saturday']
    }
  });

  // Doctor Availability slots
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: drSarahProfile.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '16:00',
        slotDurationMin: 30
      }
    });
    await prisma.doctorAvailability.create({
      data: {
        doctorId: drMarcusProfile.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00',
        slotDurationMin: 30
      }
    });
    await prisma.doctorAvailability.create({
      data: {
        doctorId: drEmilyProfile.id,
        dayOfWeek: day,
        startTime: '08:30',
        endTime: '17:00',
        slotDurationMin: 30
      }
    });
  }

  // 3. Create Patients
  const patientJohn = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      email: 'john.doe@carebridge.com',
      mobile: '+1 (555) 678-1234',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE'
    }
  });

  const patientSarah = await prisma.user.create({
    data: {
      fullName: 'Sarah Smith',
      email: 'sarah.smith@carebridge.com',
      mobile: '+1 (555) 789-2345',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE'
    }
  });

  const patientRobert = await prisma.user.create({
    data: {
      fullName: 'Robert Johnson',
      email: 'robert.j@carebridge.com',
      mobile: '+1 (555) 890-3456',
      passwordHash: patientPass,
      role: 'PATIENT',
      status: 'ACTIVE'
    }
  });

  // Patient Profiles
  const johnProfile = await prisma.patientProfile.create({
    data: {
      userId: patientJohn.id,
      dateOfBirth: new Date('1985-04-12'),
      gender: 'MALE',
      bloodGroup: 'O+',
      allergies: ['Penicillin', 'Peanuts'],
      existingConditions: ['Mild Asthma', 'Hypertension'],
      currentMedications: ['Lisinopril 10mg daily', 'Albuterol inhaler PRN'],
      medicalHistory: 'Appendectomy in 2012. No other major surgeries.',
      profileCompleted: true
    }
  });

  const sarahProfile = await prisma.patientProfile.create({
    data: {
      userId: patientSarah.id,
      dateOfBirth: new Date('1962-11-20'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      allergies: ['Sulfa drugs'],
      existingConditions: ['Type 2 Diabetes', 'Osteoarthritis'],
      currentMedications: ['Metformin 500mg BID'],
      medicalHistory: 'Managed diabetes with diet and oral medications for 8 years.',
      profileCompleted: true
    }
  });

  await prisma.patientProfile.create({
    data: {
      userId: patientRobert.id,
      dateOfBirth: new Date('1994-08-05'),
      gender: 'MALE',
      bloodGroup: 'B+',
      allergies: ['None known'],
      existingConditions: [],
      currentMedications: [],
      medicalHistory: 'No prior surgeries or chronic illnesses.',
      profileCompleted: true
    }
  });

  // Emergency Contacts
  await prisma.emergencyContact.createMany({
    data: [
      {
        patientProfileId: johnProfile.id,
        name: 'Mary Doe',
        relationship: 'Spouse',
        phoneNumber: '+1 (555) 678-9999',
        email: 'mary.doe@carebridge.com',
        isPrimary: true
      },
      {
        patientProfileId: sarahProfile.id,
        name: 'David Smith',
        relationship: 'Son',
        phoneNumber: '+1 (555) 789-8888',
        email: 'david.smith@carebridge.com',
        isPrimary: true
      }
    ]
  });

  // 4. Create Guardians
  const guardianMary = await prisma.user.create({
    data: {
      fullName: 'Mary Doe',
      email: 'mary.doe@carebridge.com',
      mobile: '+1 (555) 678-9999',
      passwordHash: guardianPass,
      role: 'GUARDIAN',
      status: 'ACTIVE'
    }
  });

  const guardianDavid = await prisma.user.create({
    data: {
      fullName: 'David Smith',
      email: 'david.smith@carebridge.com',
      mobile: '+1 (555) 789-8888',
      passwordHash: guardianPass,
      role: 'GUARDIAN',
      status: 'ACTIVE'
    }
  });

  // 5. Guardian Relationships & Permissions
  const johnMaryRel = await prisma.guardianRelationship.create({
    data: {
      patientId: patientJohn.id,
      guardianId: guardianMary.id,
      relationshipType: 'Spouse',
      status: 'ACTIVE',
      approvedAt: new Date()
    }
  });

  await prisma.guardianPermission.create({
    data: {
      relationshipId: johnMaryRel.id,
      canViewAppointments: true,
      canBookAppointments: true,
      canViewMedicalRecords: true,
      canUploadRecords: true,
      canViewPrescriptions: true,
      canReceiveSOSAlerts: true,
      viewMedicalHistory: true,
      viewCases: true,
      viewAppointments: true,
      participateChat: true,
      submitConcerns: true
    }
  });

  const sarahDavidRel = await prisma.guardianRelationship.create({
    data: {
      patientId: patientSarah.id,
      guardianId: guardianDavid.id,
      relationshipType: 'Child',
      status: 'ACTIVE',
      approvedAt: new Date()
    }
  });

  await prisma.guardianPermission.create({
    data: {
      relationshipId: sarahDavidRel.id,
      canViewAppointments: true,
      canBookAppointments: false,
      canViewMedicalRecords: true,
      canUploadRecords: false,
      canViewPrescriptions: true,
      canReceiveSOSAlerts: true,
      viewMedicalHistory: true,
      viewCases: true,
      viewAppointments: true,
      participateChat: true,
      submitConcerns: true
    }
  });

  // Sample Guardian Invitation (Pending for demonstration)
  const tomorrowExp = new Date();
  tomorrowExp.setDate(tomorrowExp.getDate() + 2);
  await prisma.guardianInvitation.create({
    data: {
      patientId: patientRobert.id,
      guardianEmail: 'elena.johnson@example.com',
      relationshipType: 'Sister',
      invitationToken: 'inv_demo_token_robert_sister_2026',
      expiresAt: tomorrowExp,
      status: 'PENDING'
    }
  });

  // 6. Clinical Health Cases
  const case1 = await prisma.healthCase.create({
    data: {
      caseNumber: 'CB-104921-7821',
      patientId: patientJohn.id,
      submittedById: patientJohn.id,
      mainProblem: 'Recurrent heart palpitations and mild chest tightness after evening walks',
      symptoms: [
        { name: 'Palpitations', startedAt: '3 days ago', severity: 'MODERATE' },
        { name: 'Mild chest tightness', startedAt: 'Yesterday', severity: 'MILD' },
        { name: 'Fatigue', startedAt: '1 week ago', severity: 'MILD' }
      ],
      severity: 'MODERATE',
      ageAtSubmission: 39,
      medicalHistorySummary: 'Hypertension controlled with Lisinopril.',
      currentMedications: ['Lisinopril 10mg'],
      allergies: ['Penicillin'],
      additionalInfo: 'Occurs primarily in the late evening. Resting slows down heart rate.',
      matchedSpecialization: 'Cardiology',
      recommendedCareLevel: 'ROUTINE_CONSULTATION',
      assignedDoctorId: drSarahUser.id,
      status: 'UNDER_REVIEW'
    }
  });

  const case2 = await prisma.healthCase.create({
    data: {
      caseNumber: 'CB-108392-4412',
      patientId: patientSarah.id,
      submittedById: guardianDavid.id, // submitted by guardian on behalf
      mainProblem: 'Spreading itchy erythematous skin rash on both forearms',
      symptoms: [
        { name: 'Red skin rash', startedAt: '2 days ago', severity: 'MODERATE' },
        { name: 'Intense itching', startedAt: '2 days ago', severity: 'MODERATE' }
      ],
      severity: 'MODERATE',
      ageAtSubmission: 63,
      medicalHistorySummary: 'Type 2 Diabetes.',
      currentMedications: ['Metformin 500mg'],
      allergies: ['Sulfa drugs'],
      additionalInfo: 'Started after gardening. No difficulty breathing or facial swelling noted.',
      matchedSpecialization: 'Dermatology',
      recommendedCareLevel: 'ROUTINE_CONSULTATION',
      assignedDoctorId: drMarcusUser.id,
      status: 'RESOLVED',
      resolutionNotes: 'Advised cool compresses, hypoallergenic skin wash, and routine outpatient follow-up.',
      resolvedAt: new Date()
    }
  });

  // 7. Appointments & Status History
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 4);

  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patientJohn.id,
      doctorId: drSarahUser.id,
      caseId: case1.id,
      date: tomorrow,
      timeSlot: '11:00 - 11:30',
      status: 'CONFIRMED',
      consultationMode: 'CHAT',
      reason: 'Review recurrent evening palpitations and discuss cardiovascular monitoring.',
      notes: 'Please keep blood pressure and resting pulse log ready.'
    }
  });

  await prisma.appointmentStatusHistory.create({
    data: {
      appointmentId: appt1.id,
      status: 'CONFIRMED',
      reason: 'Doctor confirmed slot availability',
      changedById: drSarahUser.id
    }
  });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patientRobert.id,
      doctorId: drEmilyUser.id,
      date: nextWeek,
      timeSlot: '14:00 - 14:30',
      status: 'REQUESTED',
      consultationMode: 'VIDEO_LINK',
      reason: 'Annual health profile review and seasonal allergy prevention advice.'
    }
  });

  await prisma.appointmentStatusHistory.create({
    data: {
      appointmentId: appt2.id,
      status: 'REQUESTED',
      reason: 'Initial booking request submitted by patient',
      changedById: patientRobert.id
    }
  });

  // 8. Consultation Notes & Prescriptions
  await prisma.consultationNote.create({
    data: {
      caseId: case2.id,
      doctorId: drMarcusUser.id,
      summary: 'Evaluation of acute bilateral forearm contact dermatitis post-gardening.',
      symptoms: 'Erythema, pruritus, mild edema. No vesicles or systemic involvement.',
      clinicalNotes: 'Presentation consistent with acute allergic contact dermatitis from plant exposure.',
      advice: 'Apply cool compress 15 min TID. Use gentle non-soap cleansers. Avoid scratching.'
    }
  });

  await prisma.prescription.create({
    data: {
      patientId: patientSarah.id,
      doctorId: drMarcusUser.id,
      diagnosis: 'Acute Contact Dermatitis',
      instructions: 'Apply thin layer to affected skin areas twice daily for 7 days. Do not ingest.',
      medications: [
        {
          name: 'Hydrocortisone 1% Topical Cream',
          dosage: 'Apply BID (twice daily)',
          frequency: 'Morning and Evening',
          duration: '7 days',
          instructions: 'Apply sparingly to affected forearm regions.'
        },
        {
          name: 'Cetirizine Hydrochloride',
          dosage: '10mg',
          frequency: 'Once daily at bedtime',
          duration: '5 days',
          instructions: 'For symptomatic relief of nighttime itching.'
        }
      ]
    }
  });

  // 9. First Aid Guides
  await prisma.firstAidGuide.createMany({
    data: [
      {
        title: 'Thermal & Minor Scald Burn Care',
        slug: 'thermal-minor-scald-burn-care',
        category: 'Burns & Scalds',
        situation: 'First-degree or small second-degree burns caused by hot liquids, steam, or hot surfaces.',
        safeImmediateSteps: [
          'Immediately cool the burn with gentle, cool running water for 10–20 minutes. Do not use ice.',
          'Remove tight items such as rings or jewelry from the affected area before swelling starts.',
          'Cover loosely with a sterile, non-stick dressing or clean, lint-free cloth.',
          'Elevate the burned limb if possible to minimize swelling.'
        ],
        thingsToAvoid: [
          'Do NOT apply ice or ice water directly to burned skin.',
          'Do NOT apply butter, toothpaste, grease, or oil-based ointments.',
          'Do NOT pop, prick, or peel blisters.',
          'Do NOT remove clothing that is stuck to the burn.'
        ],
        warningSigns: [
          'Burn is larger than the palm of the casualty’s hand.',
          'Blistering on the face, hands, feet, joints, or groin.',
          'White, leathery, charred, or blackened skin (third-degree burn).',
          'Signs of infection: increasing redness, pus, or fever.'
        ],
        whenToSeekProfessionalCare: [
          'Any burn on a child under 5 or elderly individual.',
          'Chemical or electrical burns (always require immediate evaluation).',
          'Burn covers multiple body areas or joints.'
        ],
        reviewedByDoctor: 'Dr. Marcus Chen, MD'
      },
      {
        title: 'Choking First Aid (Conscious Adult & Child)',
        slug: 'choking-first-aid-conscious-adult-child',
        category: 'Choking',
        situation: 'Individual has an airway obstruction, clutching their throat, unable to speak or cough forcefully.',
        safeImmediateSteps: [
          'Ask: "Are you choking?" If they can cough forcefully, encourage them to keep coughing.',
          'If they cannot breathe, speak, or cough: Stand slightly behind the person, support their chest, and give up to 5 sharp back blows between the shoulder blades with the heel of your hand.',
          'If back blows fail, give up to 5 abdominal thrusts (Heimlich maneuver): place fist thumb-side against abdomen just above navel and pull inwards and upwards sharply.',
          'Alternate 5 back blows and 5 abdominal thrusts until object clears or person loses consciousness.'
        ],
        thingsToAvoid: [
          'Do NOT perform abdominal thrusts on infants under 1 year (use chest thrusts instead).',
          'Do NOT perform a blind finger sweep into the mouth as it may push the object deeper.',
          'Do NOT slap the back while the person is upright and coughing effectively.'
        ],
        warningSigns: [
          'Lips or fingernails turning blue/gray (cyanosis).',
          'Inability to make sound or breathe.',
          'Loss of consciousness.'
        ],
        whenToSeekProfessionalCare: [
          'Call emergency medical services (112 / 108) immediately as soon as severe choking is observed.',
          'Any person who received abdominal thrusts should still be evaluated at a hospital to rule out internal injury.'
        ],
        reviewedByDoctor: 'Dr. Emily Rodriguez, MD'
      },
      {
        title: 'Sprain & Soft Tissue Strain Management (R.I.C.E.)',
        slug: 'sprain-soft-tissue-strain-management-rice',
        category: 'Sprains & Fractures',
        situation: 'Twisted ankle, wrist sprain, or sudden ligament strain without bone protrusion.',
        safeImmediateSteps: [
          'Rest: Stop activity immediately and protect the injured joint.',
          'Ice: Apply a cold pack wrapped in a cloth for 15–20 minutes every 2–3 hours. Never apply bare ice.',
          'Compression: Wrap lightly with an elastic bandage from distal to proximal, snug but not restricting circulation.',
          'Elevation: Prop the injured limb above heart level whenever resting to reduce edema.'
        ],
        thingsToAvoid: [
          'Do NOT apply direct heat or hot baths in the first 48 hours.',
          'Do NOT walk or bear weight on a joint that cannot support your weight.',
          'Do NOT wrap compression bandages so tightly that fingers or toes become pale or numb.'
        ],
        warningSigns: [
          'Audible "pop" or crack at the moment of injury.',
          'Severe deformity, visible bone irregularity, or joint instability.',
          'Total inability to bear any weight on the foot or hand.'
        ],
        whenToSeekProfessionalCare: [
          'Numbness or tingling sensation beyond the injured joint.',
          'No improvement in swelling or severe pain after 48 hours.',
          'Suspected fracture requiring radiography.'
        ],
        reviewedByDoctor: 'Dr. Sarah Jenkins, MD'
      }
    ]
  });

  // 10. Emergency Warnings
  await prisma.emergencyWarning.createMany({
    data: [
      {
        category: 'Cardiovascular & Chest Emergencies',
        title: 'Suspected Heart Attack & Acute Coronary Syndrome',
        redFlags: [
          'Pressure, tightness, crushing pain, or aching in the center of the chest lasting more than a few minutes.',
          'Pain radiating to the left arm, shoulder, jaw, neck, or back.',
          'Chest discomfort accompanied by cold sweat, extreme shortness of breath, lightheadedness, or nausea.'
        ],
        immediateActions: [
          'Call 112 (Pan-India ERSS) or 108 (Ambulance) immediately.',
          'Have the patient sit down, rest comfortably, and avoid exertion.',
          'Loosen tight clothing around the neck and waist.',
          'If advised by emergency dispatcher and patient is not allergic, an adult aspirin (325mg) may be chewed.'
        ],
        emergencyPhoneNumbers: [
          { label: 'Pan-India Integrated Emergency (ERSS)', number: '112' },
          { label: 'Emergency Ambulance Service (Telangana & Regional)', number: '108' },
          { label: 'National Ambulance Service (NHM Transport)', number: '102' }
        ],
        displayOrder: 1
      },
      {
        category: 'Neurological Emergencies',
        title: 'Stroke & Acute Cerebral Events (F.A.S.T.)',
        redFlags: [
          'Face Drooping: One side of the face droops or is numb when smiling.',
          'Arm Weakness: One arm is weak or drifts downward when raising both arms.',
          'Speech Difficulty: Slurred words, inability to speak, or difficulty comprehending speech.',
          'Time to call emergency: Note the exact time symptoms were first observed.'
        ],
        immediateActions: [
          'Call emergency services (112 / 108) immediately. Clot-busting medical treatments have strict time windows.',
          'Do NOT give the person food, drink, or medications like aspirin (may worsen hemorrhagic stroke).',
          'Keep the patient calm and lying on their side if vomiting occurs.'
        ],
        emergencyPhoneNumbers: [
          { label: 'Pan-India Emergency Response', number: '112' },
          { label: 'Emergency Ambulance Dispatch', number: '108' }
        ],
        displayOrder: 2
      }
    ]
  });

  // 11. Simulated Emergency Alert & Delivery Outbox Record
  const sosAlert = await prisma.emergencyAlert.create({
    data: {
      patientId: patientJohn.id,
      severity: 'CRITICAL',
      status: 'ACKNOWLEDGED',
      latitude: 37.7749,
      longitude: -122.4194,
      address: '742 Evergreen Terrace, Springfield',
      notes: 'Demonstration SOS: Patient activated emergency distress signal.'
    }
  });

  const recipientMary = await prisma.emergencyAlertRecipient.create({
    data: {
      alertId: sosAlert.id,
      recipientId: guardianMary.id,
      recipientName: 'Mary Doe',
      recipientPhone: '+1 (555) 678-9999',
      recipientEmail: 'mary.doe@carebridge.com',
      acknowledged: true,
      acknowledgedAt: new Date()
    }
  });

  await prisma.notificationDelivery.create({
    data: {
      recipientId: recipientMary.id,
      channel: 'SIMULATED_SMS',
      status: 'SIMULATED',
      simulatedAt: new Date()
    }
  });

  // 12. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patientJohn.id,
        type: 'APPOINTMENT_CONFIRMATION',
        title: 'Appointment Confirmed',
        message: 'Your consultation with Dr. Sarah Jenkins is confirmed for tomorrow at 11:00 - 11:30.',
        link: '/patient/appointments'
      },
      {
        userId: drSarahUser.id,
        type: 'CONSULTATION_REQUEST',
        title: 'New Case Assigned',
        message: `Case #${case1.caseNumber} (Cardiology) has been assigned to you.`,
        link: `/doctor/cases/${case1.id}`
      },
      {
        userId: guardianMary.id,
        type: 'EMERGENCY_ALERT',
        title: 'Emergency SOS Alert Acknowledged',
        message: 'You acknowledged John Doe’s SOS alert. Telehealth support dispatched.',
        link: '/patient'
      }
    ]
  });

  // 13. Knowledge Base Documents for Local AI RAG
  const doc1 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Clinical Triage Protocol for Acute Chest Discomfort',
      publisher: 'World Health Organization / ACC Guidelines',
      sourceUrl: 'https://www.who.int/cardiovascular_diseases/guidelines',
      category: 'Cardiology',
      content:
        'Chest discomfort lasting over 15 minutes accompanied by dyspnea, diaphoresis, or radiation to left arm constitutes an emergency requiring immediate 112 / 108 activation. Non-radiating, brief localized chest discomfort triggered by posture or deep inspiration may represent musculoskeletal or pleuritic etiology.'
    }
  });

  await prisma.knowledgeChunk.create({
    data: {
      documentId: doc1.id,
      chunkIndex: 0,
      content:
        'Red flag signs of myocardial infarction include crushing substernal chest pressure, radiation to left shoulder/jaw, diaphoresis, and sudden dyspnea. Patients must not drive themselves to hospital; emergency services should be contacted immediately.'
    }
  });

  const doc2 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Pediatric Fever Management and Red Flag Symptoms',
      publisher: 'American Academy of Pediatrics',
      sourceUrl: 'https://www.healthychildren.org',
      category: 'Pediatrics',
      content:
        'Fever in infants under 3 months (rectal temp >= 100.4F / 38C) requires prompt clinical evaluation. In older children, hydration status, alertness, and work of breathing are critical triage parameters. Red flags include lethargy, stiff neck, petechial rash, and signs of respiratory retractions.'
    }
  });

  await prisma.knowledgeChunk.create({
    data: {
      documentId: doc2.id,
      chunkIndex: 0,
      content:
        'Caregivers must seek emergency evaluation if a febrile child has a non-blanching purple rash, extreme lethargy (unresponsive to waking), or grunting with blue lips.'
    }
  });

  console.log('[Seed] Database successfully populated with comprehensive clinical demo data!');
  console.log('--------------------------------------------------');
  console.log('DEMO ACCOUNTS FOR LOGIN:');
  console.log('Admin:         admin@carebridge.com       / Admin@123');
  console.log('Doctor Sarah:  dr.sarah@carebridge.com    / Doctor@123 (Cardiology - Verified)');
  console.log('Doctor Marcus: dr.marcus@carebridge.com   / Doctor@123 (Dermatology - Verified)');
  console.log('Doctor Emily:  dr.emily@carebridge.com    / Doctor@123 (General Medicine - Verified)');
  console.log('Doctor Alex:   dr.alex@carebridge.com     / Doctor@123 (Pediatrics - Pending Verification)');
  console.log('Patient John:  john.doe@carebridge.com    / Patient@123');
  console.log('Patient Sarah: sarah.smith@carebridge.com / Patient@123');
  console.log('Patient Rob:   robert.j@carebridge.com    / Patient@123');
  console.log('Guardian Mary: mary.doe@carebridge.com    / Family@123 (Guardian to John Doe)');
  console.log('Guardian David:david.smith@carebridge.com / Family@123 (Guardian to Sarah Smith)');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
