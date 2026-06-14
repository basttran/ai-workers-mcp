---
description: Traduit le texte avec l'IA — insère le résultat après la sélection.
argument-hint: [langue cible]
---

Invoque `mcp__ai-workers__ai_translate` sur la sélection IDE, puis insère après.


**Langue cible :** `$ARGUMENTS` si c'est un code/nom de langue (ex: French, ES, allemand) → utilise-le directement. Sinon demande : *Vers quelle(s) langue(s) ?*

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_translate`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection