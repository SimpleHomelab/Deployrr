---
title: "Deployrr install errors: root user, sudo and architecture"
description: Fix Deployrr v6 install and start errors, such as running as root, missing sudo rights, an unsupported CPU, command not found, or a broken install.
type: troubleshooting
tags:
  - install
  - host
applies_to: v6.0+
symptoms:
  - "[ERROR] Do not run Deployrr as the root user. Run as a regular user with sudo privileges instead."
  - "This installer must be run as root."
  - "This installer requires root privileges."
  - "Unsupported architecture: <arch>. Deployrr supports x86_64 and ARM64."
  - "Required command not found: curl"
  - "Required command not found: tar"
  - "Failed to download binary"
  - "Download failed. Check your internet connection."
  - "NAME is not in the sudoers file"
  - "sudo: npx: command not found"
  - "deployrr: command not found"
  - "Could not create link in /usr/local/bin. You may need to run via absolute path."
  - "App 'NAME' not found"
related:
  - getting-started/quick-start
  - getting-started/prerequisites
  - getting-started/system-checks-failed
  - getting-started/updating-deployrr
  - support/ssh-access
further_reading:
  - title: "UDMS part 05: create a new user"
    url: https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User
videos:
  - id: "-ZSQdJ62r-Q"
    start: 620
    title: "Docker on Proxmox LXC: creating a non-root user with sudo"
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
sidebar:
  order: 2
---

## Symptoms

You see one of these messages when you install or start Deployrr.

When you start Deployrr:

```txt
[ERROR] Do not run Deployrr as the root user. Run as a regular user with sudo privileges instead.
```

When you run the curl installer without `sudo`:

```txt
This installer must be run as root. Try: sudo bash -c "$(curl -fsSL https://files.deployrr.app/install.sh)"
```

When you run the npx installer without `sudo`:

```txt
This installer requires root privileges.
Run: sudo npx @simplehomelab/deployrr
```

When the installer does not support your processor:

```txt
Unsupported architecture: <arch>. Deployrr supports x86_64 and ARM64.
```

The npx installer prints `Unsupported architecture: <arch>` instead.

Other messages from the installers:

```txt
Required command not found: curl
Required command not found: tar
Failed to download binary
Download failed. Check your internet connection.
```

Other errors you may see around the install:

```txt
NAME is not in the sudoers file
sudo: npx: command not found
deployrr: command not found
Could not create link in /usr/local/bin. You may need to run via absolute path.
```

## Cause

The installer and Deployrr have opposite rules about root.

- You run the **installer** with `sudo`, because it needs root rights.
- You start **Deployrr** as a regular user, without `sudo`. Deployrr asks for your sudo password when it needs root.

Most other errors come from a CPU that is not supported, a missing tool, or a network problem.

## Fix

Find your message below.

### "Do not run Deployrr as the root user"

You are logged in as root, or you started Deployrr with `sudo`. You need a regular user that can use `sudo`.

1. Check who you are:

   ```bash
   whoami
   ```

   If it prints `root`, create a regular user in the next section. If it prints another name, go to step 3.

2. Log in as that regular user. If you connect over SSH, open a new SSH session with that user name. See [SSH access](/support/ssh-access/).
3. Start Deployrr without `sudo`:

   ```bash
   deployrr
   ```

4. Enter your password when Deployrr asks for it.

### Create a regular user with sudo rights

On a new VPS, also set up SSH keys and a firewall for this user. See [Secure a fresh VPS before you install Deployrr](/host/secure-a-vps/).

Use `NAME` as the user name you want. Replace `NAME` in every command. If you are logged in as root, you can leave out `sudo`.

