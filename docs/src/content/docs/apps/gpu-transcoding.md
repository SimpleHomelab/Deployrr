---
title: Set up GPU hardware transcoding for Jellyfin, Plex and Emby
sidebar:
  label: GPU hardware transcoding
description: Scan for your GPU in System > GPU, install Jellyfin, Plex or Emby with it, then turn on hardware transcoding in the app and check that it works.
type: how-to
tags:
  - media
  - host
  - docker
apps:
  - jellyfin
  - plex
  - emby
applies_to: v6.0.42+
related:
  - host/gpu-host-prep
  - using-deployrr/stack-manager
  - host/shim-task-debian
  - using-deployrr/update-apps
  - using-deployrr/bash-aliases
further_reading:
  - title: "UDMS part 11: Passing the iGPU through to a Proxmox LXC container"
    url: "https://www.simplehomelab.com/udms-11-gpu-passthrough-on-proxmox-lxc/#Step-by-Step_Proxmox_GPU_Passthrough_to_LXC_Container"
videos:
  - id: Nuo83uzTWco
    start: 337
    title: "Deployrr 6 overview: Intelligent GPU Detection"
  - id: xY3UrvDgGrs
    start: 700
    title: "Jellyfin Docker Compose: turn on and test hardware transcoding"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: VbNABbeZC-Y
    start: 1073
    title: "Plex Docker Compose: configure and test hardware transcoding"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
---

A GPU lets Jellyfin, Plex and Emby convert video faster and with less CPU load. This page shows how to scan for your GPU in Deployrr, give it to the app, turn on hardware transcoding inside the app, and check that it works.

:::caution
NVIDIA GPUs do not work yet with Jellyfin, Plex and Emby. This is a known issue in the v6.0.42 release notes, and a fix will follow. If you pick **NVIDIA GPU** for one of these apps, Deployrr shows a red error that starts with "GPU (runtime) is not supported for" and the app name. Then it shows "Installing APP without GPU acceleration (CPU only)". Installing the app again does not fix it. Intel and AMD GPUs work.
:::

:::note
This page needs Deployrr v6.0.42 or later. Apps installed with a GPU on earlier 6.0.x versions run on the CPU. To fix this, update Deployrr. See [Update Deployrr](/getting-started/updating-deployrr/). Then run **Apps** > **Refresh Cache** (or **Prerequisites** > **Build Cache**). Without that step, the install shows an error and falls back to the CPU. Then reinstall the app as in part 3.
:::

## Before you start

- You have a Basic, Plus or Pro license. If you don't, **System** > **GPU** shows a **Requirements Not Met (N)** box. It says "License - Basic, Plus, or Pro required. Current: ..." and "(Prerequisites->Verify)".
- You finished the **Prerequisites** steps. If you didn't, the same box also says "Prerequisites - All steps must be completed". See [Quick start](/getting-started/quick-start/).
- Your server has an Intel or AMD GPU. See the caution above for NVIDIA.
- For an Intel or AMD GPU, the folder `/dev/dri` exists on the server. This is a general Linux check, not a Deployrr feature:

  ```bash
  ls /dev/dri
  ```

  You should see a name that starts with `renderD`, such as `renderD128`. If you don't, see [Prepare your server's GPU so Deployrr can use it](/host/gpu-host-prep/).

- Plex only: you have a Plex Pass. Plex hardware transcoding needs it. This is general Plex knowledge, not a Deployrr rule.

