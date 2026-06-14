---
description: Traduit le texte avec l'IA
argument-hint: [langue cible]
---

Invoque `mcp__ai-workers__ai_translate`.

Ici `$ARGUMENTS` désigne la **langue cible** (paramètre), pas le texte source.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu traduire ?*

**Langue cible :** `$ARGUMENTS` si fourni (ex: French, ES, allemand) → utilise-le directement. Sinon demande : *Vers quelle(s) langue(s) ?*

Affiche le résultat avec bannière 🔷 dans le chat.