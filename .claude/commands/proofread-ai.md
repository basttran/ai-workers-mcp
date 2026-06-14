---
description: Corrige le texte avec l'IA
argument-hint: [texte source]
---

Invoque `mcp__ai-workers__ai_proofread`.

**Source du texte :**
1. `$ARGUMENTS` si contient du texte → utilise-le
2. Sinon sélection IDE (`<ide_selection>`)
3. Sinon presse-papiers
4. Sinon demande : *Quel texte veux-tu corriger ?*

Affiche le résultat avec bannière 🔷 dans le chat.