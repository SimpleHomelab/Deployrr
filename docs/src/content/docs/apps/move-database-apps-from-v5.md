---
title: Move Nextcloud, Immich or Paperless-ngx from v5
description: Move Nextcloud, Immich or Paperless-ngx from Deployrr v5 to v6 by hand and keep your users, photos and documents instead of starting fresh.
type: how-to
tags:
  - migration
  - backups
  - docker
applies_to: v6.0+
related:
  - getting-started/move-from-v5
  - apps/change-database-password
  - storage/folders
  - using-deployrr/backups
  - using-deployrr/bash-aliases
further_reading: []
videos: []
last_reviewed: 2026-11-12
status: current
old_paths: []
sources: []
---

The [v5 to v6 guide](/getting-started/move-from-v5/) suggests a fresh setup for database apps. This page is for you if you know some Docker and want to keep your data in Nextcloud, Immich or Paperless-ngx. It replaces Step 8 of that guide for these three apps.

## Before you start

- You follow the [v5 to v6 guide](/getting-started/move-from-v5/): you did its backup and rename steps (Steps 2 and 3, so your v5 folder is `docker-v5`), and v6 and its core apps run (Steps 5 and 6).
- You have a few hours where these apps can be down.

:::caution
Keep `docker-v5` and the `.sql` files until everything works in v6. Do not delete them early.
:::

In the commands, replace `USERNAME` with your Linux user name. The commands assume your Docker folder is `/home/USERNAME/docker`. Change the path if yours is somewhere else.

## How the move works

- **Immich:** you copy its v5 database folder into v6 and reuse it.
- **Nextcloud and Paperless-ngx:** v5 kept their data in one shared MariaDB. v6 gives each its own. You export the database from v5 and import it into the new one.

