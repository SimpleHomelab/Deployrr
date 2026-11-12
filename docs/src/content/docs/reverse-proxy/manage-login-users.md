---
title: Change login passwords and add users for Basic Auth, TinyAuth, Authelia and Google OAuth
sidebar:
  order: 5
  label: Change passwords and add users
description: Change a password, add or remove a user, and recover two-factor login for Basic Auth, TinyAuth, Authelia, Authentik and Google OAuth.
type: guide
tags:
  - auth
  - traefik
applies_to: v6.0+
apps:
  - authelia
  - authentik
  - oauth
  - tinyauth
  - traefik
related:
  - reverse-proxy/choose-login-method
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/edit-env-and-secrets
  - reverse-proxy/certificate-errors
  - using-deployrr/stack-manager
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
further_reading:
  - title: "UDMS part 19: Authelia users"
    url: "https://www.simplehomelab.com/udms-19-authelia-docker-compose/#3_Authelia_Users"
  - title: "UDMS part 18: Basic HTTP authentication secret"
    url: "https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Basic_HTTP_Authentication_Secret"
videos:
  - id: UIq8PLZHBtk
    start: 1659
    title: "Authelia 2FA guide: registering a device with notifications.txt"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: UIq8PLZHBtk
    start: 981
    title: "Authelia 2FA guide: users.yml and password hash"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: SCKALXprTQE
    start: 684
    title: "Google OAuth with Traefik Forward Auth: allowed account in the secrets file"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
---

You set up a login method for your apps. Now you want to change a password, let another person in, or get back in after you lost your two-factor device. This guide shows how, one method at a time. It is for anyone who finished [Choose a login method for your apps](/reverse-proxy/choose-login-method/).

## Overview

Each method keeps its users in a different place. For most methods you edit a file in your Docker folder, then restart or recreate one container. Recreate needs a Basic, Plus or Pro license.

| Method | Where the users are | License to set it up |
| --- | --- | --- |
| Basic HTTP Auth | `secrets/basic_auth_credentials` | Plus or Pro (part of Traefik **Preparation**) |
| TinyAuth | `appdata/tinyauth/users_file` | Pro |
| Authelia | `appdata/authelia/users.yml` | Pro |
| Authentik | Authentik's own admin interface | Pro |
| Google OAuth | `secrets/oauth_secrets` | Pro |

All paths in this guide are inside your Docker folder, for example `/home/USER/docker`. Most of these files belong to root. The Authelia files belong to your user. Using `sudo` works for all of them.

