---
title: Run Deployrr in a Proxmox LXC container
sidebar:
  order: 1
  label: Run Deployrr in a Proxmox LXC
description: Create an LXC that suits Deployrr, pick the System Type, pass /dev/net/tun or a USB stick into it, add NAS storage, and know when a VM is better.
type: guide
tags:
  - host
  - install
applies_to: v6.0+
related:
  - storage/smb-nfs-mounts
  - storage/rclone-smb-setup
  - host/shim-task-debian
  - apps/gpu-transcoding
  - apps/qbittorrent-vpn
further_reading:
  - title: "UDMS part 10: pass the TUN network device into a Proxmox LXC"
    url: https://www.simplehomelab.com/udms-10-proxmox-lxc-network-device-passthrough/
  - title: "UDMS part 9: bind mount remote storage into a Proxmox LXC"
    url: https://www.simplehomelab.com/udms-part-9-bind-mount-remote-storage-in-proxmox-lxc-containers/
  - title: "UDMS part 3: when to choose a VM instead of an LXC"
    url: https://www.simplehomelab.com/udms-03-best-home-server-os/#When_to_Choose_VMs_Instead
videos:
  - id: r0nGMFs5pCY
    start: 173
    title: "Proxmox LXC network device passthrough: add /dev/net/tun to the container"
  - id: -ZSQdJ62r-Q
    start: 105
    title: "Docker on Proxmox LXC: LXC vs VM and privileged vs unprivileged"
  - id: D-XS0biLP14
    start: 209
    title: "Rclone SMB mount on Ubuntu/LXC: Proxmox LXC modifications"
    note: Manual Docker Compose setup. You turn on FUSE in Proxmox yourself; Deployrr does the steps inside the container.
last_reviewed: 2026-11-14
status: current
old_paths: []
sources: []
---

This guide is for you if Deployrr runs, or will run, in an LXC container on Proxmox. It covers creating the container, the System Type choice, the network device VPN apps need, USB sticks, NAS storage, Kasm, and when a virtual machine is the better choice.

## Overview

Deployrr has no menu that changes Proxmox settings. Anything that happens on the Proxmox host, you do by hand. Deployrr only checks what the container gives it and tells you what is missing.

You will:

1. Create a container that suits Deployrr, if you don't have one yet.
2. Set **System Type** to match your container.
3. Pass `/dev/net/tun` into the container, if you use VPN apps, and a USB stick, if an app needs one.
4. Give the container your NAS files with a bind mount or Rclone.
5. Know the limits for Kasm, GPU and Docker.

## Create a container that suits Deployrr

Deployrr doesn't create the container and doesn't check its size. You make these choices in Proxmox's **Create CT** wizard. The Proxmox steps are general Proxmox knowledge, not a Deployrr feature.

### Unprivileged or privileged

Pick **Unprivileged** unless you need Kasm. It is the safer choice: a process that breaks out of an unprivileged container has much less power on the Proxmox host. The choice changes three things in Deployrr:

| | Unprivileged LXC | Privileged LXC |
| --- | --- | --- |
| Socket Proxy | Runs without extra privileges | Gets extra privileges |
| Kasm | Can't install | Needs the [workaround](#kasm) for now |
| NAS files in a bind mount | Show as `nobody` until you [fix the owner](#files-show-as-nobody-in-an-unprivileged-lxc) | Keep their owner |

You can't switch a container between the two in place. If you need the other type later, create a new container and move Deployrr to it. See [Move Deployrr to a new server](/using-deployrr/move-to-new-server/).

### Settings in the Create CT wizard

1. **General**: keep **Unprivileged container** ticked for an unprivileged container. Tick **Nesting**. Docker runs containers inside your container, and it needs nesting to do that.
2. **Template**: pick Ubuntu 22.04 or newer, or Debian 11 or newer. Download the template in your storage's **CT Templates** first. See [Supported systems](/getting-started/quick-start/#supported-systems).
3. **Disks**: Docker images, app data and logs live on this disk. If your media stays on a NAS, 64 GB is a good start. Make it larger if downloads or the metadata for a big media library stay in the container.
4. **CPU** and **Memory**: Deployrr has no minimum. Size them for the apps you plan to run, and leave some for the Proxmox host. The video below uses 4 cores, 8 GB of memory and 4 GB of swap for a test container. A media server with many apps needs more. You can raise these later in the container's **Resources**.
5. **Network**: set a static IP address here, not inside the container. See [Proxmox LXC and VM](/host/fixed-ip/#proxmox-lxc-and-vm).

To watch an unprivileged container created for Docker, with nesting, disk, cores and memory, see [Docker on Proxmox LXC: creating the container at 4:10](https://youtu.be/-ZSQdJ62r-Q?t=250).

After the container starts:

1. Log in and create a regular Linux user that can run `sudo`. Deployrr doesn't run as root. See [Prerequisites](/getting-started/quick-start/#prerequisites).
2. If you plan to use VPN apps, add `/dev/net/tun` now. See [Pass /dev/net/tun into the container](#pass-devnettun-into-the-container).
3. If you plan to use Rclone for NAS shares, turn on FUSE now. See [Turn on FUSE for Rclone](#turn-on-fuse-for-rclone).
4. Install Deployrr. See [Quick start](/getting-started/quick-start/).

## Choose your System Type

**System Type** is a step in **Prerequisites**. It opens **Pick your System Type**. Choose the option that matches where Deployrr runs, then select **Select**. You see **System Type Configured** with "SUCCESS: System type set to" and your choice. **Skip** leaves the old value.

| Choice | Use it when |
| --- | --- |
| **Unprivileged LXC** | Deployrr runs in an unprivileged LXC container on Proxmox. |
| **Privileged LXC** | Deployrr runs in a privileged LXC container on Proxmox. |
| **Virtual Machine** | Deployrr runs in a VM on any hypervisor, such as Proxmox, WSL, ESXi or VirtualBox. |
| **Barebones** | Linux runs directly on the hardware. |
| **VPS** | Linux runs on a virtual private server in the cloud. |

To see how a VM, a privileged LXC and an unprivileged LXC differ, watch [Docker on Proxmox LXC: LXC vs VM and privileged vs unprivileged at 1:45](https://youtu.be/-ZSQdJ62r-Q?t=105).

You must set **System Type** before **Prerequisites** counts as complete. You can run it again at any time. See [System Type in Prerequisites](/getting-started/prerequisites/#5-system-type).

The choice changes these things:

- **Socket Proxy.** When you install Socket Proxy, Deployrr gives it extra privileges on every System Type except **Unprivileged LXC**. In an unprivileged LXC it stays off. The choice applies when you install. If you change System Type later, reinstall Socket Proxy from **Docker** > **Socket Proxy** so it applies. See [Socket Proxy](/docker/socket-proxy/).
- **SMB Mount and NFS Mount.** They only work on **VPS**, **Barebones** and **Virtual Machine**. See [Add NAS storage](#add-nas-storage).
- **Kasm.** See [Kasm](#kasm).

## Pass /dev/net/tun into the container

VPN apps need the `/dev/net/tun` network device. This covers qBittorrent VPN with Gluetun, Tailscale, ZeroTier and Cloudflare Tunnel. A new LXC container does not have it. You add it on the Proxmox host. This is general Proxmox knowledge, not a Deployrr feature.

In **System** > **Network**, Deployrr first shows a **Network Adapter** box that says VPN apps need the device at `/dev/net/tun`. Then it shows "Network Adapter Detection". It checks `/dev/net/tun` and the permissions of your user. It saves the result. The menu only changes when you run it again.

:::caution
You edit a Proxmox container config file. A mistake can stop the container from starting. Stop the container first, copy the file before you change it, and test the container after.
:::

Replace `ID` with your container's number, such as `101`. Run these commands on the Proxmox host, not in the container.

1. Stop the container:

   ```bash
   pct stop ID
   ```

2. Back up the config file:

   ```bash
   cp /etc/pve/lxc/ID.conf /root/ID.conf.before-tun
   ```

3. Open the file:

   ```bash
   nano /etc/pve/lxc/ID.conf
   ```

4. Add these two lines at the end, then save:

   ```txt
   lxc.cgroup2.devices.allow: c 10:200 rwm
   lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
   ```

5. Start the container:

   ```bash
   pct start ID
   ```

6. Inside the container, check that the device exists:

   ```bash
   ls -l /dev/net/tun
   ```

   The line must start with `c`, for example `crw-rw-rw-`. That means it is a character device.

7. In Deployrr, open **System** > **Network** and run it again.

If the container does not start, restore your copy on the Proxmox host and start it again:

```bash
cp /root/ID.conf.before-tun /etc/pve/lxc/ID.conf
pct start ID
```

Newer Proxmox versions can also add a device in the web UI under the container's **Resources**. Use `/dev/net/tun` as the path. The config lines above work on any version.

To see the config lines added on a Proxmox host, watch [Proxmox LXC network device passthrough at 2:53](https://youtu.be/r0nGMFs5pCY?t=173). For the same steps in writing, read [UDMS part 10](https://www.simplehomelab.com/udms-10-proxmox-lxc-network-device-passthrough/) (manual setup).

### What the result means

| What you see | What it means |
| --- | --- |
| `Network adapter device found at /dev/net/tun`, then `Device is readable and writable by YOUR_USER`, then `Network adapter detection completed - VPN support enabled` | Done. |
| `No network adapter detected at /dev/net/tun` and `Network adapter detection completed - No adapter detected` | The device is not in the container. Check the two config lines and restart the container. |
| `Device is not readable or writable by YOUR_USER` and `Network adapter detection failed - Permission issue detected` | The device is there, but your Linux user can't use it. The device must be readable and writable by your user. Check its permissions with `ls -l /dev/net/tun` inside the container. |

For the apps that use this, see [qBittorrent VPN](/apps/qbittorrent-vpn/#if-the-adapter-is-not-found) and [Tailscale](/networking/tailscale/).

## Pass a USB stick into the container

A Zigbee or Z-Wave stick must reach the LXC before Docker can hand it to an app such as Home Assistant. You do this on the Proxmox host. This is general Proxmox knowledge, not a Deployrr feature.

1. Plug the stick into the Proxmox host.
2. On the host, list the stable device names:

   ```bash
   ls -l /dev/serial/by-id/
   ```

   Copy the full path of your stick, such as `/dev/serial/by-id/usb-YOUR_STICK_NAME`. This name stays the same after a reboot. A name like `/dev/ttyUSB0` or `/dev/ttyACM0` can change.

3. In the Proxmox web interface, select your container, then **Resources** > **Add** > **Device Passthrough**.
4. Set the device path to the path from step 2.
5. Restart the container.
6. Inside the container, check the device:

   ```bash
   ls -l /dev/serial/by-id/
   ```

   You should see your stick at the path you entered. If the folder is empty or missing, look for a short device name too:

   ```bash
   ls -l /dev/ttyUSB* /dev/ttyACM*
   ```

   An error for one of the two names is normal. If neither command shows the stick, check the path you entered in step 4 and that the stick is plugged into the host.

7. In the app's Compose `devices:` line, use the path the stick has inside the container. For Home Assistant, see [Add a Zigbee or Z-Wave USB stick](/apps/home-assistant-container/#add-a-zigbee-or-z-wave-usb-stick-optional).

The **GID** field in **Device Passthrough** sets the group of the device inside the container. Leave it empty unless the app can't open the stick. Then set it to the group ID of the `dialout` group inside the container. To find it, run `getent group dialout` inside the container. The number after the second colon is the GID.

If your Proxmox has no **Device Passthrough** entry under **Add**, update Proxmox first.

## Add NAS storage

In an LXC container, open **System** > **Mounts** > **SMB Mount** or **NFS Mount** and choose **Yes** at the setup question. You then see "Not Supported". The text says: "SMB mounting is only supported on VPS, Barebones, or Virtual Machine systems. If you are using a Proxmox LXC, then use Bind Mounts or Rclone." **NFS Mount** shows the same text for NFS.

You have two choices:

- **Rclone.** Deployrr does not block it in an LXC, and it works once FUSE is turned on for the container. See [Turn on FUSE for Rclone](#turn-on-fuse-for-rclone) below, then [Mount a NAS share with Rclone](/storage/rclone-smb-setup/).
- **A Proxmox bind mount.** Mount the NAS on the Proxmox host, then share that folder with the container. The bind mount steps below are general Proxmox knowledge.

### Turn on FUSE for Rclone

Rclone mounts your share through FUSE. An LXC container can't use FUSE until you turn it on from the Proxmox host. Do this before you run **Install** in the Rclone menu:

1. In the Proxmox web interface, select the container.
2. Open **Options**, select **Features**, then select **Edit**.
3. Tick **FUSE** and select **OK**. Leave the features that are already ticked as they are.
4. Restart the container.

Deployrr does the rest inside the container when you run **Install**: it installs fuse3 and lets your apps read the mounted files.

To see this setting in Proxmox, watch [Rclone SMB mount on Ubuntu/LXC: Proxmox LXC modifications at 3:29](https://youtu.be/D-XS0biLP14?t=209) (manual Docker Compose setup). The video also adds an extra disk for the Rclone cache. You don't need it.

If **Automount** ends with "Mount verification failed", check that **FUSE** is ticked for the container, then read the Rclone log as shown in [Mount a NAS share with Rclone](/storage/rclone-smb-setup/).

### Bind mount a folder into the container

To understand bind mounts and ID mapping, read [UDMS part 9](https://www.simplehomelab.com/udms-part-9-bind-mount-remote-storage-in-proxmox-lxc-containers/) (manual setup).

This works for a NAS share mounted on the Proxmox host, or for a local disk. Replace these values:

- `ID` is your container's number.
- `/mnt/host-folder` is the folder on the Proxmox host.
- `/mnt/media` is the path you want inside the container.

1. On the Proxmox host, list the mount points the container already has:

   ```bash
   pct config ID | grep '^mp'
   ```

   `pct set` replaces a mount point with the same number. If `mp0` is in the list, use the next free number, such as `mp1`, in the next command.

2. Add the bind mount:

   ```bash
   pct set ID -mp0 /mnt/host-folder,mp=/mnt/media
   ```

3. Restart the container:

   ```bash
   pct reboot ID
   ```

4. Inside the container, list the folder:

   ```bash
   ls -l /mnt/media
   ```

   You should see your files.

5. In Deployrr, open **System** > **Folders** and set your media or downloads folder to `/mnt/media`. See [Set your media, downloads and other folders](/storage/folders/).

### Files show as nobody in an unprivileged LXC

In an unprivileged LXC, Proxmox shifts user IDs by 100000. A file owned by UID 1000 on the host shows as `nobody` (UID 65534) inside the container. Your user can't write to it.

The simplest fix is to make the host folder belong to the shifted IDs.

1. Inside the container, find your user's IDs:

   ```bash
   id
   ```

   If your user is `1000:1000`, the host IDs are `101000:101000`. Add 100000 to your own numbers if they differ.

2. On the Proxmox host, change the owner. Replace `/mnt/host-folder` with your folder.

   ```bash
   chown -R 101000:101000 /mnt/host-folder
   ```

:::caution
`chown -R` changes every file in the folder. If the folder is a NAS share, the NAS may refuse the change or other devices may lose access. Test on a small folder first. Don't run it on a folder that other computers rely on until you are sure.
:::

## Kasm

Kasm can't install on an **Unprivileged LXC**. The install stops with "System type not compatible", then "[REQUIRED] Compatible with:" and "[CURRENT] Your system:". Use a VM or a VPS for Kasm.

Right now Kasm may stop with the same message on **Virtual Machine**, **Privileged LXC** and **Barebones** too. Only **VPS** passes. If you run a Privileged LXC, a VM or a bare-metal server, this workaround gets you through:

1. Open **Prerequisites** > **System Type** and select **VPS**.
2. Install Kasm.
3. Open **System Type** again and set it back to your real type.

Set it back right away. Deployrr reads System Type when you install Socket Proxy or Kasm, and when you open **SMB Mount** or **NFS Mount**. Don't install or reinstall Socket Proxy while it is set to **VPS**.

:::caution
Don't do this on an **Unprivileged LXC**. Kasm can't run there.
:::

## GPU and Docker problems

- The **System** > **GPU** box says "LXC/Docker environments require the host to pass through the GPU device and toolkits." Do the pass-through on the Proxmox host first. See [Prepare your server's GPU](/host/gpu-host-prep/#3-proxmox-lxc). Then see [GPU hardware transcoding](/apps/gpu-transcoding/).
- If Docker stops starting containers after an update with "failed to create shim task", see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

## When a VM is the better choice

An LXC shares the Proxmox host's kernel. That makes it light, but you work around its limits by hand. Pick a virtual machine if you want to avoid that. A VM has its own kernel, so you don't pass devices by hand for VPN apps, and **SMB Mount** and **NFS Mount** work. Set **System Type** to **Virtual Machine**. For Kasm in a VM, see the workaround in [Kasm](#kasm). The cost is more memory and disk use than an LXC. For background, read [UDMS part 3: when to choose a VM instead](https://www.simplehomelab.com/udms-03-best-home-server-os/#When_to_Choose_VMs_Instead) (manual setup).

### Move Deployrr from an LXC to a VM

You can't convert a container into a VM. You move Deployrr with a Migration Package. It needs a Pro license on both servers. Without Pro, there is no Deployrr tool for this move. Ask in [Discord](/support/discord/).

The package holds your Docker folder and Deployrr's settings. It holds nothing outside the Docker folder, so NAS folders you bind mounted into the LXC are not in it.

1. In Proxmox, create the VM and give it a static IP. See [Proxmox LXC and VM](/host/fixed-ip/#proxmox-lxc-and-vm).
2. Create the same Linux user name the LXC uses, then install Deployrr in the VM. See [Quick start](/getting-started/quick-start/).
3. In the LXC, open **Tools** > **Backups** > **MP Create**. At the restart question, press any key other than `Y`. Don't run the same apps on both servers at once.
4. Copy the package to the VM, then run **MP Restore** there. The restore puts the Docker folder back at the same path it had in the LXC. At "Deployrr will now restart", press `Y`. For these steps, see [Move Deployrr to a new server](/using-deployrr/move-to-new-server/).
5. In **Prerequisites**, choose **System Type** and select **Virtual Machine**. The restore brings back the old setting, so the VM still says an LXC type until you change it.
6. Mount your NAS shares with **System** > **Mounts** > **SMB Mount** or **NFS Mount**. Use the same path the LXC used, such as `/mnt/media`, so your apps' folder paths still match. See [SMB and NFS mounts](/storage/smb-nfs-mounts/).
7. Follow [Fix up the new server](/using-deployrr/move-to-new-server/#fix-up-the-new-server). Run **System Checks** and **Domain Checks** again. If the VM's IP differs from the LXC's, run **Tools** > **Change Server IP** and enter the VM's IP, then the LXC's old IP. If the hostname differs, run **Tools** > **Change Hostname**. Then start your apps with **Tools** > **Stack Manager** > **Up**.
8. Shut down the LXC.

In a VM, you don't need the `/dev/net/tun` lines or the LXC USB steps. To give a USB stick to a VM, open the VM in Proxmox, then **Hardware** > **Add** > **USB Device**. For a GPU, see [Prepare your server's GPU](/host/gpu-host-prep/).

:::caution
Shut the LXC down, but don't delete it until the VM works. It is your backup. Don't start both at once.
:::

## Check it worked

- **System Type** shows "<your OS> is on - <your type>" in **Prerequisites**.
- **System** > **Network** ends with "VPN support enabled".
- `ls -l /dev/serial/by-id/` or `ls -l /dev/ttyUSB* /dev/ttyACM*` inside the container shows your USB stick, if you passed one.
- `ls /mnt/media` inside the container shows your NAS files.

## Next steps

- Install qBittorrent VPN: [qBittorrent VPN](/apps/qbittorrent-vpn/).
- Set up Tailscale: [Tailscale](/networking/tailscale/).
