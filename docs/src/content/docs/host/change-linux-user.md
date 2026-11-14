---
title: Use a different Linux user after setup
description: Switch Deployrr to another Linux user after setup without breaking your apps, update the .env values and folder access, and remove the old user's access.
type: how-to
tags:
  - host
  - docker
  - install
applies_to: v6.0+
related:
  - getting-started/system-checks-failed
  - using-deployrr/edit-env-and-secrets
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/backups
  - getting-started/prerequisites
further_reading:
  - title: "UDMS part 05: create a non-root Linux user"
    url: "https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User"
videos:
  - id: "-ZSQdJ62r-Q"
    start: 620
    title: "Docker on Proxmox LXC: creating a non-root user and adding it to sudo"
last_reviewed: 2026-11-14
status: current
sources: []
sidebar:
  order: 6
---

Use this page if you want Deployrr to run as a different Linux user than the one you set up with, or if System Checks shows `Username YOUR_USERNAME not found` because the user was renamed. See [Fix "Username not found"](/getting-started/system-checks-failed/#fix-username-not-found-step-2) for the other causes of that message.

**Prerequisites** > **Username** only saves a name. It does not change anything you set up earlier. Your Docker folder, your apps and a few other steps keep the old user until you update them.

The simplest choice is to keep the user you set up with. Change it only if you have to.

In the commands below, `NEW_USER`, `OLD_USER` and `DOCKER_FOLDER` are values you fill in. `DOCKER_FOLDER` is the path to your Docker folder.

## Before Environment

If you have not run **Prerequisites** > **Environment** yet, run **Username** again and enter the new name. Nothing else needs to change.

## After setup

:::caution
These steps change who owns your Docker files and what your apps run as. A mistake can stop apps from starting or writing their data. Back up first and check each app afterwards.
:::

1. Back up the Docker folder. See [Backups](/using-deployrr/backups/#back-up-the-docker-folder).
2. Check that the new user exists:

   ```bash
   id NEW_USER
   ```

   You should see a `uid` and a `gid`. If you see `no such user`, create it in the next step when Deployrr offers to.

3. Go to **Prerequisites** > **Username** and enter the new name. Deployrr refuses `root`. If the user does not exist, it asks "Do you want to create this user and add it to sudoers?". You see "Username set to NEW_USER", or "User NEW_USER has been created" if Deployrr created it. From now on, start Deployrr as `NEW_USER`. To see how a user is created and added to sudo by hand, watch [Docker on Proxmox LXC: creating a non-root user at 10:20](https://youtu.be/-ZSQdJ62r-Q?t=620), or read [UDMS part 05: create a non-root Linux user](https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User) (manual setup).
4. Get the user's numeric IDs:

   ```bash
   id -u NEW_USER
   id -g NEW_USER
   ```

5. Change four values in the `.env` file in your Docker folder: `PUID` (the first number), `PGID` (the second number), `PRIMARY_USERNAME` (the name) and `USERDIR` (`/home/NEW_USER`). Use **Tools** > **.env Editor** (Pro) or edit by hand. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/#edit-a-value-with-the-env-editor) and [Edit by hand without Pro](/using-deployrr/edit-env-and-secrets/#edit-by-hand-without-pro).

   :::note
   Don't run **Environment** again to do this. It warns "If you proceed, you may break previously installed apps", and both **Recreate** and **Reuse** delete files. **Reuse** also removes your apps' compose files.
   :::

6. Give the new user the same folders the old user had. Don't run a recursive `chown` on `appdata` or the whole Docker folder. Some apps, such as pgAdmin, Mosquitto and n8n, own their folders with fixed IDs, and you would break them.

   ```bash
   sudo chown NEW_USER:NEW_USER DOCKER_FOLDER DOCKER_FOLDER/appdata
   sudo chown -R NEW_USER:NEW_USER DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   sudo setfacl -m u:NEW_USER:rwX DOCKER_FOLDER
   sudo setfacl -dm u:NEW_USER:rwX DOCKER_FOLDER
   sudo setfacl -Rm u:NEW_USER:rwX DOCKER_FOLDER/appdata DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   sudo setfacl -Rdm u:NEW_USER:rwX DOCKER_FOLDER/appdata DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   ```

   These commands leave `secrets` and `.env` alone. They stay owned by root and readable only by root.

   If your Docker folder is inside the old user's home, for example `/home/OLD_USER/docker`, the new user may not be allowed into that home folder. Check with `sudo -u NEW_USER ls DOCKER_FOLDER`.

7. Run [System Checks again](/getting-started/system-checks-failed/#run-system-checks-again).
8. Recreate your apps so they read the new `.env` values. Use **Tools** > **Stack Manager** > **Recreate** and choose `all` (Basic, Plus or Pro license). Without a license, use the Docker Compose command on that page. See [Which one after which change](/using-deployrr/restart-recreate-reinstall/#which-one-after-which-change). Restart does not pick up the change.
9. Open each app and check that it works. Cloud Commander, Double Commander and VS Code show your files under `/data/NEW_USER` now.

If one app can't write its files after this, give that app's folder to the new user. Replace `APP` with the app's name:

```bash
sudo chown -R NEW_USER:NEW_USER DOCKER_FOLDER/appdata/APP
```

Don't do this for apps that use fixed IDs, such as pgAdmin, Mosquitto and n8n. Restore from your backup if an app breaks.

## Other steps that keep the old user

Redo these only if you use them:

- **Bash Aliases** are in the old user's `~/.bashrc`. With **Username** set to the new user, run **Bash Aliases** again (Basic, Plus or Pro license). It writes to the new user's `~/.bashrc`, whoever you are logged in as. Then open a new session as the new user. See [Turn on the aliases](/using-deployrr/bash-aliases/#turn-on-the-aliases).
- The Rclone mount runs as the old user. Its config is in `appdata/rclone` in your Docker folder. The old user's home only holds a link to it. Remove the mount service and run **Automount** again. See [Change the mount folder, cache or NAS details](/storage/rclone-smb-setup/#change-the-mount-folder-cache-or-nas-details).
- **Mail Relay** maps the old user to your FROM address. Run **System** > **Mail Relay** again. See [Change your SMTP details later](/host/smtp-mail-relay/#change-your-smtp-details-later).
- A Migration Package needs the same user on the new server. See [Move to a new server](/using-deployrr/move-to-new-server/).

## Renaming the user

Deployrr expects the user's home folder to be `/home/USERNAME`. The default Docker folder is inside it, at `/home/USERNAME/docker`. If you rename the user and move the home folder, the Docker folder moves too. Deployrr then looks for it in the wrong place.

If your Docker folder is in the old user's home, don't rename the user. Keep the old user, or create a new user and switch to it with the steps above. The Docker folder stays where it is.

## Check it worked

1. Show the saved values. The file is root-only, so use `sudo`:

   ```bash
   sudo grep -E '^(PUID|PGID|PRIMARY_USERNAME|USERDIR)=' DOCKER_FOLDER/.env
   ```

   They should match the new user.

2. Open **Prerequisites**. The new username shows in green.
3. System Checks shows `DONE`, and your apps start and write their files.

## Remove the old user's access (optional)

When Deployrr created your Docker folder, it gave the old user read and write access to it with ACLs (access control lists). New files and folders inside get the same access. The commands above add access for the new user but don't remove the old user's access. If you are retiring the old account, remove it too.

Do this only after everything works as the new user, including the [other steps](#other-steps-that-keep-the-old-user) you use. Skip it if your Docker folder is in the old user's home and you keep that account.

1. Check the current entries on the Docker folder:

   ```bash
   getfacl DOCKER_FOLDER
   ```

   Look for `user:OLD_USER:rw-` and `default:user:OLD_USER:rw-`.

2. Remove the old user's entries from every file and folder, then the default entries from every folder:

   ```bash
   sudo setfacl -R -x u:OLD_USER DOCKER_FOLDER
   sudo find DOCKER_FOLDER -type d -exec setfacl -x d:u:OLD_USER {} +
   ```

   This also clears the old entry from `secrets` and `.env`. It had no effect there, because those stay readable only by root.

3. Run `getfacl DOCKER_FOLDER` again. The `OLD_USER` lines are gone. If you ran step 6 of [After setup](#after-setup), the `NEW_USER` lines are still there.
4. Open a few apps and check that they still work. If one breaks, give the old user access to that app's folder again first. Replace `APP` with the app's folder in `appdata`:

   ```bash
   sudo setfacl -Rm u:OLD_USER:rwX DOCKER_FOLDER/appdata/APP
   ```

   Then restart the app. Restore the folder from your backup only as a last resort: the backup is from before the switch, so anything the app saved since then is lost.
