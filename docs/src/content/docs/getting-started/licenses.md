---
title: Licenses
description: See what the Free, Basic, Plus and Pro licenses unlock in Deployrr v6, fix "License Required" boxes, and verify your license on a new server.
type: guide
tags:
  - install
  - pin
  - support
applies_to: v6.0+
related:
  - getting-started/quick-start
  - support/forgot-pin
  - reverse-proxy/traefik-setup
  - using-deployrr/backups
  - support/discord
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 858
    title: "Deployrr 5 walkthrough: License verification and PIN"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: OnoKy73b-w4
    start: 985
    title: "Deployrr 5 intro: License types"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-13
status: current
old_paths: []
sidebar:
  order: 7
---

Deployrr has four license levels: Free, Basic, Plus and Pro. This page shows what each one unlocks, what to do when Deployrr says a license is required, and how to verify your license.

## Overview

Your license decides which menus and apps you can use. You see your current license in two places:

- The title of the main menu, for example `Main Menu (Hostname: ... | License: Free | Mode: ...)`.
- The **Verify** line in **Prerequisites**, for example `Your Deployrr License: Free`.

Each level adds to the one below it.

## Which license do I need?

Start from what you want to do. Pick the first line that fits:

- Prepare a server and check it first: **Free**. You can run every **Prerequisites** step, including **Verify**.
- Install apps and reach them on your home network only: **Basic**. This is **Local** setup mode.
- Reach your apps at your own domain with SSL certificates, through Traefik or Nginx Proxy Manager: **Plus**. This is **Hybrid** setup mode, which also needs a domain on Cloudflare and a few other steps (see [Setup Mode](/getting-started/setup-mode/)).
- Protect apps with a login app that Deployrr installs for you (Authelia, Authentik, Google OAuth, TinyAuth), add CrowdSec, or use **Backups**: **Pro**.