Not sure which method an app uses? Open **Security** > **Manage Auth** (Pro). It lists each app with its current method. See [Switch your apps to the new method](/reverse-proxy/choose-login-method/#switch-your-apps-to-the-new-method).

## Before you start

1. Open a terminal on the server.
2. Go to your Docker folder. Replace `YOUR_DOCKER_FOLDER` with its path:

   ```bash
   cd YOUR_DOCKER_FOLDER
   ```

3. Keep this terminal open. The commands below use paths that start from this folder.

:::caution
Back up each file before you edit it. A broken file can lock everyone out of the apps that file protects. If that happens, see [If you are locked out](#if-you-are-locked-out).
:::

## Basic HTTP Auth

Traefik reads Basic HTTP Auth logins from `secrets/basic_auth_credentials`. The `htpasswd` tool comes with the packages Deployrr installs, so you can use it here. To see how this file is first made by hand, read [UDMS part 18: Basic HTTP authentication secret](https://www.simplehomelab.com/udms-18-traefik-docker-compose-guide/#Create_Basic_HTTP_Authentication_Secret) (manual setup).

:::caution
Never add `-c` to the `htpasswd` command. It empties the file and removes every user.
:::

### Change a password or add a user

1. Back up the file:

   ```bash
   sudo cp secrets/basic_auth_credentials secrets/basic_auth_credentials.bak
   ```

2. Run this command. Replace `USERNAME` with the user's name. Use the existing name to change a password. Use a new name to add a user:

   ```bash
   sudo htpasswd -B secrets/basic_auth_credentials USERNAME
   ```

3. Type the password when asked. Type it again to confirm.
4. Recreate Traefik so it reads the file. Go to **Tools** > **Stack Manager** > **Recreate**. At `Select an app to recreate:`, type the number of `traefik` and press Enter. With the [Deployrr bash aliases](/using-deployrr/bash-aliases/), you can run this instead:

   ```bash
   dcrec traefik
   ```

### Remove a user

1. Back up the file, as shown above.
2. Run this command. Replace `USERNAME` with the user's name:

   ```bash
   sudo htpasswd -D secrets/basic_auth_credentials USERNAME
   ```

3. Recreate Traefik, as in the previous part.

### If you changed the main user's password

Deployrr also keeps the main user's name and password in two files: `secrets/basic_auth_username` and `secrets/basic_auth_password`. If you run Traefik **Preparation** again, it builds the login file from these two files. Only that one user is kept. Users you added by hand are removed.

To keep your new password for a later **Preparation** run:

1. Open the password file:

   ```bash
   sudo nano secrets/basic_auth_password
   ```

2. Edit the file so it holds only the new password.
3. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.

You can also use **Tools** > **Secrets Editor** with a Pro license. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).

:::note
You can also change the Basic Auth username or password by running **Proxy** > **Traefik** > **Preparation** again (Plus or Pro). Deployrr then shows "It appears that Traefik preparation was already done. If you proceed, previous setup may be overwritten." In the **Traefik Secrets** form, the password field says "(Leave password blank to keep existing)". You must stop Traefik first, or the run fails with "Port 443 is occupied. This is needed for Traefik." See [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/). The `htpasswd` way above is simpler.
:::

## TinyAuth

TinyAuth keeps one line per user in `appdata/tinyauth/users_file`. A line looks like one of these:

```text
username:bcrypt-hash
username:bcrypt-hash:TOTPSECRET
```

The second form means the user has two-factor login. `TOTPSECRET` is the secret for the authenticator app.

:::caution
If you run **Security** > **TinyAuth** again, Deployrr warns "This will reset your TinyAuth configuration." After the run, the file holds only the user you typed, and that user must set up two-factor again. Every other user is gone. Back up `users_file` first and copy the other users' lines back after. Or add users by hand, as shown below.
:::

### Add a user or change a password

1. Back up the file:

   ```bash
   sudo cp appdata/tinyauth/users_file appdata/tinyauth/users_file.bak
   ```

2. Run this command. Replace `USERNAME` with the user's name. Use a new name to add a user. Use an existing name to change that user's password. Do not add `-c`:

   ```bash
   sudo htpasswd -B appdata/tinyauth/users_file USERNAME
   ```

3. Type the password when asked. Type it again to confirm.
4. Recreate TinyAuth so it reads the file. Go to **Tools** > **Stack Manager** > **Recreate** and type the number of `tinyauth`. Or, with the bash aliases, run `dcrec tinyauth`.

When you change a password this way, `htpasswd` rewrites that user's line without the `:TOTPSECRET` part. Two-factor is then off for that user. A new user also has no two-factor yet. Add it as shown in the next part.

### Turn on two-factor for a user, or set up a new device

1. Show the user's full line. Replace `USERNAME` with the user's name:

   ```bash
   sudo grep '^USERNAME:' appdata/tinyauth/users_file
   ```

2. Generate a secret. Replace `FULL_LINE` with the whole line from step 1. Keep the single quotes:

   ```bash
   sudo docker run -t --rm ghcr.io/steveiliop56/tinyauth:v5 totp generate --user 'FULL_LINE'
   ```

   `v5` is the TinyAuth version Deployrr uses by default. If you pinned another version, use that one.

3. Scan the QR code with the user's authenticator app.
4. Copy the text after `secret=`.
5. Open the file:

   ```bash
   sudo nano appdata/tinyauth/users_file
   ```

6. At the end of that user's line, type a colon and then the secret. The line then looks like `username:bcrypt-hash:TOTPSECRET`.
7. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.
8. Recreate TinyAuth, as in the previous part.

### Lost the two-factor device

You have two choices:

- Remove the colon and the secret from the end of the user's line. The user can then log in with the password only. Recreate TinyAuth.
- Generate a new secret as shown above and put it on the line in place of the old one. Recreate TinyAuth.

## Authelia

Authelia keeps users in `appdata/authelia/users.yml`. Each user is a block under `users:` with a name, display name, email, password hash and group. To understand how the file is built, read [UDMS part 19: Authelia users](https://www.simplehomelab.com/udms-19-authelia-docker-compose/#3_Authelia_Users) (manual setup).

:::caution
If you run **Security** > **Authelia** again, Deployrr moves the old `users.yml` and `configuration.yml` to files with the date and time in their names. It writes new files with one user. It also makes new secrets and empties `notifications.txt`. Your extra users are only in the dated copy, and edits you made to the configuration are reset. To keep your users, edit the file by hand as shown below.

The run also cleans up Docker. It removes stopped containers and images that no running container uses. If you had stopped apps, bring them back afterwards with **Tools** > **Stack Manager** > **Up**. See [Stack Manager](/using-deployrr/stack-manager/).
:::

### Make a password hash

Authelia stores a hash, not the password.

1. Run this command. Replace `NEWPASSWORD` with the password you want. Keep the single quotes:

   ```bash
   sudo docker run --rm authelia/authelia:4.37.5 authelia hash-password 'NEWPASSWORD'
   ```

2. Look for the line that starts with `Password hash:`.
3. Copy the text after `Password hash: `. It starts with `$argon2id$`.

### Change a password

1. Back up the file:

   ```bash
   sudo cp appdata/authelia/users.yml appdata/authelia/users.yml.bak
   ```

2. Open the file:

   ```bash
   sudo nano appdata/authelia/users.yml
   ```

3. Find the user's `password:` line.
4. Replace the value with the new hash. Put it in single quotes.
5. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.
6. Restart Authelia:

   ```bash
   sudo docker restart authelia
   ```

### Add a user

1. Make a hash for the new user's password, as shown above.
2. Back up the file, as in the previous part.
3. Open the file with `sudo nano appdata/authelia/users.yml`.
4. Copy an existing user block, including its name line.
5. Paste it below the last user.
6. Change the name, `displayname`, `email` and `password` of the copy.
7. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.
8. Restart Authelia:

   ```bash
   sudo docker restart authelia
   ```

:::caution
YAML cares about spaces. Indent with two spaces per level. Do not use tabs. Keep the new block lined up with the other users. If the file is not valid, Authelia does not start.
:::

### Register a new device or reset a password

Authelia asks for two-factor on your domain. It does not send email. It writes its messages to a file instead. To see this done, watch [Authelia 2FA guide: registering a device with notifications.txt at 27:39](https://youtu.be/UIq8PLZHBtk?t=1659) (manual Docker Compose setup; Deployrr does these steps for you).

1. Open the Authelia login page, for example `https://authelia.YOUR_DOMAIN`. Replace `YOUR_DOMAIN` with your domain.
2. Log in with the user's password.
3. Choose the option to register a new device. For a forgotten password, choose the reset option on the login page.
4. Print the messages file:

   ```bash
   sudo cat appdata/authelia/notifications.txt
   ```

5. Copy the code or link from the newest message.
6. Use it in the browser, on the same device you started on.

### Too many failed logins

Authelia blocks a user for 12 hours after 3 failed tries in 10 minutes. Wait for the block to end. These numbers are in the `regulation` part of `appdata/authelia/configuration.yml`.

## Authentik

Authentik manages users in its own admin interface. Open `https://authentik.YOUR_DOMAIN` and log in as your admin. Replace `YOUR_DOMAIN` with your domain. Add users and change passwords there. Deployrr has no files to edit for this.

If you never created the admin account, open `https://authentik.YOUR_DOMAIN/if/flow/initial-setup/`.

## Google OAuth

Google OAuth does not store passwords. People log in with their Google account. You control who may log in with a list of allowed accounts. Each allowed account is one `whitelist=EMAIL` line in `secrets/oauth_secrets`. To see an allowed account added by hand, watch [Google OAuth with Traefik Forward Auth: allowed account in the secrets file at 11:24](https://youtu.be/SCKALXprTQE?t=684) (manual Docker Compose setup; the file is named `oauth-secrets` there).

:::caution
If the file has no `whitelist=` line, any Google account can log in. Keep at least one line. See [Google OAuth in the login method guide](/reverse-proxy/choose-login-method/#google-oauth).
:::

:::note
If you run **Security** > **Google OAuth** again, Deployrr writes `secrets/oauth_secrets` again. It adds a `whitelist=` line for each address you enter in that run and for each `secrets/oauth_whitelist_N` file (one per address from earlier runs). Lines you added by hand are lost. Add them again after the run.
:::

### Add an allowed account

1. Back up the file:

   ```bash
   sudo cp secrets/oauth_secrets secrets/oauth_secrets.bak
   ```

2. Open the file:

   ```bash
   sudo nano secrets/oauth_secrets
   ```

3. Add a new line for the account. Replace `name@gmail.com` with the person's Google address:

   ```text
   whitelist=name@gmail.com
   ```

4. Save with `Ctrl+O`, `Enter`, then close with `Ctrl+X`.
5. Recreate the `oauth` container. Go to **Tools** > **Stack Manager** > **Recreate**. At `Select an app to recreate:`, type the number of `oauth` and press Enter. See [Stack Manager](/using-deployrr/stack-manager/) and [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/).

To remove an account, delete its `whitelist=` line and recreate `oauth` the same way. If a `secrets/oauth_whitelist_N` file holds that address, delete that file too (`sudo rm secrets/oauth_whitelist_N`, with the right number). Otherwise the account comes back the next time you run **Security** > **Google OAuth**.

## Check it worked

1. Open a private browser window.
2. Open an app that uses the method you changed, for example `https://APP.YOUR_DOMAIN`. Replace `APP` with the app's subdomain and `YOUR_DOMAIN` with your domain.
3. Log in as the new user, or with the new password.
4. The app should open.
5. If the method has two-factor, confirm the code works too.

## If you are locked out

Put your backup file back, then recreate or restart the container. For example, for TinyAuth:

1. Restore the file:

   ```bash
   sudo cp appdata/tinyauth/users_file.bak appdata/tinyauth/users_file
   ```

2. Recreate `tinyauth` with **Tools** > **Stack Manager** > **Recreate**, or run `dcrec tinyauth` with the bash aliases.

For the other methods, use the matching backup and container:

| Method | Backup to restore | Container |
| --- | --- | --- |
| Basic HTTP Auth | `secrets/basic_auth_credentials.bak` | `traefik` (recreate) |
| Authelia | `appdata/authelia/users.yml.bak` | `authelia` (restart) |
| Google OAuth | `secrets/oauth_secrets.bak` | `oauth` (recreate) |

If the app still does not load, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Next steps

- Move more apps to your login method with **Manage Auth**. See [Choose a login method for your apps](/reverse-proxy/choose-login-method/).
- Back up your Docker folder before bigger changes. See [Back up and restore your Docker folder](/using-deployrr/backups/).

## Related

- [Choose a login method for your apps](/reverse-proxy/choose-login-method/): install a method and switch apps to it.
- [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/): when a restart is enough and when to recreate.
- [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/): edit secret files with the Secrets Editor.
- [Traefik can't get a Let's Encrypt certificate](/reverse-proxy/certificate-errors/): what to do if you run Traefik **Preparation** again.
- [Stack Manager](/using-deployrr/stack-manager/): recreate a container.
