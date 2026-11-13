---
title: Prepare your server's GPU so Deployrr can use it
sidebar:
  order: 8
  label: GPU host prep
description: Get your server, a Proxmox LXC or a VM to the point where System > GPU reports your Intel, AMD or NVIDIA GPU as Ready, and fix nvidia-smi driver errors.
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
last_reviewed: 2026-11-13
status: current
old_paths: []
sources: []
---

Deployrr does not install GPU drivers or toolkits. It scans your server and reports what it finds. This page gets the server ready so **System** > **GPU** shows your GPU as **Ready**. For the scan screen, the result lines and installing apps with the GPU, see [GPU hardware transcoding](/apps/gpu-transcoding/).

The steps below are general Linux, NVIDIA and Proxmox steps. Package names can differ on your system.

:::caution
NVIDIA does not work yet with Jellyfin, Plex and Emby in v6.0.42 (a known issue in the release notes), and it is untested with Ollama and Dispatcharr. Intel and AMD work. See the [caution on the GPU page](/apps/gpu-transcoding/).
:::

Have console access to the server before you start. Some steps need a reboot, and a mistake in boot settings can stop the server from starting.

## What Ready means

The scan reports a GPU as ready when these checks pass on the machine where Deployrr runs. In a VM or LXC, that is inside the VM or container, not on the Proxmox host.

| GPU | The scan needs |
| --- | --- |
| Any | The GPU shows in `lspci` (install `pciutils` if the command is missing). |
| Intel or AMD | A `renderD` device exists in `/dev/dri`. |
| NVIDIA | The `nvidia-smi` command is installed, and Docker lists an `nvidia` runtime. The scan does not run it, so check that `nvidia-smi` works yourself (part 2). |

## Steps

Pick the part that matches your setup. Bare metal and VM share parts 1 and 2. A Proxmox VM needs part 4 first. A Proxmox LXC uses part 3.

### 1. Intel or AMD on bare metal or in a VM

The kernel drivers (`i915` or `xe` for Intel, `amdgpu` for AMD) usually come with your Linux distribution. Check for the device:

```bash
ls -l /dev/dri
```

You want a name that starts with `renderD`, such as `renderD128`.

If the folder is missing or has no `renderD` device, install the video acceleration package, reboot, and check again. On Debian or Ubuntu that is `sudo apt install intel-media-va-driver` for Intel or `sudo apt install mesa-va-drivers` for AMD. If it is still missing, check your distribution's documentation for your GPU model.

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

   You see a table with your GPU. If you get an error instead, see [If nvidia-smi shows an error](#if-nvidia-smi-shows-an-error).

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
Restarting Docker stops your running containers. Deployrr installs the media apps (Jellyfin, Plex, Emby, the Arr apps and others) so they don't start again on their own ([why](/docker/apps-not-starting-after-reboot/)). After the restart, open **Tools** > **Stack Manager** and choose **Up** (needs a Basic, Plus or Pro license).
:::

### 3. Proxmox LXC

An LXC container shares the Proxmox host's kernel. The GPU driver lives on the Proxmox host, and you pass the GPU device into the container. Deployrr cannot do this for you.

For background, read [UDMS part 11: Passing the iGPU through to a Proxmox LXC container](https://www.simplehomelab.com/udms-11-gpu-passthrough-on-proxmox-lxc/#Step-by-Step_Proxmox_GPU_Passthrough_to_LXC_Container) (manual setup; it edits the container config file instead of using the menu below). The short version for Intel and AMD:

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

On older Proxmox versions without this menu, add the device lines to the container's config file instead, as the UDMS guide and [Proxmox iGPU passthrough at 2:32](https://youtu.be/kvnJYyyLoIk?t=152) show. Back up the file first, the same way as in [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/#pass-devnettun-into-the-container).

In an unprivileged container, the device can show as owned by `nobody` or `nogroup`. That is fine if the permissions let everyone read and write it (`crw-rw-rw-`). If they don't, and the app can't use the GPU, check the GID you set.

**NVIDIA in an LXC** needs the driver on the Proxmox host and the [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) inside the container. For Jellyfin, Plex and Emby, an Intel or AMD GPU is the safer choice for now.

If Docker stops starting containers inside the LXC, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).

### 4. Proxmox VM

Passing a GPU to a VM hands the whole GPU to that VM, so the host and other guests can't use it. For an integrated GPU (iGPU), an LXC is usually easier.

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

## If nvidia-smi shows an error

Run these checks on the machine where the driver is installed: the server or VM, or the Proxmox host for an LXC. Start with what the error says.

| Error | Most likely cause |
| --- | --- |
| `NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver` | The driver's kernel module isn't loaded. Secure Boot blocked it, or a kernel update left it unbuilt. |
| `Failed to initialize NVML: Driver/library version mismatch` | The driver was updated but the old one is still loaded. Reboot. In an LXC, the driver inside the container doesn't match the one on the Proxmox host. |
| `nvidia-smi: command not found` | The driver isn't installed, or on Debian the `nvidia-smi` package is missing. |

### Check that the module is loaded

```bash
lsmod | grep nvidia
```

No output means the module isn't loaded. Try to load it and read the error:

```bash
sudo modprobe nvidia
```

### Secure Boot

Check whether Secure Boot is on:

```bash
mokutil --sb-state
```

If it says `SecureBoot enabled` and `modprobe` printed `Key was rejected by service`, the kernel refused the driver because it isn't signed with a key your system trusts. You have two ways out:

- **Enroll the signing key.** A driver built on your server (DKMS) is signed with a local key that you enroll once. Import it and set a one-time password:

  ```bash
  sudo mokutil --import /var/lib/dkms/mok.pub
  ```

  Reboot. A blue MOK Manager screen opens: choose **Enroll MOK** and type that password. On Ubuntu, the driver install may ask for the password itself, and `sudo ubuntu-drivers install` usually installs a module that is already signed, so this comes up less often there. The Debian wiki's Secure Boot page has the details for Debian.
- **Turn off Secure Boot** in the BIOS or UEFI settings.

You need a screen and keyboard or the server's remote console for both. In a VM, Secure Boot is a setting of the VM, not the host.

### A kernel update broke the driver

The driver's kernel module must match the running kernel. When the driver is built on your server (DKMS, as Debian's `nvidia-driver` package does), it is rebuilt for each new kernel. If that build failed, the new kernel has no NVIDIA module. Check:

