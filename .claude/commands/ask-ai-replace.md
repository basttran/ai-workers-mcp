---
description: Pose une question à l'IA et remplace la sélection par la réponse.
argument-hint: [question]
---

Invoque `mcp__ai-workers__ai_qa`, puis remplace la sélection.

**Question :** `$ARGUMENTS` → utilise-le. Sinon demande.
**Contexte :** sélection IDE → paramètre `text`.

1. Appelle `mcp__ai-workers__ai_qa`
2. Extrais le corps : retire `🔷 **…** ────` et `────`
3. Edit → remplace la sélection par la réponse brute