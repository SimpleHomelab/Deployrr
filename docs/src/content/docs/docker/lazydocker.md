---
title: 'Lazydocker shows "client version 1.25 is too old"'
sidebar:
  order: 10
  label: Lazydocker on Docker v29
description: Open Lazydocker from Tools, see why it fails on Docker v29, and fix it by lowering Docker's minimum API version or installing Lazydocker on the host.
type: troubleshooting
tags:
  - docker
  - logs
applies_to: v6.0+
symptoms:
  - "Error response from daemon: client version 1.25 is too old. Minimum supported API version is 1.44, please upgrade your client to a newer version"
  - "Error response from daemon: client version 1.25 is too old. Minimum supported API version is 1.40"
  - Lazydocker & Docker v29 Incompatibility
  - Lazydocker is currently incompatible with Docker v29 and newer due to deprecated Docker API versions
  - Lazydocker does not start or shows no containers
related:
  - docker/container-keeps-restarting
  - getting-started/requirements-not-met
  - docker/apps-not-starting-after-reboot
  - using-deployrr/bash-aliases
  - using-deployrr/stack-manager
further_reading:
  - title: Docker Engine v29 announcement
    url: https://www.docker.com/blog/docker-engine-version-29/
  - title: Lazydocker project on GitHub
    url: https://github.com/jesseduffield/lazydocker
  - title: "UDMS part 13: Docker container logs commands"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Container_Logs
videos: []
last_reviewed: 2026-11-14
status: current
old_paths: ["/traefik/traefik-minimum-supported-docker-api"]
sources:
  - { type: issue, ref: "https://github.com/jesseduffield/lazydocker/issues/698" }
  - { type: issue, ref: "https://github.com/jesseduffield/lazydocker/issues/715" }
  - { type: issue, ref: "https://github.com/jesseduffield/lazydocker/issues/767" }
---

Lazydocker is a terminal app that lists your containers and their logs. You open it from **Tools** > **Lazydocker** ("Terminal UI for Docker Management"). On Docker v29 and newer, it can fail with an error about the client version. This page shows why, and two ways to make Lazydocker work.

Lazydocker needs completed Prerequisites and a Basic, Plus or Pro license. If you see "Requirements Not Met" instead, see [Requirements Not Met](/getting-started/requirements-not-met/).

## Symptoms

Before Lazydocker starts, Deployrr shows a box titled "Lazydocker & Docker v29 Incompatibility". It says Lazydocker is currently incompatible with Docker v29 and newer because of deprecated Docker API versions, and that you may see errors when you start it. It lists two options: wait for the Lazydocker project to update, or override your Docker minimum API version as described in a guide. That guide is this page. Press **OK** to continue.

After that, Lazydocker may show this error. The numbers can differ:

```txt
Error response from daemon: client version 1.25 is too old. Minimum supported API version is 1.44, please upgrade your client to a newer version
```

On Docker 29.3 and newer, the minimum reads `1.40`.

## Cause

Docker 29.0 raised the oldest API version it accepts to 1.44. Docker 29.3 lowered that default to 1.40. The Lazydocker in **Tools** talks to Docker with API version 1.25. Docker refuses that older version, so the error appears.

The Lazydocker project fixed this in its own releases (v0.24.2 and v0.24.4). The menu item runs the `lazyteam/lazydocker` image from Docker Hub. That image was last updated in May 2022 and has no newer versions. A Lazydocker contributor wrote that the image is not maintained. Pulling the image again does not help.

When you press **OK** in the box, Lazydocker runs as a temporary container and is removed when you quit. Its settings are kept in `appdata/lazydocker` inside your Docker folder.

## Fix

First, check your Docker version. This is a general Docker command:

```bash
sudo docker version
```

In the Server section, find a line like this. The numbers will differ:

```txt
API version:      1.52 (minimum version 1.44)
```

