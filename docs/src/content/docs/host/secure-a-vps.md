---
title: Secure a fresh VPS before you install Deployrr
sidebar:
  label: Secure a fresh VPS
description: Make a new VPS or dedicated server safer with a sudo user, SSH keys, no password login and a provider firewall, then install Deployrr in Simple mode.
type: how-to
tags:
  - host
  - firewall
  - install
  - remote-access
applies_to: v6.0+
related:
  - networking/ufw-firewall-vps
  - getting-started/quick-start
  - reverse-proxy/simple-vs-advanced-mode
  - networking/tailscale
  - getting-started/install-errors
further_reading:
  - title: "UDMS part 05: new user, SSH hardening and firewall on Ubuntu/Debian"
    url: https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#3_Secure_SSH_Access
videos:
  - id: "-ZSQdJ62r-Q"
    start: 620
    title: "Docker on Proxmox LXC: creating a non-root user with sudo"
  - id: "-ZSQdJ62r-Q"
    start: 723
    title: "Docker on Proxmox LXC: changing the SSH port"
  - id: M6GMp4FJrB8
    start: 432
    title: "Tailscale tutorial: installing Tailscale on Linux"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

A new VPS or dedicated server is on the public internet from the first minute. Bots try to log in to it right away. This page walks you through the basic steps to lock it down before you install Deployrr.

## Before you start

