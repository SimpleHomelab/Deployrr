---
title: Prepare your server's GPU so Deployrr can use it
sidebar:
  order: 8
  label: GPU host prep
description: Get your server, a Proxmox LXC or a VM to the point where System > GPU reports your Intel, AMD or NVIDIA GPU as Ready.
type: how-to
tags:
  - host
  - media
  - docker
applies_to: v6.0.42+
related:
  - apps/gpu-transcoding
  - host/proxmox-lxc
  - host/shim-task-debian
  - using-deployrr/stack-manager
further_reading:
  - title: "UDMS part 11: Step-by-step GPU passthrough to a Proxmox LXC container"
    url: https://www.simplehomelab.com/udms-11-gpu-passthrough-on-proxmox-lxc/#Step-by-Step_Proxmox_GPU_Passthrough_to_LXC_Container
videos:
  - id: kvnJYyyLoIk
    start: 152
    title: "Proxmox iGPU passthrough: finding renderD128 and passing it into the LXC"
  - id: Nuo83uzTWco
    start: 337
    title: "Deployrr 6 overview: Intelligent GPU Detection"
  - id: xY3UrvDgGrs
    start: 628
    title: "Jellyfin Docker Compose guide: checking /dev/dri on the Docker host"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Deployrr does not install GPU drivers or toolkits. It scans your server and reports what it finds. This page gets the server ready so **System** > **GPU** shows your GPU as **Ready**. For the scan screen, the result lines and installing apps with the GPU, see [GPU hardware transcoding](/apps/gpu-transcoding/).

The steps below are general Linux, NVIDIA and Proxmox steps, not Deployrr features. Package names and menus can differ between versions of your system.

:::caution
NVIDIA does not work yet with Jellyfin, Plex and Emby in v6.0.42. This is a known issue in the release notes. Intel and AMD work. NVIDIA is offered for Ollama and Dispatcharr, but the release notes say it is untested. See the [caution on the GPU page](/apps/gpu-transcoding/).
:::

## Before you start

- Know where Deployrr runs: directly on hardware, in a Proxmox VM, or in a Proxmox LXC container.
- Have console access to the server. Some steps need a reboot, and a mistake in boot settings can stop the server from starting.

## What Ready means

The scan reports a GPU as ready when these checks pass on the machine where Deployrr runs. In a VM or LXC, that is inside the VM or container, not on the Proxmox host.

| GPU | The scan needs |
| --- | --- |
| Any | The GPU shows in `lspci`. Without it you see "lspci command not found. Install pciutils to enable GPU detection." |
| Intel or AMD | A `renderD` device exists in `/dev/dri`. |
| NVIDIA | `nvidia-smi` works, and Docker lists an `nvidia` runtime. |

Install `pciutils` first if it is missing:

```bash
sudo apt install pciutils
```

Then check that your GPU appears:

```bash
lspci | grep -Ei 'vga|3d|display'
```

## Steps

Pick the part that matches your setup. Bare metal and VM share parts 1 and 2. A Proxmox VM needs part 4 first. A Proxmox LXC uses part 3.

### 1. Intel or AMD on bare metal or in a VM

The kernel drivers (`i915` or `xe` for Intel, `amdgpu` for AMD) usually come with your Linux distribution. Check for the device:

```bash
ls -l /dev/dri
```

You want a name that starts with `renderD`, such as `renderD128`.

If the folder is missing or has no `renderD` device, install the video acceleration packages. On Debian or Ubuntu:

1. For Intel:

   ```bash
   sudo apt install intel-media-va-driver
   ```

2. For AMD:

   ```bash
   sudo apt install mesa-va-drivers
   ```

3. Reboot the server.
4. Run `ls -l /dev/dri` again.

Optionally, install `vainfo` and run it to see which video formats the GPU can handle:

```bash
sudo apt install vainfo
vainfo
```

If `/dev/dri` is still missing after a reboot, the kernel does not see the GPU driver. Check `lspci` and your distribution's documentation for your GPU model.

### 2. NVIDIA on bare metal or in a VM

You need two things: the NVIDIA driver, and the NVIDIA Container Toolkit so Docker can use it.

1. Install the driver. On Ubuntu:

   ```bash
   sudo ubuntu-drivers install
   ```

   On Debian, install the `nvidia-driver` package from the non-free repository. See the Debian wiki for your release.

2. Reboot the server.
3. Check that the driver works:

   ```bash
   nvidia-smi
   ```

   You see a table with your GPU. If you get an error instead, see the note below.

4. Install the NVIDIA Container Toolkit. Follow NVIDIA's [install guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) for your distribution. It is the same link Deployrr prints under "NVIDIA Container Toolkit: Not installed or not configured".
5. Tell Docker to use the toolkit:

   ```bash
   sudo nvidia-ctk runtime configure --runtime=docker
   ```

6. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

7. Check that Docker lists the runtime:

   ```bash
   sudo docker info | grep -i runtimes
   ```

   The line must include `nvidia`.

:::caution
Restarting Docker stops your running containers. Do it when nobody is streaming. Most apps start again on their own, but Deployrr installs the media apps (Jellyfin, Plex, Emby, the Arr apps and others) so they don't. [Apps not starting after a reboot](/docker/apps-not-starting-after-reboot/) explains why. After the restart, open **Tools** > **Stack Manager** and choose **Up**. See [Stack Manager](/using-deployrr/stack-manager/).
:::

