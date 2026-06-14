---
description: Transforme le texte en liste à puces avec l'IA — remplace la sélection.
argument-hint: [texte source]
---

Invoque `mcp__ai-workers__ai_bullet` sur la sélection IDE, puis remplace-la.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_bullet`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → remplace le texte sélectionné par le résultat brut