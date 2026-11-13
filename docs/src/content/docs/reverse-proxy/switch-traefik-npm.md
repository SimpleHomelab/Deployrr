---
title: Switch between Traefik and Nginx Proxy Manager
description: Move from Traefik to Nginx Proxy Manager or back in Deployrr v6, fix your router forwards, and bring your app addresses across.
type: how-to
tags:
  - traefik
  - remote-access
  - ports
  - app-networking
apps:
  - traefik
  - npm
applies_to: v6.0+
related:
  - reverse-proxy/nginx-proxy-manager
  - reverse-proxy/traefik-setup
  - reverse-proxy/traefikify
  - networking/port-forwarding
  - reverse-proxy/simple-vs-advanced-mode
further_reading:
  - title: "UDMS part 18: Traefik vs Nginx Proxy Manager (manual setup)"
    url: https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Traefik_vs_Nginx_Proxy_Manager
videos:
  - id: Nuo83uzTWco
    start: 223
    title: "Deployrr 6 overview: NGINX Proxy Manager as a Traefik alternative"
  - id: rdqbAr0TFnQ
    start: 2263
    title: "Deployrr 5 walkthrough: Traefik port forwarding for Simple and Advanced mode"
    note: Shows Deployrr v5. Menus and steps differ in v6.
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
sidebar:
  order: 19
---

You can use Traefik or Nginx Proxy Manager (NPM) as your reverse proxy, but not both at once. Both need ports 80 and 443. This page covers what to stop, what to start, what to change on your router, and what to redo for your apps.

For a short look at why NPM is an option in v6, watch [Deployrr 6 overview: NGINX Proxy Manager at 3:43](https://youtu.be/Nuo83uzTWco?t=223). To understand how the two proxies differ, read [UDMS part 18: Traefik vs Nginx Proxy Manager](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Traefik_vs_Nginx_Proxy_Manager) (manual setup, background only).

## Before you start

- Setup Mode is **Hybrid**. In **Local** mode you see the "Proxy Type - Local Mode Warning" box. Picking a Proxy Type there still saves your choice, stops the other proxy and changes the proxy lines in your compose file, so switch to Hybrid first. Switching Setup Mode to Local also clears your Proxy Type (the **Proxy** menu shows "NOT SELECTED"). See [Setup Mode](/getting-started/setup-mode/).
- Your proxy hosts in NPM do not move to Traefik. Your Traefik routes do not move to NPM. You recreate them.

:::caution
If you use Traefik **Advanced** mode, your router forwards 80 to 81 and 443 to 444. NPM's admin page can use port 81 too (you pick its port when you install NPM), and it is a plain HTTP login page. If you switch to NPM and leave the forward on that port, the internet can reach that page. Change the forwards before or right after you switch (see [Change your router forwards](#change-your-router-forwards)).

NPM also asks whoever opens the admin page first to create the admin account. Do not let the internet reach the page before you have made yours.
:::

## Switch from Traefik to NPM

1. Open **Proxy** > **Proxy Type** and select **NPM**. Follow [Pick NPM as your proxy type](/reverse-proxy/nginx-proxy-manager/#pick-npm-as-your-proxy-type).
2. When the "Traefik Container Running" box appears, answer yes. Traefik stops. It is not removed. If you answer No, the switch is cancelled and Proxy Type stays as it was.
3. Deployrr prints "Enabling npm.yml in compose file..." and "Disabling traefik.yml in compose file...". This decides which proxy a later Stack Manager **Up** starts.
4. [Change your router forwards](#change-your-router-forwards).
5. Start NPM. If you never installed it, open **Proxy** > **NPM** > **Install**. If you used it before, see [Start a proxy you used before](#start-a-proxy-you-used-before).
6. In NPM, add a proxy host for each app. Use the container name and internal port. See [Add a proxy host for an app](/reverse-proxy/nginx-proxy-manager/#add-a-proxy-host-for-an-app) and [Connect your apps to each other](/using-deployrr/connecting-apps/). [App reference](/apps/app-reference/) lists app ports.

"Port Conflict - Cannot Install" at **NPM** > **Install** means Traefik was started again after the switch, for example with `sudo docker start traefik`. Run `sudo docker stop traefik`, then try again.

Apps behind a Traefik login chain have no login in NPM, and the login apps, **Manage Exposure** and **Traefikify** need Traefik. See [What you give up compared to Traefik](/reverse-proxy/nginx-proxy-manager/#what-you-give-up-compared-to-traefik).

## Switch from NPM to Traefik

1. List your NPM proxy hosts first. Write down the domain, forward host and forward port of each one. You need them later.
2. Open **Proxy** > **Proxy Type** and select **Traefik**.
3. When the "NPM Container Running" box appears, answer yes. NPM stops. It is not removed. If you answer No, the switch is cancelled and Proxy Type stays as it was.
4. Deployrr prints "Enabling traefik.yml in compose file..." and "Disabling npm.yml in compose file...". This decides which proxy a later Stack Manager **Up** starts.
5. Start Traefik. If you never set it up, follow [Set up Traefik](/reverse-proxy/traefik-setup/): **Preparation**, **Staging**, then **Production**. If you set it up before, see [Start a proxy you used before](#start-a-proxy-you-used-before).
6. [Change your router forwards](#change-your-router-forwards).
7. Bring your apps across (see the next section).

:::caution
**Preparation**, **Staging** and **Production** do not check your Proxy Type. Set Proxy Type to Traefik first and make sure NPM is stopped before you run them. Traefik needs ports 80 and 443 too.

If you ran them with Proxy Type still on NPM, Traefik stays disabled in the compose file. Staging then ends with "Timed out. Could not verify if Traefik is running." and NPM keeps ports 80 and 443. To fix it, set Proxy Type to Traefik, then run Staging again.
:::

"Proxy Type Required" at **Traefik** > **Traefik Mode** means your Proxy Type is still NPM.

### Bring your apps across

Apps you installed before the switch keep their Traefik rules. They work again once Traefik runs.

Apps you installed while NPM was in use have no Traefik address. While Traefik is not running, Deployrr does not ask for a subdomain when you install an app. Fix each one in one of two ways:

- Use **Traefik** > **Traefikify** to add the app. See [Traefikify](/reverse-proxy/traefikify/).
- Reinstall the app while Traefik is running. Deployrr asks for the subdomain and creates the rules file if the app has none. See [Reinstall an app](/using-deployrr/reinstall-app/).

For something Deployrr did not install, such as an app on another machine, use **Traefikify** with the IP address and port from your list of NPM proxy hosts.

The [Dashboard](/using-deployrr/dashboard/) adds remote entries only while Traefik runs.

## Start a proxy you used before

Choosing a Proxy Type does not start the proxy. Open **Tools** > **Stack Manager** > **Up** (needs a Basic, Plus or Pro license). It starts every enabled app, including the proxy whose line is now enabled. **Tools** > **Stack Manager** > **Start Container** also works if the container still exists.

As a fallback, run `sudo docker start npm` or `sudo docker start traefik`. This works only if the container still exists: a Stack Manager **Up** or **Update Stack** run while a proxy's line is disabled removes its stopped container (see [What happens to a disabled app's container](/using-deployrr/stack-manager/#what-happens-to-a-disabled-apps-container)). Its appdata stays, and the next **Up** after you switch back creates it again.

## Change your router forwards

| Proxy | Forward 80 to | Forward 443 to |
| --- | --- | --- |
| NPM | 80 | 443 |
| Traefik, Simple mode | 80 | 443 |
| Traefik, Advanced mode | 81 | 444 |

Only a move to or from Traefik Advanced mode needs a change. To see the Simple and Advanced forwards set on a router, watch [Deployrr 5 walkthrough: Port Forwarding at 37:43](https://youtu.be/rdqbAr0TFnQ?t=2263) (shows Deployrr v5; menus differ in v6, the ports are the same). See [Port forwarding](/networking/port-forwarding/) and [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

## Check it worked

1. List your containers:

   ```bash
   sudo docker ps -a
   ```

   Only one of `traefik` and `npm` should have a status that starts with "Up". The other should show "Exited". It is not listed if a Stack Manager **Up** ran since the switch.
2. Open **Proxy**. The **Proxy Type** line should end with the name you chose.
3. Open an app address in your browser.
