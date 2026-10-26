"""
CareBridge AI Safety Guard — Deterministic Clinical Emergency Detection
Treats user queries and documents as untrusted data; enforces immediate life-safety directives.
"""

import re

EMERGENCY_PATTERNS = [
    r"\b(heart attack|chest pain|chest tightness|crushing chest|crushing pain)\b",
    r"\b(stroke|face drooping|arm weakness|slurred speech)\b",
    r"\b(cannot breathe|can't breathe|severe shortness of breath|gasping|choking|airway obstruction)\b",
    r"\b(unconscious|passed out|fainted and not waking|loss of consciousness|seizure|convulsion)\b",
    r"\b(severe bleeding|uncontrolled bleeding|coughing up blood|vomiting blood)\b",
    r"\b(anaphylaxis|throat closing|epipen|swollen tongue)\b",
    r"\b(poisoning|overdose|swallowed chemicals|bleach)\b",
    r"\b(suicide|suicidal|kill myself|end my life)\b"
]

def check_emergency_symptoms(query: str):
    """
    Evaluates query against deterministic emergency patterns.
    Returns (is_emergency: bool, emergency_directive: str or None)
    """
    clean_query = query.lower()
    for pattern in EMERGENCY_PATTERNS:
        if re.search(pattern, clean_query):
            return True, (
                "🚨 CRITICAL MEDICAL EMERGENCY DIRECTIVE:\n\n"
                "The symptoms described indicate a potentially life-threatening medical emergency. "
                "Do NOT rely on digital assistance or delay care.\n\n"
                "IMMEDIATE ACTIONS REQUIRED:\n"
                "1. Immediately call regional emergency medical services:\n"
                "   • 112: India's Integrated Emergency Response Support System (ERSS - Pan-India)\n"
                "   • 108: Emergency Ambulance Service (Telangana & participating states)\n"
                "   • 102: National Ambulance Service / Patient Transport (NHM)\n"
                "2. If experiencing chest pain or difficulty breathing, sit down, rest comfortably, and avoid any exertion.\n"
                "3. If you have an active CareBridge account, use the red SOS button on your dashboard to broadcast an alert to registered emergency contacts.\n"
                "4. Do NOT attempt to drive yourself to a hospital."
            )
    return False, None