If the minimum version is higher than 1.25, pick one of the two fixes below. For what these numbers mean, see [Docker versions and Deployrr](#docker-versions-and-deployrr).

### Fix A: Lower the minimum API version in Docker

This makes **Tools** > **Lazydocker** work. It follows the Docker v29 announcement, which says to start Docker with `DOCKER_MIN_API_VERSION` set to an older version, for example 1.24. These steps are for a host that uses systemd, which includes Debian and Ubuntu.

:::caution
Restarting Docker restarts all your apps for a short time. Apps set to restart "no", and media apps that use **Delay Media Apps**, stay down until you start them. See [Apps are stopped or show empty folders after a reboot](/docker/apps-not-starting-after-reboot/). You can start them again with **Up** in [Stack Manager](/using-deployrr/stack-manager/).
:::

1. Note what is running now:

   ```bash
   sudo docker ps
   ```

2. Open the Docker service override file:

   ```bash
   sudo systemctl edit docker.service
   ```

3. Add these lines, then save and close the editor:

   ```ini
   [Service]
   Environment=DOCKER_MIN_API_VERSION=1.24
   ```

4. Reload systemd. `systemctl edit` usually does this for you, but it does no harm:

   ```bash
   sudo systemctl daemon-reload
   ```

5. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

6. Check the minimum version:

   ```bash
   sudo docker version
   ```

   The Server line should now read `minimum version 1.24`. If it still shows the higher number, the setting did not load. Repeat steps 2 to 5 and check the file contents.

7. Run `sudo docker ps` again and compare it with step 1. Start any app that is missing.

:::note
This setting lets old Docker clients talk to Docker again. To undo it, run `sudo systemctl revert docker.service`, then `sudo systemctl restart docker`.
:::

### Fix B: Install a current Lazydocker on the host

This does not change Docker. It does not change **Tools** > **Lazydocker** either. That menu item keeps running the old image.

1. Read the install script on the project's page first. The Lazydocker README tells you to check what you pipe into bash: [Lazydocker on GitHub](https://github.com/jesseduffield/lazydocker).
2. Run the install script from the README. By default it installs to `$HOME/.local/bin`. Set the `DIR` variable to use another folder.

   ```bash
   curl https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash
   ```

3. Run it with `sudo` and the full path, the same way Deployrr runs its own menu item:

   ```bash
   sudo ~/.local/bin/lazydocker
   ```

## Use Lazydocker

These keys are general Lazydocker behaviour.

1. Use the arrow keys to pick a container.
2. Open its logs from the panel on the right.
3. Press `q` to quit. From **Tools** > **Lazydocker**, this takes you back to the Tools menu.

## Check it worked

1. Open **Tools** > **Lazydocker** and press **OK**. After Fix A, the list of your containers shows and the error does not appear.
2. After Fix B, `sudo ~/.local/bin/lazydocker` shows your containers.

## Docker versions and Deployrr

Deployrr does not pin a Docker version, and it does not check which version you run.

- On the Docker side, **Prerequisites** > **System Checks** only checks that Docker is installed and running. If Docker is missing, it installs it with Docker's install script, or from Docker's apt repository if that script fails. On Arch, it installs Docker from the Arch repos.
- If Docker is already installed, System Checks asks "Would you like to check and update your system? (Y/n)". Only **Y** runs a full system update on Debian, Ubuntu and Arch. Any other answer, including Enter, skips it. The update can also move Docker to a newer version.

So a new server gets whatever Docker version Docker's script or the Arch repos provide that day, and an older server can move to a new major version after a system update.

To see your versions, run `sudo docker version`. In the Server section, look at two lines:

- `Version`: the Docker Engine version, for example `29.0.0`.
- `API version: 1.52 (minimum version 1.44)`: the newest Docker API this server speaks, and the oldest one it accepts. A tool that uses an older API than the minimum gets the "client version ... is too old" error. That is what happens to Lazydocker above.

To see whether a system update would install a new Docker on Debian or Ubuntu, run this general apt command before you answer **Y**:

```bash
sudo apt update
apt list --upgradable 2>/dev/null | grep -i docker
```

If `docker-ce` is listed with a new major version, read the release notes on the Docker site before you update.

## If you only need logs

You do not need Lazydocker to read logs.

- Go to **Apps** > **Manage Apps**, pick the app and choose **Logs**.
- Run `sudo docker logs --tail 100 CONTAINER` and replace `CONTAINER` with the container name. With the [bash aliases](/using-deployrr/bash-aliases/), run `dlogs CONTAINER`. It shows the last 50 lines and keeps following new ones. Press Ctrl+C to stop.

See [A container keeps restarting, is unhealthy or has exited](/docker/container-keeps-restarting/) for how to read a log. For more log commands, see [UDMS part 13: Container Logs](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Container_Logs) (manual setup).
