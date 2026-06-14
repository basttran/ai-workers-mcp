---
description: Classifie le texte dans une catégorie avec l'IA
argument-hint: [catégories]
---

Invoque `mcp__ai-workers__ai_classify`.

Ici `$ARGUMENTS` désigne les **catégories** (paramètre), pas le texte source.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu classifier ?*

**Catégories :** `$ARGUMENTS` si fourni (ex: bug / feature / question) → utilise-la. Sinon demande : *Quelles catégories ? (sépare par " / " ou virgule)*. Passe les catégories comme tableau au paramètre `labels`.

Affiche le résultat avec bannière 🔷 dans le chat.