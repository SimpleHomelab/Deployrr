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

- Setup Mode is **Hybrid**. In **Local** mode you see the "Proxy Type - Local Mode Warning" box. Picking a Proxy Type there still saves your choice, stops the other proxy and changes the proxy lines in your compose file, so switch to Hybrid first. See [Setup Mode](/getting-started/setup-mode/).
- The **Proxy Type** menu says "You can change this later, but existing configurations may need to be redone." Read the sections below so you know what that means.
- Your proxy hosts in NPM do not move to Traefik. Your Traefik routes do not move to NPM. You recreate them.

:::caution
If you use Traefik **Advanced** mode, your router forwards 80 to 81 and 443 to 444. NPM's admin page can use port 81 too (you pick its port when you install NPM), and it is a plain HTTP login page. If you switch to NPM and leave the forward on that port, the internet can reach that page. Change the forwards before or right after you switch (see [Change your router forwards](#change-your-router-forwards)).

NPM also asks whoever opens the admin page first to create the admin account. Do not let the internet reach the page before you have made yours.
:::

## Switch from Traefik to NPM

1. Open **Proxy** > **Proxy Type** and select **NPM**. Follow [Pick NPM as your proxy type](/reverse-proxy/nginx-proxy-manager/#pick-npm-as-your-proxy-type).
2. When the "Traefik Container Running" box appears, answer yes. Traefik stops. It is not removed. If you answer No, the switch is cancelled and Proxy Type stays as it was.
3. Deployrr prints "Disabling traefik.yml in compose file..." and "Enabling npm.yml in compose file...". This decides which proxy a later Stack Manager **Up** starts.
4. [Change your router forwards](#change-your-router-forwards).
5. Start NPM.
   - If you never installed it, open **Proxy** > **NPM** > **Install**. In Local mode you see "Requirements Not Met" first, because NPM needs Hybrid.
   - If you used it before, open **Tools** > **Stack Manager** > **Up**. This needs a Basic, Plus or Pro license. It starts every enabled app, including the proxy whose line is now enabled. **Tools** > **Stack Manager** > **Start Container** also works.
   - As a fallback, run this. It works only if the `npm` container still exists:

     ```bash
     sudo docker start npm
     ```

     A Stack Manager **Up** or **Update Stack** run while NPM's line is disabled may remove its stopped container. Its appdata stays, and the next **Up** after you switch back creates it again.
6. In NPM, add a proxy host for each app. Use the container name and internal port. See [Add a proxy host for an app](/reverse-proxy/nginx-proxy-manager/#add-a-proxy-host-for-an-app) and [Connect your apps to each other](/using-deployrr/connecting-apps/). [App reference](/apps/app-reference/) lists app ports.

Choosing a Proxy Type does not start the proxy. To start it later, use Stack Manager as shown above.

You see "Port Conflict - Cannot Install" at **NPM** > **Install** when Traefik is running while Proxy Type is already NPM. This can happen if Traefik was started again after the switch, for example by Stack Manager **Up**, **Start Container**, `docker start`, or a Traefik setup step. The box says "You cannot run both Traefik and NPM simultaneously". Run this, then try again:

```bash
sudo docker stop traefik
```

The box also offers uninstalling Traefik as the other option.

### What you lose with NPM

Apps behind a Traefik login chain have no login in NPM. If you want one, set it up in NPM with its Access Lists. That is an NPM feature, not a Deployrr one.

Login apps (Authelia, Authentik, Google OAuth, TinyAuth, **Manage Auth**), **Traefik Bouncer**, **Manage Exposure** and **Traefikify** need Traefik. With NPM they show a "Requirements Not Met (N)" box. Its lines include "Traefik - Must be running (Proxy menu)" and "Traefik Production - Must be completed (Proxy menu)". The full list is in [What you give up compared to Traefik](/reverse-proxy/nginx-proxy-manager/#what-you-give-up-compared-to-traefik).

## Switch from NPM to Traefik

1. List your NPM proxy hosts first. Write down the domain, forward host and forward port of each one. You need them later.
2. Open **Proxy** > **Proxy Type** and select **Traefik**.
3. When the "NPM Container Running" box appears, answer yes. NPM stops. It is not removed. If you answer No, the switch is cancelled and Proxy Type stays as it was.
4. Deployrr prints "Disabling npm.yml in compose file..." and "Enabling traefik.yml in compose file...". This decides which proxy a later Stack Manager **Up** starts.
5. If you set up Traefik before, open **Tools** > **Stack Manager** > **Up**. This needs a Basic, Plus or Pro license. It starts every enabled app, including Traefik. **Tools** > **Stack Manager** > **Start Container** also works.
6. As a fallback, run this. It works only if the `traefik` container still exists:

   ```bash
   sudo docker start traefik
   ```

   A Stack Manager **Up** or **Update Stack** run while Traefik's line is disabled may remove its stopped container. Its appdata stays, and the next **Up** after you switch back creates it again.
7. If you never set up Traefik, follow [Set up Traefik](/reverse-proxy/traefik-setup/): **Preparation**, **Staging**, then **Production**.
8. [Change your router forwards](#change-your-router-forwards).
9. Bring your apps across (see the next section).

:::caution
**Preparation**, **Staging** and **Production** do not check your Proxy Type. Set Proxy Type to Traefik first and make sure NPM is stopped before you run them. Traefik needs ports 80 and 443 too.

If you ran them with Proxy Type still on NPM, Traefik stays disabled in the compose file. Staging then ends with "Timed out. Could not verify if Traefik is running." and NPM keeps ports 80 and 443. To fix it, set Proxy Type to Traefik, then run Staging again.
:::

If you see "Proxy Type Required" at **Traefik** > **Traefik Mode**, your Proxy Type is still NPM. The box tells you to go to **Proxy** > **Proxy Type** and select Traefik. **NPM** > **Install** shows the same box when Proxy Type is Traefik.

### Bring your apps across

Apps you installed before the switch keep their Traefik rules. They work again once Traefik runs.

Apps you installed while NPM was in use have no Traefik address. While Traefik is not running, Deployrr does not ask for a subdomain when you install an app. Fix each one in one of two ways:

- Use **Traefik** > **Traefikify** to add the app. See [Traefikify](/reverse-proxy/traefikify/).
- Reinstall the app while Traefik is running. Deployrr asks for the subdomain ("Traefik Subdomain") and creates the rules file if the app has none. A subdomain already set in `.env` skips the prompt. If the app already has a rules file, your answers do not change that file. See [Reinstall an app](/using-deployrr/reinstall-app/).

For something Deployrr did not install, such as an app on another machine, use **Traefikify** with its IP address and port. Your list of NPM proxy hosts has these values. You can also follow [Put a custom app behind Traefik](/reverse-proxy/custom-app-behind-traefik/).

The [Dashboard](/using-deployrr/dashboard/) adds remote entries only while Traefik runs.

## Change your router forwards

| Proxy | Forward 80 to | Forward 443 to |
| --- | --- | --- |
| NPM | 80 | 443 |
| Traefik, Simple mode | 80 | 443 |
| Traefik, Advanced mode | 81 | 444 |

Going from Advanced mode to NPM, change the forwards to 80 and 443. Going back to Advanced mode, change them to 81 and 444. Simple mode and NPM use the same pair, so nothing changes between them. To see the Simple and Advanced forwards set on a router, watch [Deployrr 5 walkthrough: Port Forwarding at 37:43](https://youtu.be/rdqbAr0TFnQ?t=2263) (shows Deployrr v5; menus differ in v6, the ports are the same). See [Port forwarding](/networking/port-forwarding/) and [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/).

## If you switch Setup Mode to Local

Switching Setup Mode to **Local** clears your Proxy Type. The **Proxy** menu shows "NOT SELECTED". When you set Setup Mode back to **Hybrid**, pick your Proxy Type again.

If you pick a Proxy Type while in Local mode, you see "Proxy Type - Local Mode Warning". See [Before you start](#before-you-start) for what happens then.

## Check it worked

1. List your containers:

   ```bash
   sudo docker ps -a
   ```

   Only one of `traefik` and `npm` should have a status that starts with "Up". The other should show "Exited". It is not listed if a Stack Manager **Up** ran since the switch.
2. Open **Proxy**. The **Proxy Type** line should end with the name you chose.
3. Open an app address in your browser.

If NPM is stopped, its **Proxy** menu line shows "- Not Installed". Run `sudo docker ps -a` to see whether the `npm` container exists.

## Related

- [Use Nginx Proxy Manager instead of Traefik](/reverse-proxy/nginx-proxy-manager/): install NPM and add proxy hosts.
- [Set up Traefik](/reverse-proxy/traefik-setup/): Preparation, Staging and Production.
- [Traefikify](/reverse-proxy/traefikify/): give an existing app a Traefik address.
- [Port forwarding](/networking/port-forwarding/): set and test your router forwards.
- [Simple vs Advanced Traefik mode](/reverse-proxy/simple-vs-advanced-mode/): which ports each mode uses.
