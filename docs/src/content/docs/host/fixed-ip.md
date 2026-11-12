---
title: Give your server a fixed IP address
description: Stop your Docker host's IP from changing with a DHCP reservation in your router or a static IP set with netplan, ifupdown or NetworkManager.
type: how-to
tags:
  - host
  - app-networking
  - ports
applies_to: v6.0+
related:
  - using-deployrr/change-server-ip
  - getting-started/prerequisites
  - reverse-proxy/multi-server-same-domain
  - host/proxmox-lxc
  - networking/ufw-firewall-vps
further_reading: []
videos:
  - id: -ZSQdJ62r-Q
    start: 467
    title: "Docker on Proxmox LXC: set a static IP when you create the container"
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Give your server an IP address that never changes. Do this before you set **Server IP** in Deployrr, and ideally before you install apps.

Deployrr saves your server IP in its settings and in the `.env` file in your Docker folder. App web addresses, Dashboard links and some apps' compose settings use it. Your router port forwards point at it. If another server's Traefik points at this server by IP, its rules file holds the IP too. If the IP changes, these break.

When you change the IP later, **Tools** > **Change Server IP** updates the Deployrr Dashboard and the Traefik app rules files on this server. It does not touch your router or other servers. See [Multiple servers on one domain](/reverse-proxy/multi-server-same-domain/).

## Before you start

- You can log in to the server over SSH, or at its keyboard and screen.
- You can log in to your router, if you use a DHCP reservation.
- You know whether the server is a home machine, a Proxmox container or a VPS.

:::caution
A wrong network setting can cut you off from the server. Work from a local console if you can, or keep another way back in. Copy each config file before you edit it. Test the change before you reboot.
:::

## Pick your option

