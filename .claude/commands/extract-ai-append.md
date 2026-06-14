---
description: Extrait des informations structurées du texte avec l'IA — insère le résultat après la sélection.
argument-hint: [champs à extraire]
---

Invoque `mcp__ai-workers__ai_extract` sur la sélection IDE, puis insère après.


**Champs :** `$ARGUMENTS` si c'est une liste de champs (ex: dates, actions, noms) → utilise-la. Sinon demande : *Qu'est-ce qu'on extrait ?*. Passe les champs comme tableau au paramètre `fields`.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_extract`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection