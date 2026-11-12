---
title: Prerequisites, step by step
description: Go through each Deployrr v6 Prerequisites step in menu order to see what it asks, what to pick, what it changes on your server, and its done status.
type: guide
tags:
  - install
  - host
  - domain
applies_to: v6.0+
related:
  - using-deployrr/requirements-not-met
  - getting-started/setup-mode
  - getting-started/licenses
  - docker/no-internet-in-containers
  - getting-started/quick-start
further_reading:
  - title: "UDMS part 05: Create a new Linux user and prepare Ubuntu or Debian for Docker"
    url: https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User
  - title: "UDMS part 12: Install Docker on Ubuntu or Debian"
    url: https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/#Install_Docker_on_Ubuntu_2404_or_Debian_12
  - title: "UDMS part 14: Docker folders, permissions and the .env file"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/#1_Folders_and_Files
videos:
  - id: rdqbAr0TFnQ
    start: 331
    title: "Deployrr 5 walkthrough: Prerequisites menu"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 677
    title: "Deployrr 5 walkthrough: System Checks and Docker install"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: -ZSQdJ62r-Q
    start: 620
    title: "Docker on Proxmox LXC: creating a non-root user and adding it to sudo"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-11
status: current
old_paths: []
sidebar:
  order: 6
sources: []
---

This guide walks through every item in the **Prerequisites** menu, in menu order. It is for you if you opened **Prerequisites** for the first time and want to know what each item does before you select it. For the install command and a short version of the same steps, see the [Quick start](/getting-started/quick-start/).

## Overview

**Prerequisites** has 15 items. Each line ends with its status. You finish a step when its status changes from a red word to `DONE` or to a value. The Docker and Backups folder lines show `SET - /path` or `NOT SET`. The **Verify** line shows your license.

Other menus need every Prerequisites item done. If any one is missing, including a `Build Cache` that shows `EXPIRED`, they show `Prerequisites - All steps must be completed`. See [Requirements Not Met](/using-deployrr/requirements-not-met/).

Some steps change your server: they install packages, create folders, install Docker or write DNS settings. Read the caution under a step before you rerun it.

