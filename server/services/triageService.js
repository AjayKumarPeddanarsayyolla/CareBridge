/**
 * Clinical Triage & Safety Service
 * 
 * Assesses input symptoms and main problem to determine triage urgency:
 * - EMERGENCY_CARE
 * - URGENT_CONSULTATION
 * - ROUTINE_CONSULTATION
 * 
 * ALWAYS includes safety disclaimers and flags red flags prominently.
 */

const EMERGENCY_RED_FLAGS = [
  {
    trigger: 'chest pain',
    detail: 'Severe or crushing chest pain radiating to left arm, neck, or jaw'
  },
  {
    trigger: 'difficulty breathing',
    detail: 'Severe shortness of breath, gasping, or inability to speak in sentences'
  },
  {
    trigger: 'unconscious',
    detail: 'Loss of consciousness, fainting with delayed recovery, or unresponsiveness'
  },
  {
    trigger: 'stroke',
    detail: 'Sudden facial droop, arm weakness, or slurred/incomprehensible speech'
  },
  {
    trigger: 'bleeding',
    detail: 'Uncontrolled heavy bleeding that does not stop after 10 minutes of direct pressure'
  },
  {
    trigger: 'seizure',
    detail: 'Active seizure or first-time seizure occurrence'
  },
  {
    trigger: 'anaphylaxis',
    detail: 'Sudden swelling of lips, tongue, or throat with difficulty swallowing or breathing'
  },
  {
    trigger: 'head trauma',
    detail: 'High-impact head injury followed by vomiting, disorientation, or unequal pupils'
  }
];

const URGENT_INDICATORS = [
  'high fever above 103',
  'persistent vomiting',
  'severe abdominal pain',
  'deep laceration',
  'suspected bone fracture',
  'sudden vision changes',
  'severe migraine',
  'spreading rash'
];

export const evaluateTriage = ({
  mainProblem = '',
  symptoms = [],
  severity = 'MODERATE',
  age = 30
}) => {
  const combined = `${mainProblem} ${symptoms.map((s) => s.name || s).join(' ')}`.toLowerCase();

  const warningSignsDetected = [];
  let isEmergency = severity === 'EMERGENCY';

  // Check emergency red flags
  for (const flag of EMERGENCY_RED_FLAGS) {
    if (combined.includes(flag.trigger)) {
      isEmergency = true;
      warningSignsDetected.push(flag.detail);
    }
  }

  // Check urgent indicators
  let isUrgent = severity === 'SEVERE';
  for (const indicator of URGENT_INDICATORS) {
    if (combined.includes(indicator)) {
      isUrgent = true;
      warningSignsDetected.push(`Urgent clinical attention needed: ${indicator}`);
    }
  }

  let recommendedCareLevel = 'ROUTINE_CONSULTATION';
  let firstAidAdviceSummary = '';

  if (isEmergency) {
    recommendedCareLevel = 'EMERGENCY_CARE';
    firstAidAdviceSummary =
      'Immediate Emergency Evaluation Needed: Do not wait for an online response. Call your regional emergency medical service immediately (dial 112 for Pan-India ERSS or 108 for Ambulance) or proceed to the nearest emergency department.';
  } else if (isUrgent) {
    recommendedCareLevel = 'URGENT_CONSULTATION';
    firstAidAdviceSummary =
      'Urgent Medical Attention Advised: Schedule an expedited consultation within 12–24 hours or visit an urgent care facility if symptoms worsen.';
  } else {
    recommendedCareLevel = 'ROUTINE_CONSULTATION';
    firstAidAdviceSummary =
      'Standard Clinical Support: Rest, stay hydrated, monitor symptoms, and proceed with a scheduled consultation for clinical guidance.';
  }

  return {
    recommendedCareLevel,
    isEmergency,
    warningSignsDetected: Array.from(new Set(warningSignsDetected)),
    firstAidAdviceSummary,
    disclaimer:
      'CareBridge provides general supportive health guidance and triage navigation based on reported symptoms. It does not provide definitive medical diagnoses. If you experience worsening or emergency symptoms, contact local emergency services immediately.'
  };
};
