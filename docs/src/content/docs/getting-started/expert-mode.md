---
title: "EXPERT mode (Settings > Mode): which checks it overrides and the risks"
sidebar:
  order: 9
  label: EXPERT mode
description: Turn Deployrr EXPERT mode on and off, see which three checks it lets you override, and learn the risks before you answer Y to an override question.
type: guide
tags:
  - install
  - domain
  - traefik
  - host
applies_to: v6.0+
related:
  - getting-started/domain-checks-failed
  - reverse-proxy/certificate-errors
  - docker/no-internet-in-containers
  - getting-started/prerequisites
  - networking/opnsense-conflict
last_reviewed: 2026-11-11
status: current
old_paths: ["/using-deployrr/expert-mode"]
sources: []
videos:
  - id: rdqbAr0TFnQ
    start: 4995
    title: "Deployrr 5 walkthrough: Settings menu, Mode and EXPERT mode"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 2481
    title: "Deployrr 5 walkthrough: Domain Checks in Hybrid mode"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
---

EXPERT mode lets you override a few checks that Deployrr runs and that failed. This guide shows how to turn it on and off, which checks it covers, and what can go wrong if you override a check that was right.

## Overview

Deployrr has two modes, **NORMAL** and **EXPERT**. NORMAL is the default. In NORMAL mode, a failed check stops the step. You must fix the cause.

EXPERT mode does not skip anything by itself. When a check fails, Deployrr asks if you want to override that one check. You decide each time. If you answer no, the step stops, just as it does in NORMAL mode.

In NORMAL mode, many failures end with this line:

```txt
If you know what you are doing, you may override this error by turning on EXPERT mode in Settings menu.
```

When port 80 or 443 is already in use, the line also says "or if a previously running Traefik instance is listening on port 80" (or 443). Some failures print no hint at all, but EXPERT mode still offers the override for them.

