---
title: Remove Authentik
description: Switch your apps to another login method, then delete Authentik and its linked containers with the Stack Manager.
type: how-to
tags:
  - auth
  - traefik
  - compose
applies_to: v6.0+
apps: [authentik]
related:
  - reverse-proxy/setup-auth-bypass-using-file-provider
  - reverse-proxy/check-traefik-logs
  - using-deployrr/custom-yml
  - reverse-proxy/restrict-access-using-ip-allowlist
  - using-deployrr/second-app-instances
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/apps/authentik-removal"]
sidebar:
  order: 15
---

This page shows you how to remove Authentik from your server. First you move your apps to another login method. Then you delete Authentik in the Stack Manager.

## Before you start

- Authentik is installed with Deployrr.
- Decide which login method your apps will use instead: Authelia, Google OAuth, TinyAuth, Basic HTTP Auth or No Authentication. If you pick Authelia, Google OAuth or TinyAuth, set it up from the **Security** menu first and make sure it is running. [Choose a login method](/reverse-proxy/choose-login-method/) compares them.
- Decide if you want to keep Authentik's data. A **Full** delete removes its users, settings and database. A **Safe** delete keeps them, so you can reinstall later and reuse them. See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
- Deleting with the Stack Manager needs a Basic, Plus or Pro license.

:::caution
Apps that still use Authentik for login stop working once Authentik is gone. Switch them to another method first.
:::

In v6, Authentik runs as three containers, each with its own file in `compose/HOSTNAME/` in your Docker folder:

- `authentik` (the main app)
- `authentik-worker`
- `authentik-postgresql`

You delete all three in one go. You can't delete `authentik-worker` or `authentik-postgresql` on their own. If you try, Deployrr says `Cannot delete dependency directly` and tells you to delete `authentik` instead.

## Switch your apps to another login method

There are two ways. **Manage Auth** does it for you. It needs a Pro license, **Setup Mode** set to Hybrid, and Traefik running. Without those, edit the files yourself.

### With Manage Auth (Pro)

1. From the main menu, select **Security**.
2. Select **Manage Auth**.
3. Read the **Requirements to Manage Authentication** warning, then select **Yes** to continue. **Yes** is the button on the right. If you press Enter straight away, you select **No** and go back.
4. In the list, look for apps shown with **Authentik**. App names are in capitals, with their current login method next to them.
5. Select one of those apps.
6. At `Select new authentication method`, pick the new method. Don't pick **Authentik**. It is listed while it is still running.
7. Repeat steps 5 and 6 for each app that shows **Authentik**.

For apps set up with a Traefik rules file, the change applies right away. For apps set up with Docker labels, Deployrr recreates the container for you.

### By editing the files (any license)

Each app uses a login chain. Apps that use Authentik have `chain-authentik` in their settings. Change it to one of these:

| Chain | Login method | Available |
| --- | --- | --- |
| `chain-no-auth` | No Authentication | Always |
| `chain-basic-auth` | Basic HTTP Auth | Always |
| `chain-authelia` | Authelia | After you set up Authelia |
| `chain-tinyauth` | TinyAuth | After you set up TinyAuth |
| `chain-oauth` | Google OAuth | After you set up Google OAuth |

Only use a chain for a method you have set up. Otherwise the app stops loading.

**Apps with a rules file:**

1. Open the app's file in `appdata/traefik3/rules/HOSTNAME/` inside your Docker folder, for example:

   ```bash
   sudo nano appdata/traefik3/rules/HOSTNAME/app-sonarr.yml
   ```

2. Under `middlewares:`, change `- chain-authentik` to the chain you picked, for example `- chain-authelia`.
3. Save the file. Traefik picks up the change on its own.

**Apps with Docker labels:**

1. Open the app's compose file, for example `compose/HOSTNAME/sonarr.yml`.
2. Find the label that ends in `.middlewares=chain-authentik@file`.
3. Change `chain-authentik` to the chain you picked. Keep `@file` at the end.
4. Save the file, then recreate the app with **Tools** > **Stack Manager** > **Recreate**.

Do this for every app that uses `chain-authentik`. Don't change Authentik's own compose file.

## Delete Authentik

1. From the main menu, select **Tools**.
2. Select **Stack Manager**.
3. Select **Delete**.
4. Choose how to delete:
   - **Safe** keeps the app's data: the `appdata/authentik` and `appdata/authentik-postgresql` folders and the secret files.
   - **Full** removes everything, including the app's data.
5. When Deployrr asks about a live backup, press `Y` to make one. Press any other key to skip it. A cold backup from **Tools** > **Backups** is the safer choice (see [Back up and restore your Docker folder](/using-deployrr/backups/)).
6. At `Enter the number of the service to delete:`, type the number next to `authentik`.
7. In the **Multicontainer App Deletion** window, select **Delete authentik + all dependencies**.
8. Press `Y` to confirm.
9. Wait for `authentik + dependencies deleted successfully`.

If you pick **Delete authentik only**, the worker and the database stay behind. Choose the option with all dependencies to remove everything.

## What gets removed

Both **Safe** and **Full** remove:

- The three Authentik containers.
- The Authentik `include:` lines in your main compose file, and the Authentik files in `compose/HOSTNAME/`.
- Authentik's entries in the `.env` file, such as its version pin, database password and secret key entries.
- The secret entries for Authentik in your main compose file.
- Authentik's tile on the Deployrr Dashboard, if you use it.

**Full** also removes:

- Authentik's secret files (the database password and the secret key).
- The `appdata/authentik` and `appdata/authentik-postgresql` folders.
- Docker volumes that are no longer used.

The Authentik rule files in `appdata/traefik3/rules/HOSTNAME/` (`chain-authentik.yml` and `middlewares-authentik.yml`) stay in place. They do no harm.

## Check it worked

1. Run this command:

   ```bash
   sudo docker ps -a --filter name=authentik
   ```

   With the [Deployrr bash aliases](/using-deployrr/bash-aliases/): `dps`. It lists all containers, so check that no name starts with `authentik`.

   The list should be empty.

2. Open one of the apps you switched. It should ask for the new login, or load straight away if you chose **No Authentication**.
3. If an app shows an error, check that its chain matches a login method you have set up. [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) to see which middleware Traefik can't find.
