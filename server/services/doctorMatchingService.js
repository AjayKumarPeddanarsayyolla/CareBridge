/**
 * Safe rule-based doctor specialization matching service.
 * 
 * IMPORTANT: This matching service solely assists in directing patients
 * to the appropriate clinical discipline. It DOES NOT diagnose specific
 * diseases or make definitive clinical assertions.
 */

const specializationKeywords = {
  Cardiology: [
    'heart', 'chest pain', 'palpitation', 'fluttering', 'pulse', 'blood pressure',
    'hypertension', 'angina', 'shortness of breath on exertion', 'cardiac'
  ],
  Dermatology: [
    'skin', 'rash', 'acne', 'itch', 'itching', 'eczema', 'psoriasis', 'hives',
    'mole', 'blister', 'dermatitis', 'scalp', 'hair fall', 'fungal'
  ],
  Pediatrics: [
    'child', 'baby', 'infant', 'toddler', 'newborn', 'colic', 'immunization',
    'pediatric', 'growth', 'teething'
  ],
  Ophthalmology: [
    'eye', 'vision', 'blurry', 'cornea', 'conjunctivitis', 'pink eye', 'squint',
    'floaters', 'cataract', 'eye pain', 'dry eyes'
  ],
  Orthopedics: [
    'bone', 'joint', 'fracture', 'sprain', 'knee', 'back pain', 'spine', 'shoulder',
    'arthritis', 'ligament', 'swelling joint', 'hip'
  ],
  Psychiatry: [
    'anxiety', 'panic', 'depression', 'insomnia', 'stress', 'mood', 'hallucination',
    'mental', 'trauma', 'bipolar', 'sleep disorder'
  ],
  Dentistry: [
    'tooth', 'teeth', 'gum', 'dental', 'cavity', 'jaw pain', 'bleeding gums',
    'wisdom tooth', 'enamel'
  ],
  'Pulmonology / ENT': [
    'cough', 'throat', 'sinus', 'ear', 'earache', 'tonsil', 'wheezing', 'phlegm',
    'nasal', 'congestion', 'hoarseness'
  ],
  'General Medicine': [
    'fever', 'fatigue', 'headache', 'weakness', 'nausea', 'vomiting', 'diarrhea',
    'stomach', 'abdominal', 'body ache', 'chills', 'dizziness'
  ]
};

export const matchDoctorSpecialization = ({ mainProblem = '', symptoms = [], age = 30 }) => {
  // If patient is under 14 and problem isn't exclusively dental/ortho, give weight to Pediatrics
  if (age < 14) {
    const isDental = DentistryKeywordsMatch(mainProblem, symptoms);
    if (!isDental) {
      return {
        matchedSpecialization: 'Pediatrics',
        matchReason: 'Patient is under 14 years of age with general or pediatric health concerns.'
      };
    }
  }

  const combinedText = `${mainProblem} ${symptoms.map((s) => s.name || s).join(' ')}`.toLowerCase();

  let bestMatch = 'General Medicine';
  let maxScore = 0;

  for (const [specialization, keywords] of Object.entries(specializationKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = specialization;
    }
  }

  return {
    matchedSpecialization: bestMatch,
    matchReason: maxScore > 0
      ? `Identified common indicators corresponding to ${bestMatch}.`
      : 'General symptoms reported; recommended starting evaluation with General Medicine.'
  };
};

const DentistryKeywordsMatch = (mainProblem, symptoms) => {
  const text = `${mainProblem} ${symptoms.map((s) => s.name || s).join(' ')}`.toLowerCase();
  return specializationKeywords.Dentistry.some((kw) => text.includes(kw));
};
