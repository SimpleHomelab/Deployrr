---
title: "Domain Checks failed in Prerequisites (ports 80 and 443, DNS records, orange cloud)"
sidebar:
  order: 5
  label: Domain Checks failed
description: Fix each failed Domain Check in Deployrr v6, from ports 80 and 443 to the A record, wildcard CNAME and orange-cloud records, using the messages you see.
type: troubleshooting
tags:
  - domain
  - ports
  - firewall
  - remote-access
applies_to: v6.0+
symptoms:
  - "Port 80 is not reachable from the internet"
  - "Port 443 is not reachable from the internet"
  - "Port 80 is reachable but something is already listening on it"
  - "Could not complete port 80 check. API may be unavailable."
  - "Domain resolution failed (empty IP returned)"
  - "IP mismatch: WAN IP is ... but domain resolves to ..."
  - "Subdomain resolution failed (empty IP returned)"
  - "IP mismatch: WAN IP is ... but subdomain resolves to ..."
  - "Cloudflare proxy is probably enabled/orange-clouded for the A record (IPv6 detected)"
  - "Cloudflare proxy is probably enabled/orange-clouded for the CNAME record (IPv6 detected)"
  - "IP and Domain Checks - NOT DONE"
  - Domain Checks fails after Traefik is already running
related:
  - getting-started/prerequisites
  - reverse-proxy/traefik-setup
  - reverse-proxy/simple-vs-advanced-mode
  - networking/ufw-firewall-vps
  - getting-started/setup-mode
last_reviewed: 2026-11-11
status: current
old_paths: ["/networking/domain-checks-failed"]
sources: []
further_reading:
  - title: "UDMS part 18: Setting up port forwarding"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding"
  - title: "UDMS part 18: CG-NAT"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT"
videos:
  - id: rdqbAr0TFnQ
    start: 2494
    title: "Deployrr 5 walkthrough: Domain Checks"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 2298
    title: "Deployrr 5 walkthrough: Port forwarding on the router"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: KMZIyoZ3jWM
    start: 455
    title: "Traefik 3 guide: Cloudflare A record and wildcard CNAME"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
---

You run **Prerequisites** > **Domain Checks** in Hybrid mode and it stops with a red error. The menu row then reads `IP and Domain Checks - NOT DONE`. In Hybrid mode, **Prerequisites** isn't complete until **Domain Checks** shows `DONE`, and later steps need it. This page lists the eight checks, the message each one shows when it fails, and how to fix it.

## Symptoms

Deployrr runs eight checks in a row. It stops at the first one that fails and prints that check's error, often with a list of likely causes. Examples:

```txt
Port 80 is not reachable from the internet
--->1. If firewall (e.g. UFW) is enabled, ensure incoming traffic is allowed on port 80 (or 81 if translating).
--->2. Port 80 is forwarded from your router/internet gateway to the Docker host.
--->3. Your ISP is not blocking port 80.
--->4. You are not behind ISP CG-NAT - Carrier-grade NATs use a shared IP.
--->5. If you just made a change, there could be delays due to caching. Try expert mode.
```

For port 443, the first line ends with `port 443 (or 444 if translating)`.

```txt
IP mismatch: WAN IP is 203.0.113.10 but domain resolves to 198.51.100.7
Calls to the domain should reach this server. Possible issues:
--->1. DNS A record points to wrong IP.
--->2. Cloudflare DNS record is orange-clouded (proxied).
--->3. If you just gray-clouded the DNS records, try changing your router's DNS to 1.1.1.1.
```

The IP addresses above are examples. Yours will differ.

When a check passes, you see a green line. Examples:

```txt
Port 80 resolves to 80
Domain resolves to: 203.0.113.10
YOUR_DOMAIN resolves to 203.0.113.10, matching WAN IP
Cloudflare proxy is disabled/gray-clouded for A record
```

When every check passes, the last lines are:

```txt
Domain Checks Passed: 8 / 8
All domain checks passed successfully
```

## Cause

Hybrid mode needs your domain to point at your public IP, and the internet must be able to reach your server on ports 80 and 443. A failed check means one of these is wrong:

- The router, firewall or ISP does not let traffic in.
- The Cloudflare DNS records are missing, wrong or proxied (orange cloud).
- Your DNS change has not spread yet.

## Before you start

Domain Checks only runs in Hybrid mode. In Local mode the menu row shows `NOT-REQUIRED` and you see **Domain Checks Not Required**. There is nothing to fix. To switch, see [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).

If you see **Requirements Not Met** instead of the checks, finish **Disclaimers**, **Username**, **Domain 1** (listed as `Domain Name` in the box) and **System Checks** first. See [Requirements Not Met](/getting-started/requirements-not-met/).

## Find your failed check

| Check | What it confirms | Message when it fails | Go to |
| --- | --- | --- | --- |
| 1 | Port 80 reaches your server from the internet | `Port 80 is not reachable from the internet` | [Ports 80 and 443](#fix-ports-80-and-443) |
| 2 | Port 443 reaches your server from the internet | `Port 443 is not reachable from the internet` | [Ports 80 and 443](#fix-ports-80-and-443) |
| 3 | Your domain has a DNS record | `Domain resolution failed (empty IP returned)` | [A record](#fix-the-a-record-checks-3-and-4) |
| 4 | Your domain points to this server's public IP | `IP mismatch: WAN IP is ... but domain resolves to ...` | [A record](#fix-the-a-record-checks-3-and-4) and [orange cloud](#fix-orange-cloud-records) |
| 5 | A made-up subdomain of your domain has a DNS record | `Subdomain resolution failed (empty IP returned)` | [Wildcard record](#fix-the-wildcard-record-checks-5-and-6) |
| 6 | That subdomain points to this server's public IP | `IP mismatch: WAN IP is ... but subdomain resolves to ...` | [Wildcard record](#fix-the-wildcard-record-checks-5-and-6) and [orange cloud](#fix-orange-cloud-records) |
| 7 | The A record is not proxied (gray cloud) | `Cloudflare proxy is probably enabled/orange-clouded for the A record (IPv6 detected)` | [Orange cloud](#fix-orange-cloud-records) |
| 8 | The wildcard CNAME is not proxied (gray cloud) | `Cloudflare proxy is probably enabled/orange-clouded for the CNAME record (IPv6 detected)` | [Orange cloud](#fix-orange-cloud-records) |

Before check 3, the terminal prints `Current WAN IP:` followed by your public IP. Compare it with your DNS records.

## DNS records Deployrr expects

Create these two records in Cloudflare for your domain. Both must be **DNS only** (gray cloud). Replace `YOUR_DOMAIN` with your domain. For the Cloudflare token and what orange and gray cloud mean, see [Cloudflare for Deployrr](/networking/cloudflare/).

| Type | Name | Content | Proxy status |
| --- | --- | --- | --- |
| A | `YOUR_DOMAIN` (or `@`) | Your public IP | DNS only (gray cloud) |
| CNAME | `*` | `YOUR_DOMAIN` (or `@`) | DNS only (gray cloud) |

To see both records created in Cloudflare, watch [Traefik 3 guide: Cloudflare DNS records at 7:35](https://youtu.be/KMZIyoZ3jWM?t=455) (manual Docker Compose setup; Deployrr does the rest for you).

The steps below are general Cloudflare guidance. Menu names can change.

1. Sign in to the Cloudflare dashboard.
2. Select your domain.
3. Open **DNS** > **Records**.
4. Add or edit the two records in the table.
5. For each record, click the orange cloud so it turns gray and reads **DNS only**.
6. Select **Save**.

Your public IP is the address the internet sees for your home or server. The terminal shows it as `Current WAN IP`. A home IP can change. If yours does, the A record needs updating when it does. [DDNS Updater](/apps/ddns-updater/) can do that for you.

## Fix ports 80 and 443

You see `Port 80 is not reachable from the internet` or `Port 443 is not reachable from the internet`. The terminal lists five likely causes. Work through them in order.

1. **Firewall on the server.** If you turned on a firewall such as UFW, allow incoming traffic on the port. On a VPS, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/). Some hosting providers also have a firewall in their web panel. Open ports 80 and 443 there too.
2. **Router port forward.** This is general router guidance. Menus differ by brand. Log in to your router and forward the port to your Docker host's LAN IP. Either pair passes the check: 80 to 80 and 443 to 443, or 80 to 81 and 443 to 444. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/) for which forward each mode needs, and [Forward the right router ports](/networking/port-forwarding/) for the steps and an outside test. On success, the green line tells you which forward it saw: `Port 80 resolves to 80` or `Port 80 resolves to 81`, and `Port 443 resolves to 443` or `Port 443 resolves to 444`. To see a router port forward set up, watch [Deployrr 5 walkthrough: Port forwarding at 38:18](https://youtu.be/rdqbAr0TFnQ?t=2298) (shows Deployrr v5; menus differ in v6). For a written guide, see [UDMS part 18: Setting up port forwarding](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding) (manual setup).
3. **ISP blocks port 80.** Some home ISPs block port 80. Ask your ISP, or check your account page. If they block it, you can't finish Hybrid mode on that connection without their help.
4. **ISP CG-NAT.** Carrier-grade NAT means many customers share one public IP. Port forwards on your router then do nothing. Signs are that your router's WAN address differs from `Current WAN IP`, or starts with `100.64` to `100.127`. This is general networking guidance. To check for CG-NAT and pick a fix, see [Behind CG-NAT](/networking/cg-nat/). For background, see [UDMS part 18: CG-NAT](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#CG-NAT) (manual setup).
5. **Recent change.** If you just changed a rule, wait a minute and run the checks again.

:::note
If the port is forwarded but nothing on the server uses it yet, the check still passes and shows `Port 80 resolves to 80`.
:::

### "Something is already listening on it"

You see:

```txt
Port 80 is reachable but something is already listening on it
Ensure that port 80 is free and nothing is listening on it.
```

or the same for port 443. Your port forward works, but another program already uses the port. See [Rerunning Domain Checks after Traefik is running](#rerunning-domain-checks-after-traefik-is-running) if Traefik is the program.

1. Stop the other program that uses the port, then rerun **Domain Checks**.
2. If you know what you are doing, use the [EXPERT mode override](#override-a-check-with-expert-mode).

### "Could not complete port 80 check"

You see:

```txt
Could not complete port 80 check. API may be unavailable.
```

or the same for port 443. Deployrr got an answer it does not recognise.

1. Make sure the server has internet access.
2. Wait a few minutes.
3. Run **Domain Checks** again.
4. If it keeps failing and you know your ports are open, use the [EXPERT mode override](#override-a-check-with-expert-mode).

## Fix the A record (checks 3 and 4)

**Check 3** fails with `Domain resolution failed (empty IP returned)`. The terminal adds `Possible causes: Missing DNS A record, DNS propagation pending, or domain name typo.`

1. Check the domain in **Domain 1** for typos. Select **Domain 1** to change it.
2. Add the A record from [DNS records Deployrr expects](#dns-records-deployrr-expects).
3. If you just added it, wait a few minutes and rerun.

**Check 4** fails with `IP mismatch: WAN IP is ... but domain resolves to ...`. The domain points at a different IP than your public IP. The terminal lists three causes:

1. **DNS A record points to wrong IP.** Edit the A record so its content is the `WAN IP` shown in the message.
2. **Cloudflare DNS record is orange-clouded (proxied).** Turn the cloud gray. See [Fix orange cloud records](#fix-orange-cloud-records).
3. **You just gray-clouded the records.** See [DNS cache and waiting](#dns-cache-and-waiting).

If the IP after `resolves to` is your server's LAN IP, the server uses a local DNS server with a rewrite for your domain, such as Pi-hole. See [Do the rewrite after Domain Checks](/networking/local-dns-rewrites/#do-the-rewrite-after-domain-checks).

## Fix the wildcard record (checks 5 and 6)

**Check 5** fails with `Subdomain resolution failed (empty IP returned)`. The terminal adds `Possible cause: Missing wildcard (*) DNS CNAME record or propagation pending.` Deployrr tries a random name, such as `abcdefgh.YOUR_DOMAIN`. It only works if the wildcard record exists.

1. Add a CNAME record named `*` that points to `YOUR_DOMAIN` (or `@`). See [DNS records Deployrr expects](#dns-records-deployrr-expects).
2. Set it to DNS only (gray cloud).
3. Wait a few minutes and rerun.

**Check 6** fails with `IP mismatch: WAN IP is ... but subdomain resolves to ...`. The terminal lists two causes:

1. **Cloudflare wildcard CNAME is orange-clouded (proxied).** Turn the cloud gray.
2. **You just gray-clouded the records.** See [DNS cache and waiting](#dns-cache-and-waiting).

If check 6 still fails, check that the A record has the right IP first. The wildcard follows the A record.

## Fix orange cloud records

An orange cloud means Cloudflare sits between the internet and your server. Deployrr needs your real IP, so both records must be gray.

Look for the `IP mismatch` message first. An orange-clouded record usually makes check 4 (A record) or check 6 (wildcard CNAME) fail with the `IP mismatch: WAN IP is ... but ... resolves to ...` error, and the run stops there. The IP after `resolves to` is not yours.

You only see these two messages if you override check 4 or 6 in EXPERT mode:

```txt
Cloudflare proxy is probably enabled/orange-clouded for the A record (IPv6 detected)
Cloudflare proxy is probably enabled/orange-clouded for the CNAME record (IPv6 detected)
```

Fix for all of them:

1. Open the Cloudflare dashboard and select your domain.
2. Open **DNS** > **Records**.
3. Find the A record for your domain and the `*` CNAME record.
4. Click the orange cloud on each so it turns gray and reads **DNS only**.
5. Select **Save**.
6. Wait a few minutes, then run **Domain Checks** again.

## DNS cache and waiting

Right after you turn a cloud gray, your router or network can still hand out the old answer.

Try these, in order. The router steps are general guidance. Menus differ by brand.

1. Wait 5 to 10 minutes. New DNS records can take time to spread. Some take longer.
2. Run **Domain Checks** again.
3. If it still fails, change the DNS server in your router to `1.1.1.1`, as the terminal suggests. Save it and rerun.
4. When the checks pass, you can put your usual DNS server back.

## Rerunning Domain Checks after Traefik is running

Once Traefik is up, a rerun of **Domain Checks** always fails at port 80 with:

```txt
Port 80 is reachable but something is already listening on it
```

Any program on ports 80 or 81 (or 443 or 444) causes this, and Traefik uses them.

When you select **Domain Checks** while it shows `DONE`, Deployrr first asks:

```txt
It appears that Domain Checks were already completed.
If you want to redo it, press Y/y to continue or any other key to go back:
```

If you press `Y`, `DONE` is cleared. A failed rerun then leaves it at `NOT DONE`.

:::caution
Do not rerun **Domain Checks** once it shows `DONE` and Traefik is running. Press any key other than `Y` to go back. If you must rerun, use the EXPERT override below.
:::

## Override a check with EXPERT mode

If you know a failed check is wrong, you can override it. Turn on [EXPERT mode](/getting-started/expert-mode/) first.

1. In Deployrr, open **Settings**.
2. Select **Mode**. Its description reads `Toggle Deployrr Mode - NORMAL`.
3. Read the box. It says `Deployrr Mode: Expert mode ENABLED` and `USE AT YOUR OWN RISK`.
4. Run **Prerequisites** > **Domain Checks** again.
5. When a check fails, you see `Expert mode enabled. Do you want to override (Y/y)?:`.
6. Type `Y`. You see a line such as `Port 80 check overridden.`. The run continues.

If you answer anything else, you see `Override skipped. Re-run checks when ready.` and the run stops. This stop line shows on the port and IP checks. Not every check prints it.

Every check offers the override in EXPERT mode, not only the port checks. An overridden check counts as passed, so you can see `Domain Checks Passed: 8 / 8` even though a check failed.

:::caution
Overriding hides real problems. Your apps may still not open from the internet. When you are done, select **Settings** > **Mode** again to switch back to NORMAL.
:::

## Run the checks again

1. From the main menu, select **Prerequisites**.
2. Select **Domain Checks**.
3. If you see `It appears that Domain Checks were already completed.`, read [the warning above](#rerunning-domain-checks-after-traefik-is-running) before you press `Y`.
4. Read each check as it runs.

To see the checks run, watch [Deployrr 5 walkthrough: Domain Checks at 41:34](https://youtu.be/rdqbAr0TFnQ?t=2494) (shows Deployrr v5; menus differ in v6).

## Check it worked

The checks end with:

```txt
Domain Checks Passed: 8 / 8
All domain checks passed successfully
```

In the **Prerequisites** menu, **Domain Checks** now reads `DONE`. If a check fails, the menu row reads `IP and Domain Checks - NOT DONE`. Fix the cause shown in the error and run it again.

You can then continue with [Set up Traefik](/reverse-proxy/traefik-setup/). If Traefik staging fails later even though the checks passed, see [Traefik staging fails with unable to obtain ACME certificate on OPNsense](/networking/opnsense-conflict/) and [read the Traefik logs](/reverse-proxy/check-traefik-logs/).
