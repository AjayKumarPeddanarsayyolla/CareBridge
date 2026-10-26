"""
CareBridge RAG Engine — Semantic Retrieval & Evidence Grounding
Uses approved clinical documentation, calculates similarity, and extracts citations.
Includes greeting recognition, empathetic distress detection, symptom context follow-ups, and clinical safeguards.
"""

import json
import os
import re
import math
from typing import List, Dict, Any, Tuple

GREETING_PATTERNS = [
    r"^(hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|howdy|namaste|hi\s+there)\b",
    r"^(who\s+are\s+you|what\s+can\s+you\s+do|help|what\s+is\s+carebridge)\b"
]

EMOTIONAL_CUES = [
    r"\b(scared|terrified|afraid|frightened|panic|panicking)\b",
    r"\b(anxious|anxiety|nervous|worry|worried|stress|stressed)\b",
    r"\b(frustrated|frustration|hopeless|depressed|overwhelmed|crying|distressed)\b"
]

HIGH_RISK_CONTEXTS = {
    "pregnancy": [r"\b(pregnant|pregnancy|trimester|fetal|baby\s+in\s+womb)\b"],
    "pediatric": [r"\b(infant|baby|newborn|toddler|child|under\s+3\s+months)\b"],
    "medication": [r"\b(stop\s+taking|change\s+dose|dosage|antibiotics|pills|prescribed)\b"],
    "allergy": [r"\b(allergy|allergic|swollen\s+lips|swollen\s+tongue|throat\s+tightness|hives)\b"]
}

VAGUE_SYMPTOM_TRIGGERS = [
    r"\b(fever|headache|cough|stomach\s+pain|stomach\s+ache|nausea|dizziness|tired|fatigue|rash|sore\s+throat)\b"
]

