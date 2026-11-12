---
title: "Help menu: your version, pin, licenses and support"
description: Check your Deployrr version, see the recommended order of steps, manage your PIN and find license and support info, all from the Help menu.
type: how-to
tags:
  - pin
  - support
  - updates
applies_to: v6.0+
related:
  - using-deployrr/forgot-pin
  - getting-started/licenses
  - getting-started/updating-deployrr
  - support/discord
  - support/ssh-access
further_reading: []
videos:
  - id: Nuo83uzTWco
    start: 532
    title: "Deployrr 6 overview: Remote Assistance with Tmate"
  - id: Nuo83uzTWco
    start: 674
    title: "Deployrr 6 overview: The new Free plan"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

The **Help** menu ("Help, Support & Information") shows which Deployrr version you run and gives you quick access to your PIN, license info and support. This page lists what each item does.

## Before you start

- Deployrr is installed and you can open its main menu.

## Check your version

1. From the main menu, select **Help**.
2. Read the lines at the top of the screen:

   | Line | Meaning |
   | --- | --- |
   | **Current Version** | The newest Deployrr version. |
   | **Your Version** | The version on your server. |
   | **Total Supported Apps** | How many apps Deployrr can set up. |
   | **Lines of Code** | For information only. You don't need it. |

3. Compare **Current Version** with **Your Version**. If they differ, an update is out. See [Updating Deployrr](/getting-started/updating-deployrr/).

## What each Help item does

The items you see depend on your license. A Free, Basic or Plus license shows the same items. A Pro license has no **Deployrr** item and adds **Remote Assist**.

### Usage

Shows the **How to use Deployrr?** box with the recommended order of steps. Deployrr tells you about any missing requirement as you go.

Local mode:

1. Prerequisites
2. Make sure Local mode is on
3. Socket Proxy
4. Deployrr Dashboard
5. Apps

Hybrid mode:

1. Prerequisites
2. Make sure Hybrid mode is on
3. Socket Proxy
4. Traefik
5. Deployrr Dashboard
6. Google OAuth or Authelia
7. Apps

To switch modes, see [Setup mode](/getting-started/setup-mode/).

### View Pin, Request Pin and Reset Pin

- **View Pin** shows your 6-digit PIN. If you see `No pin found. Please re-run access Verify step from Prerequisites menu.`, run **Prerequisites** > **Verify** again.
- **Request Pin** asks for `SimpleHomelab.com Account Email:`. If an account exists with that email, the PIN arrives by email within about 2 minutes.
- **Reset Pin** warns that it clears your current PIN from this system and that you must set a new one in **Prerequisites** > **Verify**. If you continue, it asks for your account email. The reset takes about 2 minutes. Then set a new PIN in **Prerequisites** > **Verify**.

**Request Pin** and **Reset Pin** need **Prerequisites** > **Disclaimers** done first: read the box and choose **Yes**. Otherwise a **Requirements Not Met** box appears. For the full steps, see [I forgot my Deployrr PIN](/using-deployrr/forgot-pin/).

### Deployrr and Membership

These show the upgrade offer for your license and where to buy or upgrade:

- Deployrr: https://www.simplehomelab.com/deployrr/
- Membership: https://www.simplehomelab.com/membership/

### Licenses

Gives a short summary of the Free, Basic, Plus and Pro licenses. For what each one includes, see [Deployrr licenses](/getting-started/licenses/).

### Remote Assist (Pro only)

Turns a remote SSH support session on or off. The item shows `ACTIVE` or `NOT ACTIVE`. See [Get remote help with Remote Assist](/support/ssh-access/). To see what it is, watch [Deployrr 6 overview: Remote Assistance with Tmate at 8:52](https://youtu.be/Nuo83uzTWco?t=532).

### Support

Shows where to get help:

- The docs at https://docs.deployrr.app.
- Discord support.
- A `#deployrr` channel for paid supporters.

It also reminds you to generate a sanitized log from **Settings** and share it when you ask for help. To see the exclusive Discord channels, connect your Discord account on your SimpleHomelab.com profile. See [Get help on Discord](/support/discord/).

### Feedback

Before you give feedback, **Feedback** ("Submit a Review/Feedback") is on the main menu. After you give it, it moves to the Help menu, so you can send it again.

## View Deployrr status

1. From the main menu, select **Settings**.
2. Select **Status** ("View Deployrr Status").
3. Read the screen titled **Deployrr Status**. If Deployrr has nothing to show, it says `No status information found`.
4. Press Enter to go back to **Settings**, or wait 60 seconds and Deployrr goes back on its own.

## Generate a log for support

1. From the main menu, select **Settings**.
2. Select **Logs** ("Generate Sanitized Deployrr Log").
3. Read the warnings, then press `y` to continue.
4. Note the log file path shown at the end. Deployrr saves the file in the folder you started Deployrr from.
5. Open the log and check it before you share it. Deployrr tries to replace private details such as your Linux username, domain name and WAN IP, but only IPv4 addresses are replaced, not IPv6. Deployrr warns that you must check the log yourself.
6. Share the log when you ask for help. See [Get help on Discord](/support/discord/).

## Hide the main menu notes

The main menu shows intro messages, such as how to use Deployrr and access verification. To hide or show them:

1. From the main menu, select **Settings**.
2. Select **Intro**.

The item shows `ON` or `OFF`. Each time you select it, it switches.

## Check it worked

- The **Help** screen shows both **Current Version** and **Your Version**.
- After you select **Intro**, a **Deployrr Intro** box shows the new setting.

## Related

- [I forgot my Deployrr PIN](/using-deployrr/forgot-pin/): view, email or reset your PIN step by step.
- [Deployrr licenses](/getting-started/licenses/): what Free, Basic, Plus and Pro include.
- [Updating Deployrr](/getting-started/updating-deployrr/): update when your version is behind.
- [Get help on Discord](/support/discord/): share a sanitized log and ask for help.
- [Get remote help with Remote Assist](/support/ssh-access/): start and stop a support session.
