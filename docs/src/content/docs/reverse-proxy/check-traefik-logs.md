---
title: Read the Traefik logs
description: Find the Traefik log files, follow them live, spot certificate and routing errors, and change how much detail Traefik logs.
type: how-to
tags:
  - traefik
  - logs
  - remote-access
  - shell
apps:
  - traefik
  - dozzle
  - traefik-error-log
  - traefik-access-log
applies_to: v6.0+
related:
  - using-deployrr/bash-aliases
  - apps/home-assistant-behind-traefik
  - using-deployrr/change-hostname
  - apps/theme-park-configuration
  - support/discord
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/traefik/check-traefik-logs"]
sources: []
---

Traefik is the reverse proxy that sends web traffic to your apps. When an app does not load, or a certificate fails, the Traefik logs usually say why. This page shows where the logs are, how to read them, and how to make them more or less detailed.

## Before you start

- Deployrr is installed and Traefik is set up.
- You can open a terminal on your server.
- Optional: turn on the [Deployrr bash aliases](/using-deployrr/bash-aliases/). This page uses `cdd`, `traefiklogs` and `dcrec`.

## Steps

### Find the log files

Traefik writes two files:

| File | What is in it |
| --- | --- |
| `traefik.log` | Traefik's own messages: startup, certificate requests, routing and middleware errors. |
| `access.log` | One line for each request that Traefik handled, filtered by status code. |

They are in the `logs/HOSTNAME/traefik/` folder inside your Docker folder. `HOSTNAME` is your server's hostname. Deployrr recommends `/home/YOUR_USER/docker` as the Docker folder, but you choose it in **Prerequisites**, so yours may be elsewhere.

1. Go to your Docker folder.

   ```bash
   cdd
   ```

   Without the aliases, use `cd YOUR_DOCKER_FOLDER`. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder.

2. List the log files.

   ```bash
   ls -lh logs/$HOSTNAME/traefik/
   ```

   Bash fills in `$HOSTNAME` for you. You should see `traefik.log` and `access.log`.

:::note
Deployrr sets Traefik to write its messages to the two files above. Read the files, not `docker logs traefik`.
:::

When you run **Proxy** > **Traefik** > **Production** (Setup Traefik Production), Deployrr renames the old log to `traefik_staging.log` and starts a new `traefik.log`. Nothing else trims or rotates these files, so they can grow large over time.

### Follow the Traefik log live

1. Run the alias:

   ```bash
   traefiklogs
   ```

   Or run the same thing yourself from your Docker folder:

   ```bash
   tail -f logs/$HOSTNAME/traefik/traefik.log
   ```

2. Open the app or page that fails in your browser.
3. Watch for new lines.
4. Press `Ctrl+C` to stop.

If you see `Permission denied`, put `sudo` in front of the command.

### Follow the access log live

There is no alias for the access log. Run this from your Docker folder:

```bash
tail -f logs/$HOSTNAME/traefik/access.log
```

Traefik keeps access log lines in a buffer of 100 lines before it writes them to the file. New requests can show up late, or in a batch. Load the page a few times if nothing appears.

The access log skips most successful requests. It records status codes 204 to 299, 400 to 499 and 500 to 599. A normal `200` response is not logged.

### What to look for

Search the log for a word instead of reading everything. For example, to show the last certificate lines:

```bash
grep -i acme logs/$HOSTNAME/traefik/traefik.log | tail -n 20
```

| Where | What you see | What it usually means |
| --- | --- | --- |
| `traefik.log` | Lines with `acme` or `certificate` and the word `error` | Traefik could not get or renew a Let's Encrypt certificate. Check your domain and Cloudflare details. |
| `traefik.log` | A message that a middleware does not exist or cannot be found | A router uses a middleware name that Traefik does not know. Check the spelling in the app's Traefik file. |
| `traefik.log` | Messages about a router or service for one app | The app's Traefik file has a mistake. See the note below the table. |
| `access.log` | A `404` for your app's address | Traefik found no router for that address. The address in the app's Traefik file does not match what you typed. See [Open a dashboard at your root domain](/reverse-proxy/point-root-domain-to-a-dashboard/) for how the `rule:` line sets the address. |
| `access.log` | A `502` for your app's address | Traefik found the router but could not reach the app. The app may be stopped, still starting, or on the wrong port. |

Each app's Traefik file is `app-APPNAME.yml` in the `appdata/traefik3/rules/HOSTNAME/` folder inside your Docker folder. A few apps, such as Traefik itself, OAuth and Authelia, use labels in their file in `compose/HOSTNAME/` instead.

:::caution[Browser says the certificate is not trusted]
Until you run **Proxy** > **Traefik** > **Production** (Setup Traefik Production), Traefik gets test certificates from the Let's Encrypt staging server. Browsers don't trust them. That is expected. Run the production setup when your test works.
:::

For a `502`, check that the app is running:

```bash
dpss
```

### Change the log level

Deployrr starts Traefik with the log level set to `DEBUG`. This is the most detailed level. It is good while you set things up, but it makes `traefik.log` grow fast. During the production setup, Deployrr shows a message that it is changing the level to `INFO`. Check your file to confirm: the steps below show where the level is set.

The levels, from most to least detail, are `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` and `PANIC`.

1. Open Traefik's compose file in your Docker folder:

   ```bash
   cdd
   nano compose/$HOSTNAME/traefik.yml
   ```

   If your editor is not nano, use the one you prefer.

2. Find the line that starts with `- --log.level=`. It has a note after it that lists the levels:

   ```yaml
   - --log.level=DEBUG
   ```

3. Change only the level word, for example `DEBUG` to `INFO`. Leave the note after it as it is.

4. Save the file.
5. Recreate Traefik so it reads the change:

   ```bash
   dcrec traefik
   ```

   Without the aliases, run:

   ```bash
   sudo docker compose --profile all -f YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate --remove-orphans traefik
   ```

   Replace `YOUR_DOCKER_FOLDER` and `HOSTNAME` with your own values.

Recreating Traefik drops web connections for a few seconds.

### Read the logs in Dozzle

If you prefer a web page to the terminal, you can read both files in Dozzle. These apps need all **Prerequisites** steps done and **Proxy** > **Traefik** > **Production** (Setup Traefik Production) done. If something is missing, Deployrr shows a **Requirements Not Met** box that lists it.

Install each app from **Apps** > **Browse Apps**: select the app, then choose **Install**.

1. Install **Dozzle** if you do not have it yet. It needs the **Socket Proxy** app.
2. Install **Traefik Error Log for Dozzle**. It shows `traefik.log`.
3. Install **Traefik Access Log for Dozzle**. It shows `access.log`.
4. Open Dozzle and pick `traefik-error-log` or `traefik-access-log` in the container list.

When an install finishes, Deployrr shows `Traefik Error Logs should now be available on Dozzle.` or `Traefik Access Logs should now be available on Dozzle.`

## Check it worked

- `ls -lh logs/$HOSTNAME/traefik/` lists both files, and `traefik.log` is not empty.
- `traefiklogs` prints lines, and new lines appear when you open one of your apps.
- After a log level change, `traefik.log` grows more slowly or fills with fewer detail lines.

## Common problems

- **The folder or files are missing.** Check that you used your own hostname and Docker folder. If you changed the hostname, see [Change the hostname](/using-deployrr/change-hostname/).
- **`traefiklogs` says `command not found`.** Turn on the aliases, then open a new terminal. See [Bash aliases](/using-deployrr/bash-aliases/).
- **The log is too big to read.** Lower the log level, or search with `grep` as shown above.
- **The log shows `unable to obtain ACME certificate`.** See [Traefik staging fails on OPNsense](/networking/opnsense-conflict/). The steps there help with any firewall that filters DNS.
- **Traefik never starts and Deployrr says `Timed out. Could not verify if Traefik is running.`** The log file may not exist yet. See [Deployrr times out waiting for a container to start](/docker/waiting-for-container/).

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): every shortcut, including `traefiklogs`, `dcrec` and `dpss`.
- [Home Assistant behind Traefik](/apps/home-assistant-behind-traefik/): put an app that runs elsewhere behind Traefik and fix a 400 error.
- [Change the hostname](/using-deployrr/change-hostname/): what to do when your hostname, and so your log folder, changes.
