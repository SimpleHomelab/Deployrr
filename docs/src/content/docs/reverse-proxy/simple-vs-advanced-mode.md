---
title: Simple vs Advanced Traefik mode, and Internal, External or Both
description: Learn what Simple and Advanced Traefik mode do in Deployrr v6, which one to pick, and how to set each app to Internal, External or Both.
type: guide
tags:
  - traefik
  - remote-access
  - ports
  - domain
apps:
  - traefik
applies_to: v6.0+
related:
  - reverse-proxy/traefik-setup
  - reverse-proxy/traefikify
  - reverse-proxy/restrict-access-using-ip-allowlist
  - networking/ufw-firewall-vps
  - apps/pi-hole-port-53-conflict
further_reading:
  - title: "UDMS part 18: Setting up port forwarding for Traefik"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding
videos:
  - id: rdqbAr0TFnQ
    start: 2264
    title: "Deployrr 5 walkthrough: Port forwarding for Advanced mode (80 to 81, 443 to 444)"
    note: Shows Deployrr v5. Menus and steps differ in v6.
  - id: rdqbAr0TFnQ
    start: 4127
    title: "Deployrr 5 walkthrough: Manage App Exposure, hairpinning and local DNS"
    note: Shows Deployrr v5. Menus and steps differ in v6.
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
sidebar:
  order: 2
---

Deployrr has two Traefik modes, Simple and Advanced. The mode decides which router ports you forward and whether you can limit an app to your home network. This guide explains both modes, helps you pick one, and shows how to set each app to Internal, External or Both.

## Overview

Every app Traefik serves gets a real HTTPS address such as `https://app.YOUR_DOMAIN`. The mode only changes who can reach that address.

| | Simple | Advanced |
| --- | --- | --- |
| Router port forwards | 80 to 80 and 443 to 443 on your Docker host | 80 to 81 and 443 to 444 on your Docker host |
| Who can reach an app | Everyone: from home and from the internet | You choose per app: Internal, External or Both |
| Certificates and domain name | Real certificates and your full domain name | Real certificates and your full domain name |

In both modes, Traefik uses ports 80, 81, 443 and 444 on the Docker host. Only the router forward differs. Keep all four ports free on the host. Traefik Preparation checks them in both modes and stops with "Port N is occupied. This is needed for Traefik." if one is taken.

The three choices in Advanced mode mean:

- **Internal**: reachable only from your home network (LAN).
- **External**: reachable only from the internet.
- **Both**: reachable from both.

## See which mode you are in

1. In Deployrr, open **Proxy** > **Traefik**.
2. Read the **Traefik Mode** line. It says "Toggle how apps are exposed" and ends with the mode: `Simple`, `Advanced` or `NOT SET`.

If it says `NOT SET`, no mode has been chosen yet. **Manage Exposure** and **Traefikify** then behave as in Simple mode. Select **Traefik Mode** once to set it. The first time, you get Simple.

If you do not acknowledge the **Disclaimers** in **Prerequisites**, Deployrr clears the saved mode and the line goes back to `NOT SET`.

## Switch between Simple and Advanced

**Traefik Mode** is a toggle. Each time you select it, it flips to the other mode.

1. Open **Proxy** > **Traefik** > **Traefik Mode**.
2. Read the **Traefik Exposure Mode** box. It says "Simple mode ENABLED" or "Advanced mode ENABLED" and tells you which ports to forward.
3. If it is the mode you did not want, select **Traefik Mode** again to flip back.
4. Change your router port forwards to match the table above. See [Forward the right router ports](/networking/port-forwarding/) for the steps and how to test them.

If you see **Proxy Type Required**, first pick Traefik under **Proxy** > **Proxy Type**. See [Set up Traefik](/reverse-proxy/traefik-setup/). If you see **Requirements Not Met**, acknowledge the **Disclaimers** in **Prerequisites** first.

:::caution
Change the mode and the router forwards together. If your router still forwards 80 and 443 to 80 and 443 after you switch to Advanced, or to 81 and 444 after you switch to Simple, your apps can stop opening. Deployrr does not change your router. Have your router's admin page open before you switch.
:::

**Domain Checks** accepts either pair of forwards. If it fails on port 80 or 443, see [Domain Checks failed](/getting-started/domain-checks-failed/).

### What Simple mode does

The box says: "No control over exposure of app. All apps are exposed both locally and over the internet". Forward ports 80 and 443 on your router to ports 80 and 443 on the Docker host. To see how router port forwarding works by hand, read [UDMS part 18: Setting up port forwarding for Traefik](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Setting_Up_Port_Forwarding) (manual setup).

### What Advanced mode does

The box says Advanced mode allows "restricting app access to internal (home/LAN) only, external (outside home/LAN), or both, while still using a proper SSL and fully qualified domain name". Forward ports 80 and 443 on your router to ports 81 and 444 on the Docker host. To see these two router rules set up, watch [Deployrr 5 walkthrough: Port Forwarding at 38:18](https://youtu.be/rdqbAr0TFnQ?t=2298) (shows Deployrr v5; menus and steps differ in v6).

## Pick a mode

- **Server at home, behind your router:** Use Advanced if some apps should stay on your LAN only, for example an admin tool or a media server you do not want on the internet. Use Simple if you want every app reachable from anywhere and do not need the extra control.
- **VPS or dedicated server:** Simple is usually the better choice. This is general guidance, not something Deployrr tells you. A VPS has no home network, so "Internal" has little meaning there. The [UFW firewall page](/networking/ufw-firewall-vps/) also uses Simple mode on a VPS.

Advanced mode needs a little more setup at home. Read [If an Internal app won't open from home](#if-an-internal-app-wont-open-from-home) before you switch.

## Set Internal, External or Both for an app

### When you install an app

If Traefik is running and the app supports Traefik, Deployrr asks for a subdomain and a login method. In Advanced mode it then shows **Pick an Exposure Method**.

1. Pick **Both** ("Accessible internally and externally"), **Internal** ("Accessible only internally (LAN)") or **External** ("Accessible only externally (Internet)").
2. Select **Select**.

The box explains the two words: "Internal: On your LAN" and "External: Over the internet". Pick **Default (Internal)** (the Cancel button) and the app is set to Internal.

In Simple mode there is no question. The app is reachable from both.

### When you use Traefikify

**Traefikify** also asks **Pick an Exposure Method**. In Simple mode the box says "Simple mode enabled. The only option is to expose apps both internally and externally." and the only choice is **Both**. In Advanced mode you can pick **Both**, **Internal** or **External**. The Cancel button is labelled **Cancel** and silently picks **Both**. See [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/).

:::note
The two prompts treat Cancel differently. At app install it means Internal. In Traefikify it means Both. Pick a value instead of cancelling.
:::

### Change it later with Manage Exposure

1. Open **Proxy** > **Traefik** > **Manage Exposure**. The menu line shows how many apps use each choice, for example "Change app exposure (Internal: 2; External: 1; Both: 5)".
2. In the list, select the app and select **Change**. Each line shows the current exposure (**Internal**, **External**, **Int & Ext** for Both, or **Unknown** if Deployrr does not recognise the setting) and the login method. The login is coloured: green is secure, yellow is basic, red is no auth.
3. In **Change Exposure**, pick **Both**, **Internal** or **External**.
4. Select **Apply**.
5. Read the **Exposure Changed** box. It says the change takes effect immediately.
6. Repeat for other apps, or select **Back** when you are done.

Deployrr also updates the app's links on the Deployrr Dashboard when you change exposure. Internal shows a local link, External shows a remote link, and Both shows both.

If you are in Simple mode, or the mode is `NOT SET`, you see **Manage Exposure - Simple Mode** instead. It says that all apps are exposed both internally and externally, and asks you to switch to Advanced mode and forward 80 to 81 and 443 to 444.

If you see "No file providers found", the list is empty. Add an app with **Traefikify** first.

**Manage Exposure** needs all of these:

- **Prerequisites** done
- Socket Proxy running
- Traefik Production done
- Traefik running
- A Plus or Pro license
- Setup Mode set to **Hybrid**

If something is missing, a **Requirements Not Met** box lists it.

To go further and allow only chosen IP addresses, see [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/).

## After you switch modes later

- Switching only changes the mode and shows you the ports to forward. Deployrr does not ask about your installed apps.
- Your router forwards must change at the same time. See the caution above.
- Switching does not change any app's saved setting.
- When you move from Simple to Advanced, apps keep their saved setting. Apps installed in Simple are **Both**. Open **Manage Exposure** and set the ones that should stay at home to **Internal**.
- When you move from Advanced to Simple, your router forwards go to ports 80 and 443. Apps set to **Internal** (and **Both**) become reachable from the internet. Apps set to **External** stop opening until you set them to **Both** or go back to Advanced. You can't use **Manage Exposure** in Simple mode, so open it before you switch and set every **External** app to **Both**.

## If an Internal app won't open from home

You set an app to Internal in Advanced mode, and `https://app.YOUR_DOMAIN` does not open from a device on your home network. Replace `YOUR_DOMAIN` with your domain.

Deployrr's own note says: "If your router, gateway, or firewall is not capable of Hairpinning or you do not have a local DNS with rewrites (e.g. Pi-Hole, AdGuard Home, etc.), local traffic may be treated as external and you may not be able to access internal-only apps using FQDN."

In plain words: your domain points to your public IP. From inside your home, your router must send that request back inside (hairpinning, also called NAT loopback). If it does not, your request counts as coming from the internet, and an Internal app refuses it. The end of [Deployrr 5 walkthrough: Manage App Exposure at 1:08:47](https://youtu.be/rdqbAr0TFnQ?t=4127) explains hairpinning and DNS rewrites with Pi-hole or AdGuard Home (shows Deployrr v5; menus and steps differ in v6).

Try these in order. The router and DNS steps are general guidance, not Deployrr steps. Menus differ by brand.

1. Check your router forwards. Port 80 must go to 81 and port 443 to 444 on the Docker host.
2. Look in your router settings for NAT loopback, NAT reflection or hairpin NAT, and turn it on.
3. If your router has no such option, use local DNS. In Pi-hole or AdGuard Home, add a DNS rewrite that points `app.YOUR_DOMAIN` to your server's LAN IP address. A rewrite for `*.YOUR_DOMAIN` covers every app. See [Set up local DNS rewrites](/networking/local-dns-rewrites/) for the steps.
4. Make sure the devices on your network use that DNS server.
5. Open the address again. Clear the browser's DNS cache or restart the browser if it still fails.

If Pi-hole will not start because of port 53, see [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/).

:::caution
Changing router port forwards can cut off access to all your apps. Write down the old values before you change them. If you lose access, change the forwards back.
:::

## Check it worked

1. Open **Proxy** > **Traefik** and read the **Traefik Mode** line. It shows the mode you want.
2. Check your router forwards against the table in the Overview.
3. From a device on your home network, open `https://app.YOUR_DOMAIN`.
4. For an Internal app, turn off Wi-Fi on your phone and open the same address. It should not open. If it opens, check the app in **Manage Exposure**.
5. For an External or Both app, the same test from mobile data should open the app (Advanced mode).

If an address still fails, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Next steps

- Add apps behind Traefik that Deployrr did not install: [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/).
- Limit an app to chosen addresses: [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/).
- Run Traefik on a VPS: [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/).

## Related

- [Set up Traefik](/reverse-proxy/traefik-setup/): run Preparation, Staging and Production, then pick a mode.
- [Put any app behind Traefik with Traefikify](/reverse-proxy/traefikify/): add an app and pick its exposure.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): limit access further than Internal.
- [Fix the UFW firewall on a VPS](/networking/ufw-firewall-vps/): VPS firewall fixes, which use Simple mode.
- [Pi-hole will not start because port 53 is already in use](/apps/pi-hole-port-53-conflict/): get Pi-hole running for local DNS rewrites.