- A VPS or dedicated server with a supported system. See [Quick start](/getting-started/quick-start/#supported-systems) for the list. The commands below are for Debian and Ubuntu.
- The server's public IP address and the root login details from your provider.
- A way into your provider's web console, also called the rescue or VNC console. If you lock yourself out, this is how you get back in. Find it in your provider's panel now, before you change anything.
- A second terminal window on your own computer. You use it to test each change.

:::caution
Several steps below can lock you out of the server. For each one, keep your current session open and test in a second terminal before you close anything. If you do get locked out, use the provider's web console.

Deployrr does not manage SSH and does not turn UFW on. It does add firewall rules when you set up some apps. When you set up Traefik, it allows ports 80, 81, 443 and 444 (TCP, and UDP for 443 and 444). Socket Proxy adds a rule that allows its Docker network, `192.168.91.0/24`. If UFW is not installed but firewalld is, the same rules go to firewalld. The rules are added even if UFW is off. Run `sudo ufw status` before you turn UFW on, so you know what it will allow. Prerequisites > Packages installs UFW on Debian, Ubuntu and Arch.

The one Deployrr feature that uses SSH is Remote Assist (Help > Remote Assist, Pro). It sets a temporary password for a support session and asks you to restore your settings afterwards. See [Get remote help with Remote Assist](/support/ssh-access/).
:::

## Steps

### Create a regular user with sudo

If you start Deployrr as root, it stops with this message: "Do not run Deployrr as the root user. Run as a regular user with sudo privileges instead." You need a regular user that can use `sudo`. For more on that message, see [Deployrr install errors](/getting-started/install-errors/#create-a-regular-user-with-sudo-rights). To see these commands run, watch [Docker on Proxmox LXC: creating a non-root user at 10:20](https://youtu.be/-ZSQdJ62r-Q?t=620).

1. Log in to the server as root. Replace `YOUR_SERVER_IP` with your server's address:

   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. Create the user. Replace `NAME` with the user name you want, here and in the later steps. Set a password when asked:

   ```bash
   adduser NAME
   ```

3. Add the user to the sudo group:

   ```bash
   usermod -aG sudo NAME
   ```

   A minimal Debian install may not have `sudo`. If `usermod` or a later `sudo -v` fails, run these as root, then repeat this step:

   ```bash
   apt update
   apt install sudo
   ```

4. Keep this root session open. You need it in the next steps.

### Set up SSH key login

An SSH key is a pair of files. The private key stays on your computer. The public key goes on the server. You log in with the key instead of a password.

5. On your own computer, not on the server, create a key. Press Enter to accept the default file name:

   ```bash
   ssh-keygen -t ed25519
   ```

   Set a passphrase when asked. It protects the key if someone copies the file.

6. Copy the public key to the server. Replace `NAME` and `YOUR_SERVER_IP`:

   ```bash
   ssh-copy-id NAME@YOUR_SERVER_IP
   ```

   `ssh-copy-id` needs password login, which is still on at this point. It asks for the new user's password.

   Windows does not include `ssh-copy-id`. Use the manual method in the next step instead.

7. If you could not use `ssh-copy-id`, add the key by hand. On your computer, print the public key and copy the whole line:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

   In PowerShell, use `type $env:USERPROFILE\.ssh\id_ed25519.pub`.

8. In your root session on the server, create the folder and file for the key. Replace `NAME`:

   ```bash
   mkdir -p /home/NAME/.ssh
   nano /home/NAME/.ssh/authorized_keys
   ```

9. Paste the public key line, save, and exit nano.
10. Set the owner and permissions. Replace `NAME`:

    ```bash
    chown -R NAME:NAME /home/NAME/.ssh
    chmod 700 /home/NAME/.ssh
    chmod 600 /home/NAME/.ssh/authorized_keys
    ```

11. Open a second terminal on your computer and log in as the new user:

    ```bash
    ssh NAME@YOUR_SERVER_IP
    ```

    It should log you in with the key (or ask for your key passphrase), not the account password.

12. Check that `sudo` works in this session:

    ```bash
    sudo -v
    ```

Do not go on until steps 11 and 12 work.

### Turn off password login and root login

:::caution
If your key login does not work and you turn off passwords, you cannot log in over SSH. Do steps 11 and 12 first. Keep your current session open until the last check in this section passes.
:::

For background on how SSH hardening fits into a home server build, see [UDMS part 05: Secure SSH Access](https://www.simplehomelab.com/udms-05-installing-ubuntu-on-proxmox/#3_Secure_SSH_Access) (manual setup, on a Proxmox LXC). Follow the steps on this page for a VPS.

13. In the new user's session, back up the SSH settings:

    ```bash
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
    ```

14. Look at what the server uses now:

    ```bash
    sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin|kbdinteractiveauthentication'
    ```

    Many cloud images ship a file such as `/etc/ssh/sshd_config.d/50-cloud-init.conf` that sets `PasswordAuthentication yes`. SSH uses the first value it finds, and files in that folder are read before the rest of `sshd_config`. Editing only `sshd_config` can have no effect.

15. Create a settings file that is read before the others. The name starts with `00` so it comes first:

    ```bash
    sudo nano /etc/ssh/sshd_config.d/00-hardening.conf
    ```

16. Add these three lines, then save and exit:

    ```txt
    PasswordAuthentication no
    PermitRootLogin no
    KbdInteractiveAuthentication no
    ```

17. Test the settings for mistakes. No output means no errors:

    ```bash
    sudo sshd -t
    ```

    If it prints an error, fix the file before you go on. Do not restart SSH with an error.

18. Restart SSH. On Debian and Ubuntu the service is called `ssh`:

    ```bash
    sudo systemctl restart ssh
    ```

    On other systems it is called `sshd`: `sudo systemctl restart sshd`.

19. Open a third terminal and log in again as `NAME`. It should still work.
20. Check the new values:

    ```bash
    sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin|kbdinteractiveauthentication'
    ```

    You should see `no` on all three lines.

If something goes wrong, restore the backup in a session you kept open, remove the drop-in file, and restart SSH again:

```bash
sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config
sudo rm /etc/ssh/sshd_config.d/00-hardening.conf
sudo systemctl restart ssh
```

### Optional: change the SSH port

A new port cuts down the log noise from bots. It does not stop a targeted attack, so treat it as a small extra. Skip this section if you want fewer things that can go wrong. To see the idea, watch [Docker on Proxmox LXC: SSH configuration at 12:03](https://youtu.be/-ZSQdJ62r-Q?t=723). It edits `sshd_config` directly and does not cover the `ssh.socket` step below.

:::caution
Open the new port in every firewall first. Your provider's firewall panel (next section) and UFW, if you use it, must both allow it. If you change the port before you allow it, you lock yourself out. Keep your current session open and test in a second terminal.
:::

21. Pick a port number between 1024 and 65535. This page uses `2222` as the example. Replace it with your number.
22. Allow the new port in your provider's firewall panel, and in UFW if you use it. See the next section and [Set a basic UFW rule set](/networking/ufw-firewall-vps/#set-a-basic-ufw-rule-set).
23. Back up the settings again:

    ```bash
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
    ```

24. Add the port to your settings file:

    ```bash
    echo "Port 2222" | sudo tee -a /etc/ssh/sshd_config.d/00-hardening.conf
    ```

25. Test the settings:

    ```bash
    sudo sshd -t
    ```

26. Restart SSH. On Ubuntu 24.04 and newer, SSH starts through a socket, so you also reload systemd and restart the socket:

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl restart ssh.socket
    sudo systemctl restart ssh
    ```

    Ubuntu 22.04 and Debian do not use `ssh.socket`. On those, the last command alone is enough.

27. In a second terminal, log in on the new port. Replace `2222` with your port:

    ```bash
    ssh -p 2222 NAME@YOUR_SERVER_IP
    ```

28. When it works, remove the old port 22 rule from your firewalls.

If the new port does not work, restore the backup in a session you kept open and restart SSH. On Ubuntu 24.04 and newer, also reload systemd and restart the socket:

```bash
sudo cp /etc/ssh/sshd_config.bak /etc/ssh/sshd_config
sudo sed -i '/^Port 2222$/d' /etc/ssh/sshd_config.d/00-hardening.conf
sudo systemctl daemon-reload
sudo systemctl restart ssh.socket
sudo systemctl restart ssh
```

Ubuntu 22.04 and Debian do not use `ssh.socket`. On those, skip the two middle commands.

### Set the provider firewall

Your provider's web panel often has a firewall page, sometimes called security groups. It filters traffic before it reaches your server. This matters because ports that Docker publishes bypass UFW. A rule in the provider panel still blocks them.

:::caution
A wrong rule here can cut off SSH. Allow your SSH port before you save, and keep your current session open. Test a new login in a second terminal. If you are locked out, remove the rule from the provider's panel or use its web console.
:::

29. Open the firewall page in your provider's panel.
30. Allow inbound TCP on your SSH port. This is `22` unless you changed it.
31. Allow inbound TCP on `80`.
32. Allow inbound TCP on `443`. Optionally allow UDP on `443` too, for HTTP/3. Browsers fall back to TCP if you skip it.
33. Block all other inbound traffic. Apps reached through Traefik use port 443, so their own ports do not need to be open. Keep ports `81` and `444` blocked. Keep the Traefik dashboard port blocked too. It is `8080` by default, and Traefik Preparation prints "Port N assigned for Traefik dashboard". The dashboard has no login of its own on that port.
34. Apply the rules to your server.
35. Open a new SSH session to check that you can still log in.

:::note
Allow ports 80 and 443 before you run Domain Checks in Prerequisites. If you do not, it fails with "Port 80 is not reachable from the internet" or "Port 443 is not reachable from the internet". See [Domain Checks failed](/networking/domain-checks-failed/).
:::

:::note
Some providers also have a firewall on the server image, such as UFW already on. If you turn on UFW yourself, follow [Set a basic UFW rule set](/networking/ufw-firewall-vps/#set-a-basic-ufw-rule-set). Do not copy rules from other places. Do not turn on UFW before it allows your SSH port.
:::

### Optional: keep the system updated

36. Ubuntu already has `unattended-upgrades`. On Debian, install it:

    ```bash
    sudo apt update
    sudo apt install unattended-upgrades
    ```

37. Turn it on and accept the default:

    ```bash
    sudo dpkg-reconfigure unattended-upgrades
    ```

The system does not restart by itself unless you change that setting. Reboot when you can after kernel updates.

### Optional: use Tailscale for private access

If you do not want an app reachable from the internet, reach it over Tailscale instead. See [Set up Tailscale](/networking/tailscale/). To see the Linux client install, watch [Tailscale tutorial: Tailscale setup on Linux at 7:12](https://youtu.be/M6GMp4FJrB8?t=432). You can then also limit SSH in the provider panel to your Tailscale network if you want.

### Install Deployrr

38. Log in as `NAME`, not root.
39. Run the install command from [Quick start](/getting-started/quick-start/#install-deployrr) with `sudo`, as it shows.
40. Start Deployrr as your regular user. Type `deployrr` with no `sudo`.
41. In **Prerequisites** > **System Type**, pick **VPS** ("Virtual Private Server in the cloud").
42. If Traefik Preparation stops with "Port N is occupied. This is needed for Traefik.", another program is using one of the ports Traefik needs (80, 81, 443 or 444). Often it is a web server that came with your VPS image. Stop that web server, then run Traefik Preparation again.
43. Go to **Proxy** > **Traefik** and look at the **Traefik Mode** line ("Toggle how apps are exposed"). If it says **NOT SET** or **Simple**, leave it. NOT SET works as Simple. If it says **Advanced**, select **Traefik Mode** once. Each press flips the mode.

    Use Simple on a VPS. A VPS has no router to forward port 80 to 81 and 443 to 444, which Advanced mode needs. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

:::note
In Simple mode, every app is reachable from the internet. Protect apps with a login, or keep them private with Tailscale.
:::

## Check it worked

1. Log in as `NAME` with your key from a new terminal. It works.
2. Try to log in as root:

   ```bash
   ssh root@YOUR_SERVER_IP
   ```

   It is refused.
3. Try a password login:

   ```bash
   ssh -o PubkeyAuthentication=no NAME@YOUR_SERVER_IP
   ```

   It is refused with `Permission denied (publickey)`.
4. Run `sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin|kbdinteractiveauthentication'`. All three are `no`.
5. From your computer, your apps open on `https://` addresses. Other ports on the server do not answer.

## Related

- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): the basic UFW rule set, and what to do when apps cannot reach the internet.
- [Quick start](/getting-started/quick-start/): install Deployrr and work through Prerequisites.
- [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/): why a VPS uses Simple mode.
- [Set up Tailscale](/networking/tailscale/): reach private apps without opening ports.
- [Deployrr install errors](/getting-started/install-errors/): the root user stop and how to create a sudo user.
