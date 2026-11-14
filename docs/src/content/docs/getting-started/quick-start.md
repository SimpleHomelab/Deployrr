---
title: Quick start
description: Check what your server needs, install Deployrr v6 with one command, and work through Prerequisites so you are ready to install apps.
type: guide
tags:
  - install
  - pin
applies_to: v6.0+
related:
  - getting-started/prerequisites
  - getting-started/install-errors
  - getting-started/updating-deployrr
  - support/forgot-pin
  - getting-started/videos-and-guides
further_reading:
  - title: "UDMS part 05: Create a regular user and prepare Ubuntu or Debian"
    url: https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/
videos:
  - id: Nuo83uzTWco
    start: 721
    title: "Deployrr 6 intro: Getting started"
  - id: Nuo83uzTWco
    start: 674
    title: "Deployrr 6 intro: The new free plan"
last_reviewed: 2026-11-14
status: current
old_paths: ["/deployrr/quick-start-guide"]
sidebar:
  order: 1
---

This guide gets Deployrr running on a Linux server and takes you through the first-run setup.

## What you need

Check these before you install.

### Supported systems

- Ubuntu 22.04 or newer, and Debian 11 or newer. These are the main, supported platforms. Systems based on them work too.
- Fedora, Arch, CentOS, RHEL and Rocky Linux work, but they are not officially supported. On these, Deployrr uses the system's own package manager (dnf or pacman), and it works with firewalld as well as UFW. A few menu items work differently or not at all there. See [On Arch and Fedora](#on-arch-and-fedora).
- An x86_64 or ARM64 processor, running a 64-bit OS. A Raspberry Pi works with 64-bit Raspberry Pi OS or another supported 64-bit OS. To check on Debian, Ubuntu or Raspberry Pi OS, run `dpkg --print-architecture`. It must print `amd64` or `arm64`. If it prints `armhf`, you have a 32-bit OS: install the 64-bit version first. See [Unsupported architecture](/getting-started/install-errors/#unsupported-architecture).
- NAS systems such as Synology or QNAP are not supported. If your NAS can run a virtual machine, install a supported OS in a VM and run Deployrr there.
- Any of these system types: an LXC container (unprivileged or privileged), a virtual machine on any hypervisor (Proxmox, ESXi, VirtualBox, Windows WSL and others), bare metal, or a VPS. In a Proxmox LXC container, a Docker update can stop containers from starting. See [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

### On Arch and Fedora

Apps run in Docker, so they work the same on every system. The differences are in menu items that install software on the server itself.

On Arch and Manjaro, some of that software is only in the AUR. Install `yay` or `paru` first. Without one, these items show `No AUR helper found` and can't install what they need. Mail Relay then stops with `Failed to install ssmtp package`. The others carry on and still show a success message:

- **System** > **Mail Relay**
- **Security** > **CrowdSec** and **Security** > **Firewall Bouncer**
- The [ShellInABox](/apps/shellinabox/) app

On Fedora, RHEL, Rocky Linux and CentOS:

- Install Docker yourself before **System Checks**, with the steps for your system from Docker's documentation. **System Checks** first tries Docker's own install script, which may work on your system. If that fails, System Checks falls back to a method that only works on Debian and Ubuntu.
- When Docker is installed, **System Checks** asks `Would you like to check and update your system? (Y/n)`. Press Enter or type `n` to skip it, and update with `sudo dnf upgrade` instead.
- The **Username** step creates a user without a password or sudo rights. See [Create a regular user with sudo rights](/getting-started/install-errors/#create-a-regular-user-with-sudo-rights).
- **System** > **Mounts** > **SMB Mount** and **NFS Mount** stop with `Failed to install required packages`, even when the client is already installed. **System** > **Mounts** > **Rclone** > **Install** stops with `Failed to install fuse3`. Mount network shares by hand.
- **System** > **Mail Relay**, **Security** > **Firewall Bouncer** and the [ShellInABox](/apps/shellinabox/) app don't work.
- Before you install **CrowdSec**, install rsyslog: `sudo dnf install rsyslog`.
- Before you use **Help** > **Remote Assist** (Pro license only), install tmate: `sudo dnf install tmate`. On RHEL and Rocky Linux, you may need to add the EPEL repository first.
- **Packages** doesn't install UFW. Use firewalld. See [What Deployrr changes on your firewall](/networking/ufw-firewall-vps/#what-deployrr-changes-on-your-firewall).

### Prerequisites

- A regular Linux user (not root) that can run `sudo`.
- Basic command line skills.
- Only if you want to reach your apps from the internet: a domain name, Cloudflare managing the DNS for that domain, and ports 80 and 443 forwarded to your server. You can register the domain anywhere.

You do not need a domain if you only use your apps on your home network.

If you need to create the regular user or prepare a fresh Ubuntu or Debian server first, see [UDMS part 05: Installing and Prepping Ubuntu/Debian](https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/) (manual setup, for background).

### Limitations

- For internet access with a domain, your DNS must be managed by Cloudflare. Other DNS providers are not supported.

## Install Deployrr

Pick one method. Both install commands need `sudo`.

### Method 1: npx (recommended)

This needs Node.js and npm on your server.

1. Run this command:

   ```bash
   sudo npx @simplehomelab/deployrr@latest
   ```

### Method 2: curl installer

This needs no Node.js or npm.

1. Run this command:

   ```bash
   sudo bash -c "$(curl -fsSL https://files.deployrr.app/install.sh)"
   ```

2. Wait for the installer to finish. It shows `Run Deployrr: deployrr` when it is done.
3. Start Deployrr as your regular user, without `sudo`:

   ```bash
   deployrr
   ```

The installer picks the right download for your processor. After this, you can start Deployrr from any folder with `deployrr`.

:::caution
Do not start Deployrr as the root user. If you do, it stops with `Do not run Deployrr as the root user. Run as a regular user with sudo privileges instead.` Deployrr asks for your password when it needs root access.
:::

If the installer or Deployrr stops with an error, see [Install errors](/getting-started/install-errors/).

## First steps

When Deployrr opens, you see the main menu. The first item is **Prerequisites**. Complete it before you do anything else.

1. Select **Prerequisites**. The menu says `Complete all prerequisites as the first step before proceeding:` and shows the status of each step after a dash.
2. Work through the steps in order:
   - **Disclaimers**
   - **Packages**
   - **Build Cache**
   - **Username**: your regular, non-root Linux user.
   - **System Type**: LXC, virtual machine, bare metal or VPS.
   - **Setup Mode**: see below.
   - **Docker Folder** and **Backups Folder**
   - **Environment**
   - **Server IP**
   - **Domain 1**
   - **System Checks** and **Domain Checks**
   - **Verify**: checks your license. See below.
   - **Telemetry**: choose how much usage data to share.
3. Go back to the main menu. You can now install apps from **Apps**.

For what each step asks, what to pick and what it changes on your server, see [Prerequisites, step by step](/getting-started/prerequisites/).

### Setup Mode: Local or Hybrid

**Setup Mode** switches between two modes each time you select it. The screen then shows what the chosen mode needs.

- **Local** (the default): apps are only reachable on your home network. You need no reverse proxy, domain name, port forwarding or Cloudflare.
- **Hybrid**: apps can also be reached from the internet through Traefik. You need a domain, Cloudflare for DNS, DNS records for your domain, and ports 80 and 443 forwarded. Hybrid needs a Plus or Pro license and Cloudflare SSL mode set to **Full**. See [Cloudflare](/networking/cloudflare/).

See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/) for the full Hybrid checklist and how to switch later.

### Verify your license and set a PIN

1. In **Prerequisites**, select **Verify**. Do **Disclaimers** and **Docker Folder** first.
2. Enter your domain name when asked. It is optional for a Basic license.
3. Enter your SimpleHomelab.com account email.
4. Select **Proceed** to confirm.
5. The first time, Deployrr asks you to create a 6-digit PIN. Write it down somewhere safe.

The next time you verify, Deployrr asks for the same PIN. If you lose it, see [I forgot my Deployrr PIN](/support/forgot-pin/).

The **Verify** line in the menu shows your current license, for example `Verify - Your Deployrr License: Free`.

## Free and paid licenses

You can install Deployrr and complete Prerequisites with the free version. Installing apps needs a paid license (Basic, Plus or Pro), and some apps need Plus or Pro.

If you pick an app or feature your license does not cover, Deployrr shows a `License Required` message with the license you need and the one you have. After you upgrade, run **Prerequisites** > **Verify** again.

See [Licenses](/getting-started/licenses/) for what each license unlocks and how to verify it on a new server. For the current plans and prices, see [plans and pricing](https://www.simplehomelab.com/geek-army/join/).

## Update Deployrr

To update to the latest version, run:

```bash
deployrr update
```

Running your install command again also downloads the latest program files and installs them over the old ones. See [Update Deployrr](/getting-started/updating-deployrr/) for the details and what to do if it fails.

## Next steps

- If you picked Hybrid, [set up Traefik](/reverse-proxy/traefik-setup/) so your apps get HTTPS addresses on your domain.
- Watch the [Deployrr v6 intro video](https://youtu.be/Nuo83uzTWco). More in [Videos and guides](/getting-started/videos-and-guides/).
- Ask questions and share your setup in the [Discord community](https://www.simplehomelab.com/discord/).
- Report a problem on the [Deployrr GitHub page](https://github.com/SimpleHomelab/Deployrr).
