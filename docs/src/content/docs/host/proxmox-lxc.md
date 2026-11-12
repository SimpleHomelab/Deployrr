---
title: Run Deployrr in a Proxmox LXC container
sidebar:
  order: 1
  label: Run Deployrr in a Proxmox LXC
description: Pick the right System Type, pass /dev/net/tun into your LXC, add NAS storage with bind mounts, and know what Kasm and a VM change.
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
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

This guide is for you if Deployrr runs in an LXC container on Proxmox and you hit a limit of the container. It covers the System Type choice, the network device VPN apps need, NAS storage, Kasm, and when a virtual machine is the better choice.

## Overview

Deployrr has no menu that changes Proxmox settings. Anything that happens on the Proxmox host, you do by hand. Deployrr only checks what the container gives it and tells you what is missing.

You will:

1. Set **System Type** to match your container.
2. Pass `/dev/net/tun` into the container, if you use VPN apps.
3. Give the container your NAS files with a bind mount or Rclone.
4. Know the limits for Kasm, GPU and Docker.

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

## Add NAS storage

In an LXC container, open **System** > **Mounts** > **SMB Mount** or **NFS Mount** and choose **Yes** at the setup question. You then see "Not Supported". The text says: "SMB mounting is only supported on VPS, Barebones, or Virtual Machine systems. If you are using a Proxmox LXC, then use Bind Mounts or Rclone." **NFS Mount** shows the same text for NFS.

You have two choices:

- **Rclone.** Deployrr does not block it in an LXC. See [Mount a NAS share with Rclone](/storage/rclone-smb-setup/).
- **A Proxmox bind mount.** Mount the NAS on the Proxmox host, then share that folder with the container. The steps below are general Proxmox knowledge.

To see the Proxmox LXC changes needed for Rclone, watch [Rclone SMB mount on Ubuntu/LXC: Proxmox LXC modifications at 3:29](https://youtu.be/D-XS0biLP14?t=209) (manual Docker Compose setup; Deployrr does these steps for you). To understand bind mounts and ID mapping, read [UDMS part 9](https://www.simplehomelab.com/udms-part-9-bind-mount-remote-storage-in-proxmox-lxc-containers/) (manual setup).

### Bind mount a folder into the container

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

- The **System** > **GPU** box says "LXC/Docker environments require the host to pass through the GPU device and toolkits." Do the pass-through on the Proxmox host first. Then see [GPU hardware transcoding](/apps/gpu-transcoding/).
- If Docker stops starting containers after an update with "failed to create shim task", see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

## When a VM is the better choice

An LXC shares the Proxmox host's kernel. That makes it light, but you work around its limits by hand. Pick a virtual machine if you want to avoid that. A VM has its own kernel, so you don't pass devices by hand for VPN apps, and **SMB Mount** and **NFS Mount** work. Set **System Type** to **Virtual Machine**. For Kasm in a VM, see the workaround in [Kasm](#kasm). The cost is more memory and disk use than an LXC. For background, read [UDMS part 3: when to choose a VM instead](https://www.simplehomelab.com/udms-03-best-home-server-os/#When_to_Choose_VMs_Instead) (manual setup).

## Check it worked

- **System Type** shows "<your OS> is on - <your type>" in **Prerequisites**.
- **System** > **Network** ends with "VPN support enabled".
- `ls /mnt/media` inside the container shows your NAS files.

## Next steps

- Install qBittorrent VPN: [qBittorrent VPN](/apps/qbittorrent-vpn/).
- Set up Tailscale: [Tailscale](/networking/tailscale/).

## Related

- [Mount SMB and NFS shares](/storage/smb-nfs-mounts/): the mounts that work on a VPS, bare metal or VM.
- [Mount a NAS share with Rclone](/storage/rclone-smb-setup/): the NAS option that works in an LXC.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): Docker problems in an LXC.
- [GPU hardware transcoding](/apps/gpu-transcoding/): GPU steps for media apps.
- [qBittorrent VPN](/apps/qbittorrent-vpn/): the VPN app that needs `/dev/net/tun`.
