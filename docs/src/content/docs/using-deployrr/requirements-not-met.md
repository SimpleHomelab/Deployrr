---
title: Deployrr shows "Requirements Not Met"
description: Find each line in the Deployrr v6 Requirements Not Met box, learn what it means, and see which menu clears it so the item you picked can run.
type: troubleshooting
tags:
  - install
  - traefik
  - auth
  - docker
applies_to: v6.0+
symptoms:
  - "Requirements Not Met (1)"
  - "Requirements Not Met (3)"
  - "The following requirements must be met before continuing:"
  - "Prerequisites - All steps must be completed"
  - "Disclaimers - Must be read and acknowledged (Prerequisites menu)"
  - "Hybrid Mode - Setup Mode must be Hybrid. Current: Local (Prerequisites menu)"
  - "License - Plus or Pro required. Current: Free (Prerequisites->Verify)"
  - "Socket Proxy - Must be running (Docker menu)"
  - "Traefik Production - Must be completed (Proxy menu)"
  - "Advanced Authentication - Authelia, Authentik, OAuth, or TinyAuth must be running (Security menu)"
  - "Required app not running"
related:
  - getting-started/licenses
  - getting-started/setup-mode
  - getting-started/quick-start
  - reverse-proxy/traefik-setup
  - reverse-proxy/choose-login-method
videos:
  - id: rdqbAr0TFnQ
    start: 331
    title: "Deployrr 5 walkthrough: Prerequisites menu"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 1028
    title: "Deployrr 5 walkthrough: Rclone install, SMB remote and automount"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-11
status: current
old_paths: []
sources: []
---

## Symptoms

You select a menu item or confirm an app install. Nothing runs. Instead you see a box with this title and text:

```txt
Requirements Not Met (3)

The following requirements must be met before continuing:

• Prerequisites - All steps must be completed
• Hybrid Mode - Setup Mode must be Hybrid. Current: Local (Prerequisites menu)
• License - Plus or Pro required. Current: Free (Prerequisites->Verify)
```

The number in the title is how many lines the box lists. Each line names one missing item. Most lines end with the menu that fixes it.

## Cause

The item you picked needs other steps done first. Deployrr checks them before it starts. It lists every missing step in one box, so you can fix them all in one pass.

