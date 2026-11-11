---
title: Theme your apps with Theme Park
description: Install the Theme Park app, or add the Theme Park plugin to Traefik, to give qBittorrent and other web apps a custom colour theme.
type: how-to
tags:
  - traefik
  - media
applies_to: v6.0+
apps: [theme-park, qbittorrent]
related:
  - apps/qbittorrent-webui-troubleshooting
  - using-deployrr/custom-yml
  - using-deployrr/bash-aliases
  - reverse-proxy/check-traefik-logs
further_reading:
  - title: "UDMS part 25: Traefik plugins, including Theme Park"
    url: https://www.simplehomelab.com/udms-25-traefik-plugins/
last_reviewed: 2026-11-08
status: current
old_paths: ["/apps/theme-park-configuration"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1271721488038367272/1271721488038367272" }
---

Theme Park gives the web pages of many homelab apps a custom look. This page shows you how to install the Theme Park app in Deployrr. It also shows how to theme an app that sits behind Traefik, using qBittorrent as the example.

## Before you start

- Deployrr is installed and you have a Docker folder. See the [Quick start](/getting-started/quick-start/).
- For the Traefik method, the app you want to theme is reachable through Traefik with your own domain, and Traefik is installed.
- You know how to edit files in your Docker folder. The [`custom.yml` page](/using-deployrr/custom-yml/) explains where the folder and its files are.

:::note
Installing the Theme Park app does not change the look of your other apps. Deployrr does not switch themes on for you. Each app needs its own setting. The two parts below cover the two ways to do that.
:::

## Steps

### Part 1: Install the Theme Park app

Do this part if you want to run your own Theme Park server.

1. Open Deployrr.
2. Go to **Apps** > **Browse Apps**.
3. Select **Theme Park** in the list, then choose **Install**.
4. When Deployrr asks for the web interface port, enter a port or accept the default of `82`.
5. Wait for the install to finish. Deployrr shows a note with a link to the Theme Park setup guide for self-hosting:

   ```txt
   https://docs.theme-park.dev/setup/#selfhosting
   ```

6. Follow that guide to enable a theme in each app you want to change. The settings differ for each app, so use the Theme Park guide for your app.

### Part 2: Theme an app through Traefik

Do this part if the app is behind Traefik and you want the theme added by Traefik. This method needs no Theme Park container. Replace `HOSTNAME` with your server's hostname everywhere below. For background on how Traefik plugins work, read [UDMS part 25: Traefik plugins, including Theme Park](https://www.simplehomelab.com/udms-25-traefik-plugins/) (manual setup, so file paths and settings differ from Deployrr).

1. Go to the Traefik rules folder for your server. It is inside your Docker folder:

   ```txt
   appdata/traefik3/rules/HOSTNAME/
   ```

2. Create a new file named `theme-qbittorrent.yml` in that folder.
3. Put this in the file:

   ```yaml
   http:
     middlewares:
       theme-qbittorrent:
         plugin:
           traefik-themepark:
             app: qbittorrent
             theme: aquamarine
   ```

   Change `app` to the app you want to theme. Change `theme` to the theme you want. Use one file per app.

4. Open the Traefik file in your Docker folder:

   ```txt
   compose/HOSTNAME/traefik.yml
   ```

5. Find the `command:` section. Find the line `# - PLUGINS-PLACEHOLDER-DO-NOT-DELETE` in it.
6. Add these two lines below it, at the same indent as the lines around them:

   ```yaml
   - --experimental.plugins.traefik-themepark.modulename=github.com/packruler/traefik-themepark
   - --experimental.plugins.traefik-themepark.version=v1.4.2
   ```

   Leave the placeholder line where it is. `v1.4.2` is the latest plugin version at the time of writing. If you add CrowdSec later, Deployrr puts its lines right under the placeholder, above yours. Both stay.

7. Open the file that holds the Traefik settings for your app. Most apps, including qBittorrent, have a file named `app-APPNAME.yml` in `appdata/traefik3/rules/HOSTNAME/`. For qBittorrent it is `app-qbittorrent.yml`.

   - In an `app-APPNAME.yml` file, add `theme-qbittorrent` as a new line under the `middlewares:` list:

     ```yaml
     - theme-qbittorrent
     ```

   - A few apps, such as Traefik itself, OAuth and Authelia, use Traefik labels in their file in `compose/HOSTNAME/` instead. For those, find the line that contains `.middlewares=`. Add the theme after the existing value, with a comma between them:

     ```yaml
     - "traefik.http.routers.NAME-rtr.middlewares=EXISTING_VALUE@file,theme-NAME@file"
     ```

     Keep the router name and the existing value that are already on your line. Only add `,theme-NAME@file` at the end of the value.

8. Save all files. Traefik picks up new and changed files in the top level of the rules folder on its own. Files in subfolders are not read.
9. Recreate Traefik so it loads the plugin. The change to `traefik.yml` needs this step. The `dcrec` alias comes from [Bash aliases](/using-deployrr/bash-aliases/):

   ```bash
   dcrec traefik
   ```

### qBittorrent: allow the theme to load

qBittorrent blocks styles from other sites unless you allow them.

1. Open the qBittorrent web page and log in.
2. Go to **Tools** > **Options** > **WebUI**.
3. Find **Add custom HTTP headers**. Add this header as one line:

   ```txt
   content-security-policy: default-src 'self'; style-src 'self' 'unsafe-inline' theme-park.dev raw.githubusercontent.com use.fontawesome.com; img-src 'self' theme-park.dev raw.githubusercontent.com data:; script-src 'self' 'unsafe-inline'; object-src 'none'; form-action 'self'; frame-ancestors 'self'; font-src use.fontawesome.com;
   ```

4. Save the options.

## Check it worked

1. Open your app at its Traefik address.
2. Reload the page with Ctrl+F5 to skip the browser cache.
3. The page shows the theme you chose.

If the page looks unchanged or Traefik fails to start, [read the Traefik log](/reverse-proxy/check-traefik-logs/). Run `traefiklogs` from [Bash aliases](/using-deployrr/bash-aliases/). Press Ctrl+C to stop.

:::caution
The plugin is downloaded when Traefik starts. If Traefik can't reach the internet, it can't load the plugin. A typo in `traefik.yml` can stop Traefik, and all your apps behind it. Back up the file before you edit it.
:::

If you run [**Traefikify**](/reverse-proxy/traefikify/) again for the app and choose to overwrite its file, or remove the app from Traefik and add it back, Deployrr writes a new `app-APPNAME.yml` without your theme line. Add the line again afterwards. If you change the app's login method, check that the theme line is still in the `middlewares:` list.

## Related

- [qBittorrent web UI troubleshooting](/apps/qbittorrent-webui-troubleshooting/): fix login and connection problems.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): where Docker folder files live and how to edit them.
- [Bash aliases](/using-deployrr/bash-aliases/): the `dcrec` and `traefiklogs` shortcuts.
