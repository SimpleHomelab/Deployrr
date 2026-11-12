---
title: Edit .env values and secrets
description: Change a password, key or setting with the .env Editor or Secrets Editor, apply it with Recreate, and pick the text editor Deployrr opens.
type: how-to
tags:
  - compose
  - docker
  - backups
applies_to: v6.0+
related:
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/reinstall-app
  - using-deployrr/backups
  - getting-started/licenses
  - docker/port-already-in-use
further_reading:
  - title: "UDMS part 14: the .env file and its permissions"
    url: https://www.simplehomelab.com/udms-14-docker-media-server/
  - title: "UDMS part 18: Docker secrets for Traefik"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Secrets_for_Traefik
videos:
  - id: THuLgGwq0vg
    start: 335
    title: "Docker media server guide: what the .env file and secrets folder are"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
  - id: rdqbAr0TFnQ
    start: 4363
    title: "Deployrr 5 walkthrough: finding and editing the .env file"
    note: Shows Deployrr v5. Menus and steps differ in v6.
  - id: rdqbAr0TFnQ
    start: 4527
    title: "Deployrr 5 walkthrough: Stack Manager and Recreate"
    note: Shows Deployrr v5. Menus and steps differ in v6.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
sidebar:
  order: 9
---

Your apps read their settings, passwords and keys from the `.env` file and from files in the `secrets` folder. Use this page to change one of them, make the app use the new value, and choose the text editor Deployrr opens.

To see what these files are and why they belong to root, watch [Docker media server guide: .env and secrets folders at 5:35](https://youtu.be/THuLgGwq0vg?t=335) (manual setup; the folder layout differs in Deployrr). For the written version, read [UDMS part 14: the .env file and its permissions](https://www.simplehomelab.com/udms-14-docker-media-server/) (manual setup, background only).

## Before you start

- For the **.env Editor** and **Secrets Editor**, you need a Pro license and you need to finish **Prerequisites**. Without them you see a "Requirements Not Met" box. See [Licenses](/getting-started/licenses/) and [Requirements Not Met](/getting-started/requirements-not-met/).
- **Preferred Editor** works with any license. It saves your choice in `.env`, so your Docker folder must be set up first (**Prerequisites** > **Environment**).
- The app is installed.
- You know which value you want to change. For folder paths, use **System** > **Folders** instead. See [Set your media, downloads and other folders](/storage/folders/).

:::caution
Deployrr also keeps its own settings in `.env`, such as your folder paths and the editor you pick. Change a folder path in **System** > **Folders**. Don't edit it in `.env` unless you know why.
:::

## Back up first

A wrong value in `.env` or a deleted secret can stop an app from starting. Make a copy before you change anything.

1. Open a terminal on the server.
2. Copy the `.env` file. Replace `YOUR_DOCKER_FOLDER` with the path to your Docker folder:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/.env YOUR_DOCKER_FOLDER/.env.bak
   ```

3. If you plan to change a secret, copy the `secrets` folder too:

   ```bash
   sudo cp -a YOUR_DOCKER_FOLDER/secrets YOUR_DOCKER_FOLDER/secrets.bak
   ```

With a Pro license you can also back up the whole Docker folder. See [Back up and restore your Docker folder](/using-deployrr/backups/).

## Before you change a database password

:::caution
This is general Docker behavior, not a Deployrr message. A database image sets its password only the first time it starts. If you change the database password in `.env` or in a secret file, the password stored inside the existing database stays the same. The app and its database then stop talking to each other.

Don't change it here first. Follow [Change a database password safely](/apps/change-database-password/), or leave the value as it is.
:::

Apps that don't have a database, or values like an API key or an auth key, are safe to change here.

## Edit a value with the .env Editor

1. Go to **Tools** > **.env Editor**.
2. Find the box titled "Environment Variables" with the path to your `.env` file. It shows "Variables Defined: N" and "Select a variable to edit:".
3. Select the variable. Each row shows the name and its current value.
4. In the **Edit Environment Variable** box, change the value. The box is filled with the current value.
5. Select **OK**. You go back to the variable list.
6. Repeat for other variables, or press Esc or choose Cancel on the list to leave.

What to know about the editor:

- Values show in plain text, including passwords and keys. Make sure nobody is watching your screen.
- Comment lines and empty lines are not listed.
- If you leave the box empty or cancel, nothing changes. You can't set a value to empty here.
- If you don't change the value, nothing is written.
- A value with a space is saved in double quotes, like `NAME="a b"`. Other values are saved without quotes, like `NAME=value`, even if they had quotes before.
- If the new value has a `$`, a quote, a backslash, `;`, `&` or `#`, don't use the .env Editor. Edit the file by hand and put the value in single quotes, as shown in [Edit by hand without Pro](#edit-by-hand-without-pro). Deployrr reads `.env` each time it starts, and Docker Compose reads it too. Without quotes, these characters can change the value or break the line.
- The editor does not restart any app. Your change has no effect until you recreate the app.

## Edit a secret with the Secrets Editor

1. Go to **Tools** > **Secrets Editor**.
2. Find the box titled "Docker Secrets" with the path to your `secrets` folder. It shows "Secrets Found: N" and "Select a secret to edit:".
3. Select the secret.
4. In the **Manage Secret** box, choose **Edit**.
5. Change the value in the text editor that opens. Save and close the editor.

Secret files belong to root, so Deployrr opens them with root rights. When you close the editor, Deployrr removes spaces at the end of each line and empty lines at the end of the file.

Like `.env`, a change to a secret has no effect until you recreate the app. To understand how a secret file reaches the app, read [UDMS part 18: Docker secrets for Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Docker_Secrets_for_Traefik) (manual setup, background only).

To change a login password for Basic HTTP Auth, TinyAuth, Authelia or Google OAuth, see [Change login passwords and add users](/reverse-proxy/manage-login-users/). Those logins live in their own files, not only in one secret.

### Delete a secret

:::caution
You can't undo a delete. Back up the `secrets` folder first. Don't delete a secret that an app still uses. The app's compose file refers to it, and the app may not start without it.
:::

1. Back up as shown in [Back up first](#back-up-first).
2. In the **Manage Secret** box, choose **Delete**.
3. Read the **Confirm Deletion** box. It says "WARNING: This action cannot be undone!" and asks if you are sure you want to permanently delete the secret.
4. Choose **Yes**.
5. Look for "Secret NAME has been successfully deleted", where NAME is the secret you picked.

## Apply the change with Recreate

1. Go to **Tools** > **Stack Manager** > **Recreate** ("Force recreate an app").
2. At "Select an app to recreate:", type the number of the app and press Enter. Don't pick `all` unless you want to recreate every app. `exit` leaves without changes.
3. Deployrr stops the app, then recreates it. Wait for "APP recreated".

To see Stack Manager in use, watch [Deployrr 5 walkthrough: Stack Manager at 1:15:27](https://youtu.be/rdqbAr0TFnQ?t=4527) (shows Deployrr v5; menus differ in v6).

Recreate in Stack Manager needs a Basic, Plus or Pro license. If you already have the Deployrr bash aliases installed, `dcrec APP` force-recreates that app. Replace `APP` with the app's name. Run without a name, `dcrec` recreates all apps. Setting up the aliases needs a Basic, Plus or Pro license. See [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/) and [Bash aliases](/using-deployrr/bash-aliases/).

:::note
This is general Docker behavior: a restart keeps the values the container was created with. Use Recreate.
:::

## A reinstall can replace passwords

A reinstall can give some apps' generated secret files new values. Back up `secrets` and `appdata` before you reinstall. See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).

## Edit by hand without Pro

This is general Linux guidance. Without a Pro license, edit the files yourself. To see where `.env` sits and how it is opened with `sudo nano`, watch [Deployrr 5 walkthrough: editing the .env file at 1:12:43](https://youtu.be/rdqbAr0TFnQ?t=4363) (shows Deployrr v5; menus differ in v6).

1. Make a backup as shown in [Back up first](#back-up-first).
2. Open the file in nano. Replace `YOUR_DOCKER_FOLDER` with your Docker folder path:

   ```bash
   sudo nano YOUR_DOCKER_FOLDER/.env
   ```

   For a secret, open the file in the `secrets` folder. Replace `NAME` with the secret's file name:

   ```bash
   sudo nano YOUR_DOCKER_FOLDER/secrets/NAME
   ```

3. A secret file holds only the value, with no name and no quotes. In `.env`, keep each line in the form `NAME=value`, with no spaces around the `=`. Put the value in single quotes, like `NAME='value'`, as Deployrr does for its own settings. Single quotes keep a space, `$`, `;`, `&` or `#` as part of the value. The value itself can't contain a single quote.
4. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.
5. Recreate the app, as shown above.

## Change the editor Deployrr uses

The default editor is nano. In v6, the Secrets Editor uses this setting.

1. Go to **Tools** > **Preferred Editor**.
2. Read "Current editor". Choose one of nano ("Easy to use (default)"), vim ("Advanced - modal editing") or vi ("Classic Unix editor").
3. Look for "Preferred editor set to X", where X is your choice.

Deployrr saves your choice in `.env` and uses it the next time it starts. If you put back an older copy of `.env`, the setting goes back too. The **Tools** menu shows the current editor next to **Preferred Editor**.

If the editor is not installed, you see "Error: X is not installed. Install it first: sudo apt install X". Run the `apt` command it shows. Then choose the editor again.

The [bash aliases](/using-deployrr/bash-aliases/) that open files use nano, whatever you pick here.

## Check it worked

1. For `.env`, run this. Replace `NAME` with the variable's name and `YOUR_DOCKER_FOLDER` with your Docker folder path:

   ```bash
   sudo grep NAME YOUR_DOCKER_FOLDER/.env
   ```

   Or open **Tools** > **.env Editor** again and look at the value.

2. For a secret, open it again in the **Secrets Editor**, or run:

   ```bash
   sudo cat YOUR_DOCKER_FOLDER/secrets/NAME
   ```

3. Recreate the app, then open it and check it works. Run this to check that it shows `Up`:

   ```bash
   sudo docker ps --format 'table {{.Names}}\t{{.Status}}'
   ```

4. If the app shows `Restarting` or `Exited`, see [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/). Put your backup copy back if you need to.

## Related

- [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/): pick the action that applies your change.
- [Reinstall an app and keep its data](/using-deployrr/reinstall-app/): what a reinstall keeps and resets.
- [Back up and restore your Docker folder](/using-deployrr/backups/): a full backup before a big change.
- [Licenses](/getting-started/licenses/): which features need Pro.
- [Port already in use](/docker/port-already-in-use/): change an app's port in `.env`.
