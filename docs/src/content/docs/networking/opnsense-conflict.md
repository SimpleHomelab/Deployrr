---
title: "Traefik staging fails with unable to obtain ACME certificate on OPNsense"
description: Traefik staging stops with "Unable to obtain ACME certificate" behind OPNsense or another advanced firewall. Find the real error and check DNS filtering.
type: troubleshooting
tags:
  - traefik
  - domain
  - firewall
  - logs
  - remote-access
applies_to: v6.0+
apps: [traefik, tailscale]
symptoms:
  - "Unable to obtain ACME certificate"
  - Traefik staging step fails even though the Cloudflare records and port forwards are correct
  - You use OPNsense, a UDM or another advanced firewall and no certificate is issued
  - "Cannot get ACME client get directory. Possible DNS server issue."
related:
  - reverse-proxy/check-traefik-logs
  - apps/pi-hole-port-53-conflict
  - getting-started/quick-start
  - reverse-proxy/restrict-access-using-ip-allowlist
last_reviewed: 2026-11-08
status: needs-review
old_paths: ["/networking/opnsense-conflict"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1362110724666556597" }
---

Some people who use OPNsense, a UDM or another advanced firewall as their router cannot finish the Traefik staging step. This page shows how to find the exact error and how to check the most likely cause: your router filtering or redirecting the server's DNS traffic.

## Symptoms

You run **Proxy** > **Traefik** > **Staging**. Deployrr shows "Monitoring traefik logs for progress (this can take up to 15 min)...", then stops with:

```txt
Unable to obtain ACME certificate
```

Deployrr adds two hints with it. One is about the Cloudflare API token. The other says: "If you have an advanced firewall (UDM, OPNsense, etc.), disable Ad Blocking and suspicious activity blocking or bypass it for the Docker host."

People on OPNsense have seen this even when all of these are true:

- Cloudflare has an A record for your domain that points to your public IP.
- Cloudflare has a wildcard CNAME record (`*.YOUR_DOMAIN`).
- Your port forwards are set up.
- Zenarmor is turned off. Turning it off did not help.

## Cause

Traefik gets certificates from Let's Encrypt with a DNS challenge. It adds a temporary TXT record in Cloudflare, then asks public DNS servers to confirm they can see it. In the Traefik compose file (`compose/HOSTNAME/traefik.yml` in your Docker folder), those servers are set to `1.1.1.1:53` and `1.0.0.1:53`. Traefik asks them directly, whatever DNS server your network normally hands out.

If your firewall blocks, filters or redirects that DNS traffic, the check fails. Ad blocking and "suspicious activity" blocking are the usual suspects, as Deployrr's hint says. The exact OPNsense setting behind the reports is not confirmed yet.

## Fix

1. Follow Deployrr's hint first. In your firewall, turn off ad blocking and suspicious activity blocking for your Deployrr server, or add the server to a bypass list. Then try staging again (step 7).

2. Read the ACME error in the Traefik log. Run this from your Docker folder:

   ```bash
   grep -i acme logs/$HOSTNAME/traefik/traefik.log | tail -n 20
   ```

   Bash fills in `$HOSTNAME` for you. Staging clears this log each time it starts, so check it right after a failed attempt. Look for words such as `propagation`, `timeout`, `NXDOMAIN` or `authorization`. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) if you need help finding the file.

3. Check that your server can ask `1.1.1.1` directly. Replace `YOUR_DOMAIN` with your own domain:

   ```bash
   dig TXT _acme-challenge.YOUR_DOMAIN @1.1.1.1
   ```

   If `dig` is not installed, install it with `sudo apt install dnsutils`. You should get a reply with a status such as `NOERROR` or `NXDOMAIN`, and the `SERVER:` line should show `1.1.1.1`. If it times out, the DNS traffic is being blocked. Run the same test with `@1.0.0.1`, the second server Traefik uses.

4. Compare with a query to your normal DNS server:

   ```bash
   dig TXT _acme-challenge.YOUR_DOMAIN
   ```

   If this works and the `@1.1.1.1` query fails, your router treats outbound DNS differently from normal lookups.

5. In OPNsense, look for rules that touch DNS from your Deployrr server. This is general advice, not something Deployrr checks. Menu names can differ between OPNsense versions.
   - Check **Firewall** > **NAT** > **Port Forward** for a rule that redirects port 53 to the router.
   - Check **Services** > **Unbound DNS** for DNSSEC, DNS over TLS and blocklist settings.
   - Check your firewall rules for anything that blocks outbound port 53 for your server.

6. Allow your Deployrr server to reach `1.1.1.1` and `1.0.0.1` on port 53, or exclude the server from the redirect rule. Run the `dig` test from step 3 again.

7. Run **Proxy** > **Traefik** > **Staging** again. Deployrr warns that a previous setup may be overwritten. Press `Y` to continue. If it asks "Reuse existing staging SSL certificate?", press any key other than `Y` so you get a fresh attempt.

:::caution
Changing firewall and DNS rules can cut off DNS for other devices on your network. Change one rule at a time and test after each change. Write down the old setting first.
:::

### Other staging errors

Deployrr can stop staging with other messages. Each has its own fix:

- **Failed to find zone**: the Cloudflare API token is wrong. It needs Zone / Zone / Read and Zone / DNS / Edit.
- **Could not find DNS validation TXT record**: delete all `_acme-challenge` TXT records in Cloudflare and try again.
- **Cannot get ACME client get directory. Possible DNS server issue.**: check the DNS servers on your router, and check that the server has internet access. Steps 3 to 6 above help here too.
- **Getting certificate failed with error 429**: Let's Encrypt's rate limit. Wait 24 hours before you try again.

### If nothing works: use Tailscale

If you only need to reach your apps from outside your home, you can use Tailscale instead of Traefik certificates. Tailscale is in Deployrr under **Apps** > **Browse Apps**. It needs the network adapter set up first (**System** > **Network Adapter**).

During the install, the **Tailscale - Configuration** box asks for your Tailscale auth key. Deployrr then recommends that you turn off MagicDNS in the Tailscale admin console. Otherwise, the Docker host can lose internet access. After install, you open apps at `TAILSCALE-IP:PORT`.

This avoids the problem. It does not fix it. You still do not get HTTPS addresses on your own domain.

## Check it worked

1. `dig TXT _acme-challenge.YOUR_DOMAIN @1.1.1.1` gets a reply from `1.1.1.1` and does not time out.
2. **Proxy** > **Traefik** > **Staging** finishes without the error.
3. The Traefik log has no new `unable to obtain ACME certificate` lines.

When staging works, a browser shows a "Not Secure" warning for your domain. Deployrr says this is normal for a staging certificate. The next step is **Proxy** > **Traefik** > **Production**.

If you find the OPNsense setting that caused it, please tell us on Discord so this page can name it.

## Related

- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where `traefik.log` is and how to search it.
- [Pi-hole port 53 conflict](/apps/pi-hole-port-53-conflict/): another DNS problem on port 53.
- [Quick start](/getting-started/quick-start/): the setup steps that come before Traefik staging.