The export needs the v5 MariaDB running. So do Part 1 **before** [Step 1 of the move guide](/getting-started/move-from-v5/#step-1-stop-the-whole-v5-stack), while v5 is still up. If you use only Immich, skip Part 1.

## Part 1: Export in v5 (Nextcloud and Paperless-ngx)

1. For Nextcloud, turn on maintenance mode:

   ```bash
   sudo docker exec -u www-data nextcloud php occ maintenance:mode --on
   ```

2. Stop the apps. Leave `mariadb` running:

   ```bash
   sudo docker stop nextcloud paperless-ngx
   ```

3. Export the Nextcloud database:

   ```bash
   sudo docker exec mariadb sh -c 'exec mariadb-dump -u root -p"$(cat /run/secrets/mariadb_root_password)" --single-transaction nextcloud' > /home/USERNAME/nextcloud-v5.sql
   ```

4. Export the Paperless-ngx database:

   ```bash
   sudo docker exec mariadb sh -c 'exec mariadb-dump -u root -p"$(cat /run/secrets/mariadb_root_password)" --single-transaction paperless' > /home/USERNAME/paperless-v5.sql
   ```

5. Check that the files have a size and are complete:

   ```bash
   ls -lh /home/USERNAME/*-v5.sql
   tail -n 1 /home/USERNAME/nextcloud-v5.sql
   ```

   The last line should say `-- Dump completed`. Check the Paperless-ngx file the same way.

6. Go on with the [v5 to v6 guide](/getting-started/move-from-v5/) from Step 1. Come back here after its Step 6.

### Already stopped v5?

You can still export. Copy the v5 MariaDB data and start a throwaway MariaDB on the copy:

```bash
sudo cp -a /home/USERNAME/docker-v5/appdata/mariadb/data /home/USERNAME/v5-mariadb-copy
sudo docker run -d --name v5-mariadb -v /home/USERNAME/v5-mariadb-copy:/var/lib/mysql mariadb:latest
```

Wait about 30 seconds. Then export each database. This is the Nextcloud one. For Paperless-ngx, use `paperless` and `paperless-v5.sql`:

```bash
sudo docker exec -e MYSQL_PWD="$(sudo cat /home/USERNAME/docker-v5/secrets/mariadb_root_password)" v5-mariadb mariadb-dump -u root --single-transaction nextcloud > /home/USERNAME/nextcloud-v5.sql
```

Check the files as in step 5 above. Then remove the throwaway copy:

```bash
sudo docker rm -f v5-mariadb
sudo rm -rf /home/USERNAME/v5-mariadb-copy
```

:::caution
Check the path before you press Enter. `rm -rf` deletes without asking.
:::

## Part 2: Import in v6

### Install the app first

Do this for each app you move.

1. Open **System** > **Folders** and set **Immich Folder** or **Nextcloud Folder** to a new, empty folder. This keeps the fresh install from writing into your old uploads. See [Folders](/storage/folders/). Skip this for Paperless-ngx.
2. Install the app from **Apps** > **Browse Apps**.
3. Wait until the app runs.

Then follow the section for your app. Stop only the app, not its database, unless the steps say so. Use the [bash aliases](/using-deployrr/bash-aliases/) `dcrec` and `dlogs`, or **Tools** > **Stack Manager** > **Recreate** (needs a Basic, Plus or Pro license).

### Immich

1. Stop Immich and its database:

   ```bash
   sudo docker stop immich immich-postgresql
   ```

2. Set the new database folder aside, then copy the v5 one in:

   ```bash
   sudo mv /home/USERNAME/docker/appdata/immich-postgresql /home/USERNAME/docker/appdata/immich-postgresql.new
   sudo cp -a /home/USERNAME/docker-v5/appdata/immich-db /home/USERNAME/docker/appdata/immich-postgresql
   ```

3. Look up your v5 database password:

   ```bash
   grep IMMICHDB_POSTGRESQL_PASSWORD /home/USERNAME/docker-v5/.env
   ```

4. Put that value into `IMMICH_POSTGRESQL_PASSWORD` in the v6 `.env`. Use **Tools** > **.env Editor** or edit the file by hand. See [Edit .env values and secrets](/using-deployrr/edit-env-and-secrets/). The old database keeps the password it was created with, so v6 must use the same one.
5. Open **System** > **Folders** and set **Immich Folder** to your v5 upload folder. It is the `IMMICH_FOLDER` value in `docker-v5/.env`.
6. Recreate the database, then Immich, and watch the logs:

   ```bash
   dcrec immich-postgresql
   dcrec immich
   dlogs immich
   ```

   The first start can take a while. Immich moves your old search index to its new format and upgrades from v5's Immich version. Wait until the logs settle.

### Nextcloud

1. Stop Nextcloud:

   ```bash
   sudo docker stop nextcloud
   ```

2. Empty the new database:

   ```bash
   sudo docker exec -i nextcloud-mariadb sh -c 'exec mariadb -u root -p"$(cat /run/secrets/nextcloud_mariadb_root_password)"' <<'EOF'
   DROP DATABASE nextcloud;
   CREATE DATABASE nextcloud;
   EOF
   ```

   :::caution
   This drops the new, empty v6 Nextcloud database. Check that the container is `nextcloud-mariadb` before you run it.
   :::

3. Import your v5 export:

   ```bash
   sudo docker exec -i nextcloud-mariadb sh -c 'exec mariadb -u root -p"$(cat /run/secrets/nextcloud_mariadb_root_password)" nextcloud' < /home/USERNAME/nextcloud-v5.sql
   ```

4. Replace the app files with the v5 ones. Check the paths before you press Enter. `rm -rf` deletes without asking:

   ```bash
   sudo rm -rf /home/USERNAME/docker/appdata/nextcloud
   sudo cp -a /home/USERNAME/docker-v5/appdata/nextcloud /home/USERNAME/docker/appdata/nextcloud
   ```

5. Back up `config.php`, show the v6 database password, and open `config.php` in an editor:

   ```bash
   sudo cp /home/USERNAME/docker/appdata/nextcloud/config/config.php /home/USERNAME/docker/appdata/nextcloud/config/config.php.bak
   sudo cat /home/USERNAME/docker/secrets/nextcloud_mariadb_password
   sudo nano /home/USERNAME/docker/appdata/nextcloud/config/config.php
   ```

6. Set these three values. For `dbpassword`, use the password the second command showed:

   ```php
   'dbhost' => 'nextcloud-mariadb',
   'dbuser' => 'nextcloud_db_user',
   'dbpassword' => 'V6_PASSWORD',
   ```

7. Open **System** > **Folders** and set **Nextcloud Folder** to your v5 data folder. It is the `NEXTCLOUD_FOLDER` value in `docker-v5/.env`.
8. Recreate Nextcloud and watch the logs. If the v6 image is newer, Nextcloud upgrades itself on start. Wait for it to finish.

   ```bash
   dcrec nextcloud
   dlogs nextcloud
   ```

9. Turn maintenance mode off:

    ```bash
    sudo docker exec -u www-data nextcloud php occ maintenance:mode --off
    ```

### Paperless-ngx

1. Stop Paperless-ngx:

   ```bash
   sudo docker stop paperless-ngx
   ```

2. Empty the new database. The single quotes make the container use its own root password:

   ```bash
   sudo docker exec -i paperless-ngx-mariadb sh -c 'exec mariadb -u root -p"$MARIADB_ROOT_PASSWORD"' <<'EOF'
   DROP DATABASE paperless;
   CREATE DATABASE paperless;
   EOF
   ```

   :::caution
   This drops the new, empty v6 Paperless-ngx database. Check that the container is `paperless-ngx-mariadb` before you run it.
   :::

3. Import your v5 export:

   ```bash
   sudo docker exec -i paperless-ngx-mariadb sh -c 'exec mariadb -u root -p"$MARIADB_ROOT_PASSWORD" paperless' < /home/USERNAME/paperless-v5.sql
   ```

4. Replace the app files. The folder layout is the same in v5 and v6. Check the paths before you press Enter:

   ```bash
   sudo rm -rf /home/USERNAME/docker/appdata/paperless-ngx
   sudo cp -a /home/USERNAME/docker-v5/appdata/paperless-ngx /home/USERNAME/docker/appdata/paperless-ngx
   ```

5. Recreate the app and watch the logs:

   ```bash
   dcrec paperless-ngx
   dlogs paperless-ngx
   ```

   v6 gives Paperless-ngx a new secret key, so you have to sign in again in every browser.

## Check it worked

1. Open the app and sign in with your v5 account. Nextcloud and Paperless-ngx take their users from the imported database. Paperless-ngx may also add the admin from the v6 install again if that name is not in the v5 data.
2. Check that your files, photos or documents are there.
3. Read the logs. They should have no `Access denied for user` or `password authentication failed` lines.
4. When you are sure, delete the leftovers: the `.sql` files, `immich-postgresql.new` and the empty folders you made for the install. Keep `docker-v5` until every app in the move guide works.

## Troubleshooting

### Access denied for user, or password authentication failed

The password in `config.php` or `.env` does not match the database. Recheck the value you copied. See [Change a database password safely](/apps/change-database-password/).

### The import prints errors

The export file is empty or cut off. Make it again and check that it ends with `-- Dump completed`.

## Other database apps

This page does not cover the other database apps listed in the [move guide](/getting-started/move-from-v5/#database-apps). Set them up fresh, or ask on [Discord](/support/discord/).
