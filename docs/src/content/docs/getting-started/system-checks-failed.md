---
title: "System Checks failed in Prerequisites (clock drift, username not found, Docker not running, docker0)"
sidebar:
  order: 4
  label: System Checks failed
description: Fix each failed System Checks step in Deployrr v6, from clock drift and a missing Linux user to Docker not running and a missing docker0 address.
type: troubleshooting
tags:
  - install
  - docker
  - host
applies_to: v6.0+
symptoms:
  - "System clock drift detected (... seconds off)"
  - "Time Synchronization Error"
  - "CRITICAL WARNING: Your system clock is drifted by ... seconds."
  - "Network API unreachable for time check. Skipping time synchronization check."
  - "Username ... not found"
  - "Docker not installed. Installing now..."
  - "Docker installed but not running"
  - "Docker installation failed"
  - "Could not determine IP of docker0 interface"
  - "System and Docker Checks - NOT DONE"
  - System Checks fails on a Proxmox LXC or a distro that is not Debian, Ubuntu or Arch
related:
  - getting-started/prerequisites
  - getting-started/requirements-not-met
  - host/shim-task-debian
  - docker/no-internet-in-containers
  - using-deployrr/edit-env-and-secrets
last_reviewed: 2026-11-14
status: current
old_paths: ["/host/system-checks-failed"]
sources: []
further_reading:
  - title: "UDMS part 05: create a non-root Linux user"
    url: "https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User"
  - title: "UDMS part 12: verify that Docker is running"
    url: "https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/#Verify_that_Docker_is_Running_on_Ubuntu"
videos:
  - id: rdqbAr0TFnQ
    start: 677
    title: "Deployrr 5 walkthrough: System Checks and Docker install"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: "-ZSQdJ62r-Q"
    start: 620
    title: "Docker on Proxmox LXC: creating a non-root user and adding it to sudo"
  - id: "-ZSQdJ62r-Q"
    start: 1102
    title: "Docker on Proxmox LXC: installing Docker with the convenience script"
---

You run **Prerequisites** > **System Checks** and it stops with a red error. The menu row then reads `System and Docker Checks - NOT DONE`. Later steps, such as **Domain Checks**, need it to show `DONE`. This page lists the five checks, the message each failure prints, and how to fix it.

## Symptoms

System Checks runs five numbered steps in the terminal, in this order. It stops at the first failure. The failure line starts with a red `✗`.

| Step | What you see while it runs | Failure message |
| --- | --- | --- |
| 1/5 | `Verifying system time synchronization...` | `System clock drift detected (N seconds off)`, then a box titled **Time Synchronization Error** |
| 2/5 | `Verifying Linux username...` | `Username YOUR_USERNAME not found` |
| 3/5 | `Checking Docker installation...` | See [Docker is missing or not running](#fix-docker-is-missing-or-not-running-steps-3-and-4) |
| 4/5 | `Verifying Docker daemon...` | `Docker installed but not running` or `Docker installation failed` |
| 5/5 | `Checking docker0 network IP...` | `Could not determine IP of docker0 interface` |

After any failure you also see:

```txt
Check the documentation at https://docs.deployrr.app.
If needed, you may generate a troubleshooting log from the Settings menu.
```

Then you see `Going back to the menu in 60 seconds. Or, press OK to go back now...`. Deployrr returns to the menu after 60 seconds, or sooner when you press Enter.

When everything passes, the last line is:

```txt
All System and Docker checks passed
```

## Cause

System Checks makes sure the clock is right, your Linux user exists, Docker runs, and Docker has its network address. A failed check means one of these is wrong on the host. Fix it on the host, then run the step again. See [Run System Checks again](#run-system-checks-again).

## Before you start

If you see **Requirements Not Met** instead of the five steps, finish **Disclaimers** and **Username** first. The username must be a Linux user other than `root`. See [Requirements Not Met](/getting-started/requirements-not-met/).

All commands below run on the Docker host, in a terminal. Commands marked as general Linux advice are not part of Deployrr. Menus and package names can differ by distribution.

## Fix a clock that is off (step 1)

You see this line, then a box titled **Time Synchronization Error**:

```txt
System clock drift detected (42 seconds off)
```

The number is an example. The box says your clock is off by that many seconds. It warns that Let's Encrypt and Authelia will fail. It tells you to fix the clock on the host (Proxmox or the operating system) using NTP or `timedatectl`.

### Cause

Deployrr compares your server's clock with the time from an internet server. A gap of more than 10 seconds fails the check. The check uses the real time, so a wrong timezone alone does not cause it.

### Fix

The steps below are general Linux advice.

1. Look at the clock status:

   ```bash
   timedatectl status
   ```

2. Find the lines `System clock synchronized` and `NTP service`. If either says `no` or `inactive`, the clock is not syncing.
3. Turn on time syncing:

   ```bash
   sudo timedatectl set-ntp true
   ```

4. Wait about 30 seconds. Check again:

   ```bash
   timedatectl status
   ```

   `System clock synchronized: yes` means it worked.

5. If `set-ntp` fails with a message that the NTP service is not installed, install a time service. Pick one. This is general Debian and Ubuntu advice.

   :::caution
   Installing packages changes your server. Take a snapshot or backup first.
   :::

   ```bash
   sudo apt install systemd-timesyncd
   ```

   or:

   ```bash
   sudo apt install chrony
   ```

6. Run System Checks again.

### On a Proxmox LXC container or a VM

This is general Proxmox advice. An LXC container uses the clock of the Proxmox host. You can't set it from inside the container. Fix the time on the Proxmox host, then run System Checks again.

A VM keeps its own clock. If the time keeps drifting, check the time settings of the Proxmox host as well.

### "Skipping time synchronization check" is not an error

If the server can't reach the time source, you see a yellow warning instead of a failure:

```txt
Network API unreachable for time check. Skipping time synchronization check.
```

System Checks skips the clock check and goes on to step 2. You may also see:

```txt
Time parsing failed. Assuming time is fine.
```

It also goes on. If you see either warning, check that the server has internet access. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/).

## Fix "Username not found" (step 2)

You see:

```txt
Username YOUR_USERNAME not found
```

### Cause

The name saved in the **Username** step is not a Linux user on this server. The name may have a typo, the user may have been deleted, or you are on a different server than before.

### Fix

1. Check whether the user exists. Replace `YOUR_USERNAME` with the name from the message. This is a value you fill in.

   ```bash
   id YOUR_USERNAME
   ```

   If the user exists, you see its `uid`, `gid` and groups. If not, you see `no such user`.

2. If the name has a typo, go back to **Prerequisites** > **Username** and enter the correct one. See [Prerequisites: Username](/getting-started/prerequisites/#4-username).
3. If the user does not exist, run **Username** again. Deployrr asks if you want to create the user and add it to sudoers.
4. Run System Checks again.

If the user was renamed, or you want Deployrr to use a different user on purpose, read [Use a different Linux user after setup](#use-a-different-linux-user-after-setup) before you change anything.

To see a user created by hand, watch [Docker on Proxmox LXC: creating a non-root user at 10:20](https://youtu.be/-ZSQdJ62r-Q?t=620). For the written steps, read [UDMS part 05: create a non-root Linux user](https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#1_Create_a_New_User) (manual setup).

## Use a different Linux user after setup

**Username** only saves a name. It does not change anything you set up earlier. Your Docker folder, your apps and a few other steps keep the old user until you update them.

The simplest choice is to keep the user you set up with. Change it only if you have to.

In the commands below, `NEW_USER`, `OLD_USER` and `DOCKER_FOLDER` are values you fill in. `DOCKER_FOLDER` is the path to your Docker folder.

### Before Environment

If you have not run **Prerequisites** > **Environment** yet, run **Username** again and enter the new name. Nothing else needs to change.

### After setup

:::caution
These steps change who owns your Docker files and what your apps run as. A mistake can stop apps from starting or writing their data. Back up first and check each app afterwards.
:::

1. Back up the Docker folder. See [Backups](/using-deployrr/backups/#back-up-the-docker-folder).
2. Check that the new user exists:

   ```bash
   id NEW_USER
   ```

   You should see a `uid` and a `gid`. If you see `no such user`, create it in the next step when Deployrr offers to.

3. Go to **Prerequisites** > **Username** and enter the new name. Deployrr refuses `root`. If the user does not exist, it asks "Do you want to create this user and add it to sudoers?". You see "Username set to NEW_USER", or "User NEW_USER has been created" if Deployrr created it. From now on, start Deployrr as `NEW_USER`.
4. Get the user's numeric IDs:

   ```bash
   id -u NEW_USER
   id -g NEW_USER
   ```

5. Change four values in the `.env` file in your Docker folder: `PUID` (the first number), `PGID` (the second number), `PRIMARY_USERNAME` (the name) and `USERDIR` (`/home/NEW_USER`). Use **Tools** > **.env Editor** (Pro) or edit by hand. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/#edit-a-value-with-the-env-editor) and [Edit by hand without Pro](/using-deployrr/edit-env-and-secrets/#edit-by-hand-without-pro).

   :::note
   Don't run **Environment** again to do this. It warns "If you proceed, you may break previously installed apps", and both **Recreate** and **Reuse** delete files. **Reuse** also removes your apps' compose files.
   :::

6. Give the new user the same folders the old user had. Don't run a recursive `chown` on `appdata` or the whole Docker folder. Some apps, such as pgAdmin, Mosquitto and n8n, own their folders with fixed IDs, and you would break them.

   ```bash
   sudo chown NEW_USER:NEW_USER DOCKER_FOLDER DOCKER_FOLDER/appdata
   sudo chown -R NEW_USER:NEW_USER DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   sudo setfacl -m u:NEW_USER:rwX DOCKER_FOLDER
   sudo setfacl -dm u:NEW_USER:rwX DOCKER_FOLDER
   sudo setfacl -Rm u:NEW_USER:rwX DOCKER_FOLDER/appdata DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   sudo setfacl -Rdm u:NEW_USER:rwX DOCKER_FOLDER/appdata DOCKER_FOLDER/compose DOCKER_FOLDER/logs
   ```

   These commands leave `secrets` and `.env` alone. They stay owned by root and readable only by root.

   If your Docker folder is inside the old user's home, for example `/home/OLD_USER/docker`, the new user may not be allowed into that home folder. Check with `sudo -u NEW_USER ls DOCKER_FOLDER`.

7. Run [System Checks again](#run-system-checks-again).
8. Recreate your apps so they read the new `.env` values. Use **Tools** > **Stack Manager** > **Recreate** and choose `all` (Basic, Plus or Pro license). Without a license, use the Docker Compose command on that page. See [Which one after which change](/using-deployrr/restart-recreate-reinstall/#which-one-after-which-change). Restart does not pick up the change.
9. Open each app and check that it works. Cloud Commander, Double Commander and VS Code show your files under `/data/NEW_USER` now.

If one app can't write its files after this, give that app's folder to the new user. Replace `APP` with the app's name:

```bash
sudo chown -R NEW_USER:NEW_USER DOCKER_FOLDER/appdata/APP
```

Don't do this for apps that use fixed IDs, such as pgAdmin, Mosquitto and n8n. Restore from your backup if an app breaks.

### Other steps that keep the old user

Redo these only if you use them:

- **Bash Aliases** are in the old user's `~/.bashrc`. With **Username** set to the new user, run **Bash Aliases** again (Basic, Plus or Pro license). It writes to the new user's `~/.bashrc`, whoever you are logged in as. Then open a new session as the new user. See [Turn on the aliases](/using-deployrr/bash-aliases/#turn-on-the-aliases).
- The Rclone mount runs as the old user. Its config is in `appdata/rclone` in your Docker folder. The old user's home only holds a link to it. Remove the mount service and run **Automount** again. See [Change the mount folder, cache or NAS details](/storage/rclone-smb-setup/#change-the-mount-folder-cache-or-nas-details).
- **Mail Relay** maps the old user to your FROM address. Run **System** > **Mail Relay** again. See [Change your SMTP details later](/host/smtp-mail-relay/#change-your-smtp-details-later).
- A Migration Package needs the same user on the new server. See [Move to a new server](/using-deployrr/move-to-new-server/).

### Renaming the user

Deployrr expects the user's home folder to be `/home/USERNAME`. The default Docker folder is inside it, at `/home/USERNAME/docker`. If you rename the user and move the home folder, the Docker folder moves too. Deployrr then looks for it in the wrong place.

If your Docker folder is in the old user's home, don't rename the user. Keep the old user, or create a new user and switch to it with the steps above. The Docker folder stays where it is.

### Check it worked

1. Show the saved values. The file is root-only, so use `sudo`:

   ```bash
   sudo grep -E '^(PUID|PGID|PRIMARY_USERNAME|USERDIR)=' DOCKER_FOLDER/.env
   ```

   They should match the new user.

2. Open **Prerequisites**. The new username shows in green.
3. System Checks shows `DONE`, and your apps start and write their files.

### Remove the old user's access (optional)

When Deployrr created your Docker folder, it gave the old user read and write access to it with ACLs (access control lists). New files and folders inside get the same access. The commands above add access for the new user but don't remove the old user's access. If you are retiring the old account, remove it too.

Do this only after everything works as the new user, including the [other steps](#other-steps-that-keep-the-old-user) you use. Skip it if your Docker folder is in the old user's home and you keep that account.

1. Check the current entries on the Docker folder:

   ```bash
   getfacl DOCKER_FOLDER
   ```

   Look for `user:OLD_USER:rw-` and `default:user:OLD_USER:rw-`.

2. Remove the old user's entries from every file and folder, then the default entries from every folder:

   ```bash
   sudo setfacl -R -x u:OLD_USER DOCKER_FOLDER
   sudo find DOCKER_FOLDER -type d -exec setfacl -x d:u:OLD_USER {} +
   ```

   This also clears the old entry from `secrets` and `.env`. It had no effect there, because those stay readable only by root.

3. Run `getfacl DOCKER_FOLDER` again. The `OLD_USER` lines are gone. If you ran step 6 of [After setup](#after-setup), the `NEW_USER` lines are still there.
4. Open a few apps and check that they still work. If one breaks, give the old user access to that app's folder again first. Replace `APP_FOLDER` with the app's folder in `appdata`:

   ```bash
   sudo setfacl -Rm u:OLD_USER:rwX DOCKER_FOLDER/appdata/APP_FOLDER
   ```

   Then restart the app. Restore the folder from your backup only as a last resort: the backup is from before the switch, so anything the app saved since then is lost.

## Fix Docker is missing or not running (steps 3 and 4)

### What step 3 does

Deployrr checks Docker when it starts. It counts Docker as installed only if Docker answers. This matters for what happens next.

**Docker answered at start.** You see:

```txt
Docker already installed
Would you like to check and update your system? (Y/n):
```

Type `y` to update all system packages now. Press Enter, or any other key, to skip. The capital `Y` in the prompt is not the default: Enter skips. You then see `Skipping system updates`. If you update, Deployrr checks the Docker service and starts it if needed. You see `Docker service is running` or `Starting Docker service...`.

**Docker did not answer at start.** You see:

```txt
Docker not installed. Installing now...
```

This also appears when Docker is installed but stopped. Deployrr then installs Docker:

- On Arch, you see `Installing Docker from Arch repos...`.
- On every other system, Deployrr uses the Debian and Ubuntu install. You see `Installing Docker using the convenience script...`. If that fails, you see `Convenience script failed. Trying fallback installation...`, then `Installing Docker packages with held package override...`.
- On systems that are not based on Debian or Arch, the install is likely to fail. Install Docker yourself first, start it, then restart Deployrr. See [the Docker documentation](https://docs.docker.com/engine/install/).

After the install, you see `Starting Docker service...`.

To see System Checks install Docker, watch [Deployrr 5 walkthrough: System Checks at 11:17](https://youtu.be/rdqbAr0TFnQ?t=677) (shows Deployrr v5; menus differ in v6).

### Messages in step 4

Step 4 shows one of these:

```txt
Docker is installed and running
```

```txt
Docker installed but not running
```

```txt
Docker installation failed
```

### Cause

- `Docker installed but not running`: the Docker program is on the server, but the Docker service did not start or does not answer.
- `Docker installation failed`: the Docker program is still not on the server after the install. The install may have failed because of no internet, a package manager problem, or an unsupported distribution.

### Fix: Docker installed but not running

1. Check the service:

   ```bash
   sudo systemctl status docker
   ```

2. If it says `inactive` or `failed`, start it:

   ```bash
   sudo systemctl start docker
   ```

3. Check that Docker answers:

   ```bash
   sudo docker info
   ```

   You should see a long list of details, not an error.

4. If the service will not start, read the reason in its log. This is general Linux advice:

   ```bash
   sudo journalctl -u docker --no-pager -n 50
   ```

5. Once `sudo docker info` works, close Deployrr and start it again. Step 3 uses the Docker state from when Deployrr started.
6. Run System Checks again.

:::note
If you run System Checks while Docker is stopped, Deployrr runs the Docker install again. To avoid that, start Docker first, then restart Deployrr.
:::

### Fix: Docker installation failed

1. Check that the server has internet access. See [No internet on the server or in containers after setup](/docker/no-internet-in-containers/).
2. Check your distribution. Deployrr runs the Arch install on Arch. On every other system it runs the Debian and Ubuntu install, which only works on Debian-based systems.
3. Scroll up in the terminal and read the errors printed during the install.
4. Fix those errors. Or install Docker by hand from [the Docker documentation](https://docs.docker.com/engine/install/) and make sure `sudo docker info` works.
5. Run System Checks again.

To see Docker installed by hand with the convenience script, watch [Docker on Proxmox LXC: Docker installation at 18:22](https://youtu.be/-ZSQdJ62r-Q?t=1102). To check that Docker runs, read [UDMS part 12: verify that Docker is running](https://www.simplehomelab.com/udms-12-install-docker-and-docker-compose/#Verify_that_Docker_is_Running_on_Ubuntu) (manual setup).

### Containers fail to start after Docker is reinstalled

If Docker was installed again on a Proxmox LXC container, your containers may fail with `failed to create shim task`. See [Docker fails with "failed to create shim task" in a Proxmox LXC container](/host/shim-task-debian/).

## Check and re-apply held packages

You only need this if you pinned a Docker package with `apt-mark hold`, as described in [the shim task page](/host/shim-task-debian/).

How System Checks treats held packages on Debian and Ubuntu:

- **You answer `y` to the update.** Deployrr shows no hold messages. A normal `apt` upgrade skips held packages, so your hold usually stays. This part is general `apt` behaviour.
- **Deployrr installs Docker** (you saw `Docker not installed. Installing now...`). You see `Checking for held packages...`. For each one it shows `Unholding PACKAGE...`, where `PACKAGE` is the package name, such as `containerd.io`. It then installs the newest version. It does not hold the package again.

The packages it releases are `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-compose-plugin`, `docker-ce-rootless-extras`, `docker-buildx-plugin` and `docker-model-plugin`.

To check and re-apply a hold:

:::caution
Changing the `containerd.io` version can stop containers from starting. Take a snapshot or backup first. On Proxmox, snapshot the LXC container.
:::

1. Check which packages are held:

   ```bash
   apt-mark showhold
   ```

   If `containerd.io` is not in the list, the hold is gone.

2. Check the installed version:

   ```bash
   containerd --version
   ```

3. If you need an older version, follow fix 1 in [the shim task page](/host/shim-task-debian/#fix-1-pin-containerdio-to-1728-1). It installs the version you want and holds it.
4. If you already have the right version, hold it again:

   ```bash
   sudo apt-mark hold containerd.io
   ```

5. Restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

## Fix "Could not determine IP of docker0 interface" (step 5)

You see:

```txt
Could not determine IP of docker0 interface
```

### Cause

Docker is running, but Deployrr can't read the address of Docker's default network (`docker0`). Docker may have started without that network, for example because of a custom Docker setup.

### Fix

The steps below are general Docker and Linux advice.

1. Check that the network exists:

   ```bash
   ip addr show docker0
   ```

   A working network shows a line like `inet 172.17.0.1/16`. The address on your server can differ.

2. Check what Docker reports for it:

   ```bash
   sudo docker network inspect bridge
   ```

   Look for `Gateway` under `IPAM`.

3. If `docker0` is missing, restart Docker:

   ```bash
   sudo systemctl restart docker
   ```

   Then run `ip addr show docker0` again.

4. If it is still missing, look at your Docker settings file for a `"bridge": "none"` line. That line turns the default network off.

   ```bash
   sudo cat /etc/docker/daemon.json
   ```

   :::caution
   Editing Docker settings can stop all your containers. Back up the file first, for example `sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.bak`. Edit only the line you understand.
   :::

5. After you change the file, restart Docker with `sudo systemctl restart docker`.
6. Run System Checks again.

On success, you see a line like `docker0 network IP: 172.17.0.1`. If your Docker folder already has a `.env` file, Deployrr saves the address there and shows `DOCKER0_IP saved to .env`.

## Run System Checks again

1. From the main menu, select **Prerequisites**.
2. Select **System Checks**.
3. If the step already shows `DONE`, you see:

   ```txt
   It appears that System Checks were already completed.
   If you want to redo it, press Y/y to resume or any other key to go back:
   ```

   Press `y` to run it again. Any other key goes back to the menu.

4. Read each step as it runs.

When you press `y`, the status changes to `NOT DONE`. If the rerun fails, it stays `NOT DONE`, even if the step passed before. Fix the cause and run it again.

## Check it worked

The steps end with:

```txt
All System and Docker checks passed
```

In the **Prerequisites** menu, the row now reads `System and Docker Checks - DONE`. In Hybrid mode you can continue with **Domain Checks**. If that step fails, see [Domain Checks failed](/getting-started/domain-checks-failed/). In Local mode, Domain Checks is not needed.
