---
title: Change a database password safely
description: Change the MariaDB or PostgreSQL password of an app in the right order, so the app keeps its link to its database and you don't lose data.
type: how-to
tags:
  - compose
  - docker
  - backups
applies_to: v6.0+
related:
  - using-deployrr/edit-env-and-secrets
  - using-deployrr/restart-recreate-reinstall
  - using-deployrr/backups
  - using-deployrr/docker-folder-layout
  - apps/app-reference
further_reading: []
videos: []
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

Some apps come with their own MariaDB or PostgreSQL container. A database image sets its password only the first time it starts. If you change the password in `.env` or in a secret file, the password stored inside the database stays the same. The app then can't log in. This page shows the safe order: change it inside the database first, then in your files, then recreate.

## Before you start

- The app uses its own database container. It is named `APP-mariadb` or `APP-postgresql`, for example `immich-postgresql`. The standalone database apps are covered below the tables. Run `sudo docker ps` to check.
- You know where the app keeps its database password. Use the tables below.
- You have a few minutes where the app can be down.

:::caution
A wrong order can lock the app out of its database. Back up first, as shown in step 1.
:::

## Find your app

`YOUR_DOCKER_FOLDER` is the path to your Docker folder. `HOSTNAME` is your server's hostname. See [Docker folder layout](/using-deployrr/docker-folder-layout/). The database user and name are in `YOUR_DOCKER_FOLDER/compose/HOSTNAME/APP-postgresql.yml` or `APP-mariadb.yml`, on the `POSTGRES_USER`, `POSTGRES_DB` or `MARIADB_USER` lines.

### PostgreSQL apps

| App | Container | User | Database | Password kept in |
|---|---|---|---|---|
| Immich | `immich-postgresql` | `immich_db_user` | `immich` | `.env`: `IMMICH_POSTGRESQL_PASSWORD` |
| Autobrr | `autobrr-postgresql` | `autobrr_db_user` | `autobrr` | `.env`: `AUTOBRR_POSTGRESQL_PASSWORD` |
| GameVault | `gamevault-postgresql` | `gamevault_db_user` | `gamevault` | `.env`: `GAMEVAULT_POSTGRESQL_PASSWORD` |
| Flowise | `flowise-postgresql` | `flowise_db_user` | `flowise` | `.env`: `FLOWISE_POSTGRESQL_PASSWORD` |
| PdfDing | `pdfding-postgresql` | `pdfding_db_user` | `pdfding` | `.env`: `PDFDING_POSTGRESQL_PASSWORD` |
| Dockhand | `dockhand-postgresql` | `dockhand_db_user` | `dockhand` | `.env`: `DOCKHAND_POSTGRESQL_PASSWORD` |
| Authentik | `authentik-postgresql` | `authentik_db_user` | `authentik` | secret: `authentik_postgresql_password`. Recreate both `authentik` and `authentik-worker` in step 5 |
| n8n | `n8n-postgresql` | `n8n_db_user` | `n8n` | secret `n8n_postgresql_password` and the app's compose file |

### MariaDB apps

| App | Container | User | Password kept in |
|---|---|---|---|
| Paperless-ngx | `paperless-ngx-mariadb` | `paperlessngx_db_user` | `.env`: `PAPERLESSNGX_MARIADB_PASSWORD`. Root: `PAPERLESSNGX_MARIADB_ROOT_PASSWORD` |
| Guacamole | `guacamole-mariadb` | `guacamole_db_user` | `.env`: `GUACAMOLE_MARIADB_PASSWORD`. Root: `GUACAMOLE_MARIADB_ROOT_PASSWORD` |
| Vikunja | `vikunja-mariadb` | `vikunja_db_user` | `.env`: `VIKUNJA_MARIADB_PASSWORD`. The same value is also the root password |
| BookStack | `bookstack-mariadb` | `bookstack_db_user` | `.env`: `BOOKSTACK_MARIADB_PASSWORD`. The same value is also the root password |
| Speedtest Tracker | `speedtest-tracker-mariadb` | `root` (the app logs in as root) | `.env`: `SPEEDTEST_MARIADB_ROOT_PASSWORD` |
| Nextcloud | `nextcloud-mariadb` | `nextcloud_db_user` | secrets: `nextcloud_mariadb_password`. Root: `nextcloud_mariadb_root_password`. Also `config.php` |

Dockhand also uses its password inside a connection URL, so use only letters and digits there.

:::caution
Don't change the password of **Langfuse** or **Supabase** unless you are happy to edit many files. Their install writes the password into several compose files (Langfuse: three, Supabase: ten). If you miss one, that part of the app can't log in.
:::

The standalone database apps work the same way, with these names in steps 1, 3 and 5:

- **MariaDB**: container `mariadb`, user `root`, secret `mariadb_root_password`.
- **PostgreSQL**: container `postgresql`, the user you typed at the "Default PostgreSQL User" prompt (default `postgres`), database `postgres`, secret `postgres_default_password`.

## Steps

1. Back up. Replace `YOUR_DOCKER_FOLDER` and `APP` and run each line:

   ```bash
   sudo cp YOUR_DOCKER_FOLDER/.env YOUR_DOCKER_FOLDER/.env.bak
   sudo cp -a YOUR_DOCKER_FOLDER/secrets YOUR_DOCKER_FOLDER/secrets.bak
   sudo cp -a YOUR_DOCKER_FOLDER/appdata/APP-postgresql YOUR_DOCKER_FOLDER/appdata/APP-postgresql.bak
   ```

   Use the `APP-mariadb` folder for a MariaDB app. For a copy that is fully consistent, stop the database container first with `sudo docker stop APP-postgresql`, copy, then start it again. Also copy the app's compose file from `compose/HOSTNAME`. For a bigger backup, see [Back up and restore your Docker folder](/using-deployrr/backups/).

2. Make a new password with letters and digits only:

   ```bash
   openssl rand -hex 24
   ```

   Copy the result. Characters such as `$`, `;` and `&` can break `.env` values and connection URLs. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).

3. Change the password inside the running database. Pick the block for your database type.

   **PostgreSQL.** Replace `APP`, `DB_USER`, `DB_NAME` and `NEW_PASSWORD`. Keep the single quotes around the password:

   ```bash
   sudo docker exec -it APP-postgresql psql -U DB_USER -d DB_NAME -c "ALTER USER DB_USER WITH PASSWORD 'NEW_PASSWORD';"
   ```

   It asks for no password. You should see `ALTER ROLE`.

   **MariaDB.** Log in as root. Type the current root password from `.env` or the root secret file when asked:

   ```bash
   sudo docker exec -it APP-mariadb mariadb -u root -p
   ```

   At the `MariaDB [(none)]>` prompt, run:

   ```sql
   ALTER USER 'DB_USER'@'%' IDENTIFIED BY 'NEW_PASSWORD';
   FLUSH PRIVILEGES;
   ```

   Type `exit` to leave.

   - To change the root password, do it last. Run `ALTER USER 'root'@'%' IDENTIFIED BY 'NEW_PASSWORD';` and `ALTER USER 'root'@'localhost' IDENTIFIED BY 'NEW_PASSWORD';`.
   - For Vikunja and BookStack, one value is both the user password and the root password. Change the user first, then root, both to the same new value.
   - For Speedtest Tracker and the standalone MariaDB app, the password is the root password. Change root.

4. Put the same new value where the app keeps it (see the tables). Do not skip this. The next step reads these files.

   - `.env`: use the **.env Editor**, or edit the file by hand. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/).
   - Secret file: use the **Secrets Editor**, or edit the file by hand. A secret file holds only the value.
   - n8n: also open `YOUR_DOCKER_FOLDER/compose/HOSTNAME/n8n.yml` and replace the value of `DB_POSTGRESDB_PASSWORD` with the new password.
   - Nextcloud: also open `YOUR_DOCKER_FOLDER/appdata/nextcloud/config/config.php` and replace the `dbpassword` value. Nextcloud keeps a copy of the database password there after its first setup. This is how Nextcloud works, not something you can skip.

5. Recreate the app, then its database container. A plain restart does not read new values, and **Manage Apps** has no Recreate. Go to **Tools** > **Stack Manager** > **Recreate**. Under "Select an app to recreate:", type the number of the app's container. Run it again for the database container, and for Authentik also for `authentik-worker`. See [Stack Manager](/using-deployrr/stack-manager/). Or, with the [Deployrr bash aliases](/using-deployrr/bash-aliases/), run these. Replace `APP` with the app name:

   ```bash
   dcrec APP
   dcrec APP-postgresql
   ```

   Use `APP-mariadb` for a MariaDB app. See [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/).

## Check it worked

1. Open the app and sign in. Your data should still be there.
2. Read the app's recent log lines. With the Deployrr bash aliases, `dlogs APP` shows the last 50 lines and keeps following; press Ctrl+C to stop. Without them:

   ```bash
   sudo docker logs APP --tail 50
   ```

3. Look for login errors, such as `password authentication failed for user` (PostgreSQL) or `Access denied for user` (MariaDB). If you see one, the value in your files and the value in the database don't match. Fix the file, or run step 3 again with the value that is in the file. Then recreate the app.

To undo, run step 3 again with the old password, put the old value back in the files, and recreate. If the data is damaged, stop the app and restore your copy of the database folder.

:::note
A later **Reinstall** of the app can write new secret values. Back up first. See [Reinstall an app and keep its data](/using-deployrr/reinstall-app/).
:::

## Related

- [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/): the editors and how to write values safely.
- [Restart, Recreate or Reinstall an app after a change](/using-deployrr/restart-recreate-reinstall/): which action applies a change.
- [Back up and restore your Docker folder](/using-deployrr/backups/): a full backup before a risky change.
- [Docker folder layout](/using-deployrr/docker-folder-layout/): where `.env`, `secrets` and `compose` live.
- [App reference](/apps/app-reference/): what each app needs.
