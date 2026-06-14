---
description: Génère des suggestions de titres pour le texte avec l'IA — remplace la sélection
argument-hint: [nombre de titres]
---

Invoque `mcp__ai-workers__ai_title`.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu titrer ?*

**Nombre :** `$ARGUMENTS` si fourni (entier) → utilise-le comme paramètre `count`. Sinon laisse la valeur par défaut (5).

Remplace la sélection IDE par le résultat.
