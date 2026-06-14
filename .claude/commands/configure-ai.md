---
description: Configure les providers, clés et TTLs du cache à la volée
argument-hint: [reload | ttl <outil> <ms> | keys | status]
---

Outil de configuration guidé pour ai-workers. Les actions disponibles :

**1. Voir le statut (`status` ou sans argument)**
Lis `~/.config/ai-workers.json` et affiche l'ordre des providers, le nombre de clés par provider, et les `dailyLimit` configurés.

**2. Recharger la config (`reload`)**
Invoque `mcp__ai-workers__ai_reload_config`. Utile après avoir modifié `~/.config/ai-workers.json` manuellement.

**3. Modifier le TTL du cache (`ttl <outil> <ms>`)**
Invoque `mcp__ai-workers__ai_set_ttl` avec `tool_name` et `ttl_ms`.
Exemple : `/configure-ai ttl summarize 1800000` → TTL de 30min pour summarize.
Si l'argument est incomplet, demande : *Quel outil ? Quel TTL en ms ?*

**4. Gérer les clés API (`keys`)**
Flux guidé :
1. Lis `~/.config/ai-workers.json` (via l'outil Read)
2. Demande : *Quel provider ? Quelle action ? (ajouter / remplacer / supprimer une clé)*
3. Modifie le fichier avec Edit
4. Invoque `mcp__ai-workers__ai_reload_config` pour appliquer sans redémarrer

**Argument `$ARGUMENTS` :** parse la première partie comme action (`reload`, `ttl`, `keys`, `status`). Sinon affiche le menu ci-dessus et demande quelle action effectuer.
