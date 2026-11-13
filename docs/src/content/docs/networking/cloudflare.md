---
title: "Cloudflare for Deployrr: API token, Zone ID, orange vs gray cloud"
sidebar:
  order: 1
  label: Cloudflare for Deployrr
description: Set up Cloudflare for Deployrr in one place. Create the API token, find the Zone ID, choose gray or orange cloud, and change the token later.
type: guide
tags:
  - domain
  - traefik
  - remote-access
applies_to: v6.0+
apps:
  - traefik
  - ddns-updater
related:
  - reverse-proxy/traefik-setup
  - getting-started/domain-checks-failed
  - reverse-proxy/certificate-errors
  - apps/ddns-updater
  - reverse-proxy/simple-vs-advanced-mode
further_reading:
  - title: "UDMS part 18: Cloudflare DNS API token for Traefik (manual setup)"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Cloudflare_DNS_API_Token_Secret"
videos:
  - id: KMZIyoZ3jWM
    start: 533
    title: "Traefik 3 guide: create the Cloudflare scoped API token"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 455
    title: "Traefik 3 guide: Cloudflare A record and wildcard CNAME"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: rdqbAr0TFnQ
    start: 2504
    title: "Deployrr 5 walkthrough: Domain Checks and gray-cloud records"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

Deployrr uses Cloudflare in three places: the API token, the Zone ID and your DNS records. This page puts them together and links to the detail pages. Use it to set Cloudflare up the first time, or to change the token later.

## What Deployrr needs from Cloudflare

You only need Cloudflare in **Hybrid** setup mode, where you reach apps from the internet through Traefik. Hybrid mode and Traefik Preparation need a Plus or Pro license. In **Local** mode you need none of this. See [Setup Mode: Local or Hybrid](/getting-started/setup-mode/).

For Hybrid you need:

- A domain from any registrar, with its nameservers moved to Cloudflare.
- A Cloudflare API token. Traefik uses it to get your HTTPS certificates. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- Two DNS records for your domain. See [DNS records Deployrr expects](#dns-records-deployrr-expects).
- Your Zone ID, only if you install [DDNS Updater](/apps/ddns-updater/).

## Create the API token

1. In Cloudflare, open **My Profile** > **API Tokens**.
2. Create a user token. Do not use an Account API Token.
3. Add these two permissions:
   - Zone / Zone / Read
   - Zone / DNS / Edit
4. Limit the zone resources to your domain, or include all zones.
5. Copy the token. Cloudflare shows it once.

You paste it into **Proxy** > **Traefik** > **Preparation**.

To see the token made step by step, watch [Traefik 3 guide: create the Cloudflare scoped API token at 8:53](https://youtu.be/KMZIyoZ3jWM?t=533) (manual Docker Compose setup; Deployrr does the rest for you). For how Traefik uses it, see [UDMS part 18: Cloudflare DNS API token for Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Cloudflare_DNS_API_Token_Secret) (manual setup).

### What Deployrr checks

Preparation asks Cloudflare if the token is active. It does not check the permissions or the zone. This changes what you see:

| Message | What it means |
| --- | --- |
| `Cloudflare API token is valid` | Cloudflare says the token is active. The permissions may still be wrong. |
| `Invalid Cloudflare token. Please check token permissions.` | Cloudflare says the token is not active. You pasted it wrong, or it expired or was deleted. Check that you pasted the whole token. |

If the token is correct, check that your server can reach the internet, then run Preparation again. Keep a copy of your old token until the new one works, so you can paste it back if needed.

A token with too few permissions passes Preparation. It fails later, when Traefik asks for a certificate in Staging, for example with `Failed to find zone`. See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/#fix-the-cloudflare-token).

## Find your Zone ID

Only DDNS Updater asks for it. The box reads "Cloudflare Domain Zone ID (get it from the Cloudflare Domain Overview tab)".

1. In Cloudflare, select your domain.
2. Open the **Overview** tab.
3. Scroll to the **API** section, usually on the right.
4. Copy the **Zone ID**.

Cloudflare moves menus now and then, so look for the label if the layout differs.

## DNS records Deployrr expects

Hybrid mode needs an A record for your domain that points to your public IP, and a wildcard CNAME (`*`) that points to your domain. Both must be gray cloud. **Domain Checks** tests them. The records, the eight checks and the fix for each are on [Domain Checks failed](/getting-started/domain-checks-failed/#dns-records-deployrr-expects).

If your home IP changes, [DDNS Updater](/apps/ddns-updater/) keeps the A record current.

## Orange cloud or gray cloud

The cloud icon next to a DNS record shows its proxy status.

- **Gray cloud (DNS only).** Your domain resolves to your real public IP. Visitors connect straight to your router, so you must forward the ports. See [Forward the right router ports](/networking/port-forwarding/).
- **Orange cloud (proxied).** Your domain resolves to a Cloudflare address, and Cloudflare sits between the visitor and your server.

To see why proxied records fail the checks, watch [Deployrr 5 walkthrough: Domain Checks and gray-cloud records at 41:44](https://youtu.be/rdqbAr0TFnQ?t=2504) (shows Deployrr v5; menus differ in v6).

Deployrr is set up for gray cloud:

- **Domain Checks** compares your public IP with what your domain resolves to. An orange record fails the checks with `IP mismatch`. See [Fix orange cloud records](/getting-started/domain-checks-failed/#fix-orange-cloud-records).
- DDNS Updater writes `"proxied": true` into its settings, which turns the A record orange. Change it to `false`. See [Set the record to gray cloud](/apps/ddns-updater/#set-the-record-to-gray-cloud).
- Simple and Advanced mode do not depend on the cloud color. The mode decides which router ports you forward and whether an app is Internal, External or Both. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/). Internal apps open from home through your server's LAN IP, which comes from your router or from a [local DNS rewrite](/networking/local-dns-rewrites/).

:::note
The Hybrid box lists "Cloudflare SSL Mode set to FULL". Cloudflare's SSL/TLS mode applies to proxied (orange) records. Deployrr's setup uses gray cloud. If you proxy a record yourself, the mode must be **Full**.
:::

## Where Deployrr keeps the token

| Where | What it holds | Who reads it |
| --- | --- | --- |
| `secrets/cf_dns_api_token` in your Docker folder | The token. Only root can read it (mode 600). | Traefik, as a Docker secret. |
| `appdata/ddns-updater/config.json` | A copy of the token and the Zone ID. DDNS Updater gets them when you install it. | DDNS Updater. It does not read the secret file. |
| `secrets/cf_zone_identifier` | The Zone ID you typed at the DDNS Updater install. | Only the DDNS Updater install. |

Changing the secret file does not change `config.json`. After you change the token, update both. Keep the token private and don't paste it in Discord or a support post. See [What is in your Docker folder](/using-deployrr/docker-folder-layout/).

## Change or rotate the token

Do this when the token leaks, expires or has the wrong permissions. The steps below keep Traefik and your certificates in place.

:::caution
Keep the old token active until the last step. If you revoke it first, Traefik and DDNS Updater lose access to Cloudflare.
:::

1. In Cloudflare, create a new token as in [Create the API token](#create-the-api-token). Leave the old one alone.
2. Go to your Docker folder:

   ```bash
   cdd
   ```

   Without the Deployrr bash aliases, use `cd YOUR_DOCKER_FOLDER`. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

3. Back up the secret and the DDNS Updater file. Skip the second line if you don't use DDNS Updater.

   ```bash
   sudo cp -p secrets/cf_dns_api_token ~/cf_dns_api_token.bak
   sudo cp -p appdata/ddns-updater/config.json ~/ddns-config.json.bak
   ```

   Both copies hold the old token. Delete them when you finish.

4. Write the new token into the secret. Pick one way.

   - **Pro license:** open **Tools** > **Secrets Editor**, select `cf_dns_api_token`, choose **Edit**, replace the text with the new token and save. See [Edit a secret with the Secrets Editor](/using-deployrr/edit-env-and-secrets/#edit-a-secret-with-the-secrets-editor).
   - **Any license:** run this and paste the token when asked. Typing is hidden. The file keeps only the token, with no line break after it, the same way Deployrr writes it.

     ```bash
     read -rsp "New token: " NEW_TOKEN; echo
     printf '%s' "$NEW_TOKEN" | sudo tee secrets/cf_dns_api_token >/dev/null
     unset NEW_TOKEN
     ```

5. Recreate Traefik so it reads the new secret:

   ```bash
   dcrec traefik
   ```

   Or use **Tools** > **Stack Manager** > **Recreate** and pick Traefik. Recreate needs a Basic, Plus or Pro license. Your apps are unreachable by domain for a short time while Traefik restarts.

6. If you use DDNS Updater, put the new token in `config.json`. Follow [Edit config.json](/apps/ddns-updater/#edit-configjson). In step 4 there, replace the value on the `"token"` line. The restart in that section applies it.
7. Test the new token against your domain. Replace `YOUR_DOMAIN` with your domain. The token goes to `curl` through a pipe, so it doesn't show in the process list:

   ```bash
   { printf 'Authorization: Bearer '; sudo cat secrets/cf_dns_api_token; } | curl -s -H @- "https://api.cloudflare.com/client/v4/zones?name=YOUR_DOMAIN"
   ```

   The reply starts with `"success":true` and lists your zone. This proves the token is active and can read the zone. Traefik only uses the DNS Edit permission when it next asks for a certificate, so check the Traefik log at your next renewal. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).
8. When both work, open **My Profile** > **API Tokens** in Cloudflare and delete the old token.
9. Delete the two `.bak` copies from your home folder.

### If you use Preparation instead

You can paste a new token into **Proxy** > **Traefik** > **Preparation**. The form fills in your username and token. Leave the password blank to keep it. You then press `Y` or `y` at the "already done" warning.

Use this only when Traefik has not got a working certificate yet, as in [Fix the Cloudflare token](/reverse-proxy/certificate-errors/#fix-the-cloudflare-token). Preparation stops if Traefik or any other program uses ports 80, 81, 443 or 444. By then it has already saved the new token and login details, and the menu shows Preparation as not done. Preparation does not restart Traefik; Staging starts it. It also writes seven Traefik rules files again and drops a CrowdSec line you added to a chain. See [What can overwrite or delete your changes](/using-deployrr/what-overwrites-your-changes/). It does not update DDNS Updater.

DDNS Updater's reinstall writes a fresh `config.json` and loses your `"proxied": false` edit. Edit the file instead. See [After a reinstall](/apps/ddns-updater/#after-a-reinstall).

## Add a second domain to the token

Traefik has one Cloudflare token. It is in `secrets/cf_dns_api_token`, and Traefik uses it for every certificate it requests. When you serve a second domain on the same server, that token must cover both zones. How to route the second domain is on [Add a second domain](/reverse-proxy/point-root-domain-to-a-dashboard/#add-a-second-domain).

Edit the token you already have. Don't swap it for a new token that covers only the new domain. Traefik would then fail to renew your first domain's certificate.

1. In Cloudflare, open **My Profile** > **API Tokens**.
2. Find the token Deployrr uses and choose **Edit**.
3. Keep the two permissions, Zone / Zone / Read and Zone / DNS / Edit.
4. Under **Zone Resources**, add the new domain's zone next to the first one, or include all zones.
5. Save the token. Don't choose **Roll**. Roll makes a new token value and stops the old one working.

Editing changes what the token may do, not its value, so nothing changes in Deployrr. You don't edit the secret or recreate Traefik.

To check it, run the test from step 7 of [Change or rotate the token](#change-or-rotate-the-token) once with each domain. Both replies should start with `"success":true` and list the zone. A reply for your first domain proves Traefik's saved token still works. Traefik uses the DNS Edit permission when it requests the new domain's first certificate. If that fails, [the Traefik logs](/reverse-proxy/check-traefik-logs/) show why.

If you would rather make a new token, give it both zones, then follow [Change or rotate the token](#change-or-rotate-the-token).

## Check it worked

- `https://traefik.YOUR_DOMAIN` still opens with a padlock. Replace `YOUR_DOMAIN` with your domain.
- `dps` shows `traefik` as `Up`. Without the aliases, run `sudo docker ps`.
- `dlogs ddns-updater` shows no Cloudflare error, if you use DDNS Updater.
