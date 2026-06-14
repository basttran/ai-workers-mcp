---
description: Extrait les mots-clés du texte avec l'IA — remplace la sélection
argument-hint: [nombre de mots-clés]
---

Invoque `mcp__ai-workers__ai_keywords`.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu analyser ?*

**Nombre :** `$ARGUMENTS` si fourni (entier) → utilise-le comme paramètre `count`. Sinon laisse la valeur par défaut (10).

Remplace la sélection IDE par le résultat.
