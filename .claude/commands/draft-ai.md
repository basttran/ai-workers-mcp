---
description: Rédige un e-mail professionnel à partir de notes avec l'IA
argument-hint: [ton : professional|friendly|assertive]
---

Invoque `mcp__ai-workers__ai_email_draft`.

**Source du texte :**
1. `$ARGUMENTS` si contient du texte → utilise-le
2. Sinon sélection IDE (`<ide_selection>`)
3. Sinon presse-papiers
4. Sinon demande : *Quelles sont les notes ou points clés pour cet e-mail ?*


**Ton :** `$ARGUMENTS` si c'est un ton (professional, friendly, assertive) → utilise-le. Sinon laisse le défaut (professional). Passe le texte source au paramètre `bullets`.

Affiche le résultat avec bannière 🔷 dans le chat.