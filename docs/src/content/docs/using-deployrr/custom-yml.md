---
title: Add your own containers with custom.yml
description: Turn on custom.yml, add your own Docker Compose services next to your Deployrr apps, and apply the changes without Deployrr touching them.
type: how-to
tags:
  - compose
applies_to: v6.0+
related:
  - using-deployrr/bash-aliases
  - using-deployrr/second-app-instances
  - using-deployrr/connecting-apps
  - docker/compose-malformed
  - using-deployrr/change-hostname
further_reading: []
last_reviewed: 2026-11-08
status: current
old_paths: ["/docker/custom.yml-usage"]
sources: []
sidebar:
  order: 4
---

Use `custom.yml` to run containers that are not in the Deployrr apps library, or to run your own version of an app. You write the Compose code. Deployrr starts it together with your other apps.

To run a second copy of an app you already installed, see [Run a second copy of an app](/using-deployrr/second-app-instances/).

## Before you start

- Deployrr is installed and you created your Docker folder in **Prerequisites**. See the [Quick start](/getting-started/quick-start/).
- You know basic Docker Compose syntax.
- Optional: turn on the [Bash aliases](/using-deployrr/bash-aliases/). This page uses `cdd`, `dcup`, `dcrec` and `dclogs`.

## Where the files are

All paths are inside your Docker folder. Deployrr recommends `/home/YOUR_USER/docker`, but you choose the folder yourself, so yours may differ. The `cdd` alias takes you there.

| File | What it is |
| --- | --- |
| `docker-compose-HOSTNAME.yml` | The main Compose file for this machine. `HOSTNAME` is your hostname. |
| `compose/HOSTNAME/custom.yml` | Your file. It starts with only comments. |

If you rename your server, see [Change the hostname](/using-deployrr/change-hostname/).

## Steps

1. Go to your Docker folder.

   ```bash
   cdd
   ```

2. Open the main Compose file.

   ```bash
   nano docker-compose-$HOSTNAME.yml
   ```

   Bash fills in `$HOSTNAME` for you. If your editor is not nano, use the one you prefer.

3. Find the `include:` section. The `custom.yml` line starts with `#`, so it is off:

   ```yaml
   include:
     ########################### SERVICES
     # HOSTNAME defined in .env file

     # - compose/$HOSTNAME/custom.yml
     # SERVICE-PLACEHOLDER-DO-NOT-DELETE
   ```

4. Remove the `# ` at the start of the `custom.yml` line. Keep the two spaces in front of the dash.

   ```yaml
     - compose/$HOSTNAME/custom.yml
   ```

   Leave the `SERVICE-PLACEHOLDER-DO-NOT-DELETE` line as it is. Deployrr uses it when you install apps.

5. Save the file.

6. Open your custom file.

   ```bash
   nano compose/$HOSTNAME/custom.yml
   ```

7. Remove the `#` from `# services:`, then add your services below it. For example:

   ```yaml
   services:
     mycustomapp1:
       image: customimage:latest
       container_name: mycustomapp1
       restart: unless-stopped
       # Add your other options here.

     mycustomapp2:
       image: anotherimage:latest
       container_name: mycustomapp2
       restart: unless-stopped
   ```

   Replace the names and images with your own.

8. Save the file.

9. Start your new services. Replace `SERVICE_NAME` with the service name from your file, such as `mycustomapp1`.

   ```bash
   dcup SERVICE_NAME
   ```

   Without the aliases, run this instead. Replace `YOUR_USER` and `HOSTNAME` with your own values.

   ```bash
   sudo docker compose --profile all -f /home/YOUR_USER/docker/docker-compose-HOSTNAME.yml up -d SERVICE_NAME
   ```

You can also use **Tools** > **Stack Manager** > **Up** in Deployrr. That brings up the whole stack, not one service, and needs a Basic, Plus or Pro license. The `dcup` alias works with any license.

## Apply later changes

After you edit `custom.yml` again, run `dcup SERVICE_NAME` again. Compose recreates the service if its settings changed.

To force a fresh container even when nothing changed, run:

```bash
dcrec SERVICE_NAME
```

## Check it worked

1. Run `dclogs SERVICE_NAME` to read the logs of your new service. Press `Ctrl+C` to stop following them.
2. List your containers.

   ```bash
   dps
   ```

   Your service appears in the list with a status of `Up`.

If Compose prints an error about the file, check the indentation in `custom.yml`. Compose is strict about spaces.

To let your service talk to other apps, see [Connect your apps to each other](/using-deployrr/connecting-apps/).

## What Deployrr changes and what it leaves alone

- When you install an app, Deployrr adds a line for it to `docker-compose-HOSTNAME.yml`, just above the `SERVICE-PLACEHOLDER-DO-NOT-DELETE` line. It does not edit `compose/HOSTNAME/custom.yml`.
- Keep the `custom.yml` line and the placeholder line in the main file. Don't rename or move them.
- Don't give a service in `custom.yml` the same name as an app Deployrr installs. Docker Compose won't start two services with the same name.
- If the main file loses its `include:` line or the placeholder line, Deployrr reports that it is malformed.

:::caution
If you set up the Docker folder again in **Prerequisites**, Deployrr asks what to do with the existing folder:

- **Reuse** keeps `appdata`, `.env`, `secrets` and `custom.yml`. Everything else is deleted, including the main compose file. Deployrr writes a fresh main file, so the `custom.yml` line is turned off again and your apps are no longer listed. Turn the `custom.yml` line back on (steps 2 to 5) and reinstall your apps. Reuse needs a backups folder set in **Prerequisites**.
- **Recreate** deletes the folder contents and starts fresh. If you set a backups folder in **Prerequisites**, Deployrr copies the folder there first. Without one, nothing is kept.
- **Exit** makes no changes.

Back up your Docker folder before you choose Reuse or Recreate.
:::

## Use your own file names

You don't have to use `custom.yml`. You can add more Compose files next to it, such as `mycustomapp.yml`, and list them in the `include:` section of the main file in the same way.

Add new include lines above the `SERVICE-PLACEHOLDER-DO-NOT-DELETE` line:

```yaml
include:
  - compose/$HOSTNAME/custom.yml
  - compose/$HOSTNAME/mycustomapp.yml
  # SERVICE-PLACEHOLDER-DO-NOT-DELETE
```

:::caution
Deployrr lists these extra files as apps in **Tools** > **Stack Manager** (see [Stack Manager](/using-deployrr/stack-manager/) for what each option does). Don't use **Disable**, **Enable** or **Delete** on them there. **Delete** removes the line and deletes the file. `custom.yml` itself is not listed.
:::

## Related

- [Bash aliases](/using-deployrr/bash-aliases/): every `dc` shortcut for starting, recreating and reading logs.
- [Change the hostname](/using-deployrr/change-hostname/): what happens to these files when your hostname changes.
- [Quick start](/getting-started/quick-start/): set up the Docker folder and install your first app.
