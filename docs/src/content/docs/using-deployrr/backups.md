---
title: Back up and restore your Docker folder
description: Back up your Docker folder from Tools > Backups, see your backups, restore one, delete old ones, and find where they are stored.
type: how-to
tags:
  - backups
  - compose
applies_to: v6.0+
related:
  - using-deployrr/move-to-new-server
  - docker/compose-malformed
  - using-deployrr/custom-yml
  - using-deployrr/change-hostname
  - using-deployrr/reset-or-remove-deployrr
further_reading: []
videos:
  - id: Nuo83uzTWco
    start: 548
    title: "Deployrr 6 overview: backup locations and other new options"
  - id: rdqbAr0TFnQ
    start: 4680
    title: "Deployrr 5 walkthrough: Backups menu and making a backup"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
  - id: rdqbAr0TFnQ
    start: 4808
    title: "Deployrr 5 walkthrough: Restore Backups"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-09
status: current
old_paths: []
sources: []
---

Use **Tools** > **Backups** to save a copy of your Docker folder, bring an old copy back, and clean up backups you no longer need. Make a backup before you change something big, such as setting up the Docker folder again.

## Before you start

- You have a Pro license. The Backups screen opens for every license, but each option on it needs Pro. Without it you see a "Requirements Not Met" box.
- You finished **Prerequisites**. Backup, View and Delete need it. See the [Quick start](/getting-started/quick-start/).
- For Restore, you accepted the Disclaimers. Restore does not need the rest of Prerequisites.

## What a backup contains

A backup holds your whole Docker folder: the compose files, the `.env` file and the app data.

It does not hold anything outside the Docker folder. For example, media on a mounted share is not in the backup.

Each backup is one file named after the date and time it was made, like `20261109_143000.tar.gz`.

## Where backups are stored

Set the backups folder in **Prerequisites** > **Backups Folder** (**Set Backups Folder**). Deployrr recommends `/home/USERNAME/docker_backups`, where `USERNAME` is your Linux user.

If you open **Tools** > **Backups** and the folder does not exist, Deployrr creates it. It shows "Backup folder created. Here is where all your backups will be stored:" and the path.

:::caution
Keep the backups folder outside your Docker folder.

A backup folder inside the Docker folder gets packed into every new backup. A restore also deletes the Docker folder, and that would delete the backups stored in it.
:::

If you change the backups folder path, move your existing backups to the new place yourself. Deployrr does not move them.

For a short look at the backup location options in v6, watch [Deployrr 6 overview: backup locations and other new options at 9:08](https://youtu.be/Nuo83uzTWco?t=548).

## The Backups screen

The top of the screen shows **Backup Folder**, **Number of Backups** and **Size of Backups** (in MB). These numbers cover only the default backups folder. The size is for everything in that folder, not only backups.

Under **BACKUPS** you get these options:

| Option | What it does |
| --- | --- |
| **Backup** | Backs up the Docker folder. |
| **View** | Lists your backups. |
| **Restore** | Restores a backup. |
| **Delete** | Deletes backups. |

Under **MIGRATION** you get **MP Create** and **MP Restore**. They create and restore a migration package, which is for moving to a new server. See [Move Deployrr to a new server](/using-deployrr/move-to-new-server/).

## Back up the Docker folder

To see a backup made on screen, watch [Deployrr 5 walkthrough: Backups menu and making a backup at 1:18:00](https://youtu.be/rdqbAr0TFnQ?t=4680) (shows Deployrr v5; menus and steps differ in v6).

1. In Deployrr, go to **Tools** > **Backups**.
2. Choose **Backup**.
3. In the **Backup Location** box, choose where to save the backup. Pick **Use default folder** or **Select a custom folder**.
4. Read the **WARNING** box. It says all running containers will be stopped.
5. Move to **Yes** and confirm.

   The **No** button is on the left and **Yes** is on the right. **No** is selected by default.

6. Wait. Deployrr stops your apps and creates the backup. It says "This may take several minutes depending on data size...".
7. Look for "Backup completed:" followed by the path of your new file.
8. Answer "Do you want to restart the Docker stack?". Press `Y` to start your apps again.

:::note
Any key other than `Y` leaves your apps stopped.
:::

If something goes wrong you see "Backup could not be found:" and the path.

## See your backups

1. Go to **Tools** > **Backups**.
2. Choose **View**.

You get a list of the files in the default backups folder, newest first. Any other files you put in that folder show up too.

Backups you saved to a custom folder are not in this list.

## Restore a backup

:::caution
A restore deletes your current Docker folder and replaces it with the contents of the backup. The backup goes back to the same path the Docker folder had when the backup was made.
:::

1. Go to **Tools** > **Backups**.
2. Choose **Restore**.
3. In the **Restore Location** box ("Where do you want to restore from?"), pick the default folder or a custom folder.
4. Read the **WARNING** box. It says all running containers will be stopped and shows the folder you restore from.
5. Move to **Yes** and confirm. **No** is on the left and selected by default.
6. In the file browser, use `TAB` to move around and `SPACEBAR` to select a `.tar.gz` file.
7. Choose **Confirm**. If you picked something that is not a `.tar.gz` file, the browser opens again.

   If you select nothing, you see "No backup file selected or operation canceled."

8. Answer "Do you want to create a current backup before restoring the selected backup (y/n)?".

   Press `n` to skip it. Any other key makes a backup of your current state first. That backup goes in the default backups folder.

9. Wait for "Restore completed."
10. Answer "Do you want to restart the Docker stack?". Press `Y` to start your apps.

## Delete old backups

1. Go to **Tools** > **Backups**.
2. Choose **Delete**.
3. Choose the location of the backup. This box uses the same wording as Restore ("Where do you want to restore from?").
4. In the **Delete a Backup** file browser, select the file with `SPACEBAR`.
5. Choose **Confirm**.
6. At "Are you sure you want to delete the backup file:" move to **Yes** and confirm. **No** is on the left and selected by default.

You see the file name followed by "deleted successfully."

## Check it worked

- After a backup to the default folder, choose **View**. The new file is at the top of the list.
- After a restore, answer `Y` to restart the stack. Your apps come back with their old settings.
- After a delete, the file is no longer in the **View** list.

## Keep a copy elsewhere

A backup on the same disk does not help if that disk fails. Copy the backups you care about to another disk or another machine.

## Related

- [Move Deployrr to a new server](/using-deployrr/move-to-new-server/): use a migration package to move everything to another machine.
- [Docker environment setup fails: docker-compose file is malformed](/docker/compose-malformed/): rebuild your setup, and back up first.
- [Add your own containers with custom.yml](/using-deployrr/custom-yml/): your `custom.yml` is part of the Docker folder, so it is in every backup.
- [Change the hostname](/using-deployrr/change-hostname/): another change worth backing up before you start.
- [Refresh, Reset or Remove Deployrr](/using-deployrr/reset-or-remove-deployrr/): back up first, because Reset currently stops your apps and deletes their images.
