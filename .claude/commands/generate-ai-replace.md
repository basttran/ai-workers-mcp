---
description: Génère du texte avec l'IA et remplace la sélection.
argument-hint: [prompt ou consigne]
---

Invoque `mcp__ai-workers__ai_generate`, puis remplace la sélection.

**Prompt :** `$ARGUMENTS` si fourni → utilise-le. Sinon demande : *Quelle est la consigne ?*
**Contexte :** sélection IDE si présente → passe au paramètre `context`.

1. Appelle `mcp__ai-workers__ai_generate`
2. Extrais le corps : retire `🔷 **…** ────` et `────`
3. Edit → remplace la sélection par le résultat brut