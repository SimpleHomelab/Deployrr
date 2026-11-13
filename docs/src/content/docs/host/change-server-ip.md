---
title: Change the server IP
description: Tell Deployrr your server has a new IP address, update the Dashboard and Traefik file providers, and fix what the tool does not touch.
type: how-to
tags:
  - host
  - traefik
  - app-networking
applies_to: v6.0+
related:
  - using-deployrr/move-to-new-server
  - using-deployrr/dashboard
  - reverse-proxy/traefikify
  - using-deployrr/stack-manager
  - host/change-hostname
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 637
    title: "Deployrr 5 walkthrough: Server IP in the Prerequisites menu"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-11
status: current
old_paths: ["/using-deployrr/change-server-ip"]
sources: []
sidebar:
  order: 4
---

Use the **Change Server IP** tool when your server gets a new IP address. This happens after a DHCP change, after a router swap, or after you [move to a new server](/using-deployrr/move-to-new-server/). The tool saves the new IP and swaps it into your Dashboard and Traefik file provider files. It does nothing else, so this page also lists what you still do by hand.

## Before you start

- Deployrr is installed and Prerequisites are done.
- You have a Pro license. Without it, or without Prerequisites, Deployrr shows a requirements box. See [Requirements not met](/getting-started/requirements-not-met/) and [Licenses](/getting-started/licenses/).
- You know the new IP and the old IP.
- [Give the server a fixed IP](/host/fixed-ip/) so it does not change again. Set a DHCP reservation in your router, or a static IP in the operating system. This is not a Deployrr step.

:::caution
The tool does a plain find and replace of the old IP text in your files. An old IP of `192.168.1.5` also matches inside `192.168.1.50` and changes it too. Type each IP exactly, with no spaces, slashes or port. Back up first, then check the files afterwards.
:::

## Steps

### Back up the files the tool changes

All paths are inside your Docker folder. The recommended folder is `/home/USERNAME/docker`. Replace `USERNAME` with your Linux username. Replace `HOSTNAME` with your server's hostname.

1. Exit Deployrr, or open a second terminal.
2. Copy the Dashboard services file:

   ```bash
   sudo cp /home/USERNAME/docker/appdata/deployrr-dashboard/config/services.yaml /home/USERNAME/docker/appdata/deployrr-dashboard/config/services.yaml.bak
   ```

   Skip this step if you don't run the Dashboard.

3. Copy the Traefik rules folder:

   ```bash
   sudo cp -r /home/USERNAME/docker/appdata/traefik3/rules/HOSTNAME /home/USERNAME/docker/appdata/traefik3/rules/HOSTNAME-backup
   ```

   Skip this step if you don't run Traefik.

:::note
Traefik reads only the `rules/HOSTNAME` folder. The `HOSTNAME-backup` folder sits next to it, so Traefik ignores the copy. Don't put the backup inside `rules/HOSTNAME`.
:::

### Run the tool

1. Start Deployrr.
2. Select **Tools**.
3. Select **Change Server IP**. Its description reads "Adapt Deployrr to a new server IP" and shows the IP Deployrr has saved now.
4. In the **Docker Environment Variables** box, read "Enter the new Docker Host IP (LAN IP or WAN IP for VPS):". The box shows the current IP.
5. Type the new IP and select **OK**. Use the LAN IP of the server, or the public IP if the server is a VPS.

   Deployrr saves the new IP right away, as `SERVER_LAN_IP` in the `.env` file in your Docker folder. If you stop at a later step, the new IP stays saved.

   If you select **Cancel**, nothing changes and the tool stops. If you leave the box empty and select **OK**, the tool also stops, but the saved IP is cleared. Run the tool again and enter the IP.

6. At "Enter the previous Docker Host IP", type the old IP.

   If it is empty or the same as the new IP, you see "Invalid input. Previous IP cannot be empty or the same as the new IP." and go back to **Tools**.

