---
title: Change the hostname
description: Update Deployrr after you rename your server, so it matches the new hostname and stops showing a Hostname Mismatch error.
type: how-to
tags:
  - host
  - compose
applies_to: v6.0+
related:
  - getting-started/quick-start
  - using-deployrr/custom-yml
  - reverse-proxy/check-traefik-logs
  - support/discord
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/deployrr/change-hostname"]
sources:
  - type: discord
    ref: https://discord.com/channels/974306760171073556/1380986201879609515
sidebar:
  order: 2
---

Use this page after you rename the server that runs Deployrr. Deployrr keeps using the old hostname in your Docker folder until you update it.

Once Prerequisites are done, the **System Health** line in the main menu shows this when the names don't match:

```txt
Error - Hostname Mismatch (Run Tools->Change Hostname)
```

There are two ways to fix it. With a Pro license, use the **Change Hostname** tool. With any other license, follow the manual steps.

## Before you start

- Deployrr is installed and Prerequisites are done. See the [Quick start](/getting-started/quick-start/).
- Rename the server itself first. Deployrr does not do this for you. On most Linux systems:

  ```bash
  sudo hostnamectl set-hostname YOUR_NEW_HOSTNAME
  ```

  Replace `YOUR_NEW_HOSTNAME` with the name you want. Then open a new terminal session.
- Both methods stop all running containers. Your apps are offline until you start them again.

## Method 1: Change Hostname tool (Pro)

1. Start Deployrr.
2. From the main menu, select **Tools**.
3. Select **Change Hostname**. Its description ends in `(Mismatch)` while the names differ.
4. Read the **Change Hostname** box. It shows the hostname in your Deployrr environment, the hostname of the Docker host, and `WARNING: All running containers will be stopped!`
5. Select **Yes**. If you select **No**, nothing changes.
6. Wait while the tool stops your containers and renames your files. It ends with `Hostname changed to` and your new name.
7. Exit Deployrr and start it again, so it picks up the new name.
8. Start your apps again: select **Tools** > **Stack Manager** > **Up**. Deployrr shows `Docker stack is up` when done.

If your license is not Pro, step 3 shows a **Requirements Not Met** box with `License - Pro required. Current:` and your license. Use method 2 instead. If you have Pro and still see this, run **Prerequisites** > **Verify** and try again.

## Method 2: Manual steps (any license)

In these steps, `OLD` is the old hostname and `NEW` is the new one. All paths are inside your Docker folder, the one you picked in **Prerequisites** > **Docker Folder**. The recommended folder is `/home/USERNAME/docker`. Replace `USERNAME` with your Linux username.

1. Exit Deployrr.
2. Go to your Docker folder:

   ```bash
   cd /home/USERNAME/docker
   ```

   If you set up the [bash aliases](/using-deployrr/bash-aliases/), `cdd` does the same.

3. Stop all running containers:

   ```bash
   sudo docker stop $(sudo docker ps -q)
   ```

4. Open the `.env` file:

   ```bash
   nano .env
   ```

5. Change the `HOSTNAME=` line to the new name, for example `HOSTNAME=NEW`. Save and close the file.
6. Rename the main compose file:

   ```bash
   mv docker-compose-OLD.yml docker-compose-NEW.yml
   ```

7. Rename the folders that carry the hostname. Skip any that don't exist on your system:

   ```bash
   mv compose/OLD compose/NEW
   mv logs/OLD logs/NEW
   mv appdata/traefik3/rules/OLD appdata/traefik3/rules/NEW
   ```

8. Start Deployrr. Then start your apps with **Tools** > **Stack Manager** > **Up**. Stack Manager needs a Basic, Plus or Pro license.

:::note
If you set up the option to start media apps after boot, there is also a `scripts/OLD` folder. Its script still points at the old folder names, so set that option up again after the change.
:::

## Check it worked

- The **System Health** line in the main menu no longer shows `Error - Hostname Mismatch`.
- In **Tools**, the **Change Hostname** description ends in `(Healthy)`.
- Your apps open in the browser again.

## If something still looks wrong

- If an app does not load, [check the Traefik logs](/reverse-proxy/check-traefik-logs/) for errors.
- For other problems, ask in the [Deployrr Discord](https://www.simplehomelab.com/discord/).

## Related

- [Quick start](/getting-started/quick-start/): the Prerequisites steps, including Docker Folder and Verify.
