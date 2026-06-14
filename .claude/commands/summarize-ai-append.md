---
description: Résume le texte avec l'IA — insère le résultat après la sélection.
argument-hint: [texte ou URL]
---

Invoque `mcp__ai-workers__ai_summarize` sur la sélection IDE, puis insère après.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_summarize`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection