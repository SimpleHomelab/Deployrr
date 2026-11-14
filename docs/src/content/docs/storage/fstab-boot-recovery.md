---
title: Server won't boot after an /etc/fstab change
sidebar:
  order: 6
  label: Server won't boot after fstab change
description: Get your server booting again after a bad /etc/fstab line, using a console and a saved copy of the file, then stop it from happening again.
type: troubleshooting
tags:
  - host
  - docker
applies_to: v6.0+
symptoms:
  - You are in emergency mode
  - Give root password for maintenance
  - Cannot open access to console, the root account is locked
  - A start job is running for
  - Server does not come back after a reboot and SSH does not work
  - Server hangs at boot after I edited /etc/fstab
related:
  - storage/smb-nfs-mounts
  - storage/move-data-to-another-disk
  - docker/apps-not-starting-after-reboot
  - using-deployrr/stack-manager
further_reading:
  - title: "UDMS part 07: Test the fstab entry for an SMB mount"
    url: "https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration"
  - title: "UDMS part 08: Test the fstab entry for an NFS mount"
    url: "https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Test_the_fstab_Entry"
videos: []
last_reviewed: 2026-11-14
status: current
old_paths: ["/host/fstab-boot-recovery"]
sources: []
---

## Symptoms

You edited `/etc/fstab` or added an SMB or NFS mount, then rebooted. Now one or more of these happens:

- The server does not come back. SSH and every app stay unreachable.
- On a screen you see one of these messages:

  ```txt
  You are in emergency mode
  ```

  ```txt
  Give root password for maintenance
  ```

- The screen shows a long wait for a mount, usually about 1 minute 30 seconds, before the boot goes on:

  ```txt
  A start job is running for ...
  ```

## Cause

Linux reads `/etc/fstab` at every boot. It mounts each line in it.

- A line for a local disk that is missing, for example a wrong UUID or an unplugged disk, usually stops the boot in emergency mode. A typo in the file can do the same. A line without `nofail` has no way to skip the disk.
- A network share (`cifs` or `nfs`) that Linux can't reach usually only delays the boot. The share stays unmounted and the server then boots. Behaviour can differ between distros. If your server booted but your apps or folders are empty, see [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/) instead.

In **System** > **Mounts**, the lines that **SMB Mount** and **NFS Mount** add to `/etc/fstab` do not have `nofail`. Each one sits under a `# SMB mount added by Deployrr` or `# NFS mount added by Deployrr` line. If the run ended with "Failed to mount SMB share" (or NFS), the line is still in the file at the next reboot. Before each run, Deployrr saves a copy of the file as `/etc/fstab_` followed by the date and time, such as `/etc/fstab_20261112_143005`, so you may have several copies. See [Mount an SMB or NFS share without Rclone](/storage/smb-nfs-mounts/).

## Fix

You need a console. SSH does not work in emergency mode. Use one of these:

- A keyboard and monitor on the server.
- The Proxmox web console, if the server is a virtual machine.
- The web or recovery console of your VPS provider. See [If you get locked out](/host/secure-a-vps/#if-you-get-locked-out) for how it works.

If none of these gives you a shell, use a rescue system ([Fix C](#fix-c-use-a-rescue-system)).

:::caution
Editing `/etc/fstab` can break boot. Copy the file before every edit. Test your change with `sudo mount -a` and `sudo findmnt --verify` before you reboot.
:::

Pick the fix that matches what the console shows.

### Fix A: emergency mode asks for the root password

Use this fix if you see "Give root password for maintenance" and you know the root password.

1. Type the root password and press Enter.
2. Make the disk writable:

   ```bash
   mount -o remount,rw /
   ```

3. List the copies of the file:

   ```bash
   ls -l /etc/fstab*
   ```

   You may see your own copy, such as `/etc/fstab.before-edit`. You may also see copies Deployrr made, such as `/etc/fstab_20261112_143005`.

4. Keep the broken file so you can look at it later:

   ```bash
   cp /etc/fstab /etc/fstab.broken
   ```

5. Fix the file. Pick one way.

   **Put back an older copy.** Use your own copy from before the change. If you have none, use the newest `/etc/fstab_` copy that Deployrr made before the SMB or NFS line you suspect. A copy from before an SMB or NFS run does not have that mount. It also does not have any edits you made after that copy. Replace `COPY_NAME` with the file name from step 3 (this is a value you fill in):

   ```bash
   cp /etc/COPY_NAME /etc/fstab
   ```

   **Turn off the bad line.** Open the file:

   ```bash
   nano /etc/fstab
   ```

   Put a `#` at the start of the bad line. Leave every other line as it is. Save with Ctrl+O, then Enter. Exit with Ctrl+X.

6. Tell the system to read the file again:

   ```bash
   systemctl daemon-reload
   ```

7. Test the file:

   ```bash
   mount -a
   ```

   No output means the file is fine. If you see an error, fix the line it names and run the command again.

8. Check the file for mistakes:

   ```bash
   findmnt --verify
   ```

9. Reboot:

   ```bash
   reboot
   ```

### Fix B: the root account is locked

Ubuntu locks the root account by default. In that case the console shows this message and you can't use Fix A:

```txt
Cannot open access to console, the root account is locked
```

You can still start the server with a shell and no login. The keys below can differ between machines.

1. Reboot the server.
2. Open the GRUB menu. On a BIOS machine, hold Shift while it starts. On a UEFI machine, press Esc.
3. With the first entry selected, press `e`.
4. Find the line that starts with `linux`. Go to the end of that line and add a space and this text:

   ```txt
   init=/bin/bash
   ```

5. Press Ctrl+X or F10 to boot.
6. At the prompt, make the disk writable. You are root here, so you don't need `sudo`:

   ```bash
   mount -o remount,rw /
   ```

7. Look at the copies of the file:

   ```bash
   ls -l /etc/fstab*
   ```

8. Keep the broken file:

   ```bash
   cp /etc/fstab /etc/fstab.broken
   ```

9. Fix the file as in step 5 of Fix A. Either copy an older file over `/etc/fstab`, or open it with `nano /etc/fstab` and put `#` in front of the bad line.
10. Write your changes to disk:

    ```bash
    sync
    ```

11. Go on with the normal boot:

    ```bash
    exec /sbin/init
    ```

    If the server doesn't go on booting, turn it off and on again. You ran `sync`, so your change is saved.

### Fix C: use a rescue system

Use this fix when Fix A and Fix B don't work for you. For example, a VPS console may not show the GRUB menu, or the key to open GRUB may not get through a web console. A rescue system starts from a separate disk or image, so your server's `/etc/fstab` is not used.

1. Start a rescue system:
   - **VPS:** turn on rescue mode in your provider's panel and reboot into it. Your provider's docs tell you how to log in to it.
   - **Proxmox virtual machine:** in the Proxmox web interface, select the VM and go to **Hardware**. Edit the **CD/DVD Drive** (if there is none, use **Add** > **CD/DVD Drive**) and pick a live ISO that gives you a shell, such as the Ubuntu desktop ISO. A live ISO runs a full system from the image without installing it. In **Options** > **Boot Order**, move that drive to the top. Start the VM and open its **Console**. For the Ubuntu desktop ISO, choose **Try Ubuntu** and open a terminal.
   - **A physical server:** start it from a USB stick with a live ISO.
2. Find your server's main partition:

   ```bash
   lsblk -f
   ```

   Look for the large `ext4` or `xfs` partition. On a default Ubuntu install it is `ubuntu--vg-ubuntu--lv`. If you only see `LVM2_member`, run `sudo vgchange -ay` and run `lsblk -f` again.

3. Mount it. Replace `PARTITION` with the name from step 2, such as `sda2` or `mapper/ubuntu--vg-ubuntu--lv`:

   ```bash
   sudo mount /dev/PARTITION /mnt
   ```

4. Check that you mounted the right disk. You should see your fstab and its copies:

   ```bash
   ls -l /mnt/etc/fstab*
   ```

5. Keep the broken file:

   ```bash
   sudo cp /mnt/etc/fstab /mnt/etc/fstab.broken
   ```

6. Fix the file as in step 5 of Fix A, with `/mnt` in front of each path. Either copy an older file over it with `sudo cp /mnt/etc/COPY_NAME /mnt/etc/fstab`, or open it with `sudo nano /mnt/etc/fstab` and put `#` in front of the bad line.
7. Check that each disk in the file exists. List the disks and their UUIDs:

   ```bash
   sudo blkid
   ```

   Every `UUID=` line in `/mnt/etc/fstab` that doesn't start with `#` must match a UUID in this list. If one doesn't, put `#` in front of it. Check lines that start with `LABEL=` or `/dev/` against the same list.

8. Write your changes and unmount the disk:

   ```bash
   sync
   sudo umount /mnt
   ```

9. Leave the rescue system. On a VPS, turn off rescue mode in the panel and reboot. On Proxmox, move the server's disk back to the top of **Boot Order**, set the **CD/DVD Drive** to **Do not use any media**, and restart the VM.
10. When the server is up, run `sudo findmnt --verify` and `sudo mount -a` to test the file before the next reboot.

## Check it worked

1. The server boots to the login prompt and SSH works again.
2. List what is mounted:

   ```bash
   findmnt
   ```

   Your disk or share shows in the list. To check one folder, run `findmnt MOUNT_FOLDER`. Replace `MOUNT_FOLDER` with the folder where it should be.

3. Many apps don't start on their own after a reboot. In Deployrr, go to **Tools** > **Stack Manager** > **Up**. Wait for "Docker stack is up". See [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/).

If you turned off a line with `#`, the disk or share it mounted is not mounted now. Fix that line properly before you turn it on again. For an SMB or NFS line, see [If the mount fails](/storage/smb-nfs-mounts/#if-the-mount-fails). For a local disk, see [Mount the new disk for good](/storage/move-data-to-another-disk/#mount-the-new-disk-for-good).

## Keep it from happening again

Do these every time you edit `/etc/fstab`:

1. Copy the file first:

   ```bash
   sudo cp /etc/fstab /etc/fstab.before-edit
   ```

2. After you edit, check the file:

   ```bash
   sudo findmnt --verify
   ```

3. Test it:

   ```bash
   sudo mount -a
   ```

   No output means the file is fine. Don't reboot until it runs without errors.

To see how a manual setup tests an fstab entry, read [UDMS part 07: Test fstab Configuration](https://www.simplehomelab.com/udms-07-mount-remote-shares-smb/#Test_fstab_Configuration) for SMB or [UDMS part 08: Test the fstab Entry](https://www.simplehomelab.com/udms-08-mount-remote-folders-using-nfs/#Test_the_fstab_Entry) for NFS (manual setup, background only).

Add `nofail` to the options of a data disk. It means the boot goes on when that mount fails. The disk line in [Move data to another disk](/storage/move-data-to-another-disk/) already has it:

```txt
UUID=YOUR_UUID  /mnt/data  ext4  defaults,nofail  0  2
```

You can do the same for a share that Deployrr added. In the mount line, the options are the fourth column, just before the two numbers `0 0`. Add `,nofail` at the end of them. Keep the commas and don't add spaces. The mount still fails when the share is not reachable, but the boot goes on. Run `sudo findmnt --verify` and `sudo mount -a` after you save.
