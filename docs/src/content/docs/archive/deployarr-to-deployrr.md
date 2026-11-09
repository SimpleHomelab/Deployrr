---
title: Migrate from Deployarr to Deployrr
description: Archived steps for moving Deployarr v5.7 to Deployrr v5.7.1 after the rename, kept for reference. Anyone on v5.7.1 or later can skip it.
type: archive
tags:
  - migration
  - updates
applies_to: v5.7
related:
  - archive/v4-to-v5-migration
  - getting-started/updating-deployrr
  - support/discord
  - getting-started/quick-start
further_reading: []
last_reviewed: 2026-11-09
status: archived
old_paths: ["/deployrr/deployarr-to-deployrr"]
---

Deployarr was renamed Deployrr in v5.7.1. This page is for people who are still running Deployarr v5.7 or older. It is kept for reference.

:::caution
If you already run Deployrr (v5.7.1 or later, or v6), you do not need this page.

- On v6, see [Update Deployrr](/getting-started/updating-deployrr/).
- On v5, a normal update does not take you to v6. v6 needs a fresh install. You can keep your app data, but you must reinstall your apps. See [Move from Deployrr v5 to v6](/getting-started/move-from-v5/).
:::

The steps below are kept as the old docs gave them. The old docs said to go through v5.7.1 before you update to any later version.

:::note
The download links come from the old docs and may no longer work. If they fail, ask on [Discord](/support/discord/), or start fresh with v6 using the [Quick start](/getting-started/quick-start/).
:::

## Migrate from Deployarr to Deployrr

1. Go to your home folder. Replace `USER` with your Linux username. This is a value you fill in.

   ```bash
   cd /home/USER
   ```

2. Download Deployarr v5.7.

   ```bash
   wget http://www.deployrr.app/archives/deployarr_v5.7.app
   ```

3. Make the file executable.

   ```bash
   sudo chmod +x deployarr_v5.7.app
   ```

4. Run it.

   ```bash
   ./deployarr_v5.7.app
   ```

5. Open a few menus, then exit. You do not need to change any settings.

6. Download Deployrr v5.7.1.

   ```bash
   wget http://www.deployrr.app/archives/deployrr_v5.7.1.app
   ```

7. Make the file executable.

   ```bash
   sudo chmod +x deployrr_v5.7.1.app
   ```

8. Run it. According to the old docs, Deployrr v5.7.1 finds your Deployarr settings and carries them over.

   ```bash
   ./deployrr_v5.7.1.app
   ```

After this, you can update to later v5 releases.

## Clean up (optional)

When the migration works, you can delete the two files you downloaded.

```bash
sudo rm deployarr_v5.7.app
sudo rm deployrr_v5.7.1.app
```

## Get help

If you run into problems, see [Get help on Discord](/support/discord/).
