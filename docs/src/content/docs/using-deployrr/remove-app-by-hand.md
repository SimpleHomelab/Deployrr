---
title: Remove an app by hand
description: Remove an app and its helpers, secrets, rules file and dashboard entries by hand when Stack Manager Delete can't, without breaking your other apps.
type: how-to
tags:
  - docker
  - compose
applies_to: v6.0+
related:
  - using-deployrr/stack-manager
  - using-deployrr/docker-folder-layout
  - using-deployrr/edit-env-and-secrets
  - using-deployrr/reinstall-app
  - using-deployrr/backups
further_reading:
  - title: "UDMS part 13: Managing container lifecycle"
    url: https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Managing_Container_Lifecycle
videos: []
last_reviewed: 2026-11-14
status: current
old_paths: []
sources: []
sidebar:
  order: 6
---

Use this page when **Tools** > **Stack Manager** > **Delete** can't remove an app, for example when **Delete** fails or the app is not in its list. **Delete** does all of the steps below for you, so use it when you can. See [Stack Manager](/using-deployrr/stack-manager/#delete).

If the name you picked is a helper, such as an app's database, **Delete** says "Cannot delete dependency directly". That is not a reason to remove it by hand: delete the parent app and pick **Delete APP + all dependencies**.

## If the app is missing from the Delete list

The **Delete** list comes from the app lines in your main compose file. If the app is missing from the list but its file `compose/HOSTNAME/APP.yml` still exists, put its line back and use **Delete** instead. Open `docker-compose-HOSTNAME.yml` and add this line just above `# SERVICE-PLACEHOLDER-DO-NOT-DELETE`, with two spaces in front of the dash. Keep `$HOSTNAME` as it is and replace only `APP`:

```yaml
  - compose/$HOSTNAME/APP.yml
```

## Before you start

:::caution
These steps delete files for good. Make a backup of your Docker folder first, as in [Before you edit or delete anything](/using-deployrr/docker-folder-layout/#before-you-edit-or-delete-anything). At least copy the main compose file:

```bash
sudo cp YOUR_DOCKER_FOLDER/docker-compose-HOSTNAME.yml ~/docker-compose-HOSTNAME.yml.bak
```
:::

In these steps, `APP` is the name in the app's compose file name, for example `n8n` for `compose/HOSTNAME/n8n.yml`. Run the commands from your Docker folder (`cd YOUR_DOCKER_FOLDER`). For where each file sits, see [Docker folder layout](/using-deployrr/docker-folder-layout/).

## Steps

1. Find the app's helper containers, such as its database. Deployrr adds a helper's line to the main compose file right below the app's line when it installs the app:

   ```bash
   grep -n "compose/" docker-compose-HOSTNAME.yml
   ```

   Most helpers are named after the app, for example `n8n-postgresql` below `n8n`. A few are not, such as `gotenberg` and `tika` for Paperless-NGX or `guacd` for Guacamole. Do every step below for the app and for each helper. An app's `depends_on:` list can also name another app that you installed on its own, such as Ollama for Open-WebUI. Leave those alone.
2. Find the app's secret files:

   ```bash
   sudo ls secrets/
   ```

   Most start with the app's name, with `_` in place of `-`, for example `n8n_postgresql_password`. A few don't, such as `wgeasy_password` for WG-Easy. Some secrets are shared: `mariadb_root_password` is used by MariaDB and phpMyAdmin. Before you remove a secret, check which compose files name it. Only the app and its helpers should show up:

   ```bash
   sudo grep -l SECRET_NAME docker-compose-HOSTNAME.yml compose/HOSTNAME/*.yml
   ```

3. Stop and remove the container. The container name is almost always the same as `APP`. To check, run `sudo docker ps -a`.

   ```bash
   sudo docker stop APP
   sudo docker rm APP
   ```

   To learn more about these commands, read [UDMS part 13: Managing container lifecycle](https://www.simplehomelab.com/udms-13-docker-and-docker-compose-commands/#Managing_Container_Lifecycle) (manual setup, shows the commands only).

4. Edit the main compose file with `sudo nano docker-compose-HOSTNAME.yml`:
   - Delete the line `- compose/$HOSTNAME/APP.yml` (or `# - compose/$HOSTNAME/APP.yml` if the app is disabled).
   - Under `secrets:` near the top, delete the two lines for each secret from step 2 that only this app uses: the secret's name and the `file:` line below it. Not every secret has lines here.
   - If no secrets are left under `secrets:`, put `# ` in front of it so it reads `# secrets:`, as Deployrr does.
   - Leave every line that ends in `DO-NOT-DELETE` in place.
5. Delete the app's compose file:

   ```bash
   sudo rm compose/HOSTNAME/APP.yml
   ```

6. If the app was behind Traefik, delete its rules file. Traefik drops the app's route by itself.

   ```bash
   sudo rm appdata/traefik3/rules/HOSTNAME/app-APP.yml
   ```

7. If you use the [Deployrr Dashboard](/using-deployrr/dashboard/), open `appdata/deployrr-dashboard/config/services.yaml` with `sudo nano` and delete the app's entries, each from its `START` comment line to its `END` comment line. For `n8n`, they are marked `N8N-LOCAL-START` and `N8N-LOCAL-END`, and the same with `REMOTE` or `OTHER`. Dashes stay in the marker, for example `OPEN-WEBUI-LOCAL-START`.
8. Optional: delete the app's values in `.env`, such as `N8N_PORT` and `N8N_VERSION_PIN`. Left in place, they do no harm. The names use the app's name in capitals without dashes, so `open-webui` becomes `OPENWEBUI`. To list them:

   ```bash
   sudo grep -n "^OPENWEBUI" .env
   ```

   Do the same for each helper, for example `N8NPOSTGRESQL`. A few apps use other names, such as `TS_AUTH_KEY` for Tailscale. A short name can also match another app: `REDIS` matches `REDISCOMMANDER_PORT`. Check that each line belongs to this app before you delete it. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
9. Only if you want the data gone too: delete the app's data folder and the secret files from step 2 that no other app uses. Skip this step to keep the data for a later reinstall, as a **Safe** delete does.

   ```bash
   sudo rm -r appdata/APP
   sudo rm secrets/SECRET_NAME
   ```

   Your media and downloads folders are outside the Docker folder and are not touched.

## Check it worked

1. Check that the main compose file is still valid. No output means it is fine:

   ```bash
   sudo docker compose --profile all -f docker-compose-HOSTNAME.yml config --quiet
   ```

   If you see an error, compare the file with your `.bak` copy to find a line you removed or changed by mistake.
2. Open **Stack Manager** > **Services Status**. The app is no longer listed.
3. Run **Up**. Your other apps start as before.

Deployrr still counts an app you removed by hand as installed. **ReDash** adds it back to the dashboard, so delete its entries again after a ReDash. When you install the app again later, Deployrr shows a box titled with the app's name and **Already Installed**. Select **Yes** to go on. To install it again with the data you kept, see [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
