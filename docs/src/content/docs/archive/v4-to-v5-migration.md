---
title: Migrate from Deployrr v4 to v5
description: Archived steps for moving a Deployrr v4.6.1 install to v5.0, kept for reference. Anyone on v5 or v6 should not follow them.
type: archive
tags:
  - migration
  - updates
applies_to: v4.6.1
related:
  - getting-started/updating-deployrr
  - support/discord
  - getting-started/quick-start
  - getting-started/videos-and-guides
further_reading:
  - title: "Video: Deployrr v4 to v5 migration"
    url: https://youtu.be/_9C7bDPveMg
last_reviewed: 2026-11-09
status: archived
old_paths: ["/deployrr/v4-to-v5-migration"]
---

This page is for people who are still on Deployrr v4.6.1 or older. It is kept for reference.

:::caution
If you are on Deployrr v5 or v6, do not follow this page.

- On v6, see [Update Deployrr](/getting-started/updating-deployrr/).
- On v5, a normal update does not take you to v6. v6 needs a fresh install. You can keep your app data, but you must reinstall your apps. See [Quick start](/getting-started/quick-start/).
:::

Deployrr v5.0 changed a lot of the code. Because of that, v4 setups do not carry over on their own. The steps below move a v4.6.1 install (or older) to v5.0.

## What changed in v5

- A new Deployrr logo and icon.
- Local mode. You can install apps for local access without a reverse proxy. This also lets you run setups with more than one server, because Traefik is no longer required.
- New ways to expose apps through Traefik:
  - Simple mode: every app behind Traefik is reachable from inside and outside your network.
  - Advanced mode: you choose per app whether it is internal, external or both.
- Traefik now uses file providers by default to expose your apps. A few apps, such as Traefik itself, OAuth and Authelia, still use Docker labels.

## Migrate from v4 to v5

1. Stop all running containers, or bring down the whole stack.
2. Keep the stack down until the migration is done.
3. Open the Deployrr **Tools** menu and run a cold backup.
4. If you can, make a second backup, for example a Proxmox VM or LXC backup.
5. Exit Deployrr v4.6.1.
6. On your v4.6.1 install, open the `/opt/deployrr/status` folder.
7. Delete every status file whose name starts with `03_`, `04_`, `05_` or `06_`.
8. Open your Docker folder.
9. Delete the compose folder.
10. Delete the main Docker compose file.
11. Start Deployrr again.
12. Go through all the setup steps in order. Deployrr finds your existing appdata.
13. When Deployrr asks if you want to reinstall Traefik, choose to overwrite.

## Get help

If you run into problems, see [Get help on Discord](/support/discord/).
