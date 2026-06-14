---
description: Compare deux textes avec l'IA — remplace la sélection par l'analyse.
argument-hint: [aspect de comparaison optionnel]
---

Invoque `mcp__ai-workers__ai_compare`, puis remplace la sélection.

**Texte A :** sélection IDE (obligatoire pour le remplacement).
**Texte B :** demande : *Quel est le second texte à comparer ?*
**Focus :** `$ARGUMENTS` si précisé → paramètre `focus`.

1. Appelle `mcp__ai-workers__ai_compare`
2. Extrais le corps : retire `🔷 **…** ────` et `────`
3. Edit → remplace la sélection par l'analyse brute