To see this done on Ubuntu, watch [Docker on Proxmox LXC: creating a non-root user with sudo at 10:20](https://youtu.be/-ZSQdJ62r-Q?t=620). For the written steps, read [UDMS part 05: create a new user](https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User) (manual setup).

1. Create the user and set a password when asked:

   ```bash
   sudo adduser NAME
   ```

   On Fedora and RHEL, `adduser` does not ask for a password. Set one with `sudo passwd NAME`.

2. Add the user to the sudo group:

   ```bash
   sudo usermod -aG sudo NAME
   ```

   On Fedora and RHEL, the group is called `wheel`:

   ```bash
   sudo usermod -aG wheel NAME
   ```

3. Log out, then log in again as `NAME`. The new group does not apply until you do. You can also switch to the user in the same session with `su - NAME`.
4. Check that `sudo` works:

   ```bash
   sudo -v
   ```

   It asks for your password and prints nothing else when it works.
5. Check that the group is listed:

   ```bash
   groups
   ```

If `sudo` says `NAME is not in the sudoers file`, the user is not in the group yet. Repeat step 2 from an account that has sudo rights, then log in again as `NAME`.

:::note
Prerequisites has a **Username** step. If you enter a user that does not exist, Deployrr asks `User NAME does not exist. Do you want to create this user and add it to sudoers?` If you answer Yes, it creates the user and tells you to switch with `su - NAME`. You must already be a regular user to reach that step, and it does not accept `root` as the user name. See [Prerequisites, step by step](/getting-started/prerequisites/).
:::

:::caution
On Fedora, RHEL, Rocky Linux and CentOS, the user that the **Username** step creates does not get sudo rights, even though Deployrr says it was created. Add it to the `wheel` group yourself with `sudo usermod -aG wheel NAME`, and set its password with `sudo passwd NAME`.
:::

### "This installer must be run as root" or "This installer requires root privileges"

You ran the installer without `sudo`. Run the install command again with `sudo`, exactly as shown in [Install Deployrr](/getting-started/quick-start/#install-deployrr).

The two commands are:

```bash
sudo npx @simplehomelab/deployrr@latest
```

```bash
sudo bash -c "$(curl -fsSL https://files.deployrr.app/install.sh)"
```

### "Required command not found: curl" or "tar"

1. Install both tools. On Debian and Ubuntu:

   ```bash
   sudo apt install curl tar
   ```

2. Run the curl installer again.

### "sudo: npx: command not found"

The npx method needs Node.js and npm, and your server does not have them. Use the curl installer instead. See [Install Deployrr](/getting-started/quick-start/#install-deployrr).

### "Unsupported architecture"

Deployrr supports 64-bit x86_64 and 64-bit ARM64 processors. It does not support 32-bit ARM (`armv7l`, `armhf`) or `i686`. A Raspberry Pi running 32-bit Raspberry Pi OS is one example.

1. Check your processor type:

   ```bash
   uname -m
   ```

2. If it prints `x86_64` or `aarch64`, you are on a supported processor. Run the installer again and check for typing mistakes.
3. If it prints anything else, install a 64-bit version of your operating system. Then install Deployrr again.

After this message, `/opt/deployrr/apps` may already exist even though Deployrr is not installed. It does no harm.

### "Failed to download binary" or "Download failed"

The installer could not download Deployrr.

1. Check that your server can reach the internet.
2. Run the install command again.
3. If it keeps failing, check your DNS and firewall settings.

The npx installer also prints `Download failed` when `curl` is missing. If your server has internet, install `curl` and try again.

### "deployrr: command not found"

The installer normally makes `deployrr` available from any folder. The curl installer prints `Could not create link in /usr/local/bin. You may need to run via absolute path.` when it cannot. The npx installer prints the full path to use instead, after `Run:`.

1. List the install folder to see the file name:

   ```bash
   ls /opt/deployrr
   ```

2. Start Deployrr with the full path. Replace `FILE_NAME` with the `deployrr_v*.app` file you saw. Do not use `sudo`.

   ```bash
   /opt/deployrr/FILE_NAME
   ```

### Repair a broken install

Run the installer again when the Deployrr program is missing or damaged. For example, after **Settings** > **Reset** the `deployrr` command points to a missing file, or you deleted a file in `/opt/deployrr` by mistake.

Running the installer again is safe:

- It downloads the Deployrr program again and points the `deployrr` command at it.
- It does not delete anything, so your saved settings, setup status and logs in `/opt/deployrr` stay.
- It does not touch your Docker folder, your apps or your running containers.
- The npx installer also copies the app files into `/opt/deployrr/apps` again, replacing the files with the same name.

1. Run your install command again with `sudo`. See [Run the installer again](/getting-started/updating-deployrr/#run-the-installer-again).

   If Deployrr still starts, `deployrr update` does the same. It shows the method you used last (npx or curl) as `Install Method:`. When you are already on the latest version, it asks `Would you like to force reinstall Deployrr anyway? (y/N)`. Type `y`.
2. Start Deployrr without `sudo`:

   ```bash
   deployrr
   ```

3. If an app install stops with `App 'NAME' not found`, get the app files back. Build Cache needs **Disclaimers** done first. Open **Prerequisites** > **Build Cache** and choose **Yes** in the **Build App Cache** box. **Apps** > **Refresh Cache** does the same. Wait for `Building app registry...` to finish, then install the app again.

A **Reset** deletes the Deployrr program, so run the installer again before you start Deployrr. Some Prerequisites steps also need to be done again. See [Refresh, Reset or Remove Deployrr](/getting-started/reset-or-remove-deployrr/).

## Check it worked

1. Run `whoami`. It prints your regular user name, not `root`.
2. Run `deployrr`. The Deployrr main menu opens with **Prerequisites** as the first item.

Next, follow [Quick start](/getting-started/quick-start/) to finish setup. To keep Deployrr current later, see [Update Deployrr](/getting-started/updating-deployrr/).
