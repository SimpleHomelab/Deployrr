---
title: Bash aliases
description: Turn on the Deployrr bash aliases, look up every shortcut, and pick the right alias to read container, Traefik and CrowdSec logs.
type: reference
tags:
  - shell
  - docker
  - compose
applies_to: v6.0+
related:
  - using-deployrr/custom-yml
  - reverse-proxy/check-traefik-logs
  - docker/waiting-for-container
  - host/change-hostname
  - getting-started/quick-start
videos:
  - id: rdqbAr0TFnQ
    start: 1468
    title: "Deployrr 5 walkthrough: installing the bash aliases"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: Ux9khKhqhcg
    start: 463
    title: "Bash aliases: Docker and Docker Compose shortcuts in use"
    note: "Manual setup. The video builds a ~/.bash_aliases file by hand and some alias names differ from v6. In Deployrr v6, use the names on this page."
further_reading:
  - title: "UDMS part 13: Docker commands and bash aliases"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/
last_reviewed: 2026-11-13
status: current
old_paths: ["/operating-system/bash-aliases-explained"]
sources: []
sidebar:
  order: 16
---

Deployrr can add a set of short commands (aliases) to your terminal. For example, `dps` lists your containers and `dclogs` follows the logs of your Compose apps. This page shows how to turn them on and lists every alias.

## Turn on the aliases

Setting up the aliases needs a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).

1. Start Deployrr.
2. Choose **System** from the main menu.
3. In the **System Preparation** menu, choose **Bash Aliases**. The line reads `Setup Anand's Bash Aliases`.
4. Wait for Deployrr to finish. It prints the contents of the alias file when it is done.
5. Open a new terminal window, or run `source ~/.bashrc` in your current one.

After this, the line reads `Setup Anand's Bash Aliases - DONE`.

If the aliases are already set up, Deployrr shows `It appears that Docker Bash Aliases is already setup.` and changes nothing.

If you see a **Requirements Not Met** box instead, complete the items it lists first. They are usually steps in **Prerequisites**.

To see the aliases installed and the prompt change, watch [Deployrr 5 walkthrough: installing the bash aliases at 24:28](https://youtu.be/rdqbAr0TFnQ?t=1468) (shows Deployrr v5; menus differ in v6).

:::note
If you set up the Docker aliases with an older version of Deployrr, Deployrr moves you to the new alias file the next time it starts. It shows `Migrating Bash Aliases...` while it does this. See [Update Deployrr](/getting-started/updating-deployrr/).
:::

## Where the aliases live

- The alias file is `shared/config/udms_bash_aliases` inside your Docker folder. Deployrr recommends `/home/YOUR_USER/docker` as the Docker folder, but you choose it in **Prerequisites** > **Docker Folder**, so yours may be elsewhere.
- Deployrr adds a short block to your `~/.bashrc` that loads the file. The block starts with the comment `# Anand's UDMS Bash Aliases added by Deployrr`. If you were moved over from the older aliases, it reads `UDMS Bash Aliases added by Deployrr`.
- Deployrr also adds a block to `~/.bash_profile`, starting with `# Sourcing .bashrc (added by Deployrr)`, so login shells load `~/.bashrc`. If you had no `~/.bash_profile`, Deployrr creates it.
- Both blocks go into the home folder of the Linux user you set up Deployrr for, and they work in the bash shell only.

The alias file always uses `/home/YOUR_USER/docker` as the Docker folder. If you chose a different folder, see [Your Docker folder is somewhere else](#your-docker-folder-is-somewhere-else).

To understand how an alias file works, read [UDMS part 13: Docker commands and bash aliases](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/) (manual setup; it uses `~/.bash_aliases`, not the Deployrr alias file).

To read the file, use the `cdd` alias to jump to your Docker folder, then open the file:

```bash
cdd
cat shared/config/udms_bash_aliases
```

:::caution
Aliases that start with `sudo` ask for your password. Several of the cleanup aliases delete data. Read the Docker cleanup table before you use them.
:::

## Prompt

Deployrr also sets a colored prompt that shows your username (green), hostname (yellow) and current folder (cyan).

## Docker

| Alias | What it does |
| --- | --- |
| `dps` | Lists all containers, running and stopped. |
| `dpss` | Lists all containers in a table with name, state, status and image. |
| `ddf` | Shows how much disk space Docker uses for containers, images and volumes. |
| `dexec` | Runs a command inside a running container. Use `dexec CONTAINER bash` to open a shell. |
| `dlogs` | Shows the last 50 log lines of a container and keeps following new ones. |
| `dlogsize` | Shows the size of each container's log file, sorted by size. |
| `dips` | Lists the IP addresses of running containers. |
| `dstop` | Stops one container. Add the container name. |
| `dstopall` | Stops every container. |

### Docker cleanup

:::caution
These aliases remove data. `drm`, `ddelimages`, `derase` and `dprune` act on all containers or images, not just one. `dprunevol` and `dprunesys` ask you to confirm first. Make a [backup](/using-deployrr/backups/) before you run any of them. [Free up disk space used by Docker](/docker/free-disk-space/) explains which one to pick.
:::

| Alias | What it does |
| --- | --- |
| `drm` | Tries to remove all containers. Running containers are refused, so in practice it removes stopped ones. |
| `dprunevol` | Removes all volumes that no container uses. |
| `dprunesys` | Removes all unused containers, networks and images. |
| `ddelimages` | Tries to delete all Docker images. Images in use by a running container stay. |
| `dprune` | Runs `ddelimages`, then `dprunevol`, then `dprunesys`. |
| `derase` | Stops all containers, then runs `drm`, `ddelimages`, `dprunevol` and `dprunesys`. |

## Docker Compose

These aliases work on the Compose file Deployrr keeps in your Docker folder for this machine. It is named `docker-compose-HOSTNAME.yml`, where `HOSTNAME` is your hostname. They act on all apps in that file. If you rename your server, see [Change the hostname](/host/change-hostname/). Services you add yourself in [custom.yml](/using-deployrr/custom-yml/) are in that file too, so these aliases work on them.

| Alias | What it does |
| --- | --- |
| `dcrun` | The base command. Add any Compose command after it, for example `dcrun ps`. |
| `dcup` | Starts all apps. Rebuilds if needed and removes leftover containers. |
| `dcdown` | Stops and removes all containers in the file. |
| `dcstop` | Stops the apps without removing them. |
| `dcstart` | Starts apps that already exist. |
| `dcrestart` | Restarts all apps. |
| `dcrec` | Recreates all containers, even if nothing changed. |
| `dcpull` | Pulls the latest images for all apps, one at a time. If pulls fail, see [Docker image pulls fail](/docker/rate-limit/). For the menu way to update, see [Update your apps](/using-deployrr/update-apps/). |
| `dclogs` | Shows the last 50 log lines of all apps and keeps following. |
| `traefiklogs` | Follows the Traefik log file. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/). |

You can add an app name to most of the `dc` aliases to act on one app, for example `dclogs traefik` or `dcrestart traefik`.

To watch aliases like these replace long Compose commands, see [Bash aliases: Docker and Docker Compose shortcuts at 7:43](https://youtu.be/Ux9khKhqhcg?t=463) (manual setup; some alias names differ from v6).

## CrowdSec

These work only if you installed CrowdSec with Deployrr. See [Block bad visitors with CrowdSec](/reverse-proxy/crowdsec/).

| Alias | What it does |
| --- | --- |
| `cscli` | Runs a CrowdSec command inside the CrowdSec container. |
| `csdecisions` | Lists current IP bans. |
| `csalerts` | Lists alerts CrowdSec has raised. |
| `csinspect` | Shows details for one alert. Add the alert ID. |
| `cshubs` | Lists hub items. |
| `csparsers` | Lists installed parsers. |
| `cscollections` | Lists installed collections. |
| `cshubupdate` | Updates the hub index. |
| `cshubupgrade` | Upgrades all installed hub items. |
| `csmetrics` | Shows CrowdSec metrics. |
| `csmachines` | Lists registered machines. |
| `csbouncers` | Lists registered bouncers. |
| `csfbstatus` | Shows the status of the firewall bouncer service. |
| `csfbstart` | Starts the firewall bouncer. |
| `csfbstop` | Stops the firewall bouncer. |
| `csfbrestart` | Restarts the firewall bouncer. |
| `tailkern` | Follows the kernel log. |
| `tailauth` | Follows the login (auth) log. |
| `tailcsfb` | Follows the firewall bouncer log. |

The alias file also defines `csbrestart`, but in the current version it fails with `command not found`. Use `csfbrestart` to restart the firewall bouncer instead.

## Moving around and files

| Alias | What it does |
| --- | --- |
| `cdd` | Goes to your Docker folder. |
| `..` or `up` | Goes up one folder. |
| `...` | Goes up two folders. |
| `.3`, `.4`, `.5` | Goes up three, four or five folders. |
| `cd..` | Fixes the typo `cd..` so it works like `cd ..`. |
| `back` | Goes back to the previous folder. |
| `home` | Goes to your home folder. |
| `ls` | Lists files with colors and folders first. |
| `ll` | Long list with hidden files and readable sizes. |
| `lt` | Lists files sorted by size. |
| `lsr` | Lists files sorted by last change. |
| `mkdir` | Creates parent folders as needed and says what it made. |
| `cp` | Copies and asks before overwriting. |
| `mv` | Moves and asks before overwriting. |
| `biggest` | Shows the 10 largest files under the current folder. |
| `recent` | Shows the 10 most recently changed files under the current folder. |
| `tree` | Shows folders as a colored tree. The `tree` program must be installed. |

## Disks and storage

| Alias | What it does |
| --- | --- |
| `fdisk` | Lists disk partitions. |
| `disks` | Lists disks and partitions with size, type and mount point. |
| `mounts` | Shows mounted file systems in columns. |
| `uuid` | Shows the UUID of a volume. Uses an older tool that many current systems don't have. Use `disks` or `sudo blkid` instead. |
| `dirsize` | Shows the size of each folder one level down. |
| `dirusage` | Shows the total size of the current folder. |
| `diskusage` | Shows total disk use on this machine. |
| `partusage` | Shows use per partition, without virtual file systems. |
| `space-usage` | Shows disk use, without virtual file systems. |
| `space` | Lists items in the current folder by size, largest first. |
| `inode-usage` | Shows inode use on mounted file systems. |

## CPU and memory

| Alias | What it does |
| --- | --- |
| `meminfo` | Shows memory use in megabytes. |
| `free` | Shows memory use in readable sizes. |
| `psmem` | Lists processes by memory use. |
| `psmem10` | Shows the top 10 processes by memory. |
| `pscpu` | Lists processes by CPU use. |
| `pscpu10` | Shows the top 10 processes by CPU. |
| `cpuinfo` | Shows CPU details. |
| `gpumeminfo` | Shows GPU memory lines from the Xorg log. |

## Network

| Alias | What it does |
| --- | --- |
| `ports` | Shows all ports in use and the programs behind them. Needs the `net-tools` package. Handy for port clashes like [Pi-hole and port 53](/apps/pi-hole-port-53-conflict/). |
| `showlistening` | Shows programs that listen on a port. |
| `ping` | Pings with 5 packets, then stops. |
| `myip` | Shows your public IP address. |
| `localip` | Shows your main local IP address. |
| `header` | Shows the HTTP headers of a web address. |
| `dnscheck` | Does a short DNS lookup. |
| `connections` | Counts network connections by state. |
| `bandwidth` | Shows bandwidth use per program. The `nethogs` program must be installed. |

## Packages (apt)

| Alias | What it does |
| --- | --- |
| `update` | Refreshes the package list. |
| `upgrade` | Refreshes the package list and upgrades all packages. |
| `install` | Installs a package. |
| `finstall` | Fixes broken installs. |
| `rinstall` | Reinstalls a package. |
| `uninstall` | Removes a package. |
| `search` | Searches for a package. |
| `addkey` | Adds a repository key from keyserver.ubuntu.com. |

## System services (systemd)

| Alias | What it does |
| --- | --- |
| `ctlreload` | Reloads the systemd configuration. |
| `ctlstart` | Starts a service. |
| `ctlstop` | Stops a service. |
| `ctlrestart` | Restarts a service. |
| `ctlstatus` | Shows the status of a service. |
| `ctlenable` | Starts a service at boot. |
| `ctldisable` | Stops a service from starting at boot. |
| `ctlactive` | Tells you whether a service is running. |

## Firewall (UFW)

| Alias | What it does |
| --- | --- |
| `ufwenable` | Turns UFW on. |
| `ufwdisable` | Turns UFW off. |
| `ufwallow` | Allows a port. |
| `ufwlimit` | Rate limits a port. |
| `ufwlist` | Lists rules with numbers. |
| `ufwdelete` | Deletes a rule. Add the rule number. |
| `ufwreload` | Reloads the rules. |

## Synology DSM

| Alias | What it does |
| --- | --- |
| `servicelist` | Lists Synology services (DSM 6 only). |
| `servicestatus` | Shows the status of a service. |
| `servicestart` | Starts a service. |
| `servicestop` | Stops a service. |
| `servicerestart` | Restarts a service. |
| `servicehstart` | Hard starts a service (DSM 6 only). |
| `servicehstop` | Hard stops a service (DSM 6 only). |
| `restartdocker` | Restarts the Docker package. |

## Archives

| Alias | What it does |
| --- | --- |
| `targz` | Creates a `.tar.gz` archive. |
| `tarbz` | Creates a `.tar.bz2` archive. |
| `untargz` | Extracts a `.tar.gz` archive and keeps file owners. |
| `untarbz` | Extracts a `.tar.bz2` archive and keeps file owners. |
| `lstargz` | Lists what is inside a `.tar.gz` archive. |
| `lstarbz` | Lists what is inside a `.tar.bz2` archive. |

## Quick edits

| Alias | What it does |
| --- | --- |
| `reload` | Reloads `~/.bashrc` so changes take effect. |
| `bashrc` | Opens `~/.bashrc` in nano. |
| `hosts` | Opens `/etc/hosts` in nano. Asks for your `sudo` password. |
| `aliases` | Opens `~/.bash_aliases` in nano. This is a different file from the Deployrr alias file. |

These open nano. The **Tools** > **Preferred Editor** setting (nano, vim or vi) applies inside Deployrr, for example in the Secrets Editor, not to these aliases. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).

## Check logs from the terminal

Pick the alias by the log you want to read:

| What you want to read | Command |
| --- | --- |
| One container | `dlogs CONTAINER_NAME`. Shows the last 50 lines with a timestamp on each. |
| One app in the Compose file | `dclogs APP`. Use the app's Compose name. In Deployrr it is the same as the container name. |
| All your apps at once | `dclogs`. Each line starts with the app name. |
| Traefik | `traefiklogs`. The access log has no alias. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/). |
| CrowdSec Firewall Bouncer | `tailcsfb`. For the service state, use `csfbstatus`. |
| Logins to the server, such as SSH | `tailauth` |
| Kernel messages, such as UFW block lines | `tailkern` |
| What CrowdSec blocked | `csalerts` and `csdecisions`. See [Block bad visitors with CrowdSec](/reverse-proxy/crowdsec/#check-it-worked). |

`dlogs`, `dclogs` and the `tail` aliases keep printing new lines. Press `Ctrl+C` to stop. This stops only the log output, not the app. `csfbstatus`, `csalerts` and `csdecisions` show their output once instead of following.

Use `dpss` to find the container name. `dlogs` also works on a stopped container, so you can read why an app exited.

To read more than the last 50 lines, search them, or save them to share:

```bash
sudo docker logs --tail 500 CONTAINER_NAME
sudo docker logs CONTAINER_NAME 2>&1 | grep -i error
sudo docker logs CONTAINER_NAME > ~/CONTAINER_NAME.log 2>&1
```

Check a saved log for your domain and IP addresses before you post it. See [Check the log before you share it](/support/generate-support-log/#check-the-log-before-you-share-it).

If `tailauth` or `tailkern` says the file doesn't exist, your system keeps these logs in the journal only. This is the default on Debian 12. Use `sudo journalctl -f` for all system messages, or `sudo journalctl -k -f` for kernel messages.

To see which container logs take up disk space, run `dlogsize`. For the Traefik log files, see [Keep the log files small](/reverse-proxy/check-traefik-logs/#keep-the-log-files-small).

## If the aliases don't work

### "command not found" right after setup

Deployrr loads the aliases only inside its own session. Open a new terminal window or SSH session, or run `source ~/.bashrc`.

If that doesn't help, check that the block is in your `~/.bashrc`:

```bash
grep -n "added by Deployrr" ~/.bashrc
```

No output means the block is missing for the user you are logged in as. Common reasons:

- You are logged in as `root`, or you switched with `sudo -i` or `sudo su`. Log in as the user you set up Deployrr for.
- Your shell isn't bash, for example zsh or fish. Run `echo $0` to see it. Type `bash` to start a bash shell, which loads the aliases.

### `sudo dps` says "command not found"

`sudo` doesn't know your aliases. Run the alias without `sudo`. Aliases that need it, such as `dps` and `dcup`, already include `sudo` and ask for your password.

### Your Docker folder is somewhere else

The alias file uses `/home/YOUR_USER/docker` as the Docker folder, even when you chose another folder in **Prerequisites**. Then `cdd`, `traefiklogs` and every `dc` alias look in the wrong place. For example, `dcup` says the Compose file doesn't exist.

To fix it, set your folder after Deployrr's block:

1. Back up the file: `cp ~/.bashrc ~/.bashrc.bak`
2. Open `~/.bashrc` (the `bashrc` alias opens it in nano).
3. Add this line at the very end, after the block that starts with `# Anand's UDMS Bash Aliases added by Deployrr`. Replace the path with your Docker folder:

   ```bash
   DOCKER_FOLDER=/srv/docker
   ```

4. Save, then run `source ~/.bashrc`.
5. Run `cdd`, then `pwd`. It should print your Docker folder.

### You moved the Docker folder

The block in `~/.bashrc` loads the alias file by its full path. After you move the Docker folder, that path is wrong and the aliases stop loading without an error. Open `~/.bashrc`, change the path inside Deployrr's block to the new place of `shared/config/udms_bash_aliases`, and set `DOCKER_FOLDER` as in the section above. See [Move your data to another disk](/storage/move-data-to-another-disk/).

### Programs in `~/.local/bin` stopped working over SSH

On a default Debian or Ubuntu setup, `~/.profile` adds `~/bin` and `~/.local/bin` to your PATH. Bash skips `~/.profile` when `~/.bash_profile` exists. If Deployrr created `~/.bash_profile`, programs installed there (for example with `pipx`) can give "command not found" after you log in again.

1. Check that your `~/.profile` loads `~/.bashrc`: `grep -n bashrc ~/.profile`. The Debian and Ubuntu default does.
2. Back up the file: `cp ~/.bash_profile ~/.bash_profile.bak`
3. Open `~/.bash_profile` and replace Deployrr's block (the comment line and the 3 lines after it) with:

   ```bash
   if [ -f ~/.profile ]; then
       . ~/.profile
   fi
   ```

4. Open a new SSH session and keep this one open until both the aliases (`dps`) and your programs work there.

## Remove the aliases or set them up again

:::caution
A mistake in `~/.bashrc` or `~/.bash_profile` can break your logins. Back up both files first and keep your current SSH session open until a new one works.
:::

1. Back up the files:

   ```bash
   cp ~/.bashrc ~/.bashrc.bak
   cp ~/.bash_profile ~/.bash_profile.bak
   ```

2. Open `~/.bashrc` and delete Deployrr's block: the line `# Anand's UDMS Bash Aliases added by Deployrr` and the 3 lines after it.
3. Open `~/.bash_profile` and delete the line `# Sourcing .bashrc (added by Deployrr)` and the 3 lines after it. If the file is now empty and you didn't have it before, you can delete it with `rm ~/.bash_profile`.
4. Open a new SSH session and check that you can log in and that `dps` now gives "command not found".

The alias file in `shared/config` can stay. It does nothing on its own.

To run **Bash Aliases** again, remove the block from `~/.bashrc` as above. Then start Deployrr and open **System** so the menu reloads. Now **Bash Aliases** runs again instead of showing the already set up message.

## Next steps

- Use `dpss` to check your containers, then `dlogs CONTAINER_NAME` to read the logs of one that fails. Replace `CONTAINER_NAME` with the container's name.
- Watch videos and guides on the command line in [Videos and guides](/getting-started/videos-and-guides/).
