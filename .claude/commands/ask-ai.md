---
description: Pose une question à l'IA sur du texte ou une URL.
argument-hint: [question]
---

Invoque `mcp__ai-workers__ai_qa`.

**Question :** `$ARGUMENTS` si c'est une question → utilise-la. Sinon demande : *Quelle est ta question ?*
**Contexte :** sélection IDE (`<ide_selection>`) → paramètre `text`. Ou URL si `$ARGUMENTS` est une URL → paramètre `url`. Sinon presse-papiers. Sinon question directe sans contexte (demande un contexte).

Affiche la réponse avec bannière 🔷 dans le chat.