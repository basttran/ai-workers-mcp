---
description: Rédige un e-mail professionnel à partir de notes avec l'IA — insère le résultat après la sélection.
argument-hint: [ton : professional|friendly|assertive]
---

Invoque `mcp__ai-workers__ai_email_draft` sur la sélection IDE, puis insère après.


**Ton :** `$ARGUMENTS` si c'est un ton (professional, friendly, assertive) → utilise-le. Sinon laisse le défaut (professional). Passe le texte source au paramètre `bullets`.

1. Texte source = sélection IDE — si absente, demande
2. Appelle `mcp__ai-workers__ai_email_draft`
3. Extrais le corps : retire la ligne `🔷 **…** ────` (en-tête) et `────` (pied de page).
4. Edit → insère le résultat brut juste après la sélection