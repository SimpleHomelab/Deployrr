---
title: Update your apps
description: Update one app or your whole stack, see which apps have newer recommended versions, and pin or unpin an app version.
type: how-to
tags:
  - updates
  - compose
applies_to: v6.0+
related:
  - docker/rate-limit
  - using-deployrr/backups
  - using-deployrr/bash-aliases
  - getting-started/updating-deployrr
  - support/discord
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

Use **Tools** > **Stack Manager** to update one app or all of them. You can also check which apps have a newer recommended version, and keep an app on one version with a version pin. For the other Stack Manager options, such as Start, Stop, Recreate, Disable and Delete, see [Stack Manager](/using-deployrr/stack-manager/).

:::note
This page is about your apps. To update Deployrr itself, see [Update Deployrr](/getting-started/updating-deployrr/).
:::

## Before you start

- You finished **Prerequisites**. See the [Quick start](/getting-started/quick-start/).
- You have a Basic, Plus or Pro license. **Update Stack**, **Update App** and **Check Pins** need it. Without it you see a "Requirements Not Met" box.
- For version pins, you have a Pro license. **Settings** > **Version Pins** needs Pro.
- Make a backup before a big update. See [Back up and restore your Docker folder](/using-deployrr/backups/). Backups need Pro.

:::caution
The Stack Manager screen warns you: "IMPORTANT! The options below depend on patterns, spacing, and indentation adhering to Deployrr standards. Manual changes/deviations may cause unexpected behaviors."
:::

An update uses the image version your compose files ask for. An app that has a version pin stays on that version until you change the pin. Not every app has a pin. Apps without one, such as Socket Proxy and Nginx Proxy Manager, always get the newest image.

## Update one app

1. In Deployrr, go to **Tools** > **Stack Manager**.
2. Choose **Update App** ("Update a single app (smart pull or rebuild)").
3. At "Select an app to update:", type the number of your app and press Enter. The list shows all your containers, running and stopped.

   Type the number of the **exit** entry to leave. You see "No changes made."

4. Wait. Deployrr shows "Pulling latest image for APP...", stops the app and starts it again.
5. Look for "APP updated and restarted".

If the app is one Deployrr builds locally from source, it rebuilds the app instead. You see "APP rebuilt and restarted".

## Update the whole stack

1. Go to **Tools** > **Stack Manager**.
2. Choose **Update Stack** ("Pull updates and recreate entire stack").
3. If you see the **Stack Update Mode** menu, choose an option. It appears when some of your apps are built locally from source. It lists them under "Local-build apps detected:". Under "Choose update scope:" you can pick:

   | Option | What it does |
   | --- | --- |
   | **1** Full | Pulls hub images and rebuilds the custom apps. |
   | **2** Standard | Pulls hub images only and skips the custom apps. |
   | **3** Custom | Rebuilds the custom apps only and skips the hub pull. |

4. Wait. Normally you see "Pulling latest hub images..." and then "Recreating stack with updates..." (or "Recreating stack with all updates..." in Full mode).
5. Look for one of these lines:
   - "Docker stack fully updated (hub + custom)"
   - "Docker stack updated (hub images)"
   - "Docker stack updated (custom apps only)"

:::caution
The success message shows even when a pull failed, for example because of a Docker Hub rate limit. Read the Docker output above the message and look for `Error`. If pulls failed, see [Docker image pulls fail](/docker/rate-limit/).
:::

## See which apps have a newer recommended version

1. Go to **Tools** > **Stack Manager**.
2. Choose **Check Pins** ("Compare app version pins with recommended").

The **Check Version Pins** screen compares the pins in your `.env` file with the versions Deployrr recommends. It shows these groups:

| You see | What it means |
| --- | --- |
| "N pin(s) match the recommended version" | These apps are up to date. |
| "Deployrr recommends a newer version (N):" | Each line reads `APP  current -> recommended`. |
| "Newer than recommended, kept (N):" | Your pin is newer than the recommended version. Each line shows `current (recommended: X)`. |
| "Can't compare, check manually (N):" | Deployrr could not compare these pins. Check them yourself. |

If everything is fine, you see "All version pins are at or above the recommended versions." If only some pins need a manual check, you see "No pins are older than recommended. Check the N pin(s) above manually."

Check Pins does not change anything. If it lists apps to update or to check, it shows a note with these steps:

- Change the app's pin in **Settings** > **Version Pins** (Pro), then run **Tools** > **Stack Manager** > **Update Stack**.
- Check the app's logs afterwards and fix any breaking changes.
- Compose and config changes, such as new options or security settings, need a reinstall instead. Go to **Tools** > **Stack Manager** > **Delete**, then install the app again.
- Create a backup first.
- Read the [release notes](https://github.com/SimpleHomelab/Deployrr/tree/main/releases).

## Pin or unpin an app version

A pin keeps an app on one version. This keeps core apps stable. If an app uses a `latest` tag, it may update unexpectedly.

1. Go to **Settings** > **Version Pins** ("Edit Docker Image Version Pins").
2. Read the **About Version Pinning** box and confirm.
3. The list screen is titled **Version Pins** and shows the path to your `.env` file. At "Select a variable to edit:", choose the pin. Each name ends in `_VERSION_PIN`, for example `TRAEFIK_VERSION_PIN`.
4. In the **Edit Version Pin** box, type the new version after "Edit version number for NAME:". The box opens with the current value.
5. Select **OK**.
6. Run **Update App** for that app, or **Update Stack**, so the new version is used.

If you leave the box empty or unchanged, nothing changes. Choose **Back** to leave the screen.

There is no separate unpin option. To let an app always take the newest image, set its pin to `latest`, if the image offers that tag. Some apps already ship with `latest` as the recommended pin. To go back to a pinned version, type that version number again.

:::caution
A `latest` tag may update an app unexpectedly. Test upgrades before you update a pinned version. You can also use the default versions Deployrr sets. Deployrr updates these periodically after testing.
:::

If you see "No .env file found. Please complete Docker Setup first.", finish Docker setup first. If you see "No version pins found. Version pins are created when you install apps that support version pinning.", your apps have no pins to edit.

## Update from the terminal

Any license can use the Bash aliases `dcpull` and `dcup`.

1. Run this to pull the latest images for all apps, one at a time. It skips apps that are built locally:

   ```bash
   dcpull
   ```

2. Run this to start the apps. It rebuilds if needed and removes leftover containers:

   ```bash
   dcup
   ```

The aliases exist only after you turn on Deployrr's Bash aliases in **Prerequisites** > **Bash Aliases**. See [Bash aliases](/using-deployrr/bash-aliases/).

## Check it worked

- Go to **Tools** > **Stack Manager** > **Containers Status**. It lists all containers, stopped ones too. The **Version** column shows the version of each container. Some images leave it empty.
- Open the app. It loads and works.
- Run **Check Pins** again. It lists no older pins.
- Look at the app's logs for errors. The `dclogs` alias shows the last 50 lines of your app logs and follows them.
- If an app is stopped after the update, start it with **Stack Manager** > **Start Container**. For Traefik, see [Check Traefik logs](/reverse-proxy/check-traefik-logs/).

## Related

- [Docker image pulls fail](/docker/rate-limit/): fix pull errors that show up during an update.
- [Back up and restore your Docker folder](/using-deployrr/backups/): make a backup before a big update.
- [Bash aliases](/using-deployrr/bash-aliases/): `dcpull`, `dcup`, `dclogs` and the other shortcuts.
- [Update Deployrr](/getting-started/updating-deployrr/): update Deployrr itself, not your apps.
- [Get help on Discord](/support/discord/): ask the community if an update goes wrong.
