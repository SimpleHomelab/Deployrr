---
title: "Fix the UFW firewall on a VPS: apps can't reach the internet or show certificate errors"
sidebar:
  label: UFW firewall on a VPS
description: Fix apps on a VPS or dedicated server that cannot reach the internet or show self-signed certificate errors, by cleaning up UFW and using Simple mode.
type: troubleshooting
tags:
  - firewall
  - docker
  - traefik
  - ports
applies_to: v6.0+
apps: [traefik, tailscale]
symptoms:
  - "SSL certificate problem: self-signed certificate"
  - "curl: (60) SSL certificate problem: self-signed certificate"
  - "Serving default certificate for request"
  - "local error: tls: bad record MAC"
  - Apps on a VPS or dedicated server cannot connect to the internet, and features that call outside services fail
  - Your browser shows a certificate warning for your own domain
related:
  - reverse-proxy/check-traefik-logs
  - reverse-proxy/restrict-access-using-ip-allowlist
  - networking/opnsense-conflict
  - getting-started/quick-start
last_reviewed: 2026-11-09
status: current
old_paths: ["/networking/ufw-firewall-vps-dedi"]
sources: []
---

You run Deployrr on a rented VPS or a dedicated server. Your apps cannot reach the internet, or you see certificate errors you cannot explain. This page helps you clean up the firewall on the server and get back to a working state.

## Symptoms

This page fits you if all of these are true:

- Your server is a VPS or dedicated server with a public IP address.
- You have no firewall outside the server. This means no firewall page in your hosting provider's web panel, or you never opened ports there. At home, your router's port forwarding page plays this role. A cloud server usually has no router in front of it.
- You see one or more of the signs below.

What you may notice:

- Apps cannot make outside connections. Features that call other services fail or show errors.
- Your browser shows a certificate warning for your own domain.

In the Traefik log, you may see lines like this:

```txt
Serving default certificate for request: "connect.somethirdpartyAPI.com"
http: TLS handshake error from 192.168.91.1:42832: local error: tls: bad record MAC
```

If you open a shell inside an app's container and test with `curl`, you may see this:

```txt
* SSL certificate problem: self-signed certificate
curl: (60) SSL certificate problem: self-signed certificate
```

Searches for these errors usually point to missing root certificates in the container. In this case, the certificates are not the cause.

## Cause

The usual cause is the firewall on the server itself. Rules you added to UFW or iptables by hand can interfere with how Docker traffic moves. So can edits to `/etc/ufw/before.rules` or `/etc/ufw/after.rules`. The fix is to remove those changes and use a small set of plain rules.

On a home network, Deployrr's Advanced mode expects your router to forward port 80 to 81 and port 443 to 444. A cloud server has no router to do that. People then try to fake the forwarding with firewall rules on the server, and those rules are easy to break. Simple mode avoids this. See step 3.

:::note
You can also see these errors for other reasons, such as blocked DNS. Test after each step so you know what helped.
:::

## Fix

Steps 1, 2 and 5 are general Linux and UFW advice. They are not part of Deployrr. Steps 3, 4 and 6 use Deployrr menus.

### Undo your own firewall changes

1. Look at what UFW has now:

   ```bash
   sudo ufw status verbose
   ```

2. Remove any rules or edits you added by hand. This includes any lines you added to `/etc/ufw/before.rules` or `/etc/ufw/after.rules`, and any custom iptables rules. Put each file back to its default state.

   Do not use `PREROUTING ... REDIRECT` rules to forward port 80 to 81 or port 443 to 444. They can work for a while, then stop after package upgrades and reboots. Lines like these are the ones to remove:

   ```txt
   -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 81
   -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 444
   ```

   :::caution
   `sudo ufw reset` removes all UFW rules and turns UFW off. Run it only if you can still reach the server another way, such as your provider's web console. Allow SSH again before you turn UFW back on (step 5), or you lock yourself out.
   :::

### Use Simple mode

3. In Deployrr, go to **Proxy** > **Traefik**. Look at the **Traefik Mode** line.

   - If it says **Advanced**, select **Traefik Mode** once. Deployrr shows **Simple mode ENABLED**.
   - If it says **NOT SET**, select **Traefik Mode** once. That turns on Simple mode.
   - If it already says **Simple**, leave it alone. Selecting it again switches back to Advanced.

   Traefik Mode only works once **Proxy** > **Proxy Type** is set to **Traefik**. If it isn't, Deployrr tells you to go there first.

   Deployrr says Simple mode needs ports 80 and 443 sent to ports 80 and 443 on the Traefik host. On a VPS, that is the normal state. The internet reaches the server's ports directly. You have nothing to forward.

   :::caution
   In Simple mode, Deployrr says all apps are exposed both locally and over the internet. You cannot set an app to Internal only. To keep an app private, use Tailscale (step 6), or protect the app with a login.
   :::

   Advanced mode needs a router, gateway or firewall that forwards 80 to 81 and 443 to 444. A VPS with no firewall in front of it has nothing to do that. Stay on Simple mode unless you add such a device in front of your server. See [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/) for how the two modes differ, and [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/) for how Internal and External exposure work.

