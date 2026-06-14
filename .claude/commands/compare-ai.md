---
description: Compare deux textes avec l'IA et affiche les similitudes et différences.
argument-hint: [aspect de comparaison optionnel]
---

Invoque `mcp__ai-workers__ai_compare`.

**Texte A :** sélection IDE (`<ide_selection>`) en priorité, sinon presse-papiers, sinon demande.
**Texte B :** demande toujours : *Quel est le second texte à comparer ?*
**Focus optionnel :** `$ARGUMENTS` si précisé (ex: ton, structure, longueur) → passe au paramètre `focus`.

Affiche la comparaison avec bannière 🔷 dans le chat.