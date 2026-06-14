---
description: Transforme le texte en liste à puces avec l'IA — insère le résultat après la sélection.
argument-hint: [texte source]
---

Invoque `mcp__ai-workers__ai_bullet` sur la sélection IDE, puis insère après.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_bullet`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection