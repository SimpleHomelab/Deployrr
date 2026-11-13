---
title: Read the Traefik logs
description: Find and follow the Traefik logs, spot certificate and routing errors, change the log level, and keep the files from filling your disk.
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
  - host/change-hostname
  - apps/theme-park-configuration
  - support/discord
further_reading:
  - title: "UDMS part 18: Learn to read Traefik logs"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Learn_to_Read_Logs"
videos:
  - id: KMZIyoZ3jWM
    start: 2723
    title: "Traefik 3 guide: Following traefik.log during staging"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 2114
    title: "Traefik 3 guide: Traefik logging options and log level"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-13
status: current
old_paths: ["/traefik/check-traefik-logs"]
sources: []
sidebar:
  order: 8
---

Traefik is the reverse proxy that sends web traffic to your apps. When an app does not load, or a certificate fails, the Traefik logs usually say why. This page shows where the logs are, how to read them, how to make them more or less detailed, and how to keep them from filling your disk.

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

When you run **Proxy** > **Traefik** > **Production** (Setup Traefik Production), Deployrr renames the old log to `traefik_staging.log` and starts a new `traefik.log`. Deployrr doesn't trim or rotate these files, so they can grow large over time. See [Keep the log files small](#keep-the-log-files-small) below, and [Free up disk space used by Docker](/docker/free-disk-space/) for other things that fill your disk.

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

To see the log followed during a first certificate request, watch [Traefik 3 guide: following traefik.log during staging at 45:23](https://youtu.be/KMZIyoZ3jWM?t=2723) (manual Docker Compose setup; Deployrr does these steps for you).

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
| `traefik.log` | Lines with `acme` or `certificate` and the word `error` | Traefik could not get or renew a Let's Encrypt certificate. See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/). |
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

For a checklist that starts from the `404`, `502` or `Gateway Timeout` you see, read [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/).

To understand how the logs and common errors fit together, read [UDMS part 18: Learn to read Traefik logs](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Learn_to_Read_Logs) (manual setup; folder names differ from Deployrr).

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

### Keep the log files small

Check how much space the logs use. Run this from your Docker folder:

```bash
sudo du -sh logs/$HOSTNAME/traefik/*
```

The `dlogsize` alias doesn't help here. It shows the size of Docker's own container logs, not these files.

The log files grow in different ways:

- `traefik.log`: Traefik's own documentation says it starts a new file when this one reaches 100 MB. It keeps every old file, compressed, in the same folder. The `DEBUG` level fills it fastest, so [change the log level](#change-the-log-level) to `INFO` first.
- `access.log`: Traefik never starts a new file for this one. It grows until you rotate it.
- `traefik_staging.log`: the old log from before the production setup. Nothing writes to it any more. Once your apps open with a trusted certificate, you can delete it with `sudo rm logs/$HOSTNAME/traefik/traefik_staging.log`. You can't get it back after that.

#### Keep fewer old copies of traefik.log

1. Back up Traefik's compose file, then open it:

   ```bash
   cdd
   cp compose/$HOSTNAME/traefik.yml compose/$HOSTNAME/traefik.yml.bak
   nano compose/$HOSTNAME/traefik.yml
   ```

2. Below the `- --log.level=` line, add two lines with the same indent:

   ```yaml
         - --log.maxSize=50 # MB per file
         - --log.maxBackups=3 # old files to keep
   ```

3. Save the file and recreate Traefik. This drops web connections for a few seconds.

   ```bash
   dcrec traefik
   ```

4. Check that Traefik is running with `dps`. If it keeps restarting, put the backup back with `cp compose/$HOSTNAME/traefik.yml.bak compose/$HOSTNAME/traefik.yml` and recreate Traefik with `dcrec traefik`.

Some Deployrr actions write a fresh `traefik.yml`, for example deleting Traefik in Stack Manager and installing it again. If that happens, add the two lines again. See [What overwrites or deletes your changes](/using-deployrr/what-overwrites-your-changes/).

#### Rotate access.log with logrotate

`logrotate` is a standard Linux tool that renames and compresses log files on a schedule. It runs once a day on Ubuntu and Debian. Traefik's documentation says it opens `access.log` again when it gets the `USR1` signal. The rule below sends that signal after each rotation.

:::caution
You add a file to `/etc/logrotate.d/`, which runs as root every day. Use the full path to your own `access.log`, and run the test in step 3 before you rely on it. To undo, delete the file you created. Old rotated copies stay in the folder; delete them if you want.
:::

1. Find the full path of the file. Run this from your Docker folder:

   ```bash
   realpath logs/$HOSTNAME/traefik/access.log
   ```

2. Create the rule file:

   ```bash
   sudo nano /etc/logrotate.d/traefik-access
   ```

   Paste this. Replace the first line with the path from step 1:

   ```text
   /home/YOUR_USER/docker/logs/HOSTNAME/traefik/access.log {
       su root root
       weekly
       maxsize 50M
       rotate 4
       compress
       delaycompress
       missingok
       notifempty
       postrotate
           docker kill --signal=USR1 traefik > /dev/null 2>&1 || true
       endscript
   }
   ```

   This keeps four old files. It starts a new file each week, or sooner if the file is over 50 MB when logrotate runs.

3. Test the rule without changing anything:

   ```bash
   sudo logrotate -d /etc/logrotate.d/traefik-access
   ```

   The output should name your `access.log` and show no `error:` lines.

4. Optional: rotate once now to see it work:

   ```bash
   sudo logrotate -f /etc/logrotate.d/traefik-access
   ls -lh logs/$HOSTNAME/traefik/
   ```

   You should see `access.log.1` next to a new `access.log`. Open one of your apps a few times. The new `access.log` should get lines again, after the 100-line buffer fills.

If the new `access.log` stays empty while the old one keeps growing, Traefik didn't get the signal. Recreate Traefik with `dcrec traefik` so it opens the new file.

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
- After a test rotation, `access.log.1` exists and the new `access.log` gets lines.

## Common problems

- **The folder or files are missing.** Check that you used your own hostname and Docker folder. If you changed the hostname, see [Change the hostname](/host/change-hostname/).
- **`traefiklogs` says `command not found`.** Turn on the aliases, then open a new terminal. See [Bash aliases](/using-deployrr/bash-aliases/).
- **The log is too big to read.** Lower the log level, or search with `grep` as shown above.
- **The logs fill your disk.** See [Keep the log files small](#keep-the-log-files-small).
- **The log shows a certificate error.** See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/) for the fix for each error. For `unable to obtain ACME certificate` behind a firewall that filters DNS, also see [Traefik staging fails on OPNsense](/networking/opnsense-conflict/).
- **Traefik never starts and Deployrr says `Timed out. Could not verify if Traefik is running.`** The log file may not exist yet. See [Deployrr times out waiting for a container to start](/docker/waiting-for-container/).
