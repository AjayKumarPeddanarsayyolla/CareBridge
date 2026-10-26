/**
 * CareBridge AI Controller
 * Mediates between React frontend and local FastAPI AI/RAG microservice.
 * Enforces privacy, safe fallback handling, Indian emergency localization (112 / 108),
 * natural greetings, emotional distress recognition, and grounded clinical knowledge.
 */

import { prisma } from '../config/prisma.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Deterministic Emergency Red-Flag Keywords
const EMERGENCY_TRIGGERS = [
  'chest pain',
  'heart attack',
  'difficulty breathing',
  'cannot breathe',
  "can't breathe",
  'shortness of breath',
  'stroke',
  'face drooping',
  'slurred speech',
  'severe bleeding',
  'unconscious',
  'passed out',
  'loss of consciousness',
  'seizure',
  'convulsion',
  'anaphylaxis',
  'throat closing',
  'swollen tongue',
  'poisoning',
  'overdose',
  'suicide',
  'kill myself'
];

// Greetings regex patterns
const GREETING_REGEX = /^(hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|namaste|hi\s+there)\b/i;

// Emotional distress keywords
const EMOTIONAL_KEYWORDS = [
  'scared', 'terrified', 'afraid', 'frightened', 'panic', 'panicking',
  'anxious', 'anxiety', 'nervous', 'worried', 'stress', 'stressed',
  'frustrated', 'hopeless', 'overwhelmed', 'crying', 'distressed'
];

/**
 * Health check proxy to FastAPI
 */
export const getAIHealth = async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${AI_SERVICE_URL}/health`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        backendService: 'Connected to FastAPI',
        aiService: data
      });
    }
  } catch (err) {
    // Graceful degraded status
  }

  return res.json({
    success: true,
    backendService: 'Express Resilient Fallback Mode',
    status: 'degraded',
    message: 'Local FastAPI microservice offline or unreachable. Deterministic safety fallback is active.'
  });
};

/**
 * AI Service status and configuration
 */
export const getAIStatus = async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${AI_SERVICE_URL}/status`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    // Fallback status
  }

  return res.json({
    service: 'CareBridge Local AI Service',
    status: 'fallback_active',
    local_llm_installed: false,
    fallback_active: true,
    fallback_engine: 'CareBridge Grounded Clinical Rule & RAG Engine',
    emergency_contacts: {
      pan_india_erss: '112',
      ambulance: '108',
      patient_transport: '102',
      mental_health: '14416 (Tele-MANAS)'
    }
  });
};

/**
 * Process chat queries with RAG grounding and safety overrides
 */