The mode applies only to the checks listed in [Which checks you can override](#which-checks-you-can-override). Nothing else in Deployrr changes.

:::caution
EXPERT mode is for when you are sure a check is wrong. An overridden check that was really failing causes later steps to fail. Fix the cause first when you can.
:::

## Turn EXPERT mode on

1. Start Deployrr.
2. Open **Settings**.
3. Select **Mode**. Its line reads `Toggle Deployrr Mode - NORMAL`.
4. Read the **Deployrr Mode** box. It says "Expert mode ENABLED" and "USE AT YOUR OWN RISK".
5. Select **OK**.

The **Settings** menu line now reads `Toggle Deployrr Mode - EXPERT`. The title of the main menu shows `Mode: EXPERT`.

Deployrr remembers the mode. It stays on until you turn it off, even after you close and restart Deployrr.

To see the Mode setting and what EXPERT mode is for, watch [Deployrr 5 walkthrough: Settings menu and EXPERT mode at 1:23:15](https://youtu.be/rdqbAr0TFnQ?t=4995) (shows Deployrr v5; menus and steps differ in v6).

## Turn EXPERT mode off

1. Open **Settings**.
2. Select **Mode**. Its line reads `Toggle Deployrr Mode - EXPERT`.

No box appears. The line switches back to `NORMAL`, and the main menu title shows `Mode: NORMAL`.

Turn EXPERT mode off when you finish the step you needed it for. That way a failed check stops you the next time, instead of asking.

You do not need a license to switch the mode.

## What you see when a check fails

In EXPERT mode, most overridable checks print the error and then ask in the terminal:

```txt
Expert mode enabled. Do you want to override (Y/y)?:
```

- Type `Y` or `y` and press Enter to override that one check. Deployrr prints a line that says the check was overridden, such as `Port 80 check overridden.`, and carries on.
- Type anything else to stop. The port 80 and port 443 checks (not reachable, or already listening) then print `Override skipped. Re-run checks when ready.`. The other checks stop without that line. The step stops either way.

The internet check in **Packages** is different. It shows a box and asks you to choose **Yes** or **No**.

An override covers one check, one time. The next failed check asks again.

## Which checks you can override

Only three places in Deployrr offer an override.

### Packages: internet connectivity check

In **Prerequisites** > **Packages**, Deployrr checks that the server has internet. If it fails, you see a box titled **Internet Connectivity Check Failed**.

- In NORMAL mode, the box ends with "Tip: Enable EXPERT mode in Settings to override this check."
- In EXPERT mode, the box says "EXPERT MODE: You can override this check if you are certain you have internet connectivity." and asks "Do you want to override and continue?".

If you choose **Yes**, you see "Internet connectivity check overridden in EXPERT mode." and **Packages** counts as done.

On Debian 12, the box adds a note about losing internet after this step, in both modes. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/) for the fix and for how to test the connection before you override.

Override this one only when the server really has internet. If it does not, the packages are not installed and later steps fail.

### Domain Checks (Hybrid mode only)

In **Prerequisites** > **Domain Checks**, each failed check can be overridden one by one:

| Check that failed | Message you see |
| --- | --- |
| Port 80 | `Port 80 is not reachable from the internet`, `Port 80 is reachable but something is already listening on it`, or `Could not complete port 80 check. API may be unavailable.` |
| Port 443 | The same three messages for port 443. |
| Domain has no DNS record | `Domain resolution failed (empty IP returned)` |
| Domain points to a different IP | `IP mismatch: WAN IP is ... but domain resolves to ...` |
| Wildcard subdomain has no DNS record | `Subdomain resolution failed (empty IP returned)` |
| Wildcard subdomain points to a different IP | `IP mismatch: WAN IP is ... but subdomain resolves to ...` |
| Orange cloud on the A record | `Cloudflare proxy is probably enabled/orange-clouded for the A record (IPv6 detected)` |
| Orange cloud on the CNAME record | `Cloudflare proxy is probably enabled/orange-clouded for the CNAME record (IPv6 detected)` |

An overridden check counts as passed. So you can see `Domain Checks Passed: 8 / 8` even though a check failed. If you answer no to a question, **Domain Checks** stays `NOT DONE`.

For what each check means and how to fix the cause, see [Domain Checks failed](/getting-started/domain-checks-failed/).

Cases where an override makes sense:

- The outside port-check website is down, so you see `Could not complete port 80 check. API may be unavailable.`, and you know your ports are open.
- You changed a DNS record a few minutes ago and the old answer is still cached.
- You already run Traefik on ports 80 and 443, so the port check finds it listening.
- You turned the orange cloud on purpose.

:::caution
Do not rerun **Domain Checks** after Traefik is running. The rerun fails at port 80 with `Port 80 is reachable but something is already listening on it`, because Traefik is using the port. [Domain Checks failed](/getting-started/domain-checks-failed/#rerunning-domain-checks-after-traefik-is-running) tells you to press any key other than `Y` when it asks to redo the checks. EXPERT mode is the only way past that failure. Only use it if you really need to rerun them.

A rerun can also stop whatever listens on ports 80 and 443, even when you override. If you rerun, restart Traefik afterwards with `sudo docker restart traefik` (or your Nginx Proxy Manager container), then check that your apps open.
:::

### Traefik Staging and Production: DNS error in the log

While **Staging** or **Production** runs, Deployrr watches the Traefik log. If it finds a DNS problem, it shows:

```txt
Cannot get ACME client get directory. Possible DNS server issue.
Check the DNS servers on your router. Confirm if the Docker host has internet access.
```

In EXPERT mode, it then asks `Expert mode enabled. Do you want to override (Y/y)?:`. If you type `Y`, it prints `Overridden.` and carries on.

The override does not fix DNS. Deployrr checks the log about every 20 seconds, so while the same line is in the log, the question can come back again and again. Fix DNS instead. See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/) and [Traefik staging fails with unable to obtain ACME certificate on OPNsense](/networking/opnsense-conflict/).

## Checks EXPERT mode does not change

EXPERT mode has no effect on anything else in Deployrr. These work the same in both modes:

- **System Checks**.
- License checks.
- The **Requirements Not Met** box. See [Requirements Not Met](/getting-started/requirements-not-met/).
- The checks that run when you install an app.

## Risks

An override hides a failing check. It does not fix it. Later steps then hit the same problem in a harder place.

- **Internet check overridden, no internet.** Packages are missing, so later steps fail.
- **Port or DNS check overridden, but the port or record is wrong.** Traefik cannot get certificates. Your apps do not open from the internet.
- **Domain Checks shows 8 / 8 after an override.** The result looks fine, but a check still failed.

Follow this order:

1. Read the error and the causes the terminal lists.
2. Fix the cause when you can.
3. Run the step again in NORMAL mode.
4. Turn on EXPERT mode only when you know the check is wrong.
5. Turn it off again when the step is done.

## Check it worked

1. Open **Settings**. The **Mode** line reads `Toggle Deployrr Mode - NORMAL`.
2. Look at the title of the main menu. It reads `Mode: NORMAL`.

## Next steps

If you overrode a check, test the result with the step that comes next. For Domain Checks, continue with Traefik in [Prerequisites, step by step](/getting-started/prerequisites/).

## Related

- [Domain Checks failed](/getting-started/domain-checks-failed/): fix each Domain Check, and see the override in context.
- [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/): the Traefik DNS error and its override.
- [No internet on the server or in containers after setup](/docker/no-internet-in-containers/): fix the internet check before you override it.
- [Prerequisites, step by step](/getting-started/prerequisites/): where Packages and Domain Checks sit.
- [Traefik staging fails with unable to obtain ACME certificate on OPNsense](/networking/opnsense-conflict/): the router cause of the DNS error.