:::note
If your server is a Proxmox LXC container, the GPU must first be passed through to it. Deployrr shows this note in the **Graphics Card** box: "LXC/Docker environments require the host to pass through the GPU device and toolkits." Set up the passthrough in Proxmox before you scan. Deployrr does not do it for you. For the steps, see [Prepare your server's GPU so Deployrr can use it](/host/gpu-host-prep/). For a longer walkthrough, see [UDMS part 11: Passing the iGPU through to a Proxmox LXC container](https://www.simplehomelab.com/udms-11-gpu-passthrough-on-proxmox-lxc/#Step-by-Step_Proxmox_GPU_Passthrough_to_LXC_Container) (manual setup). A virtual machine needs the GPU passed through too. That is general knowledge, not something Deployrr shows. For other Docker problems in an LXC container, see [Docker fails with "failed to create shim task"](/host/shim-task-debian/).
:::

## Steps

### 1. Scan for your GPU

1. Open **System** > **GPU**. The menu line reads "Graphics Card (for HW Transcoding)".
2. Read the **Graphics Card** box, then select **OK**.
3. Wait while Deployrr shows "1/2" ("Scanning for graphics card devices and toolkits...") and "2/2".
4. Read the result. It is one of these three:

| What you see | What it means |
| --- | --- |
| "Graphics card detection completed - AI & Hardware transcoding supported" | At least one GPU is ready. Go to part 2. |
| "GPU hardware detected but required toolkits are missing." | Deployrr found a GPU but it is not ready. Read the lines above that message. They name what is missing. Fix it, then run the scan again. |
| "No graphics cards detected via lspci." or "Graphics card detection completed - No GPU hardware found" | Deployrr found no GPU. |

To see GPU detection in Deployrr 6, watch [Deployrr 6 overview: Intelligent GPU Detection at 5:37](https://youtu.be/Nuo83uzTWco?t=337).

The scan prints a line for each GPU it finds:

| Line | What to do if it fails |
| --- | --- |
| "Intel GPU: Found" then "Intel Iris: Ready" | Nothing. It is ready. |
| "Intel Iris: /dev/dri not available" | Install the Intel GPU drivers, or pass the GPU into your LXC or VM, then check that `/dev/dri` exists. See [GPU host prep](/host/gpu-host-prep/). |
| "AMD GPU: Found" then "AMD ROCm: Ready" | Nothing. It is ready. |
| "AMD ROCm: /dev/dri not available" | Install the AMD GPU drivers, or pass the GPU into your LXC or VM, then check that `/dev/dri` exists. See [GPU host prep](/host/gpu-host-prep/). |
| "NVIDIA GPU: Found" then "NVIDIA Container Toolkit: Ready" | The NVIDIA driver is installed and Docker is set up for NVIDIA. |
| "NVIDIA Container Toolkit: Not installed or not configured" | Install the NVIDIA driver, then set up Docker for NVIDIA with the NVIDIA Container Toolkit. Deployrr does not install them. It prints the link to the NVIDIA install guide below this line. For the steps, see [GPU host prep](/host/gpu-host-prep/). |

If you see "lspci command not found. Install pciutils to enable GPU detection.", install the `pciutils` package with your Linux package manager, then scan again.

When the scan works, the **GPU** line in the **System** menu shows the GPU types in green, such as "nvidia, intel". If it shows "Not Set/Found" in yellow, the scan did not find a ready GPU.

:::note
Run the scan again any time you change drivers, set up the NVIDIA toolkit or move the GPU. The result is not refreshed on its own.
:::

### 2. Install the app with the GPU

Deployrr asks you about the GPU when you install the app. Install Jellyfin, Plex or Emby after the scan.

1. Install the app from the **Apps** menu, the way you install any app.
2. If you did not scan before, you see "GPU detection has not been run yet." Choose **Yes** at "Would you like to run GPU detection now?".
3. Find the box named "GPU Selection for" and the app name, such as "GPU Selection for Plex". It shows "Hardware transcoding" for Jellyfin, Plex and Emby.
4. At "Select GPU acceleration:", pick your GPU. The first entry is highlighted. There is no default, so check before you press Enter. The options are:
   - **NVIDIA GPU**
   - **AMD GPU**
   - **Intel GPU**
   - **CPU Only (no GPU acceleration)**
5. Wait for "GPU acceleration configured". The text in brackets after it is `intel_amd` for Intel or AMD, `nvidia` for NVIDIA, or `amd` for Ollama with AMD.

The box lists only the GPUs that are ready and that the app supports. For example, Ollama offers only NVIDIA and AMD, and Kasm offers only Intel and AMD. If you pick **CPU Only (no GPU acceleration)**, you see "Using CPU mode (no GPU acceleration)."

If no GPU is ready, you skip the box and see "No compatible GPU detected. Using CPU mode." If you cancel the box, you see "GPU selection cancelled. Using CPU mode." In all these cases the app installs and runs on the CPU.

If Deployrr cannot add the GPU lines, it shows an error and then "Installing APP without GPU acceleration (CPU only)". The app still installs. This is what happens when you pick NVIDIA for Jellyfin, Plex or Emby. See the caution at the top.

These apps ask the GPU question: Jellyfin, Plex, Emby, Dispatcharr, Ollama, Kasm, Chromium, DigiKam, Double Commander, FileZilla, Lollypop, Remmina and XPipe Webtop. Other apps do not.

### 3. If the app is already installed

Deployrr adds the GPU lines when it installs the app. Scanning later does not change an app that already runs. To add the GPU to an installed app, install it again over the existing one:

1. Open **Apps** > **Browse Apps** and pick the app.
2. Choose **Yes** at "Do you want to install this app?".
3. At "Already Installed", read what reinstalling does: it stops the existing container, recreates it with the latest image and preserves the data volumes. Choose **Yes**.
4. Answer the GPU box as in part 2.

You can also use **Apps** > **Manage Apps** > **Reinstall**. This option shows only when the app is stopped.

:::caution
Reinstalling replaces any manual edits in the app's compose file with the default. The file is `compose/HOSTNAME/APP.yml` inside your Docker folder. `HOSTNAME` is your server's hostname and `APP` is the app's name. Copy your edits somewhere safe first. For what else a reinstall keeps and resets, see [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
:::

### 4. Turn on hardware transcoding in the app

These steps are on the app's own screens, not Deployrr's. They are general knowledge, and the names can change between app versions.

**Jellyfin**

1. Open Jellyfin and go to **Dashboard** > **Playback** > **Transcoding**.
2. Set **Hardware acceleration** to **VAAPI**. This is for Intel and AMD.
3. For the device, use `/dev/dri/renderD128`. If the folder has a different `renderD` name, use that one.
4. Under **Enable hardware decoding for**, tick the formats your GPU supports.
5. Save.

To see this done by hand, watch [Jellyfin Docker Compose: turn on and test hardware transcoding at 11:40](https://youtu.be/xY3UrvDgGrs?t=700) (manual Docker Compose setup). The video picks Intel Quick Sync for an Intel GPU and says VAAPI suits AMD.

**Plex** (needs Plex Pass)

1. Open Plex and go to **Settings** > **Transcoder**.
2. Turn on **Use hardware acceleration when available**.
3. Turn on **Use hardware-accelerated video encoding** if you see it.
4. Save.

To see the Plex transcoder settings and a test, watch [Plex Docker Compose: configure and test hardware transcoding at 17:53](https://youtu.be/VbNABbeZC-Y?t=1073) (manual Docker Compose setup).

**Emby** (needs Emby Premiere)

1. Open Emby and go to **Settings** > **Transcoding**.
2. Pick the hardware acceleration type for your GPU.
3. Save.

## Check it worked

These checks are general Docker and Linux checks, not Deployrr features.

1. Check that the app container sees the GPU. Replace `jellyfin` with `plex` or `emby` if you use those:

   ```bash
   sudo docker exec jellyfin ls /dev/dri
   ```

   You see the same `card` and `renderD` names as on the server.

2. Play a video that needs transcoding. One way is to set the quality in the player lower than the file's quality.
3. Open the app's activity screen. In Jellyfin it is **Dashboard**. In Plex it is **Settings** > **Status** > **Dashboard**. In Plex, a hardware transcode shows "(hw)" next to the video line. In Jellyfin, the playback info names the hardware method.

If the check fails, open the compose file for the app. It is at `DOCKER_FOLDER/compose/HOSTNAME/jellyfin.yml`. Replace `DOCKER_FOLDER` with your Docker folder path, `HOSTNAME` with your server's hostname and `jellyfin` with your app. For Intel and AMD you see these lines:

```yaml
    devices:
      - /dev/dri:/dev/dri
```

If the lines are missing, the app was installed on the CPU. Repeat part 3.

### Other apps with NVIDIA or AMD

Ollama and Dispatcharr get a different block for NVIDIA:

```yaml
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

The v6.0.42 release notes say this block is untested on NVIDIA hardware. If it works for you, `nvidia-smi` shows your GPU inside the container. Run it with `sudo docker exec APP nvidia-smi`, and replace `APP` with the container name.

Ollama with AMD gets these lines:

```yaml
    devices:
      - /dev/kfd:/dev/kfd
      - /dev/dri:/dev/dri
```

### Apply a compose file edit

If you edit the file, recreate the app so it picks up the change. Use **Tools** > **Stack Manager** > **Recreate**. See [Stack Manager](/using-deployrr/stack-manager/). Or run this Deployrr command if you installed the bash aliases. Replace `APP` with the app's name:

```bash
dcrec APP
```

Without the aliases, run this. Replace `DOCKER_FOLDER` with your Docker folder path, `HOSTNAME` with your server's hostname and `APP` with the app's name:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate APP
```

## Related

- [Prepare your server's GPU so Deployrr can use it](/host/gpu-host-prep/): install drivers and pass the GPU into an LXC or VM.
- [Stack Manager](/using-deployrr/stack-manager/): recreate an app after you edit its compose file.
- [Update your apps](/using-deployrr/update-apps/): keep Jellyfin, Plex and Emby current.
- [Docker fails with "failed to create shim task"](/host/shim-task-debian/): Docker problems inside a Proxmox LXC container.
- [Bash aliases](/using-deployrr/bash-aliases/): what `dcrec` and `dps` do.
