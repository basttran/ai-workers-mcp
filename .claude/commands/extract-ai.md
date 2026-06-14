---
description: Extrait des informations structurées du texte avec l'IA
argument-hint: [champs à extraire]
---

Invoque `mcp__ai-workers__ai_extract`.

Ici `$ARGUMENTS` désigne les **champs à extraire** (paramètre), pas le texte source.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu analyser ?*

**Champs :** `$ARGUMENTS` si fourni (ex: dates, actions, noms) → utilise-la. Sinon demande : *Qu'est-ce qu'on extrait ?*. Passe les champs comme tableau au paramètre `fields`.

Affiche le résultat avec bannière 🔷 dans le chat.