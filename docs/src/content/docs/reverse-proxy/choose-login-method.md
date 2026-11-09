---
title: Choose a login method for your apps
description: Compare Authelia, Authentik, Google OAuth, TinyAuth, Basic HTTP Auth and No Authentication, install one, then switch your apps to it.
type: guide
tags:
  - auth
  - traefik
  - remote-access
apps:
  - authelia
  - authentik
  - oauth
  - tinyauth
  - traefik
applies_to: v6.0+
related:
  - reverse-proxy/traefik-setup
  - apps/authentik-removal
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/restrict-access-using-ip-allowlist
  - apps/jellyfin-client-on-lg-webos
further_reading:
  - title: Google OAuth with Traefik forward auth (creating the client ID and secret)
    url: https://www.simplehomelab.com/google-oauth-traefik-forward-auth-2024/
  - title: Authentik Docker Compose guide
    url: https://www.simplehomelab.com/authentik-docker-compose-guide-2025/
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

Apps behind Traefik can ask visitors to log in before they see anything. This guide helps you pick a login method, install it from the **Security** menu, and switch your apps to it. It is for anyone who finished [Set up Traefik](/reverse-proxy/traefik-setup/).

## Overview

Deployrr gives you six login methods. Four are apps you install. Two are always there.

| Method | What you need | Who it suits |
| --- | --- | --- |
| Authelia | A username, password, display name and email for one user. | Most home setups. One login page for all apps. You register your device after the install. |
| Authentik | Nothing to prepare. You create the admin account in your browser after the install. | Setups where you want to manage users in a full identity provider. It runs three containers. |
| Google OAuth | A Google OAuth client ID and secret. The Google accounts allowed to log in. | Setups where you want people to sign in with a Google account. |
| TinyAuth | A username and password for one user. An authenticator app for the two-factor code. | A single sign-on login page with two-factor. |
| Basic HTTP Auth | Nothing. It uses the username and password you set in Traefik **Preparation**. | A stopgap. The picker marks it "Discouraged". |
| No Authentication | Nothing. | Apps with their own login, or apps you protect another way. The picker marks it "Not Recommended". |

Authelia, Authentik, Google OAuth and TinyAuth need a Pro license. Basic HTTP Auth and No Authentication are always available.

In the list you pick from, the four apps you install show as "Recommended". They appear only when they are running.

:::note
Not sure which one to pick? TinyAuth ("Self-Hosted SSO with 2-FA") sets up two-factor during its install and asks only for one user. Authelia also asks for one user.
:::

## Before you start

You need all of these for Authelia, Authentik, Google OAuth and TinyAuth. If something is missing, Deployrr shows a **Requirements Not Met** box that lists it.

- A Pro license.
- All **Prerequisites** steps are done.
- **Setup Mode** is **Hybrid**.
- Traefik Production is done and Traefik is running. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- The **Socket Proxy** app is running.

Your server also needs a working domain, because each login page opens at an address such as `https://authelia.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your domain.

You can install more than one method. Each app uses one method at a time.

## Install the method you picked

Open **Security** from the main menu. Then follow the part below for your method. If the method is already installed, Deployrr asks "Do you want to reinstall/reconfigure it?" and warns that this resets its configuration. Say no unless you want to start over.

### Authelia

1. Select **Authelia** ("Open-source Access/Identity Provider").
2. Enter these values when asked:
   - `Enter/edit Authelia Username:` is the name you log in with.
   - `Enter a strong password for Authelia:` is your password. Type it again in the **Confirm Password** box. If a password exists already, you can leave it blank to keep it. Write it down.
   - `Enter/edit Authelia User Display Name (use underscore in place of space):` is the name Authelia shows. Use an underscore instead of a space.
   - `Enter/edit Authelia User Email.` can be any address. Authelia does not send real email.
3. Wait for "All done with Authelia setup!".
4. Open `https://authelia.YOUR_DOMAIN` and register your device.
5. Authelia can't send email, so it saves its messages to a file. Print the file:

   ```bash
   sudo cat appdata/authelia/notifications.txt
   ```

   Run this from your Docker folder. If you use a different folder, adjust the path.
6. Copy the one-time code from the file and enter it in the browser. Use the same device you opened Authelia on in step 4.

If an Authelia configuration already existed, Deployrr keeps the old file next to the new one with a date in its name.

### Authentik

1. Select **Authentik** ("Open-source Access/Identity Provider").
2. Wait for "All done with Authentik setup!". The first start can take up to 5 minutes.
3. Open `https://authentik.YOUR_DOMAIN/if/flow/initial-setup/` in your browser.
4. Create your admin account.

Authentik asks you for nothing during install. Its database password and secret key are created for you. To remove Authentik later, see [Remove Authentik](/apps/authentik-removal/).

### Google OAuth

Create the client ID and secret in Google first. The Google OAuth guide listed under Further reading on this page shows how.

1. Select **Google OAuth** ("Forward Auth with Google").
2. In the **Google OAuth Requirements** box, read "Do you have these credentials ready?". Select **Yes**.
3. Enter your **Google OAuth Client ID**.
4. Enter your **Google OAuth Client Secret**.
5. At "Restrict only certain accounts to login by providing an allowed google account (#1)", enter the Google email address of a person who may log in.
6. In the **Add More Allowed Accounts** box, choose **Yes** to add another address. **Yes** is the button on the right. Enter picks **No**, which finishes the list.
7. Wait for "All done with Google OAuth setup!".
8. Open `https://oauth.YOUR_DOMAIN` to check it.

:::caution
By default Google OAuth lets any Google account log in. Deployrr warns about this. Add at least one allowed address in step 5, so only those accounts get in.
:::

If you leave the first email box empty, or press Cancel there, no address is added and any Google account can log in. Deployrr still ends with "Only whitelisted Google accounts can authenticate", so don't rely on that message. Enter at least one address.

### TinyAuth

You need an authenticator app on your phone, such as Google Authenticator, Duo, Authy or Bitwarden.

1. Select **TinyAuth** ("Self-Hosted SSO with 2-FA").
2. Enter a username in the **TinyAuth Username** box.
3. Enter a password in the **TinyAuth Password** box.
4. Enter it again in the **TinyAuth Confirm Password** box. If they don't match, Deployrr asks again.
5. Read the **TOTP 2-Factor Authentication Setup** box and close it.
6. Scan the QR code in the terminal with your authenticator app.
7. Copy the secret printed above the QR code. It looks like `secret=` followed by letters and digits. Copy only the part after `secret=`.
8. Press any key to continue.
9. Paste the secret into the **TOTP Secret** box.
10. Wait for "All done with TinyAuth setup!".
11. Open `https://tinyauth.YOUR_DOMAIN` to check it.

To add more users later, edit the `users_file` in `appdata/tinyauth/` in your Docker folder.

## Switch your apps to the new method

Installing a method does not change your apps. You assign it to each app.

If Traefik is running and the app supports it, apps you install after this get a question: **Pick an Authentication Method**. It lists only the methods that are running, plus Basic HTTP Auth and No Authentication. **Skip** gives the app No Authentication. The same box appears when you use **Traefikify** (Plus or Pro license; see [Use one domain across several servers](/reverse-proxy/multi-server-same-domain/)). Run the auth app on the server that runs Traefik.

Two restrictions apply in that box:

- Basic HTTP Auth is not offered for Portainer, Open WebUI, Kavita, Flame, Paperless-ngx and Flowise. Deployrr says "Basic Auth does not work with or is not recommended for" the app.
- No Authentication is not offered for wg-easy.

Manage Auth does not apply these restrictions. Avoid picking those methods for those apps there too.

For apps you already have, use **Manage Auth**.

### With Manage Auth

Manage Auth needs a Pro license, all **Prerequisites** done, **Setup Mode** set to **Hybrid**, Traefik Production done and Traefik running.

1. From the main menu, select **Security**.
2. Select **Manage Auth** ("Change/Disable Authentication for Apps").
3. Read the **Requirements to Manage Authentication** box. Select **Yes**. **Yes** is the button on the right. Enter picks **No** and takes you back.
4. In the list, select the app you want to change. App names are in capitals. Next to each name you see its current method and, if known, where it is open: Int & Ext, External or Internal.
5. In the next box, read "Current Authentication". Under "Select new authentication method", pick the new one.
6. Read the **Success** box. It shows the previous and new method.
7. Repeat steps 4 to 6 for each app. Choose **Back** when you are done.

If you see "No apps with authentication chains were found", add apps first with **Proxy** > **Traefik** > **Traefikify**, or install an app while Traefik is running.

Manage Auth only works on:

- apps with a Traefik rules file (`app-NAME.yml`)
- apps whose Docker labels use one of the Deployrr login chains
- apps that use Deployrr's own chains

For apps with a rules file, the change applies right away. For apps with Docker labels, Deployrr recreates the container for you.

If the box says "No authentication providers running", no auth app is up. Install one from **Security**, then try again.

### By editing the rules file

Each method is a login chain. You can set it by hand if you don't have a Pro license, or if you prefer files.

| Chain | Login method | Available |
| --- | --- | --- |
| `chain-no-auth` | No Authentication | Always |
| `chain-basic-auth` | Basic HTTP Auth | Always |
| `chain-authelia` | Authelia | After you install Authelia |
| `chain-authentik` | Authentik | After you install Authentik |
| `chain-oauth` | Google OAuth | After you install Google OAuth |
| `chain-tinyauth` | TinyAuth | After you install TinyAuth |

Use a chain only for a method you installed. Otherwise the app stops loading.

1. Open the app's file in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder. Replace `HOSTNAME` with your server's hostname and `NAME` with the app name:

   ```bash
   sudo nano appdata/traefik3/rules/HOSTNAME/app-NAME.yml
   ```

2. Under `middlewares:`, change the chain name. For example, change `- chain-no-auth` to `- chain-authelia`.
3. Save the file. Traefik picks up the change on its own. You don't need to restart it.

Apps that use Docker labels work a little differently. Open the app's compose file in `compose/HOSTNAME/`, find the label that ends in `.middlewares=chain-NAME@file`, and change the chain name. Keep `@file`. Then recreate the app:

```bash
dcrec NAME
```

Without the [Deployrr bash aliases](/using-deployrr/bash-aliases/), run this instead. Replace `DOCKER_FOLDER` with the path to your Docker folder and `HOSTNAME` with your server's hostname:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml up -d --force-recreate --remove-orphans NAME
```

:::caution
If you run **Traefikify** again for an app and choose to overwrite its file, the app goes back to the chain you pick in that run. Check the chain afterward.
:::

## Check it worked

1. Check that your auth app is running:

   ```bash
   dps
   ```

   Without the aliases, run:

   ```bash
   sudo docker ps -a
   ```

   You should see `authelia`, `authentik`, `oauth` or `tinyauth` with a status that starts with "Up". The **Security** menu also shows RUNNING next to it.
2. Open one of your switched apps in a private browser window. Use its address, such as `https://APP.YOUR_DOMAIN`. Replace `APP` with its subdomain.
3. You should land on the login page of your method. With Basic HTTP Auth, the browser asks for a username and password. With No Authentication, the app loads straight away.
4. Log in. The app should open.

If an app shows an error or doesn't load, its chain probably names a method that isn't installed. [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) to see which one Traefik can't find.

## Things to know

- TV and mobile apps often can't show a login page. For those, switch the app to No Authentication if it has its own login (see [Jellyfin app on LG webOS TV or Xbox shows error -27](/apps/jellyfin-client-on-lg-webos/)), or use [Auth Bypass](/reverse-proxy/setup-auth-bypass-using-file-provider/).
- To limit an app to your home network or VPN, add [an IP allowlist](/reverse-proxy/restrict-access-using-ip-allowlist/). Manage Auth replaces the chain name, so check the chain after you run it on such an app.
- To stop using Authentik, move your apps to another method first. See [Remove Authentik](/apps/authentik-removal/).

## Next steps

- Move every app that has no login to a method from this page.
- Try one app from a phone on mobile data to check the login from outside your network.

## Related

- [Set up Traefik](/reverse-proxy/traefik-setup/): the setup this guide builds on.
- [Remove Authentik](/apps/authentik-removal/): switch apps away from Authentik and delete it.
- [Let mobile apps skip the login page](/reverse-proxy/setup-auth-bypass-using-file-provider/): let apps that can't show a login page get through.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): limit an app to chosen addresses.
- [Jellyfin app on LG webOS TV or Xbox shows error -27](/apps/jellyfin-client-on-lg-webos/): TV apps and login pages.
