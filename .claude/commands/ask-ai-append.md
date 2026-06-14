---
description: Pose une question à l'IA et insère la réponse après la sélection.
argument-hint: [question]
---

Invoque `mcp__ai-workers__ai_qa`, puis insère la réponse après la sélection.

**Question :** `$ARGUMENTS` → utilise-le. Sinon demande.
**Contexte :** sélection IDE → paramètre `text`.

1. Appelle `mcp__ai-workers__ai_qa`
2. Extrais le corps : retire `🔷 **…** ────` et `────`
3. Edit → insère la réponse brute juste après la sélection