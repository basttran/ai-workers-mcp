---
description: Traduit le texte avec l'IA
argument-hint: [langue(s) cible(s), séparées par /]
---

Invoque `mcp__ai-workers__ai_translate`.

Ici `$ARGUMENTS` désigne la (ou les) **langue(s) cible(s)**, pas le texte source. Sépare plusieurs langues par `/` (ex: `en/es/nl`).

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu traduire ?*

**Langues cibles :** `$ARGUMENTS` si fourni → découpe par `/` pour former le tableau `target_langs`. Sinon demande : *Vers quelle(s) langue(s) ?*

Affiche le résultat avec bannière 🔷 dans le chat.