This box is not the same as the **License Required** box that says `ACCESS DENIED`. See [How it differs from License Required](#how-it-differs-from-license-required).

## Fix

1. Read every line in the box. Close the box.
2. Find each line in the tables below.
3. Do what the "Where to clear it" column says.
4. Select the same menu item again.
5. If a new box appears, repeat from step 1. Some items show a different box once the first one is clear.

:::note
Fix the Prerequisites line first. Several other lines depend on it.
:::

### Prerequisites lines

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `Disclaimers - Must be read and acknowledged (Prerequisites menu)` | You have not accepted the disclaimers. | **Prerequisites** > **Disclaimers**. Read the box and select **Yes**. |
| `Docker Folder - Must be set (Prerequisites menu)` | No Docker folder is chosen. | **Prerequisites** > **Docker Folder**. |
| `Docker Environment - Must be set up (Prerequisites menu)` | The Docker folder structure is not built. | **Prerequisites** > **Environment**. |
| `Username - A non-root Linux user must be set (Prerequisites menu)` | No Linux user is set, or the user is `root`. | **Prerequisites** > **Username**. |
| `Domain Name - Must be configured (Prerequisites menu)` | No primary domain is set. | **Prerequisites** > **Domain 1**. |
| `System Checks - Must be completed (Prerequisites menu)` | System Checks has not finished. | **Prerequisites** > **System Checks**. |
| `Prerequisites - All steps must be completed` | At least one Prerequisites step is not done. This line has no menu hint. | Open **Prerequisites**. Finish every item that shows `NOT DONE`, `NOT SET`, `NOT-SET` or `EXPIRED`. See the next section. |

The **Prerequisites** line is the one you see most. It is not one step. It means the whole **Prerequisites** menu must be finished.

#### What counts as "all steps"

Open **Prerequisites** and look at each line. Some items show `DONE` when finished. Others show their value, such as `SET` with a path, your username or your IP. An item still to do shows `NOT DONE`, `NOT SET`, `NOT-SET` or `EXPIRED`. These must be finished:

- **Disclaimers**
- **Packages**
- **Build Cache**. If it says `EXPIRED`, run it again.
- **Username**
- **System Type**
- **Docker Folder**
- **Backups Folder**
- **Environment**
- **Server IP**
- **System Checks**
- **Telemetry**
- **Verify**. Run it and enter your email.

In Hybrid mode, **Domain 1** and **Domain Checks** must be done too. In Local mode they show `NOT-REQUIRED`. **Setup Mode** itself needs no value, because it always shows Local or Hybrid. Follow the [Quick start](/getting-started/quick-start/) for the order, and see [Prerequisites, step by step](/getting-started/prerequisites/) for what each step asks and changes. To see the Prerequisites menu worked through, watch [Deployrr 5 walkthrough: Prerequisites menu at 5:31](https://youtu.be/rdqbAr0TFnQ?t=331) (shows Deployrr v5; menus and steps differ in v6).

#### Which Prerequisites steps need another step first

Some **Prerequisites** items show **Requirements Not Met** themselves:

| You select | It needs first |
| --- | --- |
| **Packages**, **Build Cache**, **Username**, **System Type**, **Setup Mode**, **Docker Folder**, **Backups Folder**, **Telemetry** | **Disclaimers** |
| **Environment** | **Disclaimers**, **Docker Folder** |
| **Server IP**, **Domain 1** | **Disclaimers**, **Docker Environment** |
| **System Checks** | **Disclaimers**, **Username** |
| **Domain Checks** | **Disclaimers**, **Username**, **Domain Name**, **System Checks** |
| **Verify** | **Disclaimers**, **Docker Folder** |

So the safe order is: **Disclaimers**, **Packages**, **Build Cache**, **Username**, **System Type**, **Docker Folder**, **Backups Folder**, **Environment**, **Server IP**, **Domain 1**, **System Checks**, **Domain Checks**, **Verify**, **Telemetry**.

### License lines

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `License - Basic, Plus, or Pro required. Current: ... (Prerequisites->Verify)` | The item needs a paid license. | Upgrade, then run **Prerequisites** > **Verify**. |
| `License - Plus or Pro required. Current: ... (Prerequisites->Verify)` | The item needs Plus or Pro. | Same. |
| `License - Pro required. Current: ... (Prerequisites->Verify)` | The item needs Pro. | Same. |

`Current:` shows the license Deployrr sees on this server. If you already upgraded, run **Verify** again. See [Licenses](/getting-started/licenses/) for what each level unlocks.

### Setup Mode line

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `Hybrid Mode - Setup Mode must be Hybrid. Current: Local (Prerequisites menu)` | The item only works in Hybrid mode. | **Prerequisites** > **Setup Mode**. Select it until the box says `Hybrid mode ENABLED`. |

See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/) for what Hybrid needs.

### Traefik and Docker lines

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `Socket Proxy - Must be running (Docker menu)` | Socket Proxy is not installed or not running. | **Docker** > **Socket Proxy**. The menu line shows `RUNNING` when it is ready. See [Socket Proxy](/docker/socket-proxy/). |
| `Traefik Preparation - Must be completed (Proxy menu)` | Preparation has not finished. | **Proxy** > **Traefik** > **Preparation**. |
| `Traefik Staging - Must be completed (Proxy menu)` | Staging has not finished. | **Proxy** > **Traefik** > **Staging**. |
| `Traefik Production - Must be completed (Proxy menu)` | Production has not finished. | **Proxy** > **Traefik** > **Production**. |
| `Traefik - Must be running (Proxy menu)` | The Traefik container is not running. | Finish **Production**. If it was done before and Traefik stopped, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/). |

The full Traefik order is in [Set up Traefik](/reverse-proxy/traefik-setup/).

### Security lines

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `CrowdSec - Must be running (Security menu)` | CrowdSec is not running. | **Security** > **CrowdSec**. |
| `Advanced Authentication - Authelia, Authentik, OAuth, or TinyAuth must be running (Security menu)` | No login app is running. One of the four is enough. `OAuth` means **Google OAuth**. | **Security** > **Authelia**, **Authentik**, **Google OAuth** or **TinyAuth**. See [Choose a login method](/reverse-proxy/choose-login-method/). |

### System lines

| Line in the box | What it means | Where to clear it |
| --- | --- | --- |
| `Network Adapter - Must be configured (System menu)` | The network adapter for VPN apps is not set up. | **System** > **Network**. |
| `Rclone - Must be installed (System->Rclone menu)` | Rclone is missing. | **System** > **Mounts** > **Rclone** > **Install**. |
| `SMB Remote - At least one must be configured (System->Rclone menu)` | No Rclone remote exists. | **System** > **Mounts** > **Rclone** > **SMB Remote**. |
| `SMB Remote - At least one must be mounted (System->Rclone menu)` | No Rclone remote is mounted. | **System** > **Mounts** > **Rclone** > **Automount**. See [Mount a NAS share with Rclone](/host/rclone-smb-setup/). |