:::note
If `nvidia-smi` says it cannot communicate with the driver after a reboot, Secure Boot may be blocking the NVIDIA kernel module. Either turn off Secure Boot in the BIOS or sign the module. Your distribution's documentation explains how.
:::

### 3. Proxmox LXC

An LXC container shares the Proxmox host's kernel. The GPU driver lives on the Proxmox host, and you pass the GPU device into the container. Deployrr cannot do this for you. It shows "LXC/Docker environments require the host to pass through the GPU device and toolkits." in the **Graphics Card** box.

To understand how the passthrough works, read [UDMS part 11: Passing the iGPU through to a Proxmox LXC container](https://www.simplehomelab.com/udms-11-gpu-passthrough-on-proxmox-lxc/#Step-by-Step_Proxmox_GPU_Passthrough_to_LXC_Container) (manual setup, Proxmox only; it edits the container config file instead of using the menu below). The short version for Intel and AMD:

1. On the Proxmox host, check that `/dev/dri` exists and has a `renderD` device. If not, do part 1 on the host.
2. In the Proxmox web interface, select your container, then **Resources** > **Add** > **Device Passthrough**.
3. Set the device path to `/dev/dri/renderD128`. Use your own `renderD` name if it differs.
4. Set the **GID** to the group ID of the `render` group inside the container. To find it, run this inside the container:

   ```bash
   getent group render
   ```

   The number after the second colon is the GID.

5. Restart the container.
6. Inside the container, run `ls -l /dev/dri` and check the `renderD` device is there.

To see the `/dev/dri` check on screen, watch [Jellyfin Docker Compose guide: checking /dev/dri at 10:28](https://youtu.be/xY3UrvDgGrs?t=628) (manual Docker Compose setup; Deployrr does the compose part for you).

On older Proxmox versions without this menu, you add `lxc.cgroup2.devices.allow` and `lxc.mount.entry` lines to the container's config file instead. The UDMS guide shows them. To see that method on screen, watch [Proxmox iGPU passthrough at 2:32](https://youtu.be/kvnJYyyLoIk?t=152) (config file method). Back up the file first, the same way as in [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/#pass-devnettun-into-the-container).

In an unprivileged container, the device can show as owned by `nobody` or `nogroup`. That is fine if the permissions let everyone read and write it (`crw-rw-rw-`). If they don't, and the app can't use the GPU, check the GID you set.

**NVIDIA in an LXC** is more advanced. You install the NVIDIA driver on the Proxmox host. Inside the container, you install the same driver version with the `--no-kernel-module` option, pass the `/dev/nvidia*` devices in, and then do steps 4 to 7 of part 2 inside the container. NVIDIA and Proxmox document this, and the exact device list depends on your GPU. Because NVIDIA does not work yet with Jellyfin, Plex and Emby, an Intel or AMD GPU is the safer choice for those apps.

If Docker stops starting containers inside the LXC, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

### 4. Proxmox VM

Passing a GPU to a VM hands the whole GPU to that VM. The Proxmox host and other guests can no longer use it. If you only have an integrated GPU (iGPU), the host may lose its display. An LXC is usually easier for an iGPU.

:::caution
Step 2 edits the kernel boot line. A typing mistake can stop the host from booting. Keep console or IPMI access, and note the original line before you change it.
:::

1. Turn on virtualization and IOMMU (often called VT-d or AMD-Vi) in the server's BIOS.
2. On an Intel CPU, add `intel_iommu=on` to the kernel boot line of the Proxmox host. AMD CPUs usually have it on already. Proxmox's PCI passthrough documentation shows where this setting lives for your boot loader.
3. Reboot the Proxmox host.
4. In the Proxmox web interface, select the VM, then **Hardware** > **Add** > **PCI Device**.
5. Pick your GPU and save. For a modern GPU, tick **PCI-Express** if the option shows.
6. Start the VM.
7. Inside the VM, do part 1 (Intel or AMD) or part 2 (NVIDIA).

Set **System Type** to **Virtual Machine** in **Prerequisites**. See [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/#choose-your-system-type).

## Check it worked

1. Open **System** > **GPU** in Deployrr and run the scan again. It does not refresh on its own.
2. Read the result. You want "Intel Iris: Ready", "AMD ROCm: Ready" or "NVIDIA Container Toolkit: Ready". The [GPU hardware transcoding](/apps/gpu-transcoding/#1-scan-for-your-gpu) page explains every line. To see the scan in action, watch [Deployrr 6 overview: Intelligent GPU Detection at 5:37](https://youtu.be/Nuo83uzTWco?t=337).
3. Install the app with the GPU. Apps you installed earlier keep their old settings. To add the GPU to one, reinstall it. See [If the app is already installed](/apps/gpu-transcoding/#3-if-the-app-is-already-installed).

## Related

- [GPU hardware transcoding](/apps/gpu-transcoding/): the scan, installing apps with the GPU and in-app settings.
- [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/): System Type, devices and storage in an LXC.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): Docker problems inside an LXC.
- [Stack Manager](/using-deployrr/stack-manager/): start your apps again after a Docker restart.