To see the Prerequisites menu used from the top, watch [Deployrr 5 walkthrough: Prerequisites menu at 5:31](https://youtu.be/rdqbAr0TFnQ?t=331) (shows Deployrr v5; menus and steps differ in v6).

:::caution
Before you start, and before you rerun any step marked with a caution, take a backup. On Proxmox, take a snapshot of the VM or LXC. If Deployrr is already set up and you have a Pro license, you can also use **Tools** > **Backups**. See [Back up your Docker folder](/using-deployrr/backups/).
:::

## What the status words mean

| Status | What it means | What to do |
| --- | --- | --- |
| `DONE` | The step is finished. | Nothing. |
| `SET` with a path, or a value such as your username, IP, domain, system type, `Local`, `Hybrid`, `minimum` or `normal` | You gave a value and Deployrr saved it. | Nothing, unless the value is wrong. Select the step again to change it. |
| `NOT DONE` | You have not run the step, or it failed. | Select the step and finish it. |
| `NOT SET` | No value saved yet. | Select the step and give a value. |
| `NOT-SET` | Same as `NOT SET`. Shown by **Username** and **Domain 1**. A `root` username also shows this. | Select the step and give a value. |
| `EXPIRED` | Shown by **Build Cache** only. The app list you downloaded is old. | Run **Build Cache** again. |
| `NOT-REQUIRED` | Shown by **Domain 1** and **Domain Checks** in Local mode. | Nothing. These steps only count in Hybrid mode. |

**Setup Mode** always shows `Local` or `Hybrid`. **Verify** shows your license, for example `Your Deployrr License: Free`. Neither one shows a red word.

If a menu item shows a **Requirements Not Met** box, an earlier step is missing. See [Requirements Not Met](/using-deployrr/requirements-not-met/).

## The safe order

Go top to bottom through the menu. This order always works:

1. **Disclaimers**
2. **Packages**
3. **Build Cache**
4. **Username**
5. **System Type**
6. **Setup Mode**
7. **Docker Folder**
8. **Backups Folder**
9. **Environment**
10. **Server IP**
11. **Domain 1**
12. **System Checks**
13. **Domain Checks**
14. **Verify**
15. **Telemetry**

Here is what each step needs first:

- **Disclaimers** needs nothing. Every other step needs **Disclaimers**.
- **Environment** also needs **Docker Folder**.
- **Server IP** and **Domain 1** also need **Environment**.
- **System Checks** also needs **Username**.
- **Domain Checks** also needs **Username**, **Domain 1** and **System Checks**.
- **Verify** also needs **Docker Folder**.

The full table is in [Requirements Not Met](/using-deployrr/requirements-not-met/#which-prerequisites-steps-need-another-step-first).

## 1. Disclaimers

**What it asks.** A box lists eight notes. They say that:

- Manual changes to the layout of Deployrr's files can cause problems, and you must not delete placeholders.
- You should make a backup from the **Tools** menu before big changes.
- Deployrr is not meant for production use.
- Your machine ID, your email (only for license checks) and your domain (to check domain limits) are recorded.

The last line asks whether you have read and accept them.

**What to pick.** Select **Yes** to accept. Select **No** to decline. If you decline, a warning says the disclaimers were not acknowledged. The step shows `NOT DONE`, and declining also clears an earlier `DONE`.

**What it changes.** Nothing on your server.

**Done status.** `DONE`.

## 2. Packages

**What it asks.** A box titled **Install Required Packages** lists the packages for your Linux family and asks if you want to continue.

**What to pick.** Select **Yes**.

**What it changes.** It installs these packages.

| System | Packages |
| --- | --- |
| Debian and Ubuntu | git, html2text, acl, apache2-utils, net-tools, apt-transport-https, ca-certificates, gnupg, lsb-release, argon2, pwgen, libnss-resolve, ufw, zip, unzip, nano, dos2unix, pciutils, lshw |
| Arch and Manjaro | git, python-html2text, acl, apache, net-tools, ca-certificates, gnupg, argon2, pwgen, systemd-resolvconf, ufw, zip, unzip, nano, dos2unix, pciutils, lshw, psmisc |
| Fedora, RHEL and similar | git, python3-html2text, acl, httpd-tools, net-tools, ca-certificates, gnupg2, argon2, pwgen, systemd-resolved, zip, unzip, nano, dos2unix, pciutils, lshw, psmisc |

On Debian and Ubuntu, software-properties-common is optional. Deployrr skips it if your system does not offer it. On Fedora and RHEL, it adds the EPEL repository first.

This step installs `ufw` but does not turn it on. App installs may add firewall rules, but they only take effect if you enable `ufw` yourself. See [Firewall on a VPS](/networking/ufw-firewall-vps/).

When the install finishes, the step tests your internet connection.

On Debian only, the step also changes your DNS settings. It does these things:

1. It copies `/etc/systemd/resolved.conf` to `/etc/systemd/resolved.conf.bak`.
2. It replaces `/etc/systemd/resolved.conf` with Cloudflare DNS (1.1.1.1 and 1.0.0.1) and Google as the fallback (8.8.8.8 and 8.8.4.4).
3. It restarts the DNS resolver service.

:::caution
If you rerun **Packages** on Debian, the new copy overwrites `resolved.conf.bak`. Your original settings are gone after the second run. If you set your own DNS servers, copy the file to a safe place first.
:::

**If the internet check fails.** You see **Internet Connectivity Check Failed**. On Debian 12, the box adds a note that some users lose internet after this step. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/). The box also says you can turn on [EXPERT mode](/using-deployrr/expert-mode/) in **Settings** > **Mode** to override the check. Only do that if you are sure the server has internet.

**Done status.** `DONE`.

## 3. Build Cache

**What it asks.** A box says `This will sync all app manifests and rebuild the cache.` and asks you to continue.

**What to pick.** Select **Yes**. The server needs internet.

**What it changes.** It downloads the list of apps Deployrr can install. You see five numbered sync steps, then the number of apps found. If an optional sync fails, you only see a warning. If a required sync fails, you see `Cache build incomplete` and the step stays `NOT DONE`.

**Done status.** `DONE`. After 7 days it shows `EXPIRED`. Run **Build Cache** again. It is safe to rerun any time. Rerun it too when you want the newest app list.

## 4. Username

**What it asks.** `Linux User Name (cannot be root).` The box shows your current user as a suggestion.

**What to pick.** The regular Linux user that owns your Docker apps. Never `root`. If you type `root`, you see **Invalid Username** and the step shows `NOT-SET`.

**What it changes.** If the user does not exist, Deployrr asks if you want to create it and add it to sudoers. If you say yes, it asks you to set a password for the new user. Then it tells you to run Deployrr again as that user. Use this command and enter your password:

```bash
su - YOUR_USERNAME
```

Replace `YOUR_USERNAME` with the user you created.

:::caution
On Fedora, RHEL, Rocky Linux and CentOS, the new user gets no password and no sudo rights, even though Deployrr says it was created. Set them by hand: `sudo passwd YOUR_USERNAME` and `sudo usermod -aG wheel YOUR_USERNAME`. See [Install errors](/getting-started/install-errors/#create-a-regular-user-with-sudo-rights).
:::

To see a user created and added to sudo by hand, watch [Docker on Proxmox LXC: creating a non-root user at 10:20](https://youtu.be/-ZSQdJ62r-Q?t=620) (manual setup; Deployrr does this for you).

**Done status.** Your username in green.

## 5. System Type

**What it asks.** **Pick your System Type**: what kind of machine runs your Linux.

**What to pick.**

| Choice | Pick it when |
| --- | --- |
| **Unprivileged LXC** | Deployrr runs in an unprivileged LXC container on Proxmox. |
| **Privileged LXC** | Deployrr runs in a privileged LXC container on Proxmox. |
| **Virtual Machine** | Deployrr runs in a VM on any hypervisor, such as Proxmox, WSL, ESXi or VirtualBox. |
| **Barebones** | Linux runs directly on the hardware. |
| **VPS** | Linux runs on a virtual private server in the cloud. |

Select **Skip** to leave without a choice.

**What it changes.** The choice does not change files. It changes what Deployrr lets you do later:

- In **System** > **Mounts**, **SMB Mount** and **NFS Mount** only work on **VPS**, **Barebones** and **Virtual Machine**. On an LXC you see `SMB mounting is only supported on VPS, Barebones, or Virtual Machine systems.` **NFS Mount** shows the same message for NFS. Use bind mounts or Rclone instead. See [Mount SMB and NFS shares](/host/smb-nfs-mounts/) and [Mount a NAS share with Rclone](/host/rclone-smb-setup/).
- Some apps only install on certain system types. If yours does not match, the install stops with `System type not compatible` and shows the types the app needs and your type.

Running in a Proxmox LXC? See [Run Deployrr in a Proxmox LXC container](/host/proxmox-lxc/) for what each LXC choice changes.

On a Proxmox LXC, a Docker update can also stop containers from starting. See [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

**Done status.** The system type you picked, in green. You can rerun this step any time to change it.

## 6. Setup Mode

**What it asks.** Nothing. Each time you select it, it toggles between **Local** and **Hybrid** and shows what that mode needs.

**What to pick.** Stay on **Local** if you only use apps at home. Switch to **Hybrid** if you want to reach apps from the internet. Hybrid needs a domain, a Plus or Pro license, Traefik, ports 80 and 443 forwarded, Cloudflare DNS, a few DNS records and Cloudflare SSL mode set to FULL. With a Free license the box says the setting has no effect.

**What it changes.** The mode decides whether **Domain 1** and **Domain Checks** count. Switching to Local also clears the saved proxy type.

**Done status.** `Local` or `Hybrid`. It is safe to toggle any time. See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).

## 7. Docker Folder

**What it asks.** An info box explains that this folder holds all your compose files, the `.env` file and the data of your apps. It suggests `/home/YOUR_USERNAME/docker`. Then a **Directory Browser - Instructions** box explains the keys, and a folder browser opens.

**What to pick.** Your Docker folder. To make a new folder, type its name at the end of the path in the browser, then select it. A confirm box says if the folder will be created. Select **Confirm**.

**What it changes.** It creates the folder if it does not exist. It gives your user ownership of the new folder only if you set **Username** first.

:::caution
If you already have a Docker folder and pick a different path, Deployrr does not move your files. You must move the old folder to the new place yourself. Back up first.
:::

**Done status.** `SET` and the path.

## 8. Backups Folder

**What it asks.** The same kind of info box and folder browser. The box says this is where backups from **Tools** > **Backups** are saved. It suggests `/home/YOUR_USERNAME/docker_backups`.

**What to pick.** A folder with enough free space. Use a different disk than your Docker folder if you can.

**What it changes.** It creates the folder if it does not exist.

**Done status.** `SET` and the path. The same caution as the Docker folder applies: changing the path does not move old backups.

## 9. Environment

**What it asks.** Nothing at first. It runs in the terminal and shows numbered steps. Run **Build Cache** first, because the starter files come from the app cache.

**What it changes.** It builds the Docker folder from the previous steps. After it finishes, your Docker folder holds:

| Item | What it is |
| --- | --- |
| `docker-compose-HOSTNAME.yml` | The main compose file. `HOSTNAME` is the name of your machine. |
| `compose/HOSTNAME/` | One compose file per app you install. It starts with `custom.yml`, where you can add your own services. See [Add your own services with custom.yml](/using-deployrr/custom-yml/). |
| `appdata/` | The settings and data of your apps. |
| `secrets/` | Secret values. Only root can read this folder. |
| `logs/HOSTNAME/` | Log files for this machine. |
| `.env` | Settings that your compose files use. Only root can read this file. |

The `.env` file gets your user and group IDs, your username, your timezone, your home folder, the Docker folder path, trusted local and Cloudflare IP ranges, your hostname, and your domain and server IP if you already set them. If Deployrr cannot detect your timezone, a warning says it will use `UTC`. The step also sets version pins for some services.

**If the Docker folder already holds files.** When the Docker folder has loose files other than `.env`, a menu asks what to do:

| Choice | What happens |
| --- | --- |
| **Recreate** (`Delete existing and create new folder`) | Deletes the existing content and builds from scratch. If your Backups folder exists, Deployrr first copies the Docker folder to it as `docker_backup_DATE_TIME`. |
| **Reuse** (`Keep appdata, .env, secrets, and custom.yml`) | Keeps `appdata`, `.env` and `secrets`, removes everything else, then builds the new files. The kept items sit in the Backups folder for a moment. It needs a Backups folder that exists. Without one, it stops and says a Backups folder is needed. |
| **Exit** (`Make no changes`) | Makes no changes. |

If the Environment is already `DONE`, you first see a warning that you may break installed apps. Select **Yes** only if you mean to continue.

:::caution
Both **Reuse** and **Recreate** remove the old main compose file and the compose files of apps you installed. **Recreate** also deletes `appdata`. Despite its label, **Reuse** writes a fresh `custom.yml` over yours. Copy your `custom.yml` somewhere safe first. Without a Backups folder, there is no automatic copy. Take a snapshot or a backup before you choose either one.
:::

If you see an error that the compose file is malformed, see [Compose file is malformed](/docker/compose-malformed/).

To understand how the folders, permissions and `.env` file fit together, read [UDMS part 14: Folders and Files](https://www.simplehomelab.com/udms-14-docker-media-server/#1_Folders_and_Files) (manual setup; it uses a host named `udms`, so your names differ).

**Done status.** `DONE`. It shows `DONE` only while the main compose file, `compose`, `appdata`, `secrets` and `.env` exist. If you delete one, the status goes back to `NOT DONE`.

## 10. Server IP

**What it asks.** `Enter the Docker Host IP (LAN IP or WAN IP for VPS):` Deployrr fills in the IP it detects.

**What to pick.** The IP address other devices use to reach this server. On a home network, use the LAN IP. On a VPS, use the public IP. [Give the server a fixed address](/host/fixed-ip/) first, so it does not change.

**What it changes.** It saves the address in your `.env` file. Your compose files use it.

**Done status.** Your IP in green. You can rerun it any time. The final box says so. If the server's IP changes after you installed apps, also follow [Change the server IP](/using-deployrr/change-server-ip/).

## 11. Domain 1

**What it asks.** `Enter/edit Domain Name (e.g., example.com):`

**What to pick.** In Local mode, a box says the domain is not required. You can still enter one if you plan to use Hybrid mode later. In Hybrid mode, enter the domain you use with Cloudflare.

**What it changes.** It saves the domain in your `.env` file. If you set a domain while in Local mode, Deployrr asks if you want to switch to Hybrid mode.

**Done status.** Your domain in green in Hybrid mode, `NOT-SET` if empty in Hybrid mode, and `NOT-REQUIRED` in Local mode, even if you set a domain.

## 12. System Checks

**What it asks.** Nothing at first. It runs five checks in the terminal.

**What it checks and changes.**

1. The system clock matches real time. If it is off by more than 10 seconds, you see **Time Synchronization Error** and the step stops. Fix the clock on the host, for example with NTP or `timedatectl`, then rerun. A wrong clock breaks certificates and logins. If the time service cannot be reached, you see a warning and the check is skipped.
2. The user from **Username** exists.
3. Docker is installed. On Debian, Ubuntu and Arch, Deployrr installs and starts it if it is missing. If it is already installed, you see `Would you like to check and update your system? (Y/n)`. Type `y` to update all system packages now. Pressing Enter or any other key skips the update.
4. The Docker service is running.
5. The Docker network address is found and saved to `.env`.

:::caution
The system update can also update Docker. On a Proxmox LXC, that can stop containers from starting. See [Docker fails with "failed to create shim task"](/host/shim-task-debian/). Take a snapshot first, or skip the update.
:::

To see this step run and install Docker, watch [Deployrr 5 walkthrough: System Checks at 11:17](https://youtu.be/rdqbAr0TFnQ?t=677) (shows Deployrr v5; menus and steps differ in v6). To understand what the Docker install does, read [UDMS part 12: Install Docker on Ubuntu 24.04 or Debian 12](https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/#Install_Docker_on_Ubuntu_2404_or_Debian_12) (manual setup).

**Done status.** `DONE` after the message `All System and Docker checks passed`. If a check fails, see [System Checks failed](/host/system-checks-failed/).

If it is already `DONE`, you see `It appears that System Checks were already completed.` Press `y` to run it again. Any other key goes back. A rerun that fails sets the status back to `NOT DONE`.

## 13. Domain Checks

**What it asks.** Nothing. In Local mode, a box says domain checks are not required.

**What it checks.** In Hybrid mode, it runs eight checks:

1. Port 80 can be reached from the internet.
2. Port 443 can be reached from the internet.
3. Your domain resolves to an IP.
4. That IP matches your public IP.
5. A random subdomain of your domain resolves. This tests your wildcard DNS record.
6. That IP matches your public IP.
7. The A record in Cloudflare is not proxied (gray cloud).
8. The wildcard CNAME record in Cloudflare is not proxied (gray cloud).

When a check fails, the terminal lists the likely causes. They include a blocked or unforwarded port, an ISP that blocks port 80, an ISP that shares one IP between customers, a wrong DNS record and an orange-cloud Cloudflare record. If you just changed a Cloudflare record to gray cloud, the terminal suggests setting your router's DNS to 1.1.1.1. Fix the cause and run **Domain Checks** again. New DNS records can take time to spread. See [Domain Checks failed](/networking/domain-checks-failed/) for each check and its fix.

If you turned on [EXPERT mode](/using-deployrr/expert-mode/) in **Settings** > **Mode**, each failed check asks if you want to override it. Only do that if you know the check is wrong.

**Done status.** `DONE` after all eight checks pass (`Domain Checks Passed: 8 / 8`). A failed run sets it back to `NOT DONE`. In Local mode it shows `NOT-REQUIRED`.

## 14. Verify

**What it asks.** Your domain (optional for a Basic license) and your SimpleHomelab.com account email. Then a box asks you to confirm that your email and domain are used for license checks. Select **Proceed**. The first time, you also create a 6-digit PIN.

**What it changes.** It saves the domain you enter in your `.env` file and your email in Deployrr's settings, so run it after **Environment**. Later runs ask `Enter your 6-digit pin for verification`.

**Done status.** The line shows your license, such as `Free` or `Pro`. For the steps, plans and PIN, see [Licenses](/getting-started/licenses/). If you lose the PIN, see [I forgot my Deployrr PIN](/using-deployrr/forgot-pin/).

## 15. Telemetry

**What it asks.** Each time you select it, it toggles between two levels. A box says which level you are about to set and what it shares. Select **Proceed** to switch, or **Exit** to cancel.

| Level | What it shares |
| --- | --- |
| `minimum` | Only the data needed to check your license: machine ID, email and domain. Nothing else. |
| `normal` | Whether steps passed or failed, and which apps you install. If none is saved, Deployrr asks once for a pseudonym or username (`Enter your preferred pseudonym/username:`). Deployrr says it does not share sensitive data such as IPs or passwords, and does not sell your data. |

**What to pick.** The first time you select it, the box offers `minimum`. Select it a second time to switch to `normal`.

**What it changes.** Nothing on your server.

**Done status.** `minimum` or `normal`.

## Which steps are safe to rerun

| Step | Safe to rerun? |
| --- | --- |
| **Disclaimers**, **Build Cache**, **Telemetry** | Yes. |
| **Verify** | Yes. It re-saves your domain and email. |
| **Packages** | Yes on Ubuntu. On Debian, it replaces your DNS settings and the `.bak` copy. |
| **Username**, **System Type**, **Setup Mode**, **Server IP**, **Domain 1** | Yes. They only change a saved value. |
| **Docker Folder**, **Backups Folder** | Only if you move the old folder yourself. |
| **Environment** | No, once apps are installed. Back up first and read the Reuse and Recreate table. |
| **System Checks** | Yes. You choose whether to run the system update. |
| **Domain Checks** | Yes. |

After you change a value that other steps used, rerun those steps if their status turns red.

## Next steps

- If you chose Hybrid, go to [Set up Traefik](/reverse-proxy/traefik-setup/).
- Install your first app from **Apps** in the main menu.
- Want to change your hostname later? See [Change your hostname](/using-deployrr/change-hostname/).
- Moving to new hardware? See [Move Deployrr to a new server](/using-deployrr/move-to-new-server/).
- Want shorter commands? See [Bash aliases](/using-deployrr/bash-aliases/).

## Related

- [Requirements Not Met](/using-deployrr/requirements-not-met/): what each line in the box means and which menu clears it.
- [Setup Mode: Local or Hybrid](/getting-started/setup-mode/): what Hybrid needs and how to switch.
- [Licenses](/getting-started/licenses/): what each license unlocks and how to verify.
- [No internet on the server or in containers after setup](/docker/no-internet-in-containers/): fix DNS after the Packages step on Debian.
- [Quick start](/getting-started/quick-start/): install Deployrr and see the short version of these steps.
