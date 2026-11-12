---
title: Update Deployrr
description: Update Deployrr to the latest version with one command, or from the prompt at startup, and know what to expect on screen.
type: how-to
tags:
  - updates
  - install
applies_to: v6.0+
related:
  - getting-started/install-errors
  - getting-started/quick-start
  - support/discord
  - getting-started/videos-and-guides
  - using-deployrr/reset-or-remove-deployrr
further_reading:
  - title: Deployrr changelog
    url: https://github.com/SimpleHomelab/Deployrr/blob/main/CHANGELOG.md
last_reviewed: 2026-11-12
status: current
old_paths: ["/deployrr/updating-deployrr"]
sidebar:
  order: 2
---

You can update Deployrr with one command, or say yes when Deployrr offers an update as it starts.

This page updates Deployrr itself. To update your apps, see [Update your apps](/using-deployrr/update-apps/).

## Before you start

- Deployrr v6 is installed. If not, follow the [Quick start](/getting-started/quick-start/).
- Your server is online.
- `sudo` is installed and your user can use it. Deployrr needs it to start and to update. See [Create a regular user with sudo rights](/getting-started/install-errors/#create-a-regular-user-with-sudo-rights).
- `wget` is installed. Deployrr needs it to start and to check for updates. See [Deployrr needs wget](#deployrr-needs-wget).

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

3. Deployrr starts up first. If a newer version is out, you see the startup update prompt from [Update when Deployrr offers it](#update-when-deployrr-offers-it). Press Enter to go on to the updater. If you type `y` there, Deployrr exits instead and shows the npx command.
4. The **Deployrr CLI Updater** screen shows your **Local Version**, the **Latest Version** and the **Install Method** (`npx` or `curl`).
5. Wait while the update runs. It uses the same method you used to install Deployrr and prints the command it runs. If Deployrr can't tell how it was installed, it uses the `curl` installer.

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

You also need this after **Settings** > **Reset**, which currently deletes the Deployrr program. See [Refresh, Reset or Remove Deployrr](/using-deployrr/reset-or-remove-deployrr/).

## If the update fails

Find the message you see, then follow the fix.

`deployrr update` runs Deployrr's normal startup before the updater. So a problem that stops Deployrr from starting also stops the update.

### "Could not check for updates" or "Problem with some dependencies"

As Deployrr starts, it looks up the latest version online. If that fails, you see:

```text
Could not check for updates (network error). Continuing...
```

Deployrr then downloads the files it needs to run. If that fails too, it stops with `Problem with some dependencies` and never reaches the updater. If you see only the first message and Deployrr opens, only the version check failed.

When you run `deployrr update`, the updater looks up the version once more. If that fails, it shows `Could not retrieve latest version information. Please check your internet connection.` and stops.

Check these causes in order.

#### Deployrr needs wget

If `wget` is not installed, you see these messages even when your internet works. The Prerequisites > Packages step does not install it. Ubuntu and Debian usually have it already. Minimal installs may not.

1. Check if `wget` is installed:

   ```bash
   command -v wget
   ```

   If it prints a path, `wget` is installed. If it prints nothing, it is not.

2. Install it with the command for your system:

   ```bash
   sudo apt install wget
   ```

   ```bash
   sudo dnf install wget
   ```

   ```bash
   sudo pacman -S wget
   ```

   Use the first on Debian and Ubuntu, the second on Fedora and the RHEL family, and the third on Arch.

3. Run `deployrr update` again.

#### Your server is offline or can't resolve names

Test the connection with either command:

```bash
ping -c 3 registry.npmjs.org
```

```bash
curl -I https://registry.npmjs.org
```

If both fail, fix your server's network or DNS first. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/).

#### Something on your network blocks the lookup

A firewall or a DNS blocker such as Pi-hole can block `registry.npmjs.org` or `files.deployrr.app`. Allow both, then run `deployrr update` again.

#### Deployrr's server is down for a short time

`Problem with some dependencies` can also mean Deployrr's own server is down for maintenance. Wait a few minutes and try again.

### "Update failed."

`deployrr update` prints the install command after `Running:`. `Update failed.` means that command ended with an error. The reason is in the lines printed above `Update failed.`. Find your line in this list.

- `Required command not found: curl` or `tar`: see [Required command not found](/getting-started/install-errors/#required-command-not-found-curl-or-tar).
- `sudo: npx: command not found`: see below.
- `Unsupported architecture`: see [Unsupported architecture](/getting-started/install-errors/#unsupported-architecture).
- `Failed to download binary` or `Download failed`: see [Failed to download binary](/getting-started/install-errors/#failed-to-download-binary-or-download-failed).

For any other message, see [Install errors](/getting-started/install-errors/).

#### "sudo: npx: command not found"

You installed with npx, and `sudo` can no longer find `npx`, for example because you removed Node.js and npm. To fix it, run the curl installer once:

```bash
sudo bash -c "$(curl -fsSL https://files.deployrr.app/install.sh)"
```

The curl installer saves curl as your install method. After that, `deployrr update` uses curl. The updater screen shows `Install Method: curl`.

:::note
The curl installer only downloads the Deployrr program into `/opt/deployrr`, links the `deployrr` command and saves the version and install method. It does not stop, change or remove your apps or the Docker folder.
:::

### After you fix the cause

Run the update again:

```bash
deployrr update
```

If you are already on the latest version, Deployrr asks if you want to force a reinstall. See [Update with the command](#update-with-the-command).

If it still fails, ask on [Discord](/support/discord/). Include the lines printed above `Update failed.`. Remove your domain and other personal details first.

## Check it worked

- After `deployrr update`, you see `Deployrr has been updated successfully!` and then `Restarting Deployrr...`. Deployrr opens again on its own.
- If you see `Update failed.`, `Could not retrieve latest version information. Please check your internet connection.` or `Problem with some dependencies`, see [If the update fails](#if-the-update-fails).
- If Deployrr shows `Could not check for updates (network error). Continuing...` as it starts and then opens, it could not check for a new version. See [If the update fails](#if-the-update-fails) to fix it.

## Related

- [Install errors](/getting-started/install-errors/): fix messages from the Deployrr installer.
- [Quick start](/getting-started/quick-start/): install Deployrr and complete Prerequisites.
- [Videos and guides](/getting-started/videos-and-guides/): videos that show the v6 menus.
- [Refresh, Reset or Remove Deployrr](/using-deployrr/reset-or-remove-deployrr/): clear Deployrr's cache, start over or uninstall it.
