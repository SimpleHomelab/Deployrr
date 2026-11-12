---
title: Generate a sanitized log for support
description: Make a Deployrr log with your domain, username and public IP replaced, check it by hand, and share it safely when you ask for help.
type: how-to
tags:
  - logs
  - support
applies_to: v6.0+
related:
  - support/discord
  - support/diagnostics
  - support/help-menu
  - reverse-proxy/check-traefik-logs
  - getting-started/reset-or-remove-deployrr
further_reading: []
videos:
  - id: OnoKy73b-w4
    start: 904
    title: "Deployrr 5 walkthrough: Generate a sanitized log in Settings"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
sidebar:
  order: 2
---

When you ask for help, people need to see your logs. This page shows you how to make one log file that Deployrr cleans up for you, and how to check it before you share it.

## Before you start

- Finish **Prerequisites** first. Without your username and Domain 1, Deployrr can't replace them, or your public IP, in the log.
- Your server has internet access. Deployrr looks up your public IP online. If the first lookup service shows a Cloudflare challenge, you see "Trying alternate method" and it tries a second one.
- You have run Deployrr at least once, so there are logs to collect.

## Steps

1. Start Deployrr from the folder where you want the log saved.

   Deployrr saves the log in the folder you are in when you run `deployrr`.

2. From the main menu, select **Settings**.
3. Select **Logs** ("Generate Sanitized Deployrr Log"). The screen is titled **Sanitized Log for Troubleshooting**.
4. Read the warnings in step 1/4, then press `Y` to continue. Any other key takes you back.
5. Wait for the screen to finish. It collects Deployrr's own log and, if you have one, the Traefik log. Both go into one file.
6. Note the path after `Location:`. The screen ends with "Sanitized log ready for sharing".

Each run makes a new file named `deployrr-log-sanitized-YYYYMMDD_HHMMSS.log`.

To see where this option sits in the menu, watch [Deployrr 5 walkthrough: Generate a sanitized log in Settings at 15:04](https://youtu.be/OnoKy73b-w4?t=904). It shows Deployrr v5, so menus and steps differ in v6.

### If you see `[ERROR]` lines

The screen can end with "Sanitized log ready for sharing" even when a step in 3/4 failed. Treat any `[ERROR]` line as a step that did not run:

- If the path after `Location:` does not exist, there were no logs to collect yet. Reproduce your problem, then run **Logs** again.
- If the file exists, check it by hand as shown below. Something was not replaced.

## What gets replaced

| In the log | Becomes |
| --- | --- |
| Domain 1 | `example.com` |
| Your Linux username | `USERNAME` |
| Your public IP, when it matches the IP Domain 1 points to | `XXX.XXX.XXX.XXX` |
| Your public IP, when it differs (for example Cloudflare proxy is on) | `CIP.CIP.CIP.CIP` |
| The IP Domain 1 points to, when it differs from your public IP | `RIP.RIP.RIP.RIP` |

Only IPv4 addresses are replaced. IPv6 addresses stay as they are.

Every match is replaced, even inside other words. For example, other words that contain your username change too. This is cosmetic.

:::caution
Deployrr does not replace everything. It leaves Domain 2 and any other domains, local network IPs, your hostname, email addresses, tokens, passwords and API keys. You must check the log yourself before you share it.
:::

### If your public IP is not replaced

If Domain 1 is not set (Local mode) or does not resolve, Deployrr does not replace your public IP. Step 3/4 then shows "Replacing resolved IP address (EMPTY → EMPTY.EMPTY.EMPTY.EMPTY)" followed by an `[ERROR]` line. Open the file and remove your public IP by hand.

## Check the log before you share it

The file is owned by root. To edit or delete it, use `sudo`. If you can't open it as your normal user, use `sudo` for that too.

1. Find your public IP:

   ```bash
   curl -4 ifconfig.me
   ```

2. Search the log for your private details. Replace `YOUR_LOG_FILE` with the path you noted. Replace `YOUR_DOMAIN` and `YOUR_PUBLIC_IP` with your own values. The `@` finds email addresses.

   ```bash
   grep -n -i -E "YOUR_DOMAIN|YOUR_PUBLIC_IP|@" YOUR_LOG_FILE
   ```

3. Search for other secrets:

   ```bash
   grep -n -i -E "token|password|secret|api[_-]?key" YOUR_LOG_FILE
   ```

4. Also look for Domain 2 and any other domain you use.
5. If you find anything private, open the file and edit it:

   ```bash
   sudo nano YOUR_LOG_FILE
   ```

6. Search again until nothing private is left.

:::note
`CIP` stands for your own public IP and `RIP` for the IP Domain 1 points to. Both are already replaced. When the Cloudflare proxy is on, `RIP` was a Cloudflare address, which is not private. IPv6 addresses are not replaced. Remove your own if you find one.
:::

## Share the log

1. Attach the file to your message on Discord. Do not paste it as text. See [Get help on Discord](/support/discord/).
2. When you are done, delete the file if you want:

   ```bash
   sudo rm YOUR_LOG_FILE
   ```

## Check it worked

- The screen showed "Sanitized log ready for sharing".
- The file exists at the path after `Location:`.
- Your domain shows as `example.com` and your username as `USERNAME`.
- Searching for your public IP finds nothing.

:::note
**Settings** > **Reset** and **Settings** > **Remove** delete Deployrr's logs. If you may need help, generate a log first. See [Refresh, Reset or Remove Deployrr](/getting-started/reset-or-remove-deployrr/).
:::

## Related

- [Get help on Discord](/support/discord/): what else to include when you ask for help.
- [Deployrr shows "Unhealthy - Issues detected"](/support/diagnostics/): run health checks and read the results.
- [Help menu](/support/help-menu/): the Support box that reminds you to share a sanitized log.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): read the Traefik log yourself.
- [Refresh, Reset or Remove Deployrr](/getting-started/reset-or-remove-deployrr/): save a log before you delete anything.
