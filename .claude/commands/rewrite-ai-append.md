---
description: Réécrit le texte dans un style différent avec l'IA — insère le résultat après la sélection.
argument-hint: [style ou ton]
---

Invoque `mcp__ai-workers__ai_rewrite` sur la sélection IDE, puis insère après.


**Style :** `$ARGUMENTS` si c'est un style/ton (ex: formel, décontracté, concis, technique) → utilise-le. Sinon demande : *Quel ton ou style ?*

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_rewrite`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection