---
title: "Nextcloud says Access through untrusted domain"
sidebar:
  label: Nextcloud untrusted domain
description: Fix the Nextcloud "Access through untrusted domain" page on your Traefik subdomain or server IP by adding the address to trusted_domains.
type: troubleshooting
tags:
  - traefik
  - compose
  - app-networking
applies_to: v6.0+
symptoms:
  - Access through untrusted domain
  - Please contact your administrator. If you are an administrator, edit the "trusted_domains" setting in config/config.php
  - Nextcloud shows an untrusted domain page on https://nextcloud.YOUR_DOMAIN
  - Nextcloud shows an untrusted domain page on http://SERVER_IP:PORT
related:
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/stack-manager
  - reverse-proxy/app-404-or-502
  - apps/app-reference
  - using-deployrr/docker-folder-layout
further_reading:
  - title: Nextcloud admin manual, trusted domains and reverse proxy settings
    url: https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/reverse_proxy_configuration.html
videos: []
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

You installed Nextcloud with Deployrr. When you open it, you get a Nextcloud page about an untrusted domain instead of the login page. This page shows how to add your address to Nextcloud's list of allowed addresses.

## Symptoms

You open `https://nextcloud.YOUR_DOMAIN`, or `http://SERVER_IP:PORT`. Nextcloud shows this:

```txt
Access through untrusted domain
```

```txt
Please contact your administrator. If you are an administrator, edit the "trusted_domains" setting in config/config.php
```

## Cause

Nextcloud only answers on addresses in its `trusted_domains` setting. `localhost` always works. Behind Traefik, Nextcloud checks the address Traefik passes on to it, which is your subdomain.

Deployrr installs Nextcloud for you, with the admin user already set. There is no web setup page. The line `NEXTCLOUD_TRUSTED_DOMAINS` in `nextcloud.yml` only counts during that first install. After that, uncommenting it and recreating the container changes nothing. So your subdomain and your server IP may not be in the list.

On an installed Nextcloud, `OVERWRITEHOST` is the setting in `nextcloud.yml` that takes effect after a Recreate. Fix 2 below covers it.

If you use Nextcloud without Traefik, at `http://SERVER_IP:PORT`, read [Local installs without Traefik](#local-installs-without-traefik) too.

## Fix 1: add the addresses with occ (recommended)

`occ` is Nextcloud's command line tool. It changes the setting safely and takes effect at once. You don't need a restart.

1. See what Nextcloud trusts now:

   ```bash
   sudo docker exec --user www-data nextcloud php occ config:system:get trusted_domains
   ```

   It prints one address per line. The first line is index `0`. Count the lines to find the next free index. If you see `localhost` only, the next index is `1`.

2. Add your subdomain at the next free index. Replace `nextcloud.example.com` with your Nextcloud address, and `1` with your free index:

   ```bash
   sudo docker exec --user www-data nextcloud php occ config:system:set trusted_domains 1 --value=nextcloud.example.com
   ```

   Leave out `https://` and any port. Nextcloud ignores the port when it compares.

3. Run the command from step 1 again. Your subdomain should now be in the list.
4. Reload Nextcloud in your browser.

:::caution
If you use an index that is already in the list, the command replaces that entry. Run step 1 again before each add and pick a number that is not there.
:::

## Fix 2: set OVERWRITEHOST

This option makes Nextcloud trust every address and build all its links with your subdomain. It turns off Nextcloud's address check, so Fix 1 is the safer choice when you can use it. Use Fix 2 only if you reach Nextcloud through Traefik with your own domain.

1. Open `YOUR_DOCKER_FOLDER/compose/HOSTNAME/nextcloud.yml`. See [Docker folder layout](/using-deployrr/docker-folder-layout/) for both placeholders.
2. In the `environment` section, remove the `#` in front of `OVERWRITEHOST`:

   ```yaml
   - OVERWRITEHOST=$NEXTCLOUD_SUBDOMAIN.$DOMAINNAME_1
   ```

3. You can remove the `#` in front of `NEXTCLOUD_TRUSTED_DOMAINS` too. It does no harm, but it only matters on a fresh install.
4. Save the file.
5. Recreate Nextcloud. Go to **Tools** > **Stack Manager** > **Recreate** and pick `nextcloud`, not `nextcloud-mariadb` or `nextcloud-redis`. This needs a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/). If you set up the [Deployrr bash aliases](/using-deployrr/bash-aliases/), you can run this instead:

   ```bash
   dcrec nextcloud
   ```

   Without Stack Manager or the aliases, run this. Replace `YOUR_DOCKER_FOLDER` and `HOSTNAME` as in step 1:

   ```bash
   sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate nextcloud
   ```

   Start or restart doesn't read the changed file, so it is not enough. See [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/).

What this changes:

- Nextcloud accepts any address, so the untrusted page goes away.
- Nextcloud's links and redirects point to your subdomain, even when you start from another address.
- To undo it, put the `#` back and recreate Nextcloud. Then check with `sudo docker exec --user www-data nextcloud php occ config:system:get overwritehost`. If it still prints your subdomain, remove it with `sudo docker exec --user www-data nextcloud php occ config:system:delete overwritehost`.

## Local installs without Traefik

You can install Nextcloud without Traefik and open it at `http://SERVER_IP:PORT`. The port is `8081` unless you picked another one. Two things get in the way:

- Your server's IP address is not in `trusted_domains`. Add it with Fix 1, with your IP as the value, for example `--value=192.168.1.50`. Don't use Fix 2.
- `nextcloud.yml` has the line `- OVERWRITEPROTOCOL=https`. It makes Nextcloud build its links with `https`, but the port only speaks plain `http`. After you log in, you can land on an `https://SERVER_IP:PORT` address that doesn't load.

To switch Nextcloud to plain `http`:

1. Open `YOUR_DOCKER_FOLDER/compose/HOSTNAME/nextcloud.yml` and put a `#` in front of the line:

   ```yaml
   # - OVERWRITEPROTOCOL=https
   ```

2. Save the file and recreate Nextcloud as in Fix 2, step 5.
3. Check that the setting is gone:

   ```bash
   sudo docker exec --user www-data nextcloud php occ config:system:get overwriteprotocol
   ```

   If it still prints `https`, remove it:

   ```bash
   sudo docker exec --user www-data nextcloud php occ config:system:delete overwriteprotocol
   ```

If you add Traefik later, remove the `#` again and recreate Nextcloud.

## Check it worked

1. Open `https://nextcloud.YOUR_DOMAIN`, or `http://SERVER_IP:PORT` on a local install. You should see the Nextcloud login page.
2. Log in with the admin user from your install. Deployrr showed it at the end of the install.
3. Click around a few pages. The address bar should keep the address you opened.

## If it still fails

- **Same page, address looks wrong.** The address in the page's URL must match what you added, letter for letter. Compare it with `NEXTCLOUD_SUBDOMAIN` and `DOMAINNAME_1` in your `.env`. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
- **You open `http://SERVER_IP:PORT` and land on an `https` address that doesn't load.** With Traefik, use your subdomain instead. Without Traefik, see [Local installs without Traefik](#local-installs-without-traefik).
- **A different page, such as `404 page not found` or `Bad Gateway`.** The problem is in Traefik, not Nextcloud. See [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/).
- **A certificate warning on the subdomain.** See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/).

:::caution
You can also edit `YOUR_DOCKER_FOLDER/appdata/nextcloud/config/config.php` by hand. A typo there can stop Nextcloud from starting. Copy the file first, for example `sudo cp config.php config.php.bak` in that folder. The `occ` commands above are the safer way.
:::

## Related

- [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/): why a restart does not apply the change.
- [Stack Manager](/using-deployrr/stack-manager/): where Recreate lives.
- [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/): when the error page comes from Traefik.
- [App reference](/apps/app-reference/): Nextcloud's container name, port and helper containers.