class RAGEngine:
    def __init__(self, knowledge_file_path: str):
        self.knowledge_file_path = knowledge_file_path
        self.documents = []
        self.chunks = []
        self.vocab = {}
        self.chunk_vectors = []
        self.load_and_index()

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9]{3,}\b", text.lower())
        return words

    def load_and_index(self):
        if not os.path.exists(self.knowledge_file_path):
            print(f"[RAG Engine] Warning: Knowledge file not found at {self.knowledge_file_path}")
            return

        with open(self.knowledge_file_path, "r", encoding="utf-8") as f:
            self.documents = json.load(f)

        self.chunks = []
        for doc in self.documents:
            for chunk in doc.get("chunks", []):
                self.chunks.append({
                    "doc_id": doc.get("id"),
                    "title": doc.get("title"),
                    "publisher": doc.get("publisher"),
                    "sourceUrl": doc.get("sourceUrl"),
                    "category": doc.get("category"),
                    "chunk_id": chunk.get("id"),
                    "content": chunk.get("content"),
                    "keywords": chunk.get("keywords", [])
                })

        # Build TF-IDF index
        all_tokens = []
        for c in self.chunks:
            tokens = self._tokenize(c["content"] + " " + " ".join(c["keywords"]))
            all_tokens.append(tokens)

        vocab = {}
        for tokens in all_tokens:
            for t in tokens:
                if t not in vocab:
                    vocab[t] = len(vocab)
        self.vocab = vocab

        N = len(self.chunks)
        idf = {}
        for term, tid in self.vocab.items():
            doc_freq = sum(1 for tokens in all_tokens if term in tokens)
            idf[term] = math.log((N + 1) / (doc_freq + 1)) + 1.0
        self.idf = idf

        self.chunk_vectors = []
        for tokens in all_tokens:
            vec = {}
            total = len(tokens) or 1
            for t in tokens:
                tf = tokens.count(t) / total
                vec[t] = tf * self.idf.get(t, 1.0)
            norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
            self.chunk_vectors.append({t: v / norm for t, v in vec.items()})

        print(f"[RAG Engine] Successfully indexed {len(self.chunks)} chunks across {len(self.documents)} approved documents.")

    def is_greeting(self, query: str) -> bool:
        clean = query.strip().lower()
        if len(clean.split()) <= 4:
            for pattern in GREETING_PATTERNS:
                if re.search(pattern, clean):
                    return True
        return False

    def detect_emotional_cues(self, query: str) -> str:
        clean = query.lower()
        for pat in EMOTIONAL_CUES:
            if re.search(pat, clean):
                return (
                    "I hear that you are feeling anxious or distressed right now, and it is completely understandable "
                    "to feel overwhelmed when dealing with health worries. While I am an AI assistant and cannot evaluate "
                    "or diagnose your emotional state, please know that you are not alone. Let's look at what the verified "
                    "clinical evidence suggests.\n\n"
                )
        return ""

    def retrieve(self, query: str, top_k: int = 3, threshold: float = 0.08) -> List[Dict[str, Any]]:
        tokens = self._tokenize(query)
        if not tokens or not self.chunk_vectors:
            return []

        q_vec = {}
        total = len(tokens)
        for t in tokens:
            tf = tokens.count(t) / total
            q_vec[t] = tf * self.idf.get(t, 1.0)
        norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
        q_norm = {t: v / norm for t, v in q_vec.items()}

        scores = []
        query_lower = query.lower()
        for idx, c_vec in enumerate(self.chunk_vectors):
            dot_product = sum(q_norm.get(t, 0.0) * c_vec.get(t, 0.0) for t in q_norm)
            chunk = self.chunks[idx]
            keyword_matches = sum(1 for kw in chunk["keywords"] if kw.lower() in query_lower)
            boosted_score = dot_product + (keyword_matches * 0.20)

            if boosted_score >= threshold:
                scores.append((boosted_score, chunk))

        scores.sort(key=lambda x: x[0], reverse=True)
        return [
            {
                "score": round(score, 4),
                "title": c["title"],
                "publisher": c["publisher"],
                "sourceUrl": c["sourceUrl"],
                "chunk_id": c["chunk_id"],
                "snippet": c["content"],
                "category": c["category"]
            }
            for score, c in scores[:top_k]
        ]

    def synthesize_response(self, query: str, retrieved_passages: List[Dict[str, Any]], model_online: bool = False) -> Dict[str, Any]:
        clean_query = query.strip()
        lower_query = clean_query.lower()

        # 1. Natural Conversational Greeting Response
        if self.is_greeting(clean_query):
            greeting_answer = (
                "Hello! 👋 I am your CareBridge AI Healthcare Assistant.\n\n"
                "I am here to support you with:\n"
                "• Immediate first-aid instructions (burns, choking, sprains, wound care)\n"
                "• Educational overviews of common symptoms, fevers, and chronic conditions\n"
                "• Emergency escalation directives and national hotlines (112 / 108)\n"
                "• Guidance on preparing questions for our verified CareBridge doctors\n\n"
                "How can I assist you with your health today? (Feel free to describe what symptoms you or your family member are experiencing.)"
            )
            return {
                "answer": greeting_answer,
                "citations": [
                    {
                        "title": "CareBridge Clinical Advisory Overview",
                        "publisher": "CareBridge Clinical Governance Board",
                        "sourceUrl": "/about",
                        "snippet": "Verified guidance on symptoms, safe first aid, and clinical specialty navigation."
                    }
                ],
                "evidence_sufficient": True,
                "model_status": "conversational_greeting_active",
                "disclaimer": "Informational Notice: This response is for educational reference only and does not substitute for professional medical care."
            }

        # 2. Insufficient Clinical Evidence / Out-of-Domain Guardrail
        if not retrieved_passages:
            return {
                "answer": (
                    "The current verified CareBridge healthcare knowledge base is dedicated strictly to human health education, "
                    "first-aid protocols, and clinical navigation. I could not find trustworthy clinical evidence to answer this query safely.\n\n"
                    "Recommendations:\n"
                    "• If this relates to a personal medical symptom, please schedule an appointment with a verified CareBridge physician.\n"
                    "• If you or someone nearby is experiencing acute trauma or sudden severe distress, dial 112 (Pan-India ERSS) or 108 (Ambulance) immediately."
                ),
                "citations": [],
                "evidence_sufficient": False,
                "model_status": "online_llm" if model_online else "deterministic_rag_fallback",
                "disclaimer": "Informational Notice: This response is for educational reference only and does not substitute for professional medical care."
            }

        # 3. Grounded Synthesis from Top Retrieved Clinical Evidence
        top = retrieved_passages[0]
        citations = [
            {
                "title": p["title"],
                "publisher": p["publisher"],
                "sourceUrl": p["sourceUrl"],
                "snippet": p["snippet"]
            }
            for p in retrieved_passages
        ]

        # Check for emotional tone
        empathy_prefix = self.detect_emotional_cues(clean_query)

        # Assemble primary synthesized clinical answer
        answer_parts = []
        if empathy_prefix:
            answer_parts.append(empathy_prefix)

        answer_parts.append(f"Based on verified clinical guidelines from {top['publisher']}:\n")
        answer_parts.append(f"{top['snippet']}\n")

        # Specific High-Risk Safeguard Annotations
        safeguard_notes = []
        if any(re.search(p, lower_query) for p in HIGH_RISK_CONTEXTS["pregnancy"]):
            safeguard_notes.append(
                "⚠️ PREGNANCY SAFEGUARD: During pregnancy, never start or stop medications without consulting your obstetrician. "
                "Any vaginal bleeding, persistent headache with vision changes, or severe cramps requires immediate hospital evaluation."
            )
        if any(re.search(p, lower_query) for p in HIGH_RISK_CONTEXTS["pediatric"]):
            safeguard_notes.append(
                "⚠️ PEDIATRIC SAFEGUARD: In infants under 3 months, any fever of 38.0°C (100.4°F) or above requires urgent direct clinical assessment by a pediatrician. Never administer aspirin to children."
            )
        if any(re.search(p, lower_query) for p in HIGH_RISK_CONTEXTS["medication"]):
            safeguard_notes.append(
                "⚠️ MEDICATION SAFEGUARD: Do not alter dosages, discontinue prescription therapies, or take unprescribed antibiotics without direct physician consultation."
            )
        if any(re.search(p, lower_query) for p in HIGH_RISK_CONTEXTS["allergy"]):
            safeguard_notes.append(
                "⚠️ ALLERGY SAFEGUARD: If experiencing throat tightness, lip/tongue swelling, or difficulty breathing, this may indicate anaphylaxis. Immediately administer epinephrine if available and call 112 / 108."
            )

        if safeguard_notes:
            answer_parts.append("\n" + "\n\n".join(safeguard_notes) + "\n")

        # Context-checking follow-up questions for brief/underspecified symptoms
        is_brief = len(clean_query.split()) <= 6
        has_vague_symptom = any(re.search(pat, lower_query) for pat in VAGUE_SYMPTOM_TRIGGERS)
        if is_brief and has_vague_symptom:
            follow_up = (
                "\nTo provide more relevant educational information, could you share a bit more context:\n"
                "1. How long have you experienced this symptom, and did it start suddenly or gradually?\n"
                "2. How severe is it on a scale of 1 to 10?\n"
                "3. Are there accompanying signs such as fever, vomiting, rash, or difficulty breathing?"
            )
            answer_parts.append(follow_up)
        else:
            answer_parts.append(
                "\nNext Steps:\n"
                "• Monitor your symptoms closely.\n"
                "• If symptoms worsen or fail to improve within 24 to 48 hours, schedule a consultation with a verified specialist on CareBridge.\n"
                "• If you develop sudden crushing pain, severe shortness of breath, or confusion, dial 112 (Pan-India ERSS) or 108 (Ambulance) immediately."
            )

        return {
            "answer": "".join(answer_parts),
            "citations": citations,
            "evidence_sufficient": True,
            "model_status": "online_llm" if model_online else "deterministic_rag_fallback",
            "disclaimer": "Informational Notice: This response is for educational reference only and does not substitute for professional medical care."
        }