```bash
uname -r
dkms status
```

If `dkms status` doesn't list `nvidia` as `installed` for the kernel `uname -r` shows, install the headers for that kernel and rebuild:

```bash
sudo apt install linux-headers-$(uname -r)
sudo dkms autoinstall
```

On a Proxmox host, the headers package is `proxmox-headers-$(uname -r)` (`pve-headers-$(uname -r)` on older releases) instead of `linux-headers-$(uname -r)`.

If `dkms status` lists nothing, the driver came prebuilt (common on Ubuntu) or from NVIDIA's own installer. Run `sudo ubuntu-drivers install` or NVIDIA's installer again so it installs the module for the new kernel.

Reboot and run `nvidia-smi` again. If it still fails, pick the previous kernel in the boot menu to get the GPU back while you sort it out.

### Driver versions on Proxmox and in an LXC

An LXC uses the Proxmox host's kernel module, and the driver files inside the container must be the same version. After you update the driver on the host, install the same version inside the container. On the host, show the loaded version:

```bash
cat /proc/driver/nvidia/version
```

Don't run that inside the container: it shows the host's module there too. Inside the container, list the installed driver files instead:

```bash
ls /usr/lib/x86_64-linux-gnu/libnvidia-ml.so.*
```

The number at the end, such as `550.120`, must match the host's version. If the host itself shows the error, fix the host first with the checks above.

### Apps say the driver is too old

If an app container won't start and the error mentions `unsatisfied condition: cuda>=`, the app's image needs a newer NVIDIA driver than the one installed. Update the driver on the server (or the Proxmox host), reboot, and start the app again.

## Check it worked

1. Open **System** > **GPU** in Deployrr and run the scan again. It does not refresh on its own.
2. You want "Intel Iris: Ready", "AMD ROCm: Ready" or "NVIDIA Container Toolkit: Ready". [GPU hardware transcoding](/apps/gpu-transcoding/#1-scan-for-your-gpu) explains every line. To see the scan, watch [Deployrr 6 overview: Intelligent GPU Detection at 5:37](https://youtu.be/Nuo83uzTWco?t=337).
3. Install the app with the GPU. To add the GPU to an app you installed earlier, reinstall it. See [If the app is already installed](/apps/gpu-transcoding/#3-if-the-app-is-already-installed).

## Related

- [GPU hardware transcoding](/apps/gpu-transcoding/): the scan, installing apps with the GPU and in-app settings.
- [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/): System Type, devices and storage in an LXC.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): Docker problems inside an LXC.
- [Stack Manager](/using-deployrr/stack-manager/): start your apps again after a Docker restart.
