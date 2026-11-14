---
title: No internet on the server or in containers after setup
sidebar:
  order: 6
  label: No internet after setup
description: Fix lost internet or DNS on a Debian server after Prerequisites, and containers that cannot reach the internet, by resetting DNS and restarting Docker.
type: troubleshooting
tags:
  - docker
  - host
  - install
  - dns
applies_to: v6.0+
symptoms:
  - "[ERROR] Problem with some dependencies. This can be due to two reasons: No internet connection"
  - Deployrr server is down for maintenance
  - Internet connectivity could not be verified
  - Internet Connectivity Check Failed
  - sudo apt update fails after Prerequisites > Packages on Debian
  - Temporary failure in name resolution
  - Server has internet but containers cannot reach the internet
related:
  - apps/pi-hole-port-53-conflict
  - docker/rate-limit
  - networking/ufw-firewall-vps
  - getting-started/prerequisites
  - getting-started/quick-start
last_reviewed: 2026-11-13
status: current
old_paths: ["/docker/internet-connectivity-problem"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1343085128913518726/1343085128913518726" }
---

Your server cannot look up names or reach the internet after you run Deployrr's Prerequisites. Or the server works, but your containers do not. This page helps you tell which one it is and fix it.

## Symptoms

On a Debian server, **Prerequisites** > **Packages** ends with an error box titled "Internet Connectivity Check Failed". The box says:

```txt
ERROR: Internet connectivity could not be verified.
```

On Debian 12, the box also adds a "Debian 12 Note". It says some users lost internet after this step and tells you to edit `/etc/systemd/resolved.conf`, set `DNS` and `FallbackDNS`, reboot and retry.

The check pings 8.8.8.8, 1.1.1.1 and 9.9.9.9. While it waits, the terminal shows `Waiting for network... (5s/90s)`, so it can take a minute and a half or a bit longer before it fails. Two things follow from how it works:

- It can fail on a server that has internet, if your network or VPS blocks ping to those addresses.
- It can pass while name lookups are broken, because it tests addresses, not names. Run the DNS test below even if the check passed.

When you start Deployrr, it can also stop with this message before the main menu if it cannot reach the internet or the Deployrr server:

```txt
[ERROR] Problem with some dependencies. This can be due to two reasons:
---> 1) No internet connection - ensure there is internet connection on your server.
---> 2) Deployrr server is down for maintenance - this happens about once a month but down time is only about 10 minutes.
```

Other signs:

- `sudo apt update` fails on the server.
- The server works, but an app cannot reach the internet from inside its container.

## Cause

There are two separate causes.

**The server cannot resolve names.** On Debian, the **Packages** step saves your `/etc/systemd/resolved.conf` as `/etc/systemd/resolved.conf.bak`. Then it replaces the whole file with these lines and restarts the DNS service:

```ini
[Resolve]
DNS=1.1.1.1 1.0.0.1
FallbackDNS=8.8.8.8 8.8.4.4
```

Any other setting you had in that file is gone until you put it back. The step also installs `libnss-resolve`. On Debian 12 this can bring in the systemd-resolved service, which then manages `/etc/resolv.conf`.

Some Debian 12 users report that internet stops working after this step. One possible reason is that the server cannot reach Cloudflare or Google DNS, for example when your network blocks them or only allows its own DNS server.

The same message about dependencies can also mean Deployrr's own server is down for a short time. Wait a few minutes and try again before you change anything. If your server has internet and the message stays, check that `wget` is installed. Deployrr needs it to start. See [Deployrr needs wget](/getting-started/updating-deployrr/#deployrr-needs-wget).

**The server works, but containers do not.** This is general Docker behavior, not something Deployrr sets. A container copies the host's DNS settings when it starts. If the host's DNS was broken or changed after that, running containers keep the old settings.

## Fix

### Find out which problem you have

These are general Linux commands, not Deployrr features.

1. Ping an IP address. This tests the network without DNS:

   ```bash
   ping -c 3 1.1.1.1
   ```

2. Ping a name. This tests DNS:

   ```bash
   ping -c 3 google.com
   ```

3. Read the result.
   - Both work: the server is fine. Go to [Containers cannot reach the internet](#containers-cannot-reach-the-internet).
   - The IP works and the name fails: DNS is the problem. Continue with the next section.
   - Both fail: the server has no network at all. Check the cable, Wi-Fi, router and your VPS firewall. On a VPS, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

4. Optional: see which DNS servers the server uses:

   ```bash
   resolvectl status
   ```

### Fix DNS on the server

1. Open the systemd-resolved settings file:

   ```bash
   sudo nano /etc/systemd/resolved.conf
   ```

2. Under the `[Resolve]` heading, set these lines. Remove a leading `#` if there is one.

   ```ini
   DNS=1.1.1.1
   FallbackDNS=8.8.8.8
   ```

   If your network blocks public DNS servers, or you run your own DNS server such as Pi-hole, put your router's or DNS server's IP address in `DNS=` instead, for example `DNS=192.168.1.1`.

3. Save the file and close the editor (in nano: `Ctrl+X`, `Y`, `Enter`).

4. Restart the DNS service:

   ```bash
   sudo systemctl restart systemd-resolved
   ```

5. Test again:

   ```bash
   ping -c 3 google.com
   ```

6. If it still fails, reboot the server:

   ```bash
   sudo reboot
   ```

:::note
Deployrr's own Debian 12 message tells you to reboot. Restarting the service is often enough, but a reboot is the safe choice.
:::

If you prefer your original settings, you can restore the backup instead. It only exists if you ran **Packages** on Debian.

```bash
sudo cp /etc/systemd/resolved.conf.bak /etc/systemd/resolved.conf
```

Then restart `systemd-resolved` or reboot. Use this when your network needs its own DNS settings.

:::caution
If you installed Pi-hole and turned off the stub listener, the new file removes the `DNSStubListener=no` line. Add it back. See [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).
:::

### Run the step again

On Debian, every run of **Packages** copies the current `/etc/systemd/resolved.conf` over the `.bak` file. After a second run, the `.bak` file holds Deployrr's settings and your original file is gone. Save your original under another name before you run the step again:

```bash
sudo cp -n /etc/systemd/resolved.conf.bak /etc/systemd/resolved.conf.original
```

The `-n` keeps an existing `resolved.conf.original`, so running this twice can't overwrite it.

1. Start Deployrr.
2. Open the **Prerequisites** menu.
3. Choose **Packages** and press `Y` to continue.

The step replaces `/etc/systemd/resolved.conf` again. If you want your own DNS values to stay, edit the file again after the step finishes, or copy `resolved.conf.original` back and restart `systemd-resolved`.

If the check still fails and you are sure the server has internet (for example, your network blocks ping), you can turn on [EXPERT mode](/getting-started/expert-mode/) with **Settings** > **Mode**. The error box points to this too. Run **Packages** again. When the check fails, Deployrr now asks "Do you want to override and continue?". Only do this when `ping -c 3 google.com` works.

### Containers cannot reach the internet

This section is general Docker advice.

1. Test name lookup from a fresh container:

   ```bash
   sudo docker run --rm busybox nslookup google.com
   ```

2. To test a container that already runs, replace `CONTAINER_NAME` with its name and run this. Not every image includes `nslookup` or `ping`, so use `sh` and try what the image has.

   ```bash
   sudo docker exec -it CONTAINER_NAME sh
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dexec CONTAINER_NAME sh`.

3. If the host works but the container fails, restart Docker. This makes containers pick up the host's current DNS settings:

   ```bash
   sudo systemctl restart docker
   ```

4. Check that your containers are running again:

   ```bash
   sudo docker ps
   ```

   With the aliases: `dps`.

   Containers with a restart policy start on their own. Others may need to be started again.

5. Run the test from step 1 again.

If the test works but the app still fails with TLS timeouts while it pulls images, see [Docker image pulls fail](/docker/rate-limit/). If the host firewall blocks traffic from containers, see [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

## Check it worked

1. On the server, a name lookup works:

   ```bash
   ping -c 3 google.com
   ```

2. `sudo apt update` finishes without errors.
3. **Prerequisites** > **Packages** ends with "Internet connectivity verified".
4. A fresh container can look up names:

   ```bash
   sudo docker run --rm busybox nslookup google.com
   ```
