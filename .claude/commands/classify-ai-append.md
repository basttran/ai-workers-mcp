---
description: Classifie le texte dans une catégorie avec l'IA — insère le résultat après la sélection.
argument-hint: [catégories]
---

Invoque `mcp__ai-workers__ai_classify` sur la sélection IDE, puis insère après.


**Catégories :** `$ARGUMENTS` si c'est une liste de catégories (ex: bug / feature / question) → utilise-la. Sinon demande : *Quelles catégories ? (sépare par " / " ou virgule)*. Passe les catégories comme tableau au paramètre `labels`.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_classify`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection