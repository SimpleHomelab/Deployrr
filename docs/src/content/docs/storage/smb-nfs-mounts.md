---
title: Mount an SMB or NFS share without Rclone
sidebar:
  order: 2
  label: Mount an SMB or NFS share
description: Mount an SMB or NFS share from your NAS with System > Mounts, fix or remove it safely, and fix the "Selected directory is not empty" message.
type: how-to
tags:
  - host
  - media
applies_to: v6.0+
related:
  - storage/rclone-smb-setup
  - storage/rclone-mount-not-empty
  - host/shim-task-debian
  - using-deployrr/move-to-new-server
  - using-deployrr/bash-aliases
further_reading:
  - title: "UDMS part 08: Permission denied errors on NFS mounts"
    url: "https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Permission_Denied_Errors"
  - title: "UDMS part 07: Test the fstab entry for an SMB mount"
    url: "https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration"
last_reviewed: 2026-11-13
status: current
old_paths: ["/host/smb-nfs-mounts"]
sources: []
---

This page shows how to mount a share from your NAS on your Deployrr server with the **SMB Mount** or **NFS Mount** option. You fill in a short form and pick a folder. Deployrr mounts the share and adds it to `/etc/fstab`, the file Linux reads at boot to mount shares again. Use it when you don't want Rclone.

## SMB Mount, NFS Mount or Rclone?

All three are under **System** > **Mounts**.

| | SMB Mount | NFS Mount | Rclone |
| --- | --- | --- | --- |
| Works on | VPS, Barebones, Virtual Machine | VPS, Barebones, Virtual Machine | Not blocked in a Proxmox LXC container |
| License | Basic, Plus or Pro | Basic, Plus or Pro | Basic, Plus or Pro |
| What you need from the NAS | Server IP, share name, user name, password | Server IP, export path | Server IP, user name, password, plus a remote name you choose (no share name) |
| Other requirement | None | The NAS user's UID must match your Deployrr user's UID | Three menu steps: Install, SMB Remote, Automount |
| Extra software | `cifs-utils` is installed for you | The NFS client (`nfs-common` on Debian or Ubuntu) is installed for you | Rclone and fuse3 |
| After a reboot | Entry in `/etc/fstab` | Entry in `/etc/fstab` | Its own service |
| **Delay Media Apps** | Not offered | Not offered | Offered |
| If the NAS is off at boot | The boot usually waits, then goes on without the share | The boot usually waits, then goes on without the share | With **Delay Media Apps**, your media apps wait about 15 minutes for the mount, then Deployrr removes their containers. App data stays. |

Pick **SMB Mount** or **NFS Mount** if your server is a VPS, a bare-metal machine or a virtual machine and you want a plain mount. Pick **Rclone** if your server is a Proxmox LXC container, or if you want **Delay Media Apps** to hold your media apps back until the share is ready. See [Mount a NAS share with Rclone](/storage/rclone-smb-setup/).

If your NAS is sometimes off or slow to start when the server boots, plan for it:

- With **SMB Mount** or **NFS Mount**, the share stays unmounted until you turn the NAS on and run `sudo mount -a`.
- The lines Deployrr adds don't have `nofail`. A network share without it usually only delays the boot, but this can differ between distros. To add it, see [Server won't boot after an /etc/fstab change](/storage/fstab-boot-recovery/).
- To start your media apps only once an SMB or NFS share is mounted, set up the service in [step 6 of Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/#6-start-your-media-apps-at-boot-after-an-smb-or-nfs-share-is-ready).
- With **Rclone** and **Delay Media Apps**, fix the mount and start the apps again as in [step 5 of the same page](/docker/apps-not-starting-after-reboot/#5-start-your-media-apps-on-their-own-at-boot-rclone-only).

## Before you start

- You have a Basic, Plus or Pro license. If you don't, Deployrr shows a **Requirements Not Met** box that says "License - Basic, Plus, or Pro required".
- You finished the **Prerequisites** steps. See [Quick start](/getting-started/quick-start/).
- Your server is a VPS, Barebones or Virtual Machine system. In a Proxmox LXC container, **SMB Mount** and **NFS Mount** do not work. See the note below.
- Your server can reach the NAS on your network.
- For SMB, you know the NAS IP address, the share name, and a NAS user name and password that can read the share.
- For NFS, you know the NAS IP address and the export path, such as `/volume1/media`. The NAS user that owns the files must have the same UID as your Deployrr user. The first NFS prompt shows your Deployrr user's name and UID. Look up the NAS user's UID on your NAS.
- You have an empty folder for the mount, or you are happy to let Deployrr create one.

:::note
In a Proxmox LXC container, after you choose **Yes** at the first prompt, Deployrr shows "Not Supported". The text says: "SMB mounting is only supported on VPS, Barebones, or Virtual Machine systems. If you are using a Proxmox LXC, then use Bind Mounts or Rclone." The NFS option shows the same text with "NFS". Use Proxmox bind mounts or [Rclone](/storage/rclone-smb-setup/) instead. If Docker itself fails in your LXC, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).
:::

## Steps

### Mount an SMB share

1. Open **System** > **Mounts**.
2. Select **SMB Mount** ("Mount a remote SMB Share"). The number before "defined" counts the SMB entries Deployrr has added to `/etc/fstab`.
3. Read the **SMB Mount Setup** box and choose **Yes**. It lists what you need, including "You need the share name".
4. Wait while Deployrr checks for `cifs-utils` and installs it if it is missing. If you see "Failed to install required packages. Please check your internet connection and try again.", check that your server can reach the internet and start again.
5. Fill in the form:
   - **Server IP** is the IP address of your NAS, such as `192.168.5.112`.
   - **Share Name** is the name of the share on the NAS, such as `media`.
   - **Username** is your NAS user name.
   - **Password** is your NAS password.
6. Select **OK**. If you cancel instead, you see "SMB mount setup was cancelled."
7. Read "Select an empty directory as mount point for the SMB share" and select **OK**.
8. Read the **Directory Browser - Instructions** and select **OK**.
9. In the browser, pick the mount folder. It starts at `/`. Up and Down move, Spacebar opens a folder, Tab switches to the buttons and Esc cancels. To make a new folder, type its name at the end of the path, such as `/media/nas`.
10. Select **Select**, then choose **Confirm**. Deployrr creates the folder if it does not exist. If you choose **Cancel** here, you see "Directory selection cancelled" and go back to the **Mounts** menu.
11. Wait for the **Success** box: "SMB share mounted successfully at" and your folder.

:::caution
The password field does not hide what you type. Check that nobody can see your screen. Deployrr saves the user name and password in `/etc/samba/credentials`, which only root can read. All SMB mounts added this way share that one file. Each **SMB Mount** run overwrites it right after the form, even if you cancel later or the mount fails. That changes the login for your earlier SMB mounts too. Use the same NAS user every time.
:::

### Mount an NFS share

1. Open **System** > **Mounts**.
2. Select **NFS Mount** ("Mount a remote NFS Share").
3. Read the **NFS Mount Setup** box. Check that the UID it shows for your user matches the NAS user's UID, then choose **Yes**.
4. Wait while Deployrr checks for the NFS client package (`nfs-common` on Debian or Ubuntu) and installs it if it is missing. If it fails, you see the same "Failed to install required packages" message as for SMB.
5. Fill in the form:
   - **Server IP** is the IP address of your NAS, such as `192.168.5.112`.
   - **Export Path** is the path the NAS exports, such as `/volume1/media`.
6. Select **OK**. If you cancel instead, you see "NFS mount setup was cancelled."
7. Read "Select an empty directory as mount point for the NFS share" and select **OK**.
8. Read the **Directory Browser - Instructions** and select **OK**.
9. Pick the mount folder as in the SMB steps and choose **Confirm**.
10. Wait for the **Success** box: "NFS share mounted successfully at" and your folder.

NFS does not ask for a user name or password. Deployrr's setup box says the UIDs must match. If they don't, you may not be able to read or write the files. To understand how this works, read [UDMS part 08: Permission Denied Errors](https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Permission_Denied_Errors) (manual setup, background only).

### Point your apps at the share

Your NAS files now appear in the mount folder. Tell Deployrr to use it in **System** > **Folders** (see [Set your media, downloads and other folders](/storage/folders/)), then recreate your apps. Part 4 of [Mount a NAS share with Rclone](/storage/rclone-smb-setup/) covers the folder steps and the recreate command. Use your mount folder where it shows the Rclone path.

## Fix "Selected directory is not empty"

You picked a folder that already has files in it. Deployrr shows:

```txt
Selected directory is not empty. Please choose an empty directory or empty (if safe!) the selected directory and retry.
```

Select **OK**. Deployrr takes you back to the mount folder step. You can fix this in one of two ways.

**Pick a different folder.** This is the safest choice. Select **OK** on the instructions, then pick or create a new folder, such as `/media/nas2`.

**Empty the folder.** Do this only if the files are leftovers, such as folders your apps created while the share was not mounted. Replace `MOUNT_FOLDER` with the folder you picked.

:::caution
Do not delete anything until step 1 says the folder is not a mount. If a share is already mounted there, the folder shows your real NAS files. Deleting them removes data from your NAS.
:::

1. Check that the folder is not a mount:

   ```bash
   mountpoint MOUNT_FOLDER
   ```

   You must see `MOUNT_FOLDER is not a mountpoint`. If it says `is a mountpoint`, pick a different folder.

2. Look at what is in it, hidden files included:

   ```bash
   ls -A MOUNT_FOLDER
   ```

3. Move the files somewhere else. Replace `BACKUP_FOLDER` with any path outside the mount folder:

   ```bash
   mkdir -p BACKUP_FOLDER
   sudo find MOUNT_FOLDER -mindepth 1 -maxdepth 1 -exec mv -t BACKUP_FOLDER {} +
   ```

4. In Deployrr, select **OK** on the message, then pick the same folder again.

If apps keep writing into the folder, stop them first. If you installed the Deployrr [bash aliases](/using-deployrr/bash-aliases/), `dcdown` stops and removes all your containers, including orphaned ones. Your app data folders are not touched.

```bash
dcdown
```

Without the aliases, run this. Replace `DOCKER_FOLDER` with your Docker folder path and `HOSTNAME` with your server's hostname:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml down --remove-orphans
```

Start them again with `dcup` when the mount works. The Rclone version of this problem is a different error. See [Rclone mount folder is not empty](/storage/rclone-mount-not-empty/).

## Check it worked

1. Check that the folder is a mount. Replace `MOUNT_FOLDER` with your folder:

   ```bash
   mountpoint MOUNT_FOLDER
   ```

   It says `MOUNT_FOLDER is a mountpoint`.

2. List the folder. You should see your NAS files:

   ```bash
   ls MOUNT_FOLDER
   ```

3. Check the entry Deployrr added to the end of the file. It starts with `# SMB mount added by Deployrr` or `# NFS mount added by Deployrr`:

   ```bash
   tail -n 5 /etc/fstab
   ```

4. Reboot, then run the first two commands again:

   ```bash
   sudo reboot
   ```

5. In **System** > **Mounts**, the number before "defined" next to **SMB Mount** or **NFS Mount** has gone up. It counts entries in `/etc/fstab`, so failed runs count too.

## If the mount fails

Deployrr shows "Failed to mount SMB share. Please check your settings and try again." (or "NFS" in place of "SMB"). The box adds that you must edit `/etc/fstab` by hand to remove or change the mounts Deployrr added.

If you see "Failed to add SMB mount entry to /etc/fstab. Please check permissions and try again." instead, Deployrr could not write the file. Check that your user can use `sudo`, then run the option again.

Deployrr keeps the entry in `/etc/fstab` even when the mount fails. Running the option again adds a second entry. Fix the entry first.

:::caution
Linux reads `/etc/fstab` at every boot. A broken line in it can stop your server from booting normally, and the lines Deployrr adds don't tell Linux to skip a share it can't reach. Copy the file before you edit it, change only the Deployrr lines, and test your change with `sudo mount -a` before you reboot. If your server already won't boot, see [Server won't boot after an /etc/fstab change](/storage/fstab-boot-recovery/).
:::

1. Make a copy of the file:

   ```bash
   sudo cp /etc/fstab /etc/fstab.before-edit
   ```

   Deployrr also saved copies before each of its own changes, as `/etc/fstab_` followed by the date and time.

2. Open the file:

   ```bash
   sudo nano /etc/fstab
   ```

3. Find the line that starts with `# SMB mount added by Deployrr` or `# NFS mount added by Deployrr`. The mount line is right below it.
4. Correct the server, share or export path, or delete the comment line and the mount line. Leave every other line as it is.
5. Save the file, then test it:

   ```bash
   sudo mount -a
   ```

   No output means the file is fine. If you see an error, fix the line it names, or put your copy back with `sudo cp /etc/fstab.before-edit /etc/fstab`. Don't reboot until `sudo mount -a` runs without errors. For how a manual setup tests an fstab entry, see [UDMS part 07: Test fstab Configuration](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration) (manual setup, background only).

Check the IP address, share name or export path, and (for SMB) the user name and password in `/etc/samba/credentials`. Also check that the NAS is on and allows your server to connect.

## Remove a mount

**SMB Mount** and **NFS Mount** have no remove option. To remove a mount, edit `/etc/fstab` with the same care as above.

1. Unmount it. Replace `MOUNT_FOLDER` with your folder:

   ```bash
   sudo umount MOUNT_FOLDER
   ```

   If you see `target is busy`, an app or a terminal still uses the folder. Stop your apps (see [Fix "Selected directory is not empty"](#fix-selected-directory-is-not-empty)), leave the folder in every terminal, and run the command again.

2. Make a copy of the file:

   ```bash
   sudo cp /etc/fstab /etc/fstab.before-edit
   ```

3. Open `/etc/fstab`, delete the `# SMB mount added by Deployrr` (or NFS) line and the mount line below it, and save. Leave every other line as it is.

   ```bash
   sudo nano /etc/fstab
   ```

4. Test the file before you reboot:

   ```bash
   sudo findmnt --verify
   sudo mount -a
   ```

   `findmnt --verify` ends with `Success, no errors or warnings detected` or lists the problems. `mount -a` prints nothing when the file is fine. If you see an error, put your copy back with `sudo cp /etc/fstab.before-edit /etc/fstab`.

5. In **System** > **Folders**, point any folder that used the mount to a new place, then recreate your apps.

### Clean up old copies

Each time you get past the mount folder step of **SMB Mount** or **NFS Mount**, Deployrr saves a copy of `/etc/fstab` before it changes the file. So you may have several. They are small and harmless. To remove the ones you don't need, list them first:

```bash
ls -l /etc/fstab_*
```

The names end with the date and time, such as `/etc/fstab_20261112_143005`. Keep the newest one and your own `/etc/fstab.before-edit` until the server has rebooted fine. Delete the others one at a time, with the full name:

```bash
sudo rm /etc/fstab_20261112_143005
```

:::danger
Type each full name. Never run `rm` on `/etc/fstab` itself, and never use a pattern such as `/etc/fstab*`. Without `/etc/fstab`, your server can't boot normally.
:::

If no SMB mount line is left in `/etc/fstab`, you can also delete the file that holds your NAS user name and password. Check first. The command prints `0` when no line uses it:

```bash
grep -c "credentials=/etc/samba/credentials" /etc/fstab
```

Only if you saw `0`, delete the file. The next **SMB Mount** run creates it again.

```bash
sudo rm /etc/samba/credentials
```
