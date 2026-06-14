---
description: Classifie le texte dans une catégorie avec l'IA
argument-hint: [catégories]
---

Invoque `mcp__ai-workers__ai_classify`.

Ici `$ARGUMENTS` désigne les **catégories** (paramètre), pas le texte source.

**Source du texte :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande : *Quel texte veux-tu classifier ?*

**Catégories :** `$ARGUMENTS` si fourni (ex: bug / feature / question) → utilise-la. Sinon demande : *Quelles catégories ? (sépare par " / " ou virgule)*. Passe les catégories comme tableau au paramètre `labels`.

**Overflow (texte > 50 000 caractères) :** si la source est manifestement longue, demande à l'utilisateur :
> Le texte est trop long pour une seule passe. Quelle stratégie ?
> 1. **truncate** — classifier sur les premiers 50 000 caractères seulement
> 2. **vote** — classifier chaque section, retenir la catégorie majoritaire
> 3. **skip** — annuler

Passe la stratégie choisie au paramètre `strategy` (`"truncate"` ou `"vote"`). Si l'utilisateur choisit "skip", annule sans appeler l'outil.

Affiche le résultat avec bannière 🔷 dans le chat.
