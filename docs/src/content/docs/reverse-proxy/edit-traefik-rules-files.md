---
title: Edit Traefik rules files safely
description: Edit a Traefik rules file or an app's Docker labels, add your own middleware or a Traefik plugin, and restore a file after a bad edit or overwrite.
type: how-to
tags:
  - traefik
  - compose
  - backups
applies_to: v6.0+
apps: [traefik]
related:
  - reverse-proxy/app-404-or-502
  - reverse-proxy/check-traefik-logs
  - using-deployrr/what-overwrites-your-changes
  - reverse-proxy/change-app-subdomain
  - reverse-proxy/traefikify
further_reading:
  - title: "UDMS part 18: Docker labels vs file provider"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Labels_vs_File_Provider
videos:
  - id: 6S9PwhAlZUs
    start: 693
    title: "Traefik 3 guide: edit an app's rules file (external app behind Traefik)"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: cUZ6kkum1pc
    start: 348
    title: "Traefik 3 guide: add a middleware file to the rules folder"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
sidebar:
  order: 10
---

Traefik reads two kinds of settings for your apps: rules files and Docker labels. This page shows which one an app uses, how to edit it, how to add your own middleware or a plugin, and how to go back after a bad edit.

## Before you start

- Traefik is set up and running. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- You have a terminal on your server. Commands start in your Docker folder. Run `cdd` to get there, or use `cd YOUR_DOCKER_FOLDER` and replace `YOUR_DOCKER_FOLDER` with your Docker folder path.
- `HOSTNAME` in a path is your server's hostname. In a command you can type `$HOSTNAME`.

## Rules files or labels

Most apps use a rules file. Five apps use labels instead.

| How the app is set up | Where it lives | Apps | After you edit |
| --- | --- | --- | --- |
| Rules file | `appdata/traefik3/rules/HOSTNAME/app-NAME.yml` | Every app you install behind Traefik, and every app you add with **Traefikify** | Nothing. Traefik applies a saved change by itself. |
| Docker labels | The `labels:` lines in `compose/HOSTNAME/NAME.yml` | Traefik, Authelia, Authentik, OAuth and TinyAuth | Recreate the app. |

For a container you added in `custom.yml`, you choose either way. See [Protect a custom.yml app with Traefik and a login](/reverse-proxy/custom-app-behind-traefik/).

Keep rules files directly in the rules folder. Traefik does not watch subfolders. See [Which files Traefik loads](/reverse-proxy/app-404-or-502/#which-files-traefik-loads).

To understand how the two differ, read [UDMS part 18: Docker labels vs file provider](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Labels_vs_File_Provider) (manual setup).

## Steps

### Edit a rules file

1. Copy the file to your home folder first. Replace `NAME` with the app's name.

   ```bash
   sudo cp appdata/traefik3/rules/$HOSTNAME/app-NAME.yml ~/app-NAME.yml.bak
   ```

   Keep copies outside the rules folder. Traefik loads every `.yml`, `.yaml` and `.toml` file there, so a copy such as `app-NAME-old.yml` would clash with the original's router names.

2. Open the file.

   ```bash
   sudo nano appdata/traefik3/rules/$HOSTNAME/app-NAME.yml
   ```

3. Change what you need. See [What an app file holds](#what-an-app-file-holds).
4. Save and close. In nano, press `Ctrl+O`, `Enter`, then `Ctrl+X`.
5. Check the log for errors.

   ```bash
   sudo grep -i error logs/$HOSTNAME/traefik/traefik.log | tail -n 20
   ```

   For more ways to read the log, see [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

:::note
YAML uses spaces for indentation. Never use the Tab key. One wrong indent can stop Traefik from loading the file.
:::

### What an app file holds

An `app-NAME.yml` file normally has one router and one service. Their names end in `-rtr` and `-svc` and must stay unique across all files. Edit only these lines:

| Line | What it does | Change it to |
| --- | --- | --- |
| `rule:` | The address. The part before `.{{env "DOMAINNAME_1"}}` is the subdomain. | A new subdomain. See [Change the subdomain of an app you already installed](/reverse-proxy/change-app-subdomain/). Your DNS must send it to your server. |
| `entryPoints:` | Where the app can be reached: `websecure-external` (internet) and `websecure-internal` (your LAN). A line starting with `#` is switched off. | Use **Proxy** > **Traefik** > **Manage Exposure** instead of editing. Changes take effect immediately. Simple mode offers only **Both**. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/). |
| `middlewares:` | The login method, as one chain: `chain-authelia`, `chain-authentik`, `chain-oauth`, `chain-tinyauth`, `chain-basic-auth` or `chain-no-auth`. | Another chain. Or use **Security** > **Manage Auth**. For a rules file app it needs no restart. For a labels app it recreates the container. See [Choose a login method](/reverse-proxy/choose-login-method/). |
| `url:` | Where Traefik sends the request: `http://IP:PORT`. It starts with `https://` if you chose https in Traefikify. | A new IP or port. |

To see these lines edited by hand, watch [Traefik 3 guide: edit an app's rules file at 11:33](https://youtu.be/6S9PwhAlZUs?t=693) (manual Docker Compose setup; Deployrr writes this file for you).

### Add your own middleware

A chain such as `chain-basic-auth` is shared. Every app that uses it changes when you edit it, and Deployrr can replace it (see [Files Deployrr writes again](#files-deployrr-writes-again)). So put your own middleware in a new file with a name of your own.

1. Create a file in the rules folder. Do not start the name with `middlewares-` or `chain-`. For example, `my-extra.yml`.

   ```bash
   sudo nano appdata/traefik3/rules/$HOSTNAME/my-extra.yml
   ```

2. Add your middleware. This example adds a response header. The name `my-header` and the header are yours to choose.

   ```yaml
   http:
     middlewares:
       my-header:
         headers:
           customResponseHeaders:
             X-My-Header: "1"
   ```

3. Save the file.

Now add it to an app.

**App with a rules file.** Add a line under `middlewares:` in `app-NAME.yml`, after the chain:

```yaml
      middlewares:
        - chain-basic-auth
        - my-header
```

**App with labels.** Add the name to the `middlewares=` label, separated by a comma, with `@file` after it:

```yaml
      - "traefik.http.routers.traefik-rtr.middlewares=chain-basic-auth@file,my-header@file"
```

Then go to **Tools** > **Stack Manager** > **Recreate** and pick the app from the numbered list. Recreating Traefik drops web connections for a few seconds. See [Stack Manager](/using-deployrr/stack-manager/).

Traefik runs middlewares in the order you list them.

To see a middleware file added to the rules folder and picked up without a restart, watch [Traefik 3 guide: add a middleware file to the rules folder at 5:48](https://youtu.be/cUZ6kkum1pc?t=348) (manual setup; the video starts file names with `middlewares-`, which you should avoid here).

### Edit labels in a compose file

1. Copy the file.

   ```bash
   sudo cp compose/$HOSTNAME/NAME.yml ~/NAME.yml.bak
   ```

2. Edit it.

   ```bash
   sudo nano compose/$HOSTNAME/NAME.yml
   ```

3. Recreate the app from **Tools** > **Stack Manager** > **Recreate**. Without it, the change does not apply.

Reinstalling Traefik, Authelia, OAuth or TinyAuth keeps its compose file and your label edits. Reinstalling Authentik replaces its compose file, so copy your label lines back afterwards. Deleting the app in **Tools** > **Stack Manager** removes the file, and a new install brings back the default labels. See [What can overwrite or delete your changes](/using-deployrr/what-overwrites-your-changes/).

### Add a Traefik plugin

A plugin needs two parts: lines in Traefik's compose file that load it, and a middleware in a rules file that uses it. Take the plugin's name, module path, version and settings from its page in the [Traefik plugin catalog](https://plugins.traefik.io/).

1. Copy Traefik's compose file.

   ```bash
   sudo cp compose/$HOSTNAME/traefik.yml ~/traefik.yml.bak
   ```

2. Open it.

   ```bash
   sudo nano compose/$HOSTNAME/traefik.yml
   ```

3. Find this line near the end of the `command:` section, just before `ports:`:

   ```yaml
         # - PLUGINS-PLACEHOLDER-DO-NOT-DELETE
   ```

   Leave it as it is. The CrowdSec Traefik Bouncer adds its plugin lines below it. If the line is gone, the bouncer install shows an error and you have to add its lines yourself. Leave the other `PLACEHOLDER` lines in this file alone too.

4. Add your plugin's lines below it, not below the `METRICS-PLACEHOLDER` line just above it. Use the same six-space indent. Replace `myplugin` with a short name of your own, and the module path and version with the ones from the plugin's page:

   ```yaml
         # - PLUGINS-PLACEHOLDER-DO-NOT-DELETE
         - --experimental.plugins.myplugin.modulename=github.com/AUTHOR/PLUGIN
         - --experimental.plugins.myplugin.version=v1.0.0
   ```

   Do not use the name `crowdsec`. The CrowdSec Traefik Bouncer uses it. If you set up the bouncer already, its lines (a `# CrowdSec Bouncer Plugin` comment and two `crowdsec` lines) are below the placeholder too. Put yours on their own lines before or after them. The order does not matter.

5. Save and close, then recreate Traefik. Web connections drop for a few seconds.

   ```bash
   dcrec traefik
   ```

   Without the aliases, use **Tools** > **Stack Manager** > **Recreate** and pick Traefik.

6. Check the log for plugin errors. Traefik downloads plugins when it starts, so the server needs internet access.

   ```bash
   sudo grep -i plugin logs/$HOSTNAME/traefik/traefik.log | tail -n 20
   ```

7. Create a rules file with a name of your own, as in [Add your own middleware](#add-your-own-middleware), and use the plugin there. Under `plugin:`, the name must match the one in the compose lines. The settings come from the plugin's page.

   ```yaml
   http:
     middlewares:
       my-plugin:
         plugin:
           myplugin:
             SETTING: VALUE
   ```

8. Add `my-plugin` to an app's `middlewares:`, as in [Add your own middleware](#add-your-own-middleware).

A wrong module path or version can stop Traefik from loading any plugin, including CrowdSec. If apps fail after this change, copy `~/traefik.yml.bak` back and run `dcrec traefik`.

Your plugin lines stay when you run **Traefik Preparation** again or reinstall Traefik, because Deployrr reuses the compose file. Deleting Traefik in **Tools** > **Stack Manager** removes them. For the CrowdSec plugin's own warnings, see [Warnings during the Traefik Bouncer install](/reverse-proxy/crowdsec/#warnings-during-the-traefik-bouncer-install).

## Restore a file after a bad edit

1. Copy your backup over the file.

   ```bash
   sudo cp ~/app-NAME.yml.bak appdata/traefik3/rules/$HOSTNAME/app-NAME.yml
   ```

2. Wait a few seconds. Traefik loads the restored file by itself.
3. For a compose file with labels, copy its backup back the same way, then recreate the app. For Traefik itself:

   ```bash
   dcrec traefik
   ```

   Without the aliases, see [Which files Traefik loads](/reverse-proxy/app-404-or-502/#which-files-traefik-loads) for the full command.

:::caution
Restore `compose/HOSTNAME/traefik.yml` only from a copy you made right before your edit. Traefik **Staging** and **Production** change this file. An older copy would bring back the old certificate server line.
:::

No copy? **Proxy** > **Traefik** > **Traefikify** with the same name makes the file again. It does not bring back your edits. You enter the subdomain, IP, protocol, port, login and exposure again, and pick **Yes** at **File Provider Exists**. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/). Or restore the file from a Deployrr backup. See [Back up and restore your Docker folder](/using-deployrr/backups/).

## Files Deployrr writes again

Copy a file before you run an action in this table.

| What you did | What happens to your edits |
| --- | --- |
| Reinstalled an app | Its rules file stays, with your edits. |
| **Traefikify** with a used name, then **Yes** at **File Provider Exists** | The file is made again. Your edits are gone. **No** keeps it. |
| **Un-Traefikify** | Deletes the file after you confirm. It recommends a backup from the **Tools** menu first. It may ask **Remove from Dashboard?**. |
| **Traefik Preparation** run again | Replaces seven files, listed below. |
| Installed Authelia, Authentik, OAuth or TinyAuth again | Replaces its `middlewares-NAME.yml` and `chain-NAME.yml` with no prompt. |
| Set up CrowdSec | Adds `middlewares-crowdsec-bouncer.yml`. At **Add to Chain Files?** it adds its middleware first in every `chain-*.yml`. |
| **Domain Passthrough** | Creates `domain-*.yml` files in the same folder. |

**Traefik Preparation** needs a Plus or Pro license. If it was done before, it warns "previous setup may be overwritten" and asks you to press `Y` or `y`. It then replaces:

- `tls-opts.yml`
- `middlewares-basic-auth.yml`
- `middlewares-buffering.yml`
- `middlewares-rate-limit.yml`
- `middlewares-secure-headers.yml`
- `chain-basic-auth.yml`
- `chain-no-auth.yml`

A CrowdSec line you added to a chain is lost. Your `app-NAME.yml` files and files with your own names stay.

## Check it worked

1. Open the app's address in a private browser window.
2. You see the app or its login page.
3. The log shows no new error for the app. Run `traefiklogs` and press `Ctrl+C` to stop.

If you see a 404, 502 or Gateway Timeout, see [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/).
