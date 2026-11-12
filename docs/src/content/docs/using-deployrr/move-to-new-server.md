---
title: Move Deployrr to a new server
description: Move your Deployrr settings and your whole Docker folder to another server with a Migration Package, then fix up the new server.
type: how-to
tags:
  - backups
  - host
applies_to: v6.0+
related:
  - using-deployrr/backups
  - using-deployrr/change-hostname
  - getting-started/quick-start
  - support/discord
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 4701
    title: "Deployrr 5 walkthrough: moving your setup with a Migration Package"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

Use a Migration Package to move your whole setup to a new server. The package holds your Deployrr settings and your full Docker folder. You create it on the old server, copy it over and restore it on the new one.

## Before you start

- You have a Pro license. **MP Create** and **MP Restore** both need it. Without it you see a "Requirements Not Met" box.
- You finished **Prerequisites** on the old server. **MP Create** needs it too.
- The new server has the same Linux user name as the old one. Your Docker folder comes back to the same path, for example `/home/USERNAME/docker`.
- You can copy a file from the old server to the new one.

## How this differs from a backup

A [backup](/using-deployrr/backups/) holds only the Docker folder and is meant to be restored on the same server. A Migration Package also holds your Deployrr settings and is meant for a new machine.

Neither holds anything else. For example, media on a mounted share is not in the package. Move it or mount it again on the new server yourself, for example with [Rclone](/host/rclone-smb-setup/) or [SMB or NFS Mount](/host/smb-nfs-mounts/).

## Steps

For a short spoken overview of these steps, watch [Deployrr 5 walkthrough: moving your setup with a Migration Package at 1:18:21](https://youtu.be/rdqbAr0TFnQ?t=4701) (shows Deployrr v5; it describes the steps but doesn't show them, and menus and steps differ in v6).

### Create the package on the old server

1. In Deployrr, go to **Tools** > **Backups**.
2. Under **MIGRATION**, choose **MP Create** ("Create a Migration Package").
3. Read the **WARNING** box. It lists what you need on the new machine: Deployrr downloaded again, Docker installed, all checks passing, and the same primary user.
4. Move to **Yes** and confirm.

   The **No** button is on the left and **Yes** is on the right. **No** is selected by default.

   If your license or Prerequisites are not ready, the "Requirements Not Met" box shows up now.

5. In the **Migration Package Location** box ("Where do you want to save the migration package?"), pick **Use default folder** or **Select a custom folder**. The default is your home folder.
6. Wait. Deployrr stops all your apps and prints "Backing up...".
7. Look for "Verifying backup:" and then "Backup successful:" followed by the path of your new file.

   The file is named `mig_pkg_YYYYMMDD_HHMMSS.tar.gz`, with the date and time it was made.

   If something goes wrong you see "Backup not successful." and the path.

8. Answer "Do you want to restart your Docker stack? Press Y/y to resume or any other key for no:".

:::tip
If you are moving for good, press any key other than `Y`. Deployrr says "Leaving the Docker stack stopped." This stops two servers from running the same apps and fighting over the same domain.
:::

### Copy the package to the new server

Any way of copying the file works. One way is `scp`. Run it on the old server.

```bash
scp FILE USER@NEW_SERVER_IP:~/
```

Replace `FILE` with the path of your `.tar.gz` file. Replace `USER` with your Linux user on the new server and `NEW_SERVER_IP` with its IP address.

### Restore the package on the new server

1. Install Deployrr on the new server. See the [Quick start](/getting-started/quick-start/).
2. Verify your Pro license on the new server. In **Prerequisites**, accept the **Disclaimers**, set the **Docker Folder** to the same path as on the old server, then choose **Verify**. Enter your domain and the email of your SimpleHomelab.com account, then choose **Proceed**. Wait for "Access Level Verified: Pro". **MP Restore** does not work until then.
3. Go to **Tools** > **Backups**.
4. Under **MIGRATION**, choose **MP Restore** ("Restore a Migration Package").
5. Read the warning. It says your existing Docker folder and Deployrr settings will be overwritten if they already exist.

   :::caution
   The restore replaces all Deployrr settings on this server with the ones in the package. Files in the Docker folder are overwritten by the files in the package. Run it only on a new server, not on one whose setup you want to keep.
   :::

6. Move to **Yes** and confirm. **No** is on the left and selected by default.
7. In the **Restore a Migration Package** file browser, use `TAB` to move around and `SPACEBAR` to select. The browser starts at the top of the file system (`/`).
8. Browse to the `.tar.gz` file you copied and select it.
9. Choose **Confirm**.

   If you select nothing, you see "No migration package file selected or operation canceled." If you pick a file that is not a `.tar.gz`, the browser opens again.

10. Wait. Deployrr stops your apps and prints "Restoring" and the file name.
11. Look for "Restore completed." Deployrr reminds you to run the checks again and start your stack.
12. At "Deployrr will now restart. Press Y/y to proceed or any other key to quit:", press `Y`. Any other key closes Deployrr. Start it again yourself.

### Fix up the new server

1. In **Prerequisites**, run **System Checks** again. They may already show as done, because the settings came from the old server. At "It appears that System Checks were already completed. If you want to redo it, press Y/y...", press `Y`.
2. In **Prerequisites**, run **Domain Checks** again, and press `Y` at the same kind of question. In Local setup mode you see "Domain Checks Not Required" instead, and you can skip this step.
3. Start your apps. Go to **Tools** > **Stack Manager** and choose **Up**. You see "Docker stack is up" when it is done.

#### If the new server has a different IP address

These steps are the short version. For a backup step, the full output and what the tool leaves alone, see [Change the server IP](/using-deployrr/change-server-ip/).

1. Go to **Tools** > **Change Server IP** ("Adapt Deployrr to a new server IP"). This needs Pro and finished Prerequisites.
2. At "Enter the new Docker Host IP (LAN IP or WAN IP for VPS):", type the IP of the new server.
3. At "Enter the previous Docker Host IP...", type the IP of the old server. It can't be empty or the same as the new IP.
4. Read the **Update Service IP** box. It says Deployrr will update the IP for your services in the Deployrr Dashboard and in all Traefik file providers.
5. Confirm.
6. Read the lines Deployrr prints. Each file shows "Updated" with the old and new IP, or "No occurrence" if it did not contain the old IP. There is no separate success message. Press Enter, or wait, to go back.
7. Go to **Prerequisites** > **Server IP** and enter the new IP again, so Deployrr's own setting matches.
8. Recreate Plex, Open WebUI, Paperless-ngx and BookStack if you run them. They use the server IP.
9. Update your router port forwards and DNS records that still point at the old IP.

#### If the new server has a different hostname

Once Prerequisites are done, the System Health line on the main menu shows "Error - Hostname Mismatch (Run Tools->Change Hostname)". Follow [Change the hostname](/using-deployrr/change-hostname/) to fix it. The Change Hostname tool stops all running containers, so run **Stack Manager** > **Up** afterwards.

You can also avoid the error. Before you restore, give the new server the old hostname. This is a standard Linux command, not a Deployrr option. Replace `OLDNAME` with the hostname of the old server.

```bash
sudo hostnamectl set-hostname OLDNAME
```

## Check it worked

- **Prerequisites** shows **System Checks** and **Domain Checks** as done.
- The System Health line on the main menu shows Healthy.
- **Tools** > **Stack Manager** > **Containers Status** lists your containers.
- Your apps open at their usual addresses.

## Related

- [Back up and restore your Docker folder](/using-deployrr/backups/): the normal backup, for the same server.
- [Change the hostname](/using-deployrr/change-hostname/): fix a hostname mismatch on the new server.
- [Quick start](/getting-started/quick-start/): install Deployrr on the new server.
- [Get help on Discord](/support/discord/): ask the community if the restore fails.