### Set the server IP

4. Check that **Prerequisites** > **System Type** is set to **VPS - Virtual Private Server in the cloud**.

   Then go to **Prerequisites** > **Server IP**. Deployrr asks:

   ```txt
   Enter the Docker Host IP (LAN IP or WAN IP for VPS):
   ```

   On a VPS in Simple mode, enter the server's public IP address. Deployrr then shows "Server IP set to" and your address. You can run this again at any time.

   If you change the IP later, use **Tools** > **Change Server IP** (needs a Pro license). It asks for the new IP, then the previous IP. It then asks you to confirm. It updates the IP for services on the Deployrr Dashboard and in the Traefik file providers. [Move Deployrr to a new server](/using-deployrr/move-to-new-server/) walks through it.

### Set a basic UFW rule set

5. Run these commands one at a time. This is general UFW advice. It denies everything coming in except what you allow.

   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

   Change `22` in the SSH rule if you moved SSH to another port. If you get this wrong, you lock yourself out of the server.

   Add these rules too. The first two allow web traffic that UFW routes through the server to Docker. The last one allows Tailscale, if you use it:

   ```bash
   sudo ufw route allow proto tcp from any to any port 80
   sudo ufw route allow proto tcp from any to any port 443
   sudo ufw allow in on tailscale0
   ```

   Then turn UFW on and restart the server:

   ```bash
   sudo ufw enable
   sudo reboot
   ```

   Deployrr v6 does not have a UFW-Docker option any more. Its release notes list "UFW Docker integration" as removed. If you installed UFW-Docker with an older version, remove it the way its own documentation says.

   Deployrr never turns your firewall on or manages it for you. That is up to you. It adds firewall rules for only two apps:

   - **Traefik**: ports 80, 81, 443 and 444 over TCP, and 443 and 444 over UDP.
   - **Socket Proxy**: allows traffic from `192.168.91.0/24`, the Socket Proxy's Docker network.

   Other apps add no firewall rules. Deployrr uses UFW if it is installed, otherwise firewalld. If neither is there, it skips this step. If you open an app's port to the internet without Traefik, add that rule yourself.

### Reach private apps with Tailscale

6. Open apps you do not want public through Tailscale. In Deployrr, set up the network adapter first at **System** > **Network** (needs a Basic, Plus or Pro license). Then install Tailscale from **Apps** > **Browse Apps**. It asks for your **Tailscale Auth Key**.

   Deployrr shows a **Tailscale Mode** box. It says Tailscale installs in host networking mode, and you open apps at `TAILSCALE-IP:PORT`. It also says you should turn off MagicDNS in the Tailscale admin console. If you leave MagicDNS on, the Docker host can lose its internet connection.

7. Open an app at `http://TAILSCALE-IP:PORT`. Replace `TAILSCALE-IP` with your server's Tailscale address and `PORT` with the app's port. This address uses plain `http`, with no certificate and no domain name.

### Private networking (only if you use Advanced mode)

You do not need this section for Simple mode. In Advanced mode, Deployrr needs a local address to tell internal traffic from external traffic. Cloud providers often offer private networking for this. Look in your provider's documentation. You usually switch it on in the provider's panel, then add a network interface on the server with `netplan` or `/etc/network/interfaces`.

This is an example `netplan` file only. Interface names, allowed IP ranges and the MAC address are different at every provider. Replace the values in capitals with the ones your provider gives you.

```yaml
network:
  version: 2
  ethernets:
    INTERFACE_NAME:
      match:
        macaddress: YOUR_MAC_ADDRESS
      addresses:
        - PRIVATE_IP/24
```

After you add the interface, set the server IP in Deployrr (step 4) to the private address.

## Check it worked

1. Open a shell in an affected container. Replace `CONTAINER_NAME` with the container's name:

   ```bash
   sudo docker exec -it CONTAINER_NAME sh
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dexec CONTAINER_NAME sh`.

2. Run a test. If `curl` is not installed in the container, use `wget` instead:

   ```bash
   curl -I https://google.com
   ```

   You should get an HTTP response and no "SSL certificate problem" message.

3. Check your apps. The features that failed before should work now.
4. Open your app's domain in a browser. The certificate warning should be gone.
5. Check the Traefik log. After a fresh restart, the "Serving default certificate" and "bad record MAC" lines should not come back. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) for how to find the log.

If the problem stays, check whether your provider has its own firewall page in its web panel. Open ports 80 and 443 there too.

## Related

- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): where to find the log and what to look for.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): how Internal and External exposure work in Advanced mode.
- [Traefik staging fails on OPNsense](/networking/opnsense-conflict/): another firewall problem, with DNS filtering.
- [Quick start](/getting-started/quick-start/): the setup order for Deployrr.