7. Read the **Update Service IP** box. It says Deployrr will update the IP for services in the Deployrr Dashboard and in all Traefik file providers.
8. Select **Yes**. If you select **No**, you go back to **Tools**. The Dashboard and rules files stay as they are, but the new IP from step 5 stays saved in `.env`.
9. Read the lines Deployrr prints. See the next section.
10. Press Enter, or wait a few seconds, to go back to **Tools**. There is no final success message.
11. Go to **Prerequisites** > **Server IP**. Enter the new IP and select **OK**. You see "Server IP set to NEW_IP."

    Deployrr keeps a second copy of the server IP in its own settings, and Change Server IP does not update it. Without this step, Deployrr can show the old IP again later. To see the Server IP entry in Prerequisites, watch [Deployrr 5 walkthrough: Server IP at 10:37](https://youtu.be/rdqbAr0TFnQ?t=637) (shows Deployrr v5; menus and steps differ in v6).

### Read the output

First you see "Updating Deployrr Dashboard services file...", with one of these lines for the `services.yaml` file:

| Line | Meaning |
| --- | --- |
| `[INFO] Updated OLD to NEW in FILE.` | The old IP was in the file and is replaced. |
| `[INFO] No occurrence of OLD found in FILE.` | The file did not contain the old IP. Nothing changed. |
| `[WARNING] FILE does not exist. No update performed.` | You have no Dashboard installed. |

Then you see "Updating Traefik file providers...". Deployrr checks the `app-*.yml` files in the `appdata/traefik3/rules/HOSTNAME` folder:

| Line | Meaning |
| --- | --- |
| `[INFO] Updated OLD to NEW in FILE.` | One line for each file that held the old IP. |
| `[INFO] No occurrence of OLD found in any app-*.yml file in FOLDER.` | No file held the old IP. |
| `[WARNING] FOLDER does not exist or contains no app-*.yml files. No update performed.` | You have no such files. |

Only files named `app-*.yml` are changed. Other files in the rules folder, for example ones you named differently, are not.

"No occurrence" is normal for apps you installed from the Deployrr menu. Their rules files point at the Docker bridge address (usually `172.17.0.1`), not at your LAN IP. Files that do hold the old IP are usually ones you made with [Traefikify](/reverse-proxy/traefikify/) and pointed at this server's IP.

### Check the changed files

1. Open the Dashboard services file and look for IPs that should not have changed:

   ```bash
   sudo nano /home/USERNAME/docker/appdata/deployrr-dashboard/config/services.yaml
   ```

2. Compare the rules folder with your backup:

   ```bash
   sudo diff -r /home/USERNAME/docker/appdata/traefik3/rules/HOSTNAME-backup /home/USERNAME/docker/appdata/traefik3/rules/HOSTNAME
   ```

   Every changed line should show the old IP replaced by the new one. Fix any other IP that changed by mistake.

## Fix what the tool does not change

The tool does not touch anything outside the files above. Do these yourself:

- Update the port forwards in your router to point at the new IP.
- Update DNS records that hold the server IP. If you use Hybrid or VPS, this includes the A record.
- Update firewall rules that name the old IP. See [UFW firewall on a VPS](/networking/ufw-firewall-vps/).
- Update bookmarks that use the old IP.
- Update other servers that point at this one. For example, the main server's Traefik may send traffic for a remote app to this server. See [Traefikify](/reverse-proxy/traefikify/) and [Multiple servers on one domain](/reverse-proxy/multi-server-same-domain/).
- Update remote apps you added to the Dashboard.
- Watch out for **Tools** > **ReDash**. It rebuilds the Dashboard and brings back the entries you added with Dashify from Deployrr's own list. That list is not updated, so a ReDash run can bring back the old IP for those entries. After a ReDash run, check `services.yaml` again and fix any old IP.

### Recreate apps that use the server IP

Four apps read the server IP from the `.env` file in their compose files:

- Plex
- Open WebUI
- Paperless-ngx
- BookStack

A running container keeps the old value until you recreate it. For each of these apps you run, go to **Tools** > **Stack Manager** > **Recreate** and pick the app at "Select an app to recreate:". Pick `all` to recreate every app at once. Stack Manager needs a Basic, Plus or Pro license. See [Stack Manager](/using-deployrr/stack-manager/).

## Check it worked

- In **Tools**, the **Change Server IP** description shows the new IP.
- Your apps open in the browser at their usual addresses.
- The links on your [Dashboard](/using-deployrr/dashboard/) work. If a link does not change, refresh the page.
- If an app does not load, [check the Traefik logs](/reverse-proxy/check-traefik-logs/).
