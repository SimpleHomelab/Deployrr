---
title: "Traefik can't get a Let's Encrypt certificate"
description: "Fix Traefik Staging or Production failing to get a Let's Encrypt certificate: Cloudflare token, DNS, TXT records and rate limits."
type: troubleshooting
tags:
  - traefik
  - domain
  - logs
apps:
  - traefik
applies_to: v6.0+
symptoms:
  - "Unable to obtain ACME certificate"
  - "Failed to find zone"
  - "Possibly wrong Cloudflare API token. Ensure that your Scoped API Token has Zone/Zone/Read and Zone/DNS/Edit privileges."
  - "Could not find DNS validation TXT record"
  - "Cannot get ACME client get directory. Possible DNS server issue."
  - "Getting certificate failed with error 429"
  - "You probably hit Let's Encrypt rate limit. Wait at least 24 hours and retry."
  - "Staging certificate could not be verified. Try re-running Deployrr."
  - "Real LetsEncrypt certificate could not be verified."
  - "Real LetsEncrypt certificate could not be verified after restart."
  - "Invalid Cloudflare token. Please check token permissions."
  - "Port 443 is occupied. This is needed for Traefik."
  - Traefik Staging or Production stops with a red error
  - The browser still shows Not Secure after Traefik Production
related:
  - reverse-proxy/check-traefik-logs
  - networking/opnsense-conflict
  - reverse-proxy/traefik-setup
  - networking/domain-checks-failed
  - using-deployrr/diagnostics
further_reading:
  - title: "UDMS part 18: Cloudflare DNS API token for Traefik (manual setup)"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Cloudflare_DNS_API_Token_Secret"
videos:
  - id: KMZIyoZ3jWM
    start: 441
    title: "Traefik 3 guide: Cloudflare DNS records and scoped API token"
    note: "Manual Docker Compose setup. You create the Cloudflare token the same way in Deployrr v6."
  - id: rdqbAr0TFnQ
    start: 2594
    title: "Deployrr 5 walkthrough: Traefik Staging and the Not Secure warning"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: KMZIyoZ3jWM
    start: 2632
    title: "Traefik 3 guide: Staging first, then Production, and Let's Encrypt rate limits"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-11
status: current
old_paths: []
sources: []
---

You run **Proxy** > **Traefik** > **Staging** or **Production**. Deployrr stops with a red error and your apps get no working HTTPS certificate. This page lists each error, what causes it and how to fix it.

For the normal Staging and Production steps, see [Set up Traefik](/reverse-proxy/traefik-setup/).

:::note
Staging and Production need these first: **Prerequisites** done, the Socket Proxy app running, Setup Mode set to Hybrid, **Preparation** done and a Plus or Pro license. Production also needs Staging done and Traefik running. If one is missing, you see a **Requirements Not Met** box instead. See [Requirements Not Met](/using-deployrr/requirements-not-met/), [Licenses](/getting-started/licenses/), [Setup Mode](/getting-started/setup-mode/) and [Socket Proxy](/docker/socket-proxy/).
:::

## Symptoms

Deployrr shows `Monitoring traefik logs for progress (this can take up to 15 min)...`. It then stops with one of these errors:

```txt
Failed to find zone
```

```txt
Unable to obtain ACME certificate
```

```txt
Could not find DNS validation TXT record
```

```txt
Cannot get ACME client get directory. Possible DNS server issue.
```

```txt
Getting certificate failed with error 429
```

Each of these five comes with a hint line. For example, `Failed to find zone` adds "Possibly wrong Cloudflare API token. Ensure that your Scoped API Token has Zone/Zone/Read and Zone/DNS/Edit privileges."

`Unable to obtain ACME certificate` adds two hints:

```txt
Possibly wrong Cloudflare API key. Ensure that your Scoped API Token has Zone/Zone/Read and Zone/DNS/Edit privileges.
If you have an advanced firewall (UDM, OPNsense, etc.), disable Ad Blocking and suspicious activity blocking or bypass it for the Docker host.
```

Three later messages mean the certificate never showed up:

```txt
Staging certificate could not be verified. Try re-running Deployrr.
```

```txt
Real LetsEncrypt certificate could not be verified.
```

```txt
Real LetsEncrypt certificate could not be verified after restart.
```

You may also see one of these:

- The progress never ends. Deployrr keeps printing a joke or tip between dots (`... text ...`) every 20 seconds.
- Your browser shows a "Not Secure" or "certificate not trusted" warning.

## Cause

Traefik asks Let's Encrypt for a certificate that covers your domain and all its subdomains. To prove the domain is yours, it adds a temporary TXT record in Cloudflare and asks the public DNS servers `1.1.1.1` and `1.0.0.1` to confirm they can see it. Any break in that chain stops the certificate. The usual breaks are:

- The Cloudflare API token is wrong or has too few permissions.
- The domain is not in the Cloudflare account that the token belongs to.
- An old `_acme-challenge` TXT record is still in Cloudflare, or DNS lookups from your server are blocked.
- Your router or firewall blocks or redirects DNS from your server.
- You hit a Let's Encrypt rate limit.

## Fix

### 1. Find the error

1. Go to your Docker folder:

   ```bash
   cdd
   ```

   Without the Deployrr bash aliases, use `cd YOUR_DOCKER_FOLDER`. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

2. Search the Traefik log for the known errors:

   ```bash
   grep -iE "failed to find zone|No TXT record|server misbehaving|unable to obtain ACME|error: 429|too many certificates" logs/$HOSTNAME/traefik/traefik.log | tail -n 20
   ```

   Bash fills in `$HOSTNAME` for you. If you see `Permission denied`, put `sudo` in front of the command. This is general Linux advice. For more on the log, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

   Staging clears the log each time it starts, so run this right after a failed try. Production moves the old log to `traefik_staging.log` and starts a fresh `traefik.log`. After a Production failure, look in both files.

3. Match what you found to this table. The log has Traefik's own wording, not Deployrr's.

   | Deployrr shows | Search the log for | Go to |
   | --- | --- | --- |
   | `Failed to find zone` | `failed to find zone` | [Fix the Cloudflare token](#fix-the-cloudflare-token), then [Fix the domain or zone](#fix-the-domain-or-zone) |
   | `Unable to obtain ACME certificate` | `Unable to obtain ACME certificate` | [Fix the Cloudflare token](#fix-the-cloudflare-token), then [Fix DNS problems](#fix-dns-problems) |
   | `Could not find DNS validation TXT record` | `No TXT record found at _acme-challenge` | [Fix old or unreachable TXT records](#fix-old-or-unreachable-txt-records) |
   | `Cannot get ACME client get directory` | `server misbehaving` | [Fix DNS problems](#fix-dns-problems) |
   | `Getting certificate failed with error 429` | `error: 429` or `too many certificates` | [Wait out a rate limit](#wait-out-a-rate-limit) |
   | The browser says Not Secure | Nothing to search for | [Fix the browser warning](#fix-the-browser-warning) |
   | The progress never ends, or the error is not in the list | Lines with `acme` or `error` | [If the progress never ends](#if-the-progress-never-ends) |

### Fix the Cloudflare token

`Failed to find zone` and `Unable to obtain ACME certificate` both point at the token first.

1. In Cloudflare, open **My Profile** > **API Tokens**. Use a user token, not an Account API Token.
2. Check that the token has both of these permissions:
   - Zone / Zone / Read
   - Zone / DNS / Edit
3. Check that the token can reach your domain's zone. This is general Cloudflare advice, and the wording of the setting depends on your Cloudflare dashboard. In the token's zone resources, include your domain or all zones.
4. If you need a new token, create it and copy it. To see the token made in Cloudflare, watch [Traefik 3 guide: Cloudflare DNS records and scoped API token at 7:21](https://youtu.be/KMZIyoZ3jWM?t=441) (manual Docker Compose setup; the Cloudflare steps are the same in v6).
5. Stop Traefik:

   ```bash
   sudo docker stop traefik
   ```

   Preparation checks that ports 443, 444, 80 and 81 are free. A running Traefik holds them. If you skip this step, Preparation fails with `Port 443 is occupied. This is needed for Traefik.` and goes back to not done. Traefik usually still runs after a failed Staging. Staging starts it again.

   Your apps can't be reached by their domain names until Staging finishes.

6. In Deployrr, open **Proxy** > **Traefik** > **Preparation**.
7. Select **Yes** in the first box.
8. If you see "It appears that Traefik preparation was already done. If you proceed, previous setup may be overwritten.", press `Y`.
9. In the **Traefik Secrets** form, paste the token into **Cloudflare DNS API Token**. Leave the **Basic Auth Username** as it is. Leave the **Basic Auth Password** blank to keep the old one. If you type a new password, Deployrr asks for **Confirm Basic Auth Password:**.
10. Wait for "Traefik Preparation completed successfully".
11. Go to [Run Staging again](#run-staging-again).

:::note
Preparation shows "Cloudflare API token is valid" when Cloudflare says the token is active. It does not check the permissions or the zone. A token with too few permissions passes Preparation and fails later in Staging.

If Preparation shows `Invalid Cloudflare token. Please check token permissions.`, Cloudflare says the token is not active. Check that you pasted the whole token, and that it is not expired or deleted.

To swap the token on a setup that already works, see [Change or rotate the token](/networking/cloudflare/#change-or-rotate-the-token).
:::

To understand how Traefik uses the token, read [UDMS part 18: Cloudflare DNS API token for Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Cloudflare_DNS_API_Token_Secret) (manual setup; for background only, not as steps to follow in Deployrr).

### Fix the domain or zone

`Failed to find zone` also happens when the token works but Cloudflare has no zone for your domain.

1. Open the Cloudflare account that owns the token.
2. Check that your domain is listed there and is active. This is general Cloudflare advice.
3. In Deployrr, open **Prerequisites** and check **Domain 1**. It must be the same domain, with no typo.
4. If the domain sits in a different Cloudflare account, make the token in that account. Then follow [Fix the Cloudflare token](#fix-the-cloudflare-token) to load it.
5. Go to [Run Staging again](#run-staging-again).

### Fix old or unreachable TXT records

You see:

```txt
Could not find DNS validation TXT record
```

Deployrr's hint says to delete `_acme_challenge` records. The real record name has a hyphen: `_acme-challenge`.

Two causes are common:

- A left-over `_acme-challenge` record from an earlier failed or interrupted run. This is general Cloudflare and Let's Encrypt knowledge.
- Blocked DNS lookups. Traefik can't see the TXT record because DNS questions from your server are blocked or redirected. See [Fix DNS problems](#fix-dns-problems).

To remove old records:

1. In Cloudflare, select your domain.
2. Open **DNS** > **Records**.
3. Find every TXT record whose name starts with `_acme-challenge`.
4. Delete each of them. Leave your other TXT records alone.
5. Wait a minute.
6. Go to [Run Staging again](#run-staging-again).

### Fix DNS problems

You see:

```txt
Cannot get ACME client get directory. Possible DNS server issue.
```

Deployrr adds: "Check the DNS servers on your router. Confirm if the Docker host has internet access."

The Traefik compose file that Deployrr creates uses `1.1.1.1` and `1.0.0.1` for the DNS check. Traefik asks them directly. It does not use the DNS server your router hands out. A router or firewall that redirects or blocks DNS from your server makes the check fail. It can also show up as `Unable to obtain ACME certificate` or as a missing TXT record.

Traefik also waits about 2 minutes before it checks DNS. A long wait with no error is normal.

1. Check that the server reaches the internet.
2. Check the DNS settings on your router.
3. Look for a rule that redirects or blocks DNS (port 53) from your Docker host. OPNsense, UDM and other advanced firewalls are the usual cause. Follow [Traefik staging fails on OPNsense](/networking/opnsense-conflict/), which also shows how to test `1.1.1.1` from your server.
4. If the server lost DNS or internet after Prerequisites, see [No internet on the server or in containers after setup](/docker/no-internet-in-containers/).
5. Go to [Run Staging again](#run-staging-again).

Deployrr says you can override this error by turning on [EXPERT mode](/using-deployrr/expert-mode/) in **Settings** > **Mode**. The box then reads "Expert mode ENABLED". The override does not fix DNS. Deployrr checks the log about every 20 seconds, so while the same line is in the log, the override question (`Expert mode enabled. Do you want to override (Y/y)?:`) can come back again and again. Fix DNS instead.

### Wait out a rate limit

You see:

```txt
Getting certificate failed with error 429
```

Deployrr adds: "You probably hit Let's Encrypt rate limit. Wait at least 24 hours and retry."

Let's Encrypt limits how many certificates and failed validations you can have in a period. The next point is general Let's Encrypt knowledge. Some limits reset within hours. Others take days. See the [Let's Encrypt rate limits](https://letsencrypt.org/docs/rate-limits/) page, which Deployrr also points to.

1. Stop running Staging and Production. Each new try can count against the limit.
2. Wait at least 24 hours.
3. Fix any other cause on this page first, so the next try does not fail again.
4. Go to [Run Staging again](#run-staging-again).

To stay under the limit:

- Always run **Staging** before **Production**. Staging uses the Let's Encrypt test server.
- When Production shows its "already done" warning and then asks "Reuse existing production SSL certificate?", press `Y` at both if the certificate works. Deployrr then skips asking for a new one.

### Check the clock

This is general Linux advice. Deployrr does not check it. If the server's date and time are far off, certificate checks can fail.

1. Check the clock:

   ```bash
   timedatectl
   ```

2. Look for `System clock synchronized: yes`.
3. If it says `no`, turn on time sync:

   ```bash
   sudo timedatectl set-ntp true
   ```

4. Go to [Run Staging again](#run-staging-again).

### Fix the browser warning

After **Staging**, your browser shows "Not Secure". Deployrr says this is normal, because Staging gets a test certificate. Browsers do not trust it. To see this happen, watch [Deployrr 5 walkthrough: Traefik Staging and the Not Secure warning at 43:14](https://youtu.be/rdqbAr0TFnQ?t=2594) (shows Deployrr v5; menus differ in v6).

1. Run **Proxy** > **Traefik** > **Production**.
2. Wait for "Traefik Production Setup completed successfully".
3. Reload the page in a private window. This is general browser advice. It avoids a cached warning.

If Production fails, use the table in [Find the error](#1-find-the-error).

### If the progress never ends

Deployrr stops on the errors in the table. For anything else, it keeps waiting. It has no time-out at this step. The message says "up to 15 min", but it does not stop on its own.

If it runs well past 15 minutes, read the log yourself.

1. Open a second terminal on your server.
2. Follow the log:

   ```bash
   traefiklogs
   ```

   Without the aliases, run this from your Docker folder:

   ```bash
   tail -f logs/$HOSTNAME/traefik/traefik.log
   ```

3. Look for lines with `acme` or `error`. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).
4. If you can't tell the cause, ask on [Discord](/support/discord/) and share the lines you found.

### Run Staging again

Run Staging again after each fix. If your error came from Production and Staging already worked, you can run only **Production** (step 6).

:::caution
Staging and Production replace your saved certificate file with an empty one before they ask for a new certificate. If a certificate works today, back it up first. If you already have a production certificate and press `Y` at the "already done" warning, Staging deletes it without asking. You then need Production again, and that counts against the Let's Encrypt limit.
:::

1. Only if your current certificate works: copy the certificate file. Run this from your Docker folder:

   ```bash
   sudo cp -p appdata/traefik3/acme/acme.json appdata/traefik3/acme/acme.json.bak
   ```

2. Open **Proxy** > **Traefik** > **Staging**.
3. If you see "It appears that Traefik Staging/Production was already done. If you proceed, previous setup may be overwritten.", press `Y`.
4. If you see "Reuse existing staging SSL certificate?", press any key except `Y` to get a fresh certificate.
5. Wait for "Traefik Staging Setup completed successfully".
6. Open **Proxy** > **Traefik** > **Production**.
7. If you see "It appears that Traefik Production was already done. If you proceed, previous setup may be overwritten.", press `Y` only if you want a new certificate. If you then see "Reuse existing production SSL certificate?", press `Y` to keep it, or any other key to get a new one.
8. Wait for "Traefik Production Setup completed successfully".

After a failed Staging, Deployrr usually starts fresh with no questions.

:::note
Running Staging after a Production run also marks Production as not done. Production is blocked until Staging finishes again. The **Requirements Not Met** box then says "Traefik Staging - Must be completed (Proxy menu)".
:::

## Check it worked

- Staging ends with "Traefik Staging Setup completed successfully". Production ends with "Traefik Production Setup completed successfully".
- `https://traefik.YOUR_DOMAIN` opens with a padlock after Production. Replace `YOUR_DOMAIN` with your domain.
- The search from [Find the error](#1-find-the-error) shows no new lines.

## Related

- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where `traefik.log` is and how to read it.
- [Traefik staging fails on OPNsense](/networking/opnsense-conflict/): fix certificate errors caused by a DNS redirect.
- [Set up Traefik](/reverse-proxy/traefik-setup/): the normal Preparation, Staging and Production steps.
- [Domain Checks failed](/networking/domain-checks-failed/): fix the DNS records and ports that Traefik needs.
- [Deployrr shows "Unhealthy - Issues detected"](/using-deployrr/diagnostics/): fix `acme.json` permission warnings.
