---
description: Compare deux textes avec l'IA — insère l'analyse après la sélection.
argument-hint: [aspect de comparaison optionnel]
---

Invoque `mcp__ai-workers__ai_compare`, puis insère l'analyse après la sélection.

**Texte A :** sélection IDE.
**Texte B :** demande : *Quel est le second texte à comparer ?*
**Focus :** `$ARGUMENTS` si précisé → paramètre `focus`.

1. Appelle `mcp__ai-workers__ai_compare`
2. Extrais le corps : retire `🔷 **…** ────` et `────`
3. Edit → insère l'analyse brute juste après la sélection