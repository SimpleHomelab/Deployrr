---
title: Install ShellInABox for a terminal in your browser
description: Install ShellInABox from the Apps menu to get a Linux terminal in your browser behind Traefik and a login, and learn how to secure, stop or remove it.
type: how-to
tags:
  - host
  - traefik
  - auth
  - remote-access
applies_to: v6.0+
related:
  - reverse-proxy/choose-login-method
  - reverse-proxy/traefikify
  - getting-started/requirements-not-met
  - using-deployrr/manage-apps
  - getting-started/licenses
further_reading: []
videos: []
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

ShellInABox gives you a terminal for your server in a web browser. You open an address, log in with your Linux user name and password, and type commands as if you were on SSH. You install it from **Apps** > **ShellInABox**.

ShellInABox is not a Docker container. It runs on the server itself as a system service. **Manage Apps**, Stack Manager and Docker commands don't list or control it. Use the commands in [Check, stop, start or remove it](#check-stop-start-or-remove-it) instead.

:::caution
A terminal in a browser is a shell on your server. Anyone who gets past the login can run commands on it. Read [Keep it safe](#keep-it-safe) before you install.
:::

## Before you start

- You run Debian or Ubuntu, where Deployrr installs it with `apt`. Arch Linux also works if you have the `yay` or `paru` AUR helper installed. On Fedora or RHEL, Deployrr has no way to install ShellInABox, so the install fails.
- All **Prerequisites** steps are done.
- Traefik Production is done. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- A login method is running: Authelia, Authentik, Google OAuth or TinyAuth. See [Choose a login method](/reverse-proxy/choose-login-method/).
- You have a Basic, Plus or Pro license. See [Licenses](/getting-started/licenses/).
- Your DNS sends the subdomain you plan to use to your server.

If something is missing, Deployrr shows a **Requirements Not Met** box after you accept the warning. For ShellInABox, the box can list:

- Prerequisites: "All steps must be completed"
- Traefik Production: "Must be completed (Proxy menu)"
- Advanced Authentication: "Authelia, Authentik, OAuth, or TinyAuth must be running (Security menu)"
- License: "Basic, Plus, or Pro required. Current: ..." with your current license

Fix the lines, then start again. See [Requirements Not Met](/getting-started/requirements-not-met/) for what each line means.

## Steps

1. In Deployrr, go to **Apps**. Under SYSTEM APPS, select **ShellInABox**. The line reads "Web-based SSH terminal (non-Docker)". After it is installed, the line also shows **RUNNING** or **STOPPED**.
2. Read the **ShellInABox** warning box. It says not to expose it to the internet without strong authentication. The **No** button is selected by default. Select **Yes** to continue.
3. If ShellInABox is installed and running, you see **ShellInABox Already Running**. Select **Yes** to reinstall it. Select **No** to leave it as it is. A reinstall stops and starts the service, so open terminal sessions drop.
4. Wait while Deployrr installs the package, then stops the service, turns off ShellInABox's own HTTPS (Traefik handles HTTPS) and starts it again. This can take a moment. On Arch, if you have no AUR helper, you see "No AUR helper found. Please install shellinabox manually from AUR." You then see "Package installed", and the setup stops with "ShellInABox service failed to start". Install `yay` or `paru`, or install the package yourself, then run the install again.
5. If you see **File Provider Exists**, a file named `app-shellinabox.yml` is already there. Select **Yes** to overwrite it. Select **No** and Deployrr says "No changes made", keeps the old file and skips the rest of the Traefik step. See [If the Traefik step is skipped](#if-the-traefik-step-is-skipped).
6. At "Enter a subdomain for ShellInABox", type a lowercase name with no spaces. The default is `shellinabox`. If you leave it empty, Deployrr says "Subdomain empty" and skips the Traefik step.
7. At **Pick an Authentication Method**, select your login method. See [Pick a login method](#pick-a-login-method).
8. At **Pick an Exposure Method**, select who can reach it. See [Pick an exposure method](#pick-an-exposure-method).
9. Wait for the remaining steps to finish. Deployrr checks that port 4200 answers on the server and says "Connection to ... could not be verified" if it doesn't. The setup then continues.
10. Read the final message. It shows the local address and, if the Traefik step ran, the remote address.

When it works, the terminal says "ShellInABox service is active and running on port 4200" and "ShellInABox installation complete!".

If the service does not start, you see "ShellInABox service failed to start" and the command `sudo journalctl -u shellinabox -f`. The setup ends there, before the Traefik step. Run the command on the server to read the log.

If the Deployrr Dashboard is running, Deployrr adds ShellInABox entries to it: a local one and, if the Traefik step ran, a remote one. The local entry uses the server's internal Docker address, so it may not open from another computer. Use the local address from the final message instead. See [Set up and maintain the Deployrr Dashboard](/using-deployrr/dashboard/).

### If the Traefik step is skipped

If you leave the subdomain empty or answer **No** at **File Provider Exists**, you see "Could not create Traefik file provider". ShellInABox still runs. The final message shows only the local address, `http://SERVER_LAN_IP:4200`, where `SERVER_LAN_IP` is the address of your server on your network. No remote Dashboard entry is added. Run the install again to add the Traefik address.

### Pick a login method

The list shows only the methods you can use:

- **Authelia**, **Authentik**, **Google OAuth** and **TinyAuth** show when that app is running. They are marked **Recommended**.
- **Basic HTTP Auth** is marked **Discouraged**.
- **No Authentication** is marked **Not Recommended**.

:::danger
Never pick **No Authentication**, and don't select **Skip**. **Skip** also means no authentication. Deployrr says "Authentication selection skipped, using no authentication". Then anyone who reaches the address sees the ShellInABox login with no other gate in front.
:::

Pick the same login method you use for your other private apps. See [Choose a login method](/reverse-proxy/choose-login-method/).

### Pick an exposure method

- In Simple Traefik mode, the only choice is **Both**. ShellInABox is reachable on your LAN and over the internet.
- In Advanced mode, you can also pick **Internal** (your LAN only) or **External** (over the internet only). See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

If you cancel this box, Deployrr uses **Both**.

If you only need the terminal at home, switch to Advanced mode first and pick **Internal**. Then it can't be reached from the internet through Traefik.

## Open ShellInABox

You have two addresses:

- **Remote, through Traefik:** `https://SUBDOMAIN.YOUR_DOMAIN`. Replace `SUBDOMAIN` with the subdomain you chose and `YOUR_DOMAIN` with your domain. You get your login method first, then the ShellInABox page. This address uses HTTPS.
- **Local:** `http://SERVER_LAN_IP:4200`. Replace `SERVER_LAN_IP` with your server's LAN address. This one is plain HTTP, because Deployrr turns off ShellInABox's own HTTPS, and it skips your login method.

At the ShellInABox page, log in with your Linux user name and password.

## Keep it safe

- Always keep a login method in front of it. That is the point of the requirements above.
- Pick **Internal** in Advanced mode if you only use it at home.
- Port 4200 is plain HTTP on your LAN. Anything you type, including your Linux password, can be read by someone on the same network. Use the Traefik address when you can.
- Think about blocking port 4200 with a firewall for every machine except the ones you trust. This also stops people going around Traefik and your login method. For a UFW example, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).
- Use a strong password on the Linux user you log in with.

## Check, stop, start or remove it

These are generic Linux commands, not Deployrr commands. Run them on the server.

Check that it runs:

```bash
sudo systemctl status shellinabox
```

Stop it:

```bash
sudo systemctl stop shellinabox
```

Start it:

```bash
sudo systemctl start shellinabox
```

Read the log:

```bash
sudo journalctl -u shellinabox -f
```

### Remove it

1. Remove the package. On Debian and Ubuntu:

   ```bash
   sudo apt remove shellinabox
   ```

   On Arch, use your package manager, for example `sudo pacman -Rns shellinabox`.

2. In Deployrr, go to **Proxy** > **Traefik** > **Un-Traefikify**. This needs a Plus or Pro license. The delete warning recommends a backup from the **Tools** menu first.
3. Select `app-shellinabox.yml` in the list, then select **Delete** and confirm.
4. If Deployrr asks **Remove from Dashboard?**, select **Yes**.

Un-Traefikify removes the rules file `app-shellinabox.yml` from `appdata/traefik3/rules/HOSTNAME/` in your Docker folder. With a Basic license, delete that file yourself instead. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/#remove-an-app-with-un-traefikify) for the full steps.

## Check it worked

1. In **Apps**, ShellInABox shows **RUNNING**.
2. Open `https://SUBDOMAIN.YOUR_DOMAIN`. You see your login method, then the ShellInABox page.
3. Log in with your Linux user name and password. You get a shell prompt.
4. If the Traefik address shows 404, 502 or Gateway Timeout, see [One app behind Traefik shows 404, 502 or Gateway Timeout](/reverse-proxy/app-404-or-502/).
