---
title: Update Deployrr
description: Update Deployrr to the latest version with one command, or from the prompt at startup, and know what to expect on screen.
type: how-to
tags:
  - updates
  - install
applies_to: v6.0+
related:
  - getting-started/quick-start
  - support/discord
  - getting-started/videos-and-guides
further_reading:
  - title: Deployrr changelog
    url: https://github.com/SimpleHomelab/Deployrr/blob/main/CHANGELOG.md
last_reviewed: 2026-11-08
status: current
old_paths: ["/deployrr/updating-deployrr"]
sidebar:
  order: 2
---

You can update Deployrr with one command, or say yes when Deployrr offers an update as it starts.

## Before you start

- Deployrr v6 is installed. If not, follow the [Quick start](/getting-started/quick-start/).
- Your server is online.
- `sudo` is installed and your user can use it. Without it, the update stops with `sudo command is required for updates.`

:::caution
A new version can include changes that need you to reinstall an app or edit your setup. Read the [changelog](https://github.com/SimpleHomelab/Deployrr/blob/main/CHANGELOG.md) before you update.

Deployrr v5 cannot be updated to v6 with these steps. v6 needs a fresh install. See [Move from Deployrr v5 to v6](/getting-started/move-from-v5/). If you are still on v4, see the archived [v4 to v5 migration](/archive/v4-to-v5-migration/) steps. If you still run Deployarr (the old name), see [Migrate from Deployarr to Deployrr](/archive/deployarr-to-deployrr/).
:::

## Update with the command

1. Open a terminal on your server as your normal user.
2. Run this command, without `sudo` in front. Deployrr asks for your password when it needs it.

   ```bash
   deployrr update
   ```

3. The **Deployrr CLI Updater** screen shows your **Local Version**, the **Latest Version** and the **Install Method** (`npx` or `curl`).
4. Wait while the update runs. It uses the same method you used to install Deployrr and prints the command it runs. If Deployrr can't tell how it was installed, it uses the `curl` installer.

If you already have the latest version, Deployrr shows `Deployrr is already up-to-date (v...)` and asks:

```text
Would you like to force reinstall Deployrr anyway? (y/N):
```

- To reinstall anyway, type `y` and press Enter.
- To cancel, press Enter. Deployrr shows `Update cancelled.`

## Update when Deployrr offers it

When a newer version is out, Deployrr tells you as it starts:

```text
You are running version X. There is a newer version: Y.
Update to vY using npx? Press Y/y to exit and update, or any other key to continue:
```

1. Type `y` and press Enter. Deployrr exits and shows `Exiting. Please run: sudo npx @simplehomelab/deployrr@latest`.
2. Run that command:

   ```bash
   sudo npx @simplehomelab/deployrr@latest
   ```

To skip the update, press Enter instead. Deployrr shows `Continuing with v...` and opens as usual.

:::note
This prompt always suggests the `npx` command, even if you installed with `curl`. If you installed with `curl`, use `deployrr update` instead. It keeps your install method.
:::

## Run the installer again

`deployrr update` runs your original install command for you. If it doesn't work, you can run that command yourself.

If you installed with npx:

```bash
sudo npx @simplehomelab/deployrr@latest
```

If you installed with curl:

```bash
sudo bash -c "$(curl -fsSL https://files.deployrr.app/install.sh)"
```

## Check it worked

- After `deployrr update`, you see `Deployrr has been updated successfully!` and then `Restarting Deployrr...`. Deployrr opens again on its own.
- If you see `Update failed.`, run the command again. If it keeps failing, ask for help on [Discord](https://www.simplehomelab.com/discord/).
- If you see `Could not retrieve latest version information. Please check your internet connection.`, check that your server is online and try again.
- If Deployrr shows `Could not check for updates (network error). Continuing...` as it starts, it could not reach the internet to check. It still opens.

## Related

- [Quick start](/getting-started/quick-start/): install Deployrr and complete Prerequisites.
- [Videos and guides](/getting-started/videos-and-guides/): videos that show the v6 menus.