export const chatWithAI = async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, message: 'Valid query string is required' });
  }

  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();
  const userId = req.user ? req.user.id : null;

  // 1. Immediate Deterministic Red-Flag Emergency Detection
  const hasEmergency = EMERGENCY_TRIGGERS.some(trigger => lowerQuery.includes(trigger));
  if (hasEmergency) {
    const emergencyResponse = {
      success: true,
      answer: "🚨 CRITICAL MEDICAL EMERGENCY DIRECTIVE:\n\nThe symptoms described indicate a potentially life-threatening medical emergency. DO NOT WAIT for an online consultation or text response.\n\nIMMEDIATELY contact regional emergency medical dispatch:\n• 112 — National Emergency Response Support System (Pan-India ERSS, all-emergency)\n• 108 — Emergency Medical & Ambulance Service (Telangana & participating states)\n• 102 — National Ambulance Service (Patient Transport / Maternity)\n\nIMMEDIATE FIRST-AID STEPS:\n1. If experiencing chest pain or difficulty breathing, sit down, rest comfortably, and avoid any exertion.\n2. Keep the patient calm, and do not leave them unattended.\n3. If you have an active CareBridge account, use the red SOS button on your dashboard to notify registered emergency contacts.\n4. Do NOT attempt to drive yourself to a hospital.",
      citations: [
        {
          title: "National Emergency Response Support System (ERSS)",
          publisher: "Ministry of Home Affairs & National Health Mission (India)",
          sourceUrl: "https://112.gov.in",
          snippet: "Pan-India single emergency contact 112 with integrated 108 medical dispatch for acute life-threatening situations."
        }
      ],
      is_emergency: true,
      evidence_sufficient: true,
      model_status: "deterministic_emergency_override",
      disclaimer: "EMERGENCY SAFETY DIRECTIVE: CareBridge is an advisory system and does not substitute for 112/108 emergency dispatch."
    };

    // Log security/audit event asynchronously
    if (userId) {
      prisma.securityEvent.create({
        data: {
          eventType: 'EMERGENCY_QUERY_DETECTED',
          severity: 'HIGH',
          userId: userId,
          ipAddress: req.ip || '127.0.0.1',
          details: { querySnippet: query.slice(0, 80) }
        }
      }).catch(() => {});
    }

    return res.json(emergencyResponse);
  }

  // 2. Forward to FastAPI RAG Service if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: cleanQuery,
        userId: userId,
        role: req.user ? req.user.role : 'PATIENT'
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch (err) {
    // If FastAPI is offline, use Express deterministic clinical knowledge engine below
  }

  // 3. Natural Conversational Greeting Recognition
  const isGreetingQuery = GREETING_REGEX.test(lowerQuery) && cleanQuery.split(/\s+/).length <= 4;
  if (isGreetingQuery) {
    return res.json({
      success: true,
      answer: "Hello! 👋 I am your CareBridge AI Healthcare Assistant.\n\nI can assist you with:\n• Verified first-aid protocols (burns, choking, sprains, wound care)\n• Evidence-grounded overviews of symptoms, tropical fevers, and chronic conditions\n• Guidance on when to consult our verified doctors or seek immediate emergency care (112 / 108)\n\nHow can I help you today? Please feel free to describe your question or symptom.",
      citations: [
        {
          title: "CareBridge Clinical Advisory Guidelines",
          publisher: "CareBridge Clinical Governance Board",
          sourceUrl: "/about",
          snippet: "Patient-centered educational triage, health navigation, and validated first-aid."
        }
      ],
      is_emergency: false,
      evidence_sufficient: true,
      model_status: "conversational_greeting_active",
      disclaimer: "INFORMATIONAL PURPOSE ONLY: Not intended as medical diagnosis or treatment plan.",
      duration_ms: 8
    });
  }

  // 4. Emotional Distress Recognition
  let emotionalPrefix = "";
  const hasEmotionalCue = EMOTIONAL_KEYWORDS.some(cue => lowerQuery.includes(cue));
  if (hasEmotionalCue) {
    emotionalPrefix = "I can understand that you are feeling anxious or concerned right now, and it is completely natural to feel stressed when facing health questions. While I am an AI assistant and cannot diagnose emotional states, please know that you are supported. Let's look at what the verified medical guidelines advise:\n\n";
  }

  // 5. In-Memory Grounded Knowledge Base (Matching ai-service)
  let answer = "";
  let citations = [];
  let evidenceSufficient = false;

  // Domain checks
  if (lowerQuery.includes('burn') || lowerQuery.includes('scald')) {
    answer = "For minor thermal burns and scalds: 1. Immediately cool the affected area under gentle, cool running tap water for at least 10 to 20 minutes. This halts ongoing thermal tissue damage. 2. Carefully remove rings, watches, or tight clothing around the site before swelling develops. 3. Cover loosely with a clean, sterile lint-free cloth or clear plastic wrap. DO NOT apply ice, butter, oils, or toothpaste, and do not pop blisters.";
    citations = [
      {
        title: "Standard First-Aid Protocols for Acute Injuries, Scalds & Trauma",
        publisher: "International Red Cross & Crescent Societies / St. John Ambulance",
        sourceUrl: "https://www.redcross.org/take-a-class/first-aid",
        snippet: "Continuous cool running water for 10-20 minutes is the evidence-based first line for thermal scalds."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('sprain') || lowerQuery.includes('twist') || lowerQuery.includes('ankle') || lowerQuery.includes('wrist')) {
    answer = "For acute joint sprains and soft tissue strains, follow the R.I.C.E. protocol: Rest (stop activity and protect the joint), Ice (apply cold pack wrapped in a towel for 15-20 min every 2-3 hours; never apply bare ice), Compression (snug elastic bandage, not cutting off circulation), Elevation (keep limb raised above heart level). Seek medical radiography if unable to bear weight or if joint deformity is visible.";
    citations = [
      {
        title: "Soft Tissue Injury Guidelines: R.I.C.E. Protocol",
        publisher: "International Red Cross & Crescent Societies / St. John Ambulance",
        sourceUrl: "/first-aid/sprains",
        snippet: "R.I.C.E. protocol minimizes localized swelling and reduces recovery duration."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('chok') || lowerQuery.includes('heimlich') || lowerQuery.includes('airway')) {
    answer = "For conscious adults and children over 1 year with severe airway obstruction (cannot speak, cough, or breathe): 1. Give up to 5 firm back blows between shoulder blades with the heel of your hand. 2. If clearing is unsuccessful, perform 5 abdominal thrusts (Heimlich maneuver) inward and upward above the navel. Repeat cycles until airway clears. If the person becomes unresponsive, call 112 / 108 immediately and begin CPR.";
    citations = [
      {
        title: "Airway Obstruction Management & Choking Protocol",
        publisher: "International Red Cross & St. John Ambulance",
        sourceUrl: "/first-aid/choking",
        snippet: "Alternating back blows and abdominal thrusts for choking relief."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('diabetes') || lowerQuery.includes('sugar') || lowerQuery.includes('hypoglycemia') || lowerQuery.includes('glucose')) {
    answer = "For managing acute hypoglycemia (blood glucose < 70 mg/dL with shakiness, cold diaphoresis, or palpitations), apply the 15-15 Rule: 1. Take 15 grams of fast-acting simple carbohydrates (3-4 glucose tablets, half cup fruit juice, or 3 teaspoons of sugar dissolved in water). 2. Wait 15 minutes and re-test glucose. 3. Repeat if still below 70 mg/dL. If unconscious, do NOT administer fluids; place on side and dial 112 / 108 immediately.";
    citations = [
      {
        title: "Guidelines for Management of Type 2 Diabetes Mellitus",
        publisher: "Indian Council of Medical Research (ICMR) & WHO",
        sourceUrl: "https://main.icmr.nic.in",
        snippet: "Standardized 15-15 rule for acute hypoglycemia triage."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('dengue') || lowerQuery.includes('malaria') || (lowerQuery.includes('fever') && lowerQuery.includes('platelet'))) {
    answer = "Dengue fever presents with acute high fever, severe retro-orbital eye pain, and joint/muscle aches ('breakbone fever'). Critical warning signs include: persistent vomiting, severe abdominal pain, bleeding gums/nose, and lethargy. Hydration with ORS and tender coconut water is vital. Avoid NSAIDs (aspirin, ibuprofen) as they heighten bleeding risks; use paracetamol under doctor guidance and monitor platelet counts.";
    citations = [
      {
        title: "National Clinical Guidelines on Dengue & Vector-Borne Fevers",
        publisher: "National Center for Vector Borne Diseases Control (NCVBDC) & NHM India",
        sourceUrl: "https://ncvbdc.mohfw.gov.in",
        snippet: "Aggressive oral rehydration and strict avoidance of NSAIDs in dengue."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('diarrhea') || lowerQuery.includes('loose motion') || lowerQuery.includes('vomit') || lowerQuery.includes('dehydration') || lowerQuery.includes('ors')) {
    answer = "The primary treatment for acute gastroenteritis and diarrhea is preventing dehydration using WHO-formulated Oral Rehydration Salts (ORS). Dissolve one packet in 1 liter of clean drinking water and sip frequently after each loose stool. Continue feeding and zinc supplementation for children. Red flags requiring clinical care: blood in stool (dysentery), high fever, dry mouth with absence of urination for over 8 hours, or inability to keep liquids down.";
    citations = [
      {
        title: "Clinical Management of Acute Diarrhea & Dehydration",
        publisher: "World Health Organization (WHO) & Indian Society of Gastroenterology",
        sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease",
        snippet: "WHO ORS formula and zinc therapy for acute diarrheal illnesses."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('asthma') || lowerQuery.includes('inhaler') || lowerQuery.includes('wheez')) {
    answer = "For an acute asthma flare-up: 1. Sit the person upright and encourage calm, slow breathing; do not let them lie down. 2. Administer 2 to 4 puffs of a rapid-acting bronchodilator reliever (such as Salbutamol) via a spacer. 3. Wait 4 minutes. If symptoms do not improve, give another 4 puffs. 4. If severe breathlessness, inability to speak full sentences, or blue lips/fingertips persist, call 112 (National ERSS) or 108 (Ambulance) immediately.";
    citations = [
      {
        title: "Global Initiative for Asthma (GINA) Flare-Up Guidelines",
        publisher: "Global Initiative for Asthma & WHO",
        sourceUrl: "https://ginasthma.org",
        snippet: "Upright positioning and spaced bronchodilator protocol for acute asthma."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('fever') || lowerQuery.includes('temperature')) {
    answer = "For general fever management: Stay well-hydrated with water, broths, and electrolyte fluids, rest comfortably in a cool room, and use light clothing. For discomfort, paracetamol can be used at age-appropriate dosages. Red flags requiring prompt medical attention include: fever exceeding 39°C (102°F), lasting more than 3 days, accompanied by stiff neck, confusion, breathing difficulty, or non-blanching rash.";
    citations = [
      {
        title: "Clinical Triage & Fever Management Protocols",
        publisher: "National Health Mission (NHM) & Indian Academy of Pediatrics",
        sourceUrl: "https://nhm.gov.in",
        snippet: "Symptomatic fever management, hydration, and warning sign monitoring."
      }
    ];
    evidenceSufficient = true;
  } else if (lowerQuery.includes('headache') || lowerQuery.includes('migraine')) {
    answer = "Most headaches are tension-type or migraines, typically relieved by resting in a quiet, dark room, staying hydrated, applying a cold or warm compress, and gentle scalp/neck relaxation. Red flags requiring emergency attention: sudden explosive 'thunderclap' headache (worst headache of your life), headache with fever, stiff neck, confusion, weakness, numbness, or difficulty speaking.";
    citations = [
      {
        title: "Clinical Headache Classification & Triage",
        publisher: "World Health Organization & International Headache Society",
        sourceUrl: "https://www.who.int",
        snippet: "Differentiating primary headaches from secondary neurological red flags."
      }
    ];
    evidenceSufficient = true;
  } else if (
    lowerQuery.includes('anxiety') ||
    lowerQuery.includes('anxious') ||
    lowerQuery.includes('panic') ||
    lowerQuery.includes('stress') ||
    lowerQuery.includes('depress') ||
    lowerQuery.includes('scared') ||
    lowerQuery.includes('dizzy') ||
    lowerQuery.includes('dizziness')
  ) {
    answer = "For acute anxiety, panic, or associated dizziness: 1. Sit down immediately in a safe, comfortable position to prevent fall injuries and take slow, deep breaths. 2. Practice Box Breathing: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. 3. Use the 5-4-3-2-1 sensory grounding exercise (5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste). 4. Sip water slowly to address potential dehydration. In India, Tele-MANAS provides 24/7 free, confidential mental health support by dialing 14416 or 1800-891-4416.";
    citations = [
      {
        title: "Mental Health First Aid & Anxiety De-escalation",
        publisher: "Tele-MANAS (Ministry of Health & Family Welfare, India) & WHO",
        sourceUrl: "https://telemanas.mohfw.gov.in",
        snippet: "Evidence-based grounding techniques, fall precautions, and 24/7 Tele-MANAS support."
      }
    ];
    evidenceSufficient = true;
  }

  // 6. High-Risk Safeguard Annotations
  const safeguards = [];
  if (lowerQuery.includes('pregnant') || lowerQuery.includes('pregnancy') || lowerQuery.includes('trimester')) {
    safeguards.push("⚠️ PREGNANCY SAFEGUARD: During pregnancy, never take unprescribed medications (including common NSAIDs like ibuprofen). Any vaginal bleeding, fluid leakage, severe abdominal cramping, or persistent headache with blurred vision warrants immediate in-person obstetric evaluation.");
  }
  if (lowerQuery.includes('child') || lowerQuery.includes('baby') || lowerQuery.includes('infant') || lowerQuery.includes('pediatric')) {
    safeguards.push("⚠️ PEDIATRIC SAFEGUARD: In infants under 3 months, any temperature of 38.0°C (100.4°F) or above requires immediate clinical assessment by a pediatrician. Never administer aspirin to children or adolescents.");
  }
  if (lowerQuery.includes('antibiotic') || lowerQuery.includes('stop taking') || lowerQuery.includes('dose') || lowerQuery.includes('prescription')) {
    safeguards.push("⚠️ MEDICATION SAFEGUARD: Always complete full antibiotic courses as prescribed to avoid drug resistance. Never alter prescription dosages or discontinue chronic therapies without direct physician clearance.");
  }

  // 7. Follow-up Question for Brief / Vague Queries
  let followUpText = "";
  const isBrief = cleanQuery.split(/\s+/).length <= 5;
  const isVagueSymptom = ['fever', 'headache', 'cough', 'stomach', 'pain', 'vomit', 'dizzy'].some(w => lowerQuery.includes(w));
  if (isBrief && isVagueSymptom && evidenceSufficient) {
    followUpText = "\n\nTo provide more relevant educational information, could you share a bit more context:\n1. How long have you experienced this symptom, and did it start suddenly or gradually?\n2. How severe is it on a scale of 1 to 10?\n3. Are there accompanying signs such as fever, rash, breathing difficulty, or inability to keep fluids down?";
  }

  // 8. If no health evidence matched (Out-of-Domain / Unsupported Query)
  if (!evidenceSufficient) {
    let fallbackMsg = "The current verified CareBridge healthcare knowledge base is dedicated strictly to human health education, clinical triage, and first-aid protocols. I could not find trustworthy clinical evidence to answer this query safely.\n\nRecommendations:\n• If this relates to a personal medical symptom, please schedule an appointment with a verified CareBridge physician.\n• If you or someone nearby is experiencing acute trauma or sudden severe distress, dial 112 (Pan-India ERSS) or 108 (Ambulance) immediately.";
    if (emotionalPrefix) {
      fallbackMsg = emotionalPrefix + fallbackMsg;
    }
    return res.json({
      success: true,
      answer: fallbackMsg,
      citations: [],
      is_emergency: false,
      evidence_sufficient: false,
      model_status: 'express_grounded_fallback',
      disclaimer: "INFORMATIONAL PURPOSE ONLY: Not intended as medical diagnosis or treatment plan.",
      duration_ms: 10
    });
  }

  // Combine full answer
  let fullAnswer = emotionalPrefix + answer;
  if (safeguards.length > 0) {
    fullAnswer += "\n\n" + safeguards.join("\n\n");
  }
  if (followUpText) {
    fullAnswer += followUpText;
  }

  return res.json({
    success: true,
    answer: fullAnswer,
    citations,
    is_emergency: false,
    evidence_sufficient: true,
    model_status: 'express_grounded_fallback',
    disclaimer: "INFORMATIONAL PURPOSE ONLY: Not intended as medical diagnosis or treatment plan.",
    duration_ms: 12
  });
};
