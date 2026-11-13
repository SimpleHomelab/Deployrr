---
title: Get help on Discord
description: Join the Deployrr Discord, unlock the support channels and post a help request with the details that get you a fast answer.
type: how-to
tags:
  - support
  - logs
applies_to: v6.0+
related:
  - support/ssh-access
  - support/forgot-pin
  - getting-started/quick-start
  - reverse-proxy/check-traefik-logs
  - docker/waiting-for-container
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: ["/deployrr/get-support-on-discord"]
sidebar:
  order: 1
---

Discord is the place to ask for help with Deployrr, whatever license you have. You can also ask general homelab questions and talk with other users. This page shows how to join, where to post and what to include so people can help you quickly.

## Before you start

- A Discord account.
- Deployrr installed, if your question is about Deployrr.
- Your SimpleHomelab.com account, if you have a paid license or membership.

## Steps

### Join the Discord server

1. Open the [Deployrr Discord invite](https://www.simplehomelab.com/discord/).
2. Accept the invite and follow the server's join steps.

### Unlock the support channels

Paid supporters get a dedicated support channel called `#deployrr`. To see it, connect your Discord account to your SimpleHomelab.com profile.

1. Sign in on SimpleHomelab.com.
2. Open your profile.
3. Connect your Discord account.
4. Go back to Discord and look for the extra channels.

:::note
If you are a paid supporter and Deployrr is not for you, you can get a full refund, no questions asked. Ask on Discord.
:::

### Check the docs first

1. Search these docs for your error message. Many common problems have a fix here.
2. If the fix does not work, go on to the next section.

### Collect the details

A good request saves everyone time. Gather these items first.

1. Find your Deployrr version. Open Deployrr, select **Help** from the main menu, and read the **Your Version** line. It sits just below **Current Version**, above the menu entries.
2. Note your operating system and its version, for example Ubuntu 24.04 or Debian 12.
3. Note your system type, for example bare metal, virtual machine, WSL, LXC or VPS.
4. Write down what you did, step by step, and which menu option you were in.
5. Copy the exact error text from the screen. Do not retype it from memory.
6. Generate a sanitized log:
   1. In Deployrr, open **Settings** > **Logs** and press `Y` to continue.
   2. Write down the path after `Location:` before you leave the screen.
   3. Open the file and remove anything private before you share it.

   For what Deployrr replaces, how to check the file and what an `[ERROR]` line means, see [Generate a sanitized log for support](/support/generate-support-log/).

:::caution
Deployrr tries to replace your Linux username, your domain name and your WAN IP (IPv4) in the log. It does not replace IPv6 addresses. Deployrr says that you must check the log yourself before you share it publicly.
:::

:::caution
Never post passwords, tokens, API keys or your Deployrr PIN. This applies to messages, screenshots and log files. If you lose your PIN, see [I forgot my Deployrr PIN](/support/forgot-pin/).
:::

### Post your request

1. Open the `#deployrr` channel if you can see it. If you cannot, post in a public help channel on the server.
2. Write a short title line that says what is wrong.
3. Add the details from the last section.
4. Attach the sanitized log file.
5. Reply to any questions from other members. Say what you tried and what changed.

If support needs to look at your system, Pro users can start a remote session. See [Get remote help with Remote Assist](/support/ssh-access/).

### Find the same information inside Deployrr

Deployrr has a **Support** entry in the **Help** menu. It is described as "How and where to get support". It shows a **Getting Support** box. The box tells you to check the documentation first and then ask on Discord. It names the `#deployrr` channel for paid supporters. It also asks you to share a sanitized log and to connect your Discord account on your SimpleHomelab.com profile.

## Check it worked

- You see the Deployrr channels in the Discord server. If you do not see `#deployrr`, check that your Discord account is connected to your SimpleHomelab.com profile.
- Your post has your Deployrr version, your OS, your system type, the exact error and the sanitized log.
- Someone replies to your post.
