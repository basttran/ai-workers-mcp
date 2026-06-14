---
description: Génère du texte avec l'IA à partir d'un prompt.
argument-hint: [prompt ou consigne]
---

Invoque `mcp__ai-workers__ai_generate`.

**Prompt :** `$ARGUMENTS` si fourni → utilise-le directement. Sinon demande : *Quel est le sujet ou la consigne ?*
**Contexte optionnel :** si une sélection IDE (`<ide_selection>`) est présente, passe-la au paramètre `context`.

Affiche le résultat avec bannière 🔷 dans le chat.