---
description: Réécrit le texte dans un style différent avec l'IA
argument-hint: [style ou ton]
---

Invoque `mcp__ai-workers__ai_rewrite`.

Ici `$ARGUMENTS` désigne le **style/ton** (paramètre), pas le texte source.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu réécrire ?*

**Style :** `$ARGUMENTS` si fourni (ex: formel, décontracté, concis, technique) → utilise-le. Sinon demande : *Quel ton ou style ?*

Affiche le résultat avec bannière 🔷 dans le chat.