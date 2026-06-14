---
description: Vérifie les quotas des providers et met à jour dailyLimit dans la config
---

Flux guidé pour vérifier et synchroniser les limites quotidiennes des providers LLM.

**Étapes :**

1. Lis `~/.config/ai-workers.json` pour connaître les providers configurés.

2. Pour chaque provider, essaie de récupérer les infos de quota via `mcp__ai-workers__ai_qa` :
   - Gemini : tente l'URL Google AI Studio pour les quotas. Si la page retourne 404 ou ne contient pas d'info de limite, demande à l'utilisateur : *URL de la page de quotas Gemini ?*
   - Groq : même approche sur la page de limites Groq.
   - Mistral : même approche.
   - Pour tout autre provider : demande l'URL manuellement.

3. Pour chaque limite trouvée (nombre de requêtes/jour), propose une mise à jour :
   *Provider X : limite détectée = N req/jour. Mettre à jour `dailyLimit` dans la config ? (oui/non)*

4. Si oui, modifie `~/.config/ai-workers.json` avec Edit pour mettre à jour le champ `dailyLimit` du provider concerné.

5. Si au moins une valeur a été modifiée, invoque `mcp__ai-workers__ai_reload_config` pour appliquer sans redémarrer.

6. Affiche un récapitulatif des changements effectués.

**Note :** si `$ARGUMENTS` contient une URL, utilise-la directement comme URL de quotas pour le premier provider.