For the full list by menu, see the table in the next section. For the current plans and prices, see [plans and pricing](https://www.simplehomelab.com/geek-army/join/).

## What each license unlocks

Deployrr describes the levels in **Help** > **Licenses** like this:

- **Free**: everything in the **Prerequisites** menu, including **Docker Environment Setup** and **Reverse Proxy Checks**. No registration needed.
- **Basic**: all Free features, plus local-only setup for Docker apps, without reverse proxy support.
- **Plus**: all Basic features, plus reverse proxy (Traefik) so your services get a domain name and Let's Encrypt SSL certificates. You add and manage login apps such as Authelia or Google OAuth yourself, outside Deployrr's menus.
- **Pro**: all Plus features, plus authentication, Backups and more.

In Deployrr itself, the **Security** menu items for Authelia, Authentik, Google OAuth and TinyAuth need Pro.

For a spoken overview of the levels, watch [Deployrr 5 intro: License types at 16:25](https://youtu.be/OnoKy73b-w4?t=985) (shows Deployrr v5; the levels and what they include differ in v6, so use the table below).

This table shows the menus and features each level unlocks.

| Menu or feature | Free | Basic | Plus | Pro |
|---|---|---|---|---|
| **Prerequisites** menu, including **Verify** | Yes | Yes | Yes | Yes |
| **Help** menu | Yes | Yes | Yes | Yes |
| **Docker** > **Docker Login**, **Disk Usage**, **Cleanup** (after Prerequisites) | Yes | Yes | Yes | Yes |
| **Tools** > **Preferred Editor**, **Proxy** > **Proxy Type** and **Proxy** > **Traefik** > **Traefik Mode** | Yes | Yes | Yes | Yes |
| **Apps** > **Browse Apps** (installing an app) | No | Yes | Yes | Yes |
| **Docker** > **Socket Proxy** and **Deployrr Dashboard** | No | Yes | Yes | Yes |
| **System** menu: **Mounts** (SMB, NFS and Rclone), **GPU**, **Network**, **Bash Aliases**, [**SMTP** and **Mail Relay**](/host/smtp-mail-relay/), and setting a folder in [**Folders**](/storage/folders/) (Free can open the menu only) | No | Yes | Yes | Yes |
| **Tools** > **Stack Manager**, **Diagnostics**, **Dashify**, **ReDash**, **Lazydocker** | No | Yes | Yes | Yes |
| **Proxy** > **Traefik** > **Preparation**, **Staging** and **Production** | No | No | Yes | Yes |
| **Proxy** > **Traefik** > **Manage Exposure**, **Traefikify**, **Un-Traefikify**, **Domain Passthrough**, **Auth Bypass** | No | No | Yes | Yes |
| **Proxy** > **NPM** > **Install** (Nginx Proxy Manager) | No | No | Yes | Yes |
| **Security** menu: **Authelia**, **Authentik**, **Google OAuth**, **TinyAuth**, **Manage Auth** | No | No | No | Yes |
| **Security** menu: **CrowdSec**, **Firewall Bouncer**, **Traefik Bouncer** | No | No | No | Yes |
| **Tools** > **Backups**: every option (**Backup**, **View**, **Restore**, **Delete**, **MP Create**, **MP Restore**) | No | No | No | Yes |
| **Tools** > **.env Editor**, **Secrets Editor**, **Change Hostname**, **Change Server IP** | No | No | No | Yes |
| **Settings** > **Version Pins** | No | No | No | Yes |
| **Help** > **Remote Assist** | No | No | No | Yes |

:::note
Some items also need other steps, such as Traefik running or Hybrid mode on. A missing step shows a **Requirements Not Met** box. See [Deployrr shows "Requirements Not Met"](/getting-started/requirements-not-met/) for every line it can list.
:::

**Help** > **Remote Assist** appears only with a Pro license. It starts and stops a support session. With Basic or Plus, **Tools** > **Diagnostics** > **Remote Assist** shows whether a session is running and can only stop it.

### Setup mode and your license

**Setup Mode** in **Prerequisites** switches between **Local** and **Hybrid**. You can switch it with any license, but the apps and features each mode uses need a license:

- Local mode needs Basic, Plus or Pro.
- Hybrid mode needs Plus or Pro, plus a domain name, Traefik and the other items the screen lists.
- With a Free license, both screens show `NOTE: With Free license, this setting has no effect.`

For the full list of what each mode needs, see [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).

### What you see in Help

**Help** > **Licenses** opens a **License Types** box. It explains Free, Basic, Plus and Pro in the words above. It also says which membership levels include each license, and that you can upgrade at any time by paying the difference. To do that, use **Change Membership** in your profile on SimpleHomelab.com.

The rest of the **Help** menu depends on your license:

- Free: **Usage**, **View Pin**, **Request Pin**, **Reset Pin**, **Deployrr**, **Membership**, **Licenses**, **Support**. **Deployrr** and **Membership** show upgrade offers.
- Basic and Plus: the same list.
- Pro: the same list without **Deployrr**, plus **Remote Assist**.

**Help** > **Usage** shows the recommended order of steps for Local mode and for Hybrid mode.

## When Deployrr says a license is required

If you pick something your license does not cover, Deployrr shows a box. No app is installed.

### License Required: ACCESS DENIED

This box has the title **License Required**:

```txt
ACCESS DENIED

This app requires a Plus or Pro license.

Your current license: Free

Visit https://deployrr.app to upgrade.
```

You usually see it after you answer the "Do you want to install ...?" question. The second line changes with the app. You may see:

- `This app requires a Basic, Plus, or Pro license.` For Socket Proxy and Deployrr Dashboard.
- `This app requires a Plus or Pro license.` For Nginx Proxy Manager.
- `Official apps require a paid license.` For apps in **Apps** > **Browse Apps**.

A paid license means Basic, Plus or Pro.

### Requirements Not Met

Most other items show a different box when you select them. Traefik, Authelia, Authentik, Google OAuth, TinyAuth, CrowdSec and the **System**, **Tools** and **Settings** items in the table use this one. It is titled `Requirements Not Met (1)`, with the number of missing items. For a license it says one of these:

```txt
License - Basic, Plus, or Pro required. Current: Free (Prerequisites->Verify)
License - Plus or Pro required. Current: Basic (Prerequisites->Verify)
License - Pro required. Current: Plus (Prerequisites->Verify)
```

### What to do

1. Read the box. It names the license you need and the license Deployrr sees on this server.
2. If you already have the license, go to the next section and run **Verify**. Deployrr may still show an older license.
3. If you need a higher license, upgrade. The boxes point to `https://deployrr.app` or `https://www.simplehomelab.com/deployrr/`. For the current plans and prices, see [plans and pricing](https://www.simplehomelab.com/geek-army/join/).
4. After you upgrade, run **Prerequisites** > **Verify** again.
5. Try the menu again.

## Verify your license

You run **Verify** the first time, after you upgrade, and on every new or reinstalled server.

### Before you start

- **Disclaimers** and **Docker Folder** in **Prerequisites** are done. If not, Deployrr lists them in a **Requirements Not Met** box.
- Your server has internet access.
- You know the email address of your SimpleHomelab.com account.
- If you set a PIN before, you know it. If not, see [I forgot my Deployrr PIN](/support/forgot-pin/).

### Steps

1. From the main menu, select **Prerequisites**.
2. Select **Verify**.
3. At `Enter/edit Domain Name (Optional for Basic License):`, check the domain name. Change it if it is wrong.
4. At `SimpleHomelab.com Account Email:`, enter the email of your SimpleHomelab.com account.
5. Read the **Access Verification** box. It says Deployrr uses your email and domain name, if you gave one, for license verification.
6. Select **Proceed**. Select **Exit** to stop.
7. Enter your PIN when asked:
   - The first time, you see `Create a personalized 6-digit numerical PIN to protect your account (note it down or remember it):`. Enter a new 6-digit number and write it down. Then close the **Pin Created** box.
   - After that, you see `Previously set pin found. Enter your 6-digit pin for verification.` Enter the same PIN.
8. Read the result box.

To see the same flow in Deployrr v5, watch [Deployrr 5 walkthrough: License verification at 14:18](https://youtu.be/rdqbAr0TFnQ?t=858) (shows Deployrr v5; menus and steps differ in v6).

If you leave the email empty, you see an **Incomplete Information** box with `Incomplete information. Return back when necessary, to complete verification.` Run **Verify** again when you have the email.

### Check it worked

With a paid license, the **Access Verification** box says:

```txt
SUCCESS!

Access Level Verified: Pro

Thank you for your support.
```

It names your level: Basic, Plus or Pro. The main menu title and the **Verify** line now show the same level.

With no paid license found, the box says `WARNING! No access found. You can continue to use the Free version.` Check that the email is the one on your SimpleHomelab.com account, then run **Verify** again. If it still says Free, ask on [Discord](/support/discord/).

If you enter a wrong PIN, you see an **Invalid Pin** box with `Incorrect pin.` You don't see a license result. Run **Verify** again with the right PIN. If you don't know it, see [I forgot my Deployrr PIN](/support/forgot-pin/).

### After you upgrade

1. Upgrade your license, as described in the steps above.
2. Open Deployrr and select **Prerequisites** > **Verify**.
3. Go through the prompts and wait for `Access Level Verified` with your new level.

### On a new or reinstalled server

A fresh Deployrr shows the Free license until you verify.

1. Install Deployrr. See the [Quick start](/getting-started/quick-start/).
2. In **Prerequisites**, complete **Disclaimers**.
3. Complete **Docker Folder**.
4. Select **Verify** and go through the prompts above. Use the same email and PIN as before.
5. Wait for `Access Level Verified`.

:::note
Pro features such as **MP Restore** don't work until the new server shows Pro. See [Move Deployrr to a new server](/using-deployrr/move-to-new-server/).
:::

## If your license shows Free again

Your apps don't stop when Deployrr shows Free. Containers you installed keep running, and your Compose files and app data stay in your Docker folder. Only the menus change: items your license no longer covers show a **License Required** or **Requirements Not Met** box.

That includes the **Up** and **Down** actions in **Tools** > **Stack Manager**, which need Basic, Plus or Pro. To start your apps without them, use Docker Compose in the terminal. If you set up the [Bash aliases](/using-deployrr/bash-aliases/) earlier (setting them up needs Basic or higher), they keep working. Run:

```bash
dcup
```

If your Docker folder is not `/home/YOUR_USER/docker`, the aliases look in the wrong place. See [Your Docker folder is somewhere else](/using-deployrr/bash-aliases/#your-docker-folder-is-somewhere-else), or use the full command below.

Without the aliases, run this. Replace `YOUR_DOCKER_FOLDER` and `HOSTNAME` with your Docker folder and your server's hostname:

```bash
sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d
```

If you still have a paid license, run **Prerequisites** > **Verify** again. See [Verify your license](#verify-your-license).

## Next steps

- Using Hybrid mode? [Set up Traefik](/reverse-proxy/traefik-setup/).
- Have Pro? [Back up your Docker folder](/using-deployrr/backups/).
- Not sure which login app to use? See [Choose a login method](/reverse-proxy/choose-login-method/).
