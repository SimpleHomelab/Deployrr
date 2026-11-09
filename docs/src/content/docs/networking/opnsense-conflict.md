---
title: "Traefik staging fails with unable to obtain ACME certificate on OPNsense"
sidebar:
  label: Certificate fails behind OPNsense
description: Traefik staging stops with "Unable to obtain ACME certificate" behind OPNsense. Exempt your Docker host from the DNS redirect rule and try again.
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
  - OPNsense redirects all DNS on your LAN to its own resolver
related:
  - reverse-proxy/check-traefik-logs
  - apps/pi-hole-port-53-conflict
  - getting-started/quick-start
  - reverse-proxy/restrict-access-using-ip-allowlist
  - networking/ufw-firewall-vps
last_reviewed: 2026-11-09
status: current
old_paths: ["/networking/opnsense-conflict"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1362110724666556597" }
---

Some people who use OPNsense, a UDM or another advanced firewall as their router cannot finish the Traefik staging step. On OPNsense the cause is a DNS redirect rule. This page shows how to exempt your Docker host from it, and how to find the exact error if that is not enough.

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

On OPNsense, the cause is a DNS redirect rule. Many people set OPNsense to redirect (hijack) every DNS request on the LAN to its own resolver. Then Traefik's questions to `1.1.1.1` and `1.0.0.1` never leave your network. Your local resolver answers instead, and the check fails.

On other advanced firewalls, ad blocking and "suspicious activity" blocking can do the same, as Deployrr's hint says.

## Fix on OPNsense: exempt the Docker host from the DNS redirect

Keep the redirect for the rest of your network. Only the server that runs Traefik skips it.

1. In OPNsense, go to **Firewall** > **Aliases** and add an alias:
   - **Type**: Host(s).
   - **Name**: any name you like, for example `dns_bypass_hosts`.
   - **Content**: the IP address of your Docker host, the server that runs Deployrr and Traefik.

   Save, then select **Apply**.

2. Go to **Firewall** > **NAT** > **Destination NAT** (on some versions **Port Forward**). Find the rule that redirects DNS requests (port 53) to your local resolver. It often has a description like "Redirect DNS requests to internal DNS resolver". It catches port 53 traffic on one of your LAN or VLAN interfaces and sends it to `127.0.0.1`, on the port your local resolver listens on.

   For example, on an interface named `CommonDNS`, the destination reads `! CommonDNS network` with port 53. That means "DNS going anywhere outside this network". `CommonDNS` is only an example name. Your rule's description, interface and redirect port depend on how you set it up.

3. Open that rule. Set **Source** to the alias from step 1 and tick **Invert** for the source. The source then shows as `! dns_bypass_hosts` (with your alias name). This means "every device except the Docker host".

   <!-- TODO: screenshot of the OPNsense DNS redirect rule with the inverted source alias (Anand to add). -->

4. Save the rule, then select **Apply**.
5. Run the staging step again (see [Try staging again](#try-staging-again)).

Menu names can differ a little between OPNsense versions.

:::caution
Changing firewall and DNS rules can cut off DNS for other devices on your network. Write down the old setting first, change one rule at a time and test after each change.
:::

## Fix on other firewalls

1. Follow Deployrr's hint. In your firewall, turn off ad blocking and suspicious activity blocking for your Deployrr server, or add the server to a bypass list.
2. Look for any rule that redirects or blocks DNS (port 53) from your Deployrr server, and exempt the server from it, as in the OPNsense steps.
3. Run the staging step again (see [Try staging again](#try-staging-again)).

## Find the real error

If staging still fails, these checks show what is going on.

1. Read the ACME error in the Traefik log. Run this from your Docker folder:

   ```bash
   grep -i acme logs/$HOSTNAME/traefik/traefik.log | tail -n 20
   ```

   Bash fills in `$HOSTNAME` for you. Staging clears this log each time it starts, so check it right after a failed attempt. Look for words such as `propagation`, `timeout`, `NXDOMAIN` or `authorization`. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) if you need help finding the file.

2. Check that your server can ask `1.1.1.1` directly. Replace `YOUR_DOMAIN` with your own domain:

   ```bash
   dig TXT _acme-challenge.YOUR_DOMAIN @1.1.1.1
   ```

   If `dig` is not installed, install it with `sudo apt install dnsutils`. You should get a reply with a status such as `NOERROR` or `NXDOMAIN`, and the `SERVER:` line should show `1.1.1.1`. If it times out, the DNS traffic is being blocked. Run the same test with `@1.0.0.1`, the second server Traefik uses.

3. Compare with a query to your normal DNS server:

   ```bash
   dig TXT _acme-challenge.YOUR_DOMAIN
   ```

   If this works and the `@1.1.1.1` query fails, your router treats outbound DNS differently from normal lookups.

4. In OPNsense, also check **Services** > **Unbound DNS** for blocklist settings, and your firewall rules for anything that blocks outbound port 53 for your server.

### Try staging again

Run **Proxy** > **Traefik** > **Staging** again. Deployrr warns that a previous setup may be overwritten. Press `Y` to continue. If it asks "Reuse existing staging SSL certificate?", press any key other than `Y` so you get a fresh attempt.

### Other staging errors

Deployrr can stop staging with other messages. Each has its own fix:

- **Failed to find zone**: the Cloudflare API token is wrong. It needs Zone / Zone / Read and Zone / DNS / Edit.
- **Could not find DNS validation TXT record**: delete all `_acme-challenge` TXT records in Cloudflare and try again.
- **Cannot get ACME client get directory. Possible DNS server issue.**: check the DNS servers on your router, and check that the server has internet access. The checks in [Find the real error](#find-the-real-error) help here too.
- **Getting certificate failed with error 429**: Let's Encrypt's rate limit. Wait 24 hours before you try again.

### If nothing works: use Tailscale

If you only need to reach your apps from outside your home, you can use Tailscale instead of Traefik certificates. Tailscale is in Deployrr under **Apps** > **Browse Apps**. It needs the network adapter set up first (**System** > **Network Adapter**).

During the install, the **Tailscale - Configuration** box asks for your Tailscale auth key. Deployrr then recommends that you turn off MagicDNS in the Tailscale admin console. Otherwise, the Docker host can lose internet access. After install, you open apps at `TAILSCALE-IP:PORT`.

This avoids the problem. It does not fix it. You still do not get HTTPS addresses on your own domain.

## Check it worked

1. `dig TXT _acme-challenge.YOUR_DOMAIN @1.1.1.1` gets a reply from `1.1.1.1` and does not time out.
2. **Proxy** > **Traefik** > **Staging** finishes without the error.
3. The Traefik log has no new `unable to obtain ACME certificate` lines.

When staging works, a browser shows a "Not Secure" warning for your domain. Deployrr says this is normal for a staging certificate. The next step is **Proxy** > **Traefik** > **Production**. See [Set up Traefik](/reverse-proxy/traefik-setup/) for the whole setup.

## Related

- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where `traefik.log` is and how to search it.
- [Pi-hole port 53 conflict](/apps/pi-hole-port-53-conflict/): another DNS problem on port 53.
- [Quick start](/getting-started/quick-start/): the setup steps that come before Traefik staging.
- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): firewall problems on a cloud server.