To see the Rclone menu used from install to automount, watch [Deployrr 5 walkthrough: Rclone setup and mounting at 17:08](https://youtu.be/rdqbAr0TFnQ?t=1028) (shows Deployrr v5; menus and steps differ in v6).

### Folder lines

These appear when you install an app that needs a folder. Set the folder in **System** > **Folders**. Setting a folder needs a Basic, Plus or Pro license. See [Set your media, downloads and other folders](/using-deployrr/folders/) for every folder and which apps use it.

| Line in the box | Where to clear it |
| --- | --- |
| `Media Folder - At least one media folder must be set (System > Folders menu)` | **Media Folder 1**, **2** or **3**. One is enough. |
| `Downloads Folder - Must be set (System > Folders menu)` | **Downloads Folder** |
| `Books Folder - Must be set (System > Folders menu)` | **Books Folder** |
| `Audiobooks Folder - Must be set (System > Folders menu)` | **Audiobooks Folder** |
| `Podcasts Folder - Must be set (System > Folders menu)` | **Podcasts Folder** |
| `Comics Folder - Must be set (System > Folders menu)` | **Comics Folder** |
| `Photos Folder - Must be set (System > Folders menu)` | **Photos Folder** |
| `Games Folder - Must be set (System > Folders menu)` | **Games Folder** |
| `Immich Folder - Must be set (System > Folders menu)` | **Immich Folder** |
| `Nextcloud Folder - Must be set (System > Folders menu)` | **Nextcloud Folder** |

## What each menu item needs

This table shows which lines each item can list. Prerequisites means the `Prerequisites - All steps must be completed` line.

| Menu item | Can list |
| --- | --- |
| **Docker** > **Docker Login**, **Disk Usage**, **Cleanup** | Prerequisites |
| **System** > **GPU**, **Network**, **SMTP**, **Mail Relay**; **Mounts** > **SMB Mount**, **NFS Mount**; **Rclone** > **Install**, **Uninstall** | Prerequisites, Basic, Plus or Pro license |
| **System** > **Bash Aliases** | Disclaimers, Username, Docker Environment, Basic, Plus or Pro license |
| **System** > **Folders** (each folder item) | Prerequisites, Basic, Plus or Pro license |
| **System** > **Mounts** > **Rclone** > **SMB Remote** | Prerequisites, Basic, Plus or Pro license, Rclone installed |
| **System** > **Mounts** > **Rclone** > **Automount** | Prerequisites, Basic, Plus or Pro license, Rclone installed, SMB Remote configured |
| **System** > **Mounts** > **Rclone** > **Delay Media Apps**, **Refresh Cache** | Prerequisites, Basic, Plus or Pro license, Rclone installed, SMB Remote configured, SMB Remote mounted |
| **Tools** > **Stack Manager**, **Lazydocker**, **Diagnostics**, **Dashify**, **ReDash** | Prerequisites, Basic, Plus or Pro license |
| **Tools** > **Backups** (**Backup**, **View**, **Delete**, **MP Create**), **.env Editor**, **Secrets Editor**, **Change Hostname**, **Change Server IP**; **Settings** > **Version Pins** | Prerequisites, Pro license |
| **Tools** > **Backups** > **Restore** | Disclaimers, Pro license |
| **Tools** > **Backups** > **MP Restore** | Pro license |
| **Proxy** > **Traefik** > **Traefik Mode** | Disclaimers |
| **Proxy** > **Traefik** > **Preparation** | Prerequisites, Hybrid, Socket Proxy, Plus or Pro license |
| **Proxy** > **Traefik** > **Staging** | Prerequisites, Socket Proxy, Hybrid, Traefik Preparation, Plus or Pro license |
| **Proxy** > **Traefik** > **Production** | Prerequisites, Socket Proxy, Traefik Preparation, Hybrid, Traefik Staging, Traefik running, Plus or Pro license |
| **Proxy** > **Traefik** > **Manage Exposure** | Prerequisites, Socket Proxy, Traefik Production, Traefik running, Hybrid, Plus or Pro license |
| **Proxy** > **Traefik** > **Traefikify**, **Un-Traefikify**, **Domain Passthrough**, **Auth Bypass** | Prerequisites, Socket Proxy, Traefik Production, Traefik running, Plus or Pro license |
| **Proxy** > **NPM** > **Install** | Prerequisites, Hybrid |
| **Security** > **Authelia**, **Authentik**, **Google OAuth**, **TinyAuth** | Prerequisites, Socket Proxy, Traefik Production, Traefik running, Hybrid, Pro license |
| **Security** > **Manage Auth** | Prerequisites, Traefik Production, Traefik running, Hybrid, Pro license |
| **Security** > **CrowdSec** | Prerequisites, Pro license |
| **Security** > **Firewall Bouncer** | Prerequisites, CrowdSec running, Pro license |
| **Security** > **Traefik Bouncer** | Prerequisites, CrowdSec running, Traefik running, Pro license |
| **Apps** > **ShellInABox** | Prerequisites, Traefik Production, Advanced Authentication, Basic, Plus or Pro license |
| **Help** > **Request Pin**, **Reset Pin** | Disclaimers |
| **Feedback** | Disclaimers, Basic, Plus or Pro license |

**Traefik Mode** and **Traefikify** never list the Hybrid Mode line. **Traefik Mode** also needs **Proxy** > **Proxy Type** set to Traefik. If it is not, you see a **Proxy Type Required** box that says `Go to: Proxy -> Proxy Type`. See [Set up Traefik](/reverse-proxy/traefik-setup/).

**NPM** > **Install** works the same way: Proxy Type must be NPM, or you see **Proxy Type Required**. Traefik must also be stopped, or you see **Port Conflict - Cannot Install**. See [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/).

### When you install an app

When you install an app from **Apps** > **Browse Apps**, the box lists one line at a time. Fix it and start the install again. If another line is missing, the box appears again.

Every app needs the Prerequisites line. Some apps need more:

| App needs | Examples |
| --- | --- |
| Media Folder | Sonarr, Radarr, Lidarr, Bazarr, Navidrome |
| Downloads Folder | qBittorrent, SABnzbd, NZBGet, Prowlarr, Jackett, Transmission |
| Books Folder | Calibre, Calibre-Web, Kavita, Komga |
| Comics Folder | Komga, Mylar3 |
| Audiobooks Folder and Podcasts Folder | Audiobookshelf |
| Photos Folder | Piwigo |
| Games Folder | GameVault |
| Immich Folder | Immich |
| Nextcloud Folder | Nextcloud |
| Network Adapter | Gluetun, Tailscale, ZeroTier, Cloudflare Tunnel |
| Traefik Production | PrivateBin, Traefik Access Log, Traefik Error Log |
| Traefik Production and Advanced Authentication | ShellInABox |

An app that needs another app running, such as the Deployrr Dashboard, shows a message in the terminal instead of a box:

```txt
Required app not running
[REQUIRED] socket-proxy must be installed and running first
```

Install the named app first. For Socket Proxy, use **Docker** > **Socket Proxy**.

## How it differs from License Required

| | Requirements Not Met | License Required |
| --- | --- | --- |
| Box title | `Requirements Not Met (N)` | `License Required` |
| First text | `The following requirements must be met before continuing:` | `ACCESS DENIED` |
| What it lists | Every missing item, with the menu that fixes it | Only your license, and the level you need |
| Where you see it | Traefik, Security, System, Tools, Settings and most menu items | Installing Socket Proxy, Deployrr Dashboard, NPM and apps from **Apps** > **Browse Apps** |

When you install Socket Proxy, the Deployrr Dashboard or an app from **Browse Apps**, the license is checked first. A Free license shows **License Required** before Deployrr checks anything else. Fix the license, then you may see **Requirements Not Met**.

**NPM** > **Install** is the other way round. It shows **Requirements Not Met** and **Proxy Type Required** first, and **License Required** only once those pass.

For the license box and how to upgrade, see [Licenses](/getting-started/licenses/). For Nginx Proxy Manager, see [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/).

## Check it worked

1. Select the menu item again.
2. The **Requirements Not Met** box does not appear.
3. The item starts, or asks its first question.

If you see a different box, such as **Proxy Type Required** or **License Required**, fix what it says. Then try again.

## Related

- [Licenses](/getting-started/licenses/): what each license unlocks and how to run Verify.
- [Setup Mode: Local or Hybrid](/getting-started/setup-mode/): switch to Hybrid and see what it needs.
- [Quick start](/getting-started/quick-start/): finish Prerequisites in order.
- [Set up Traefik](/reverse-proxy/traefik-setup/): Preparation, Staging and Production.
- [Choose a login method](/reverse-proxy/choose-login-method/): pick Authelia, Authentik, Google OAuth or TinyAuth.
