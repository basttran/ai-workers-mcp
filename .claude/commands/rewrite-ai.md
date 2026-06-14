---
description: Réécrit le texte dans un ou plusieurs styles avec l'IA
argument-hint: [style(s), séparés par /]
---

Invoque `mcp__ai-workers__ai_rewrite`.

Ici `$ARGUMENTS` désigne le (ou les) **style(s)/ton(s)**, pas le texte source. Sépare plusieurs styles par `/` (ex: `formal/concise`).

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu réécrire ?*

**Styles :** `$ARGUMENTS` si fourni → découpe par `/` pour former le tableau `styles`. Sinon demande : *Quel(s) style(s) ou ton(s) ?*

Affiche le résultat avec bannière 🔷 dans le chat.