| Your server | What to do |
| --- | --- |
| Home or office network | [Option 1: DHCP reservation](#option-1-reserve-the-address-in-your-router). It is the easiest and safest. |
| You can't change the router | [Option 2: static IP in the operating system](#option-2-set-a-static-ip-in-the-operating-system). |
| Proxmox LXC or VM | Set the address in Proxmox. See [Proxmox LXC](#proxmox-lxc-and-vm). |
| VPS | [Usually nothing to do](#vps). |

## Steps

### Find your current network details

1. Run this command to list your interfaces and addresses:

   ```bash
   ip -br addr
   ```

   Look for the line with your LAN address, for example `192.168.1.50/24`. The first word on that line is the interface name, for example `eth0` or `enp3s0`. Skip `lo` and the `docker0` or `br-` lines.

2. Find your gateway, which is your router:

   ```bash
   ip route
   ```

   The gateway is the address after `default via`, for example `192.168.1.1`.

3. Find your DNS servers. On systems that use systemd-resolved, such as Ubuntu:

   ```bash
   resolvectl status
   ```

   Look for `DNS Servers`. On many home networks this is the router address. You can also use `1.1.1.1`.

4. Write down the interface name, current address, gateway and DNS servers. You need them below.

### Option 1: Reserve the address in your router

A reservation tells your router to always hand the same address to your server. The server keeps using DHCP, so there is nothing to change on the server. Menus differ by router. Check your router's manual for exact names.

1. Log in to your router's admin page. Write down the server's current entry and any existing reservation, so you can undo the change.
2. Find the list of connected devices. It is often called **DHCP clients** or **Connected devices**.
3. Find your server by its hostname or MAC address. To see the MAC address on the server, run `ip -br link`.
4. Choose the option to reserve or bind the address. It may be called **Static lease**, **Address reservation** or **Static DHCP**.
5. Pick the address. Using the one the server has now is the safest.
6. Save the reservation.
7. Make the server ask for its address again. The simplest way is to reboot it:

   ```bash
   sudo reboot
   ```

:::note
Some routers need the reserved address inside the DHCP pool. Others need it outside the pool. If the router rejects your address, follow your router's documentation.
:::

### Option 2: Set a static IP in the operating system

Pick an address that is outside your router's DHCP pool, so no other device gets it. Check the pool range in your router. If you pick an address inside the pool, two devices can end up with the same IP.

:::caution
Don't use Option 2 on a VPS. Its provider sets the network, and a change can lock you out of the server. See [VPS](#vps).
:::

Use only the section that matches your system:

- Ubuntu, including Ubuntu Desktop: netplan.
- Debian with `/etc/network/interfaces`: ifupdown.
- Fedora, RHEL, Rocky and Debian desktops: NetworkManager.

#### Ubuntu (netplan)

Replace `eth0`, the addresses and the DNS servers with your own values from above. The `/24` is your subnet size. Most home networks use `/24`.

1. List the netplan files:

   ```bash
   ls /etc/netplan/
   ```

2. Copy the file you will edit. Replace `FILE.yaml` with its name, such as `50-cloud-init.yaml` or `00-installer-config.yaml`:

   ```bash
   sudo cp /etc/netplan/FILE.yaml ~/FILE.yaml.bak
   ```

   Keep the copy in your home folder. Netplan reads every `.yaml` file in `/etc/netplan/`, so a copy left there can cause conflicts.

3. If the file is `50-cloud-init.yaml`, stop cloud-init from rewriting it. Create this file:

   ```bash
   echo 'network: {config: disabled}' | sudo tee /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
   ```

   Skip this step if your file has another name.

4. Open the file:

   ```bash
   sudo nano /etc/netplan/FILE.yaml
   ```

5. Edit the interface section. Keep the other lines in the file. Set `dhcp4` to `false` and add `addresses`, `routes` and `nameservers`. Keep the spaces exactly. YAML does not allow tabs. The interface section should look like this:

   ```yaml
   network:
     version: 2
     ethernets:
       eth0:
         dhcp4: false
         addresses:
           - 192.168.1.50/24
         routes:
           - to: default
             via: 192.168.1.1
         nameservers:
           addresses:
             - 192.168.1.1
             - 1.1.1.1
   ```

6. Save the file and close the editor.
7. Try the change:

   ```bash
   sudo netplan try
   ```

   Netplan applies the change and starts a countdown of 120 seconds. If you can still use the server, press Enter to keep the change. You don't need `netplan apply`. If you lose the connection, do nothing. Netplan rolls back on its own.

:::note
`to: default` needs netplan 0.103 or newer, which Ubuntu 22.04 and later have. On older releases, use `to: 0.0.0.0/0` instead.
:::

If netplan warns that a file is too open, set its permissions and try again:

```bash
sudo chmod 600 /etc/netplan/FILE.yaml
```

#### Debian (ifupdown)

Use this if your Debian system has `/etc/network/interfaces` and does not use NetworkManager.

:::caution
A network change can drop your SSH session. Do this at the server's own console, not over SSH.
:::

1. Copy the file:

   ```bash
   sudo cp /etc/network/interfaces /etc/network/interfaces.bak
   ```

2. Open it:

   ```bash
   sudo nano /etc/network/interfaces
   ```

3. Find the existing lines for your interface. They look like `allow-hotplug eth0` or `auto eth0`, followed by `iface eth0 inet dhcp`.
4. Replace those lines with the block below. Don't add a second block for the same interface. Use your own interface name and addresses:

   ```txt
   auto eth0
   iface eth0 inet static
       address 192.168.1.50/24
       gateway 192.168.1.1
       dns-nameservers 192.168.1.1 1.1.1.1
   ```

5. Save the file and close the editor. Check it again for typos.
6. Reboot from the console:

   ```bash
   sudo reboot
   ```

   Restarting the networking service can keep the old DHCP address, so reboot instead.

:::note
The `dns-nameservers` line only works if the `resolvconf` package is installed. If DNS fails after the change, check `/etc/resolv.conf` and add `nameserver 1.1.1.1` there.
:::

If you lose the connection, restore your copy at the console and reboot:

```bash
sudo cp /etc/network/interfaces.bak /etc/network/interfaces
sudo reboot
```

#### NetworkManager (Fedora, RHEL, Rocky and Debian desktops)

Don't use this on Ubuntu, including Ubuntu Desktop. Ubuntu sets the network with netplan, so use the netplan steps above.

1. List your connections:

   ```bash
   nmcli con show
   ```

   Note the name of the connection that uses your interface. Replace `CONNECTION_NAME` below with it. Use quotes if it has spaces.

2. Save the current settings, so you can compare or restore them later:

   ```bash
   nmcli con show "CONNECTION_NAME" > ~/nm-before.txt
   ```

3. Set the static address, gateway and DNS. Replace the addresses with your own:

   ```bash
   sudo nmcli con mod "CONNECTION_NAME" ipv4.method manual ipv4.addresses 192.168.1.50/24 ipv4.gateway 192.168.1.1 ipv4.dns "192.168.1.1 1.1.1.1"
   ```

4. Bring the connection up again:

   ```bash
   sudo nmcli con up "CONNECTION_NAME"
   ```

   This can drop an SSH session. Run it at the console if you can.

To go back to DHCP, run this and bring the connection up again:

```bash
sudo nmcli con mod "CONNECTION_NAME" ipv4.method auto ipv4.addresses "" ipv4.gateway "" ipv4.dns ""
```

### Proxmox LXC and VM

For a Proxmox LXC container, set the address in Proxmox, on the container's **Network** tab. Don't set it inside the container as well. For a VM, use a reservation in your router or the steps above inside the VM. See [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/) for other Proxmox settings. To watch the static IP set while you create a container, see [Docker on Proxmox LXC: static IP at 7:47](https://youtu.be/-ZSQdJ62r-Q?t=467).

### VPS

The provider gives a VPS a fixed public IP. You have nothing to do. Don't edit its network files. See [UFW firewall on a VPS](/networking/ufw-firewall-vps/) to protect it. On a VPS, enter the public IP in **Prerequisites** > **Server IP**.

## Check it worked

1. Show the addresses again:

   ```bash
   ip -br addr
   ```

   Your interface shows the address you picked.

2. Ping your gateway. Use your own gateway address:

   ```bash
   ping -c 3 192.168.1.1
   ```

3. Ping the internet by IP:

   ```bash
   ping -c 3 1.1.1.1
   ```

4. Check that DNS works:

   ```bash
   getent hosts deployrr.app
   ```

   You see an IP address. If the pings work but this prints nothing, fix your DNS servers.

5. Reboot and run `ip -br addr` again. The address must stay the same.

## Tell Deployrr and your router

If the address is the same as before, you are done.

If the address changed, pick the case that fits you.

**New install, or apps not installed yet.** Open **Prerequisites** > **Server IP**. You need **Disclaimers** and **Environment** done first. At "Enter the Docker Host IP (LAN IP or WAN IP for VPS):", the box shows the address saved earlier, or the one Deployrr detects if none is saved. Check it, change it to your fixed address if it differs, and select **OK**. Don't leave it empty. On a VPS, enter the public IP. See [Server IP in Prerequisites](/getting-started/prerequisites/#10-server-ip).

**Apps already installed, with a Pro license.** Use **Tools** > **Change Server IP**. You need a Pro license and all Prerequisites done.

1. Write down your old IP before you start. The tool asks for it.
2. Enter the new IP when asked.
3. Enter the previous IP when asked.
4. In the **Update Service IP** box, select **Yes** to proceed.

The tool then updates the Deployrr Dashboard and the Traefik app rules files on this server. It does not recreate your apps. Recreate them afterwards. See [Restart, recreate and reinstall apps](/using-deployrr/restart-recreate-reinstall/).

**Apps already installed, without Pro.** Open **Prerequisites** > **Server IP** and enter the new address. Then do the manual fixes in [Change the server IP](/using-deployrr/change-server-ip/).

Also update your router's port forwards so they point to the new address. See [Simple vs Advanced mode](/reverse-proxy/simple-vs-advanced-mode/) for the ports you forward. If another server's Traefik points at this server by IP, change the IP in that rules file too. See [Multiple servers on one domain](/reverse-proxy/multi-server-same-domain/).

## Related

- [Change the server IP](/using-deployrr/change-server-ip/): update Deployrr and your apps after the address changes.
- [Prerequisites](/getting-started/prerequisites/): where you enter the server IP.
- [Multiple servers on one domain](/reverse-proxy/multi-server-same-domain/): remote apps that hold this server's IP.
- [Run Deployrr in a Proxmox LXC](/host/proxmox-lxc/): set the address in Proxmox.
- [UFW firewall on a VPS](/networking/ufw-firewall-vps/): protect a VPS, where the IP is fixed by the provider.
