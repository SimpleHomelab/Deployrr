---
title: Docker fails with "failed to create shim task" in a Proxmox LXC container
description: Fix the Docker "failed to create shim task" permission denied error in a Proxmox LXC container by pinning containerd.io or relaxing AppArmor.
type: troubleshooting
tags:
  - docker
  - debian
  - updates
applies_to: v6.0+
symptoms:
  - "Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: open sysctl net.ipv4.ip_unprivileged_port_start file: reopen fd 8: permission denied: unknown"
  - failed to create shim task
  - open sysctl net.ipv4.ip_unprivileged_port_start file permission denied
  - Containers stopped starting after I updated Docker on a Debian or Ubuntu LXC container in Proxmox
related:
  - docker/waiting-for-container
  - docker/no-internet-in-containers
  - getting-started/quick-start
  - getting-started/videos-and-guides
further_reading:
  - title: Docker Engine release notes
    url: https://docs.docker.com/engine/release-notes/
  - title: "Reddit: Impossible to run docker"
    url: https://www.reddit.com/r/docker/comments/1op6e1a/impossible_to_run_docker/
last_reviewed: 2026-11-09
status: current
old_paths: ["/operating-system/failed-to-create-shim-task-debian"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1436318756807901235" }
---

Docker containers fail to start on a Debian or Ubuntu system that runs inside a Proxmox LXC container. This page gives two fixes. Both are general Linux and Proxmox steps. This is not a Deployrr bug.

## Symptoms

A container will not start. Docker shows this error:

```txt
Error response from daemon: failed to create task for container: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error during container init: open sysctl net.ipv4.ip_unprivileged_port_start file: reopen fd 8: permission denied: unknown
```

It often starts after you update Docker, the LXC container or Proxmox.

## Cause

Docker uses a package called `containerd.io`. Newer versions of it, from 1.7.28-2 on, are stricter about system settings. Inside an LXC container, Proxmox's default AppArmor rules can block that access. Docker then cannot start the container and shows `permission denied`.

You have two ways out. You can stay on the older `containerd.io` (fix 1). Or you can switch off AppArmor for this one LXC container (fix 2).

:::caution
Both fixes lower your security. Fix 1 keeps you on an older package without newer security fixes. Fix 2 removes AppArmor protection from the LXC container. Pick one. Fix 1 is the safer choice for most people.
:::

How Deployrr affects this:

- When Docker is not installed yet, **Prerequisites** > **System Checks** (described as "System and Docker Checks") installs it with Docker's own install script. That gets the newest `containerd.io`.
- When Docker is already installed, System Checks asks "Would you like to check and update your system? (Y/n)". If you press `Y`, it updates all your operating system packages. Pressing Enter skips the update. A normal update respects a held package, so fix 1 survives it.
- If System Checks has to install Docker again, Deployrr shows "Unholding containerd.io..." and installs the newest version. Apply fix 1 again afterwards.
- In **Prerequisites** > **System Type**, choose "Unprivileged LXC" or "Privileged LXC" to match your container.

## Fix

### Fix 1: Pin containerd.io to 1.7.28-1

Run these steps inside the LXC container where Docker runs, not on the Proxmox host.

1. Find the exact `containerd.io` version strings your system can install:

   ```bash
   apt-cache madison containerd.io
   ```

2. In the list, find the line that starts with `1.7.28-1`. Copy the whole version string. It ends with your distribution name.

   For Ubuntu 24.04 (Noble) it is `1.7.28-1~ubuntu.24.04~noble`. For Ubuntu 22.04 (Jammy) it is `1.7.28-1~ubuntu.22.04~jammy`. On Debian, copy the string from the list, because it differs by release.

3. Install that version. Replace `VERSION` with the string you copied. This is a value you fill in.

   ```bash
   sudo apt install "containerd.io=VERSION"
   ```

   Apt warns that it will downgrade the package. Confirm to continue.

4. Hold the package so updates do not replace it:

   ```bash
   sudo apt-mark hold containerd.io
   ```

5. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

### Fix 2: Use an unconfined AppArmor profile

Use this only if you cannot use fix 1. Run these steps on the Proxmox host, not inside the LXC container.

:::caution
`unconfined` turns off AppArmor for this LXC container. Only use it if you understand the risk and the container is isolated from untrusted networks.
:::

1. Open the container's configuration file. Replace `ID` with the container ID, such as `101`. This is a value you fill in.

   ```bash
   nano /etc/pve/lxc/ID.conf
   ```

2. Add this line at the end of the file:

   ```txt
   lxc.apparmor.profile = unconfined
   ```

3. Save the file.
4. Restart the LXC container. Replace `ID` as before.

   ```bash
   pct reboot ID
   ```

## Check it worked

1. Inside the LXC container, list your containers:

   ```bash
   sudo docker ps
   ```

2. Your containers show `Up` in the `STATUS` column. The `failed to create shim task` error is gone.
3. If you used fix 1, check the version and the hold:

   ```bash
   containerd --version
   apt-mark showhold
   ```

   The first command shows 1.7.28. The second lists `containerd.io`.

## Undo the fix later

Check the [Docker release notes](https://docs.docker.com/engine/release-notes/) from time to time. When a newer `containerd.io` works in your setup, remove the workaround.

For fix 1, release the hold and update the package:

```bash
sudo apt-mark unhold containerd.io
sudo apt update
sudo apt install --only-upgrade containerd.io
```

Then run `sudo docker ps` and start a container to test. If the error returns, repeat fix 1.

For fix 2, remove the `lxc.apparmor.profile = unconfined` line from `/etc/pve/lxc/ID.conf` on the Proxmox host. Then restart the LXC container.

## Related

- [Deployrr times out waiting for a container to start](/docker/waiting-for-container/): other reasons a container does not start, and how to read its log.
- [No internet on the server or in containers after setup](/docker/no-internet-in-containers/): another host-level Docker problem.
- [Quick start](/getting-started/quick-start/): the Prerequisites steps in order.
- [Videos and guides](/getting-started/videos-and-guides/): includes a Proxmox tutorials playlist.
