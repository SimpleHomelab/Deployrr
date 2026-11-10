---
title: "Docker environment setup fails with: docker-compose file is malformed"
sidebar:
  label: Compose file is malformed
description: Deployrr stops with "is malformed (missing placeholders)" on your main compose file. Put the missing lines back, or rebuild it after a backup.
type: troubleshooting
tags:
  - compose
  - docker
  - logs
applies_to: v6.0+
symptoms:
  - "/home/USERNAME/docker/docker-compose-HOSTNAME.yml is malformed (missing placeholders)"
  - "docker-compose-HOSTNAME.yml is malformed"
  - Setup Docker Environment stops after "Creating starter compose files..."
  - Installing Socket Proxy or Deployrr Dashboard ends with a malformed compose file error
  - "Compose Validation Error"
  - "One or more compose files has errors"
related:
  - using-deployrr/custom-yml
  - using-deployrr/second-app-instances
  - getting-started/quick-start
  - docker/rate-limit
last_reviewed: 2026-11-08
status: current
old_paths: ["/docker/docker-compose-malformed"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1343085128913518726/1343085128913518726" }
---

Deployrr keeps one main compose file in your Docker folder. It is named `docker-compose-HOSTNAME.yml`, where `HOSTNAME` is the name of your machine. This page helps when Deployrr says that file is malformed, or when it reports a compose file error.

## Symptoms

You run **Prerequisites** > **Environment** (Setup Docker Environment). Deployrr gets to the "Creating starter compose files..." step and stops with an error like this:

```txt
/home/USERNAME/docker/docker-compose-HOSTNAME.yml is malformed (missing placeholders)
```

Deployrr then points you to the documentation and says you can generate a troubleshooting log from the Settings menu.

You can see the same message after installing **Socket Proxy** or **Deployrr Dashboard** from the **Docker** menu. Both installs check the main compose file when they finish. Other app installs don't run this check.

A different problem shows up in **Tools** > **Diagnostics**:

- The **YAML Yoda** line says "One or more compose files has errors".
- **YAML Yoda** shows a "Compose Validation Error" box with the file and Docker's message.

That is a YAML syntax error. See [Find a YAML error](#find-a-yaml-error) below.

## Cause

The main compose file has four lines that Deployrr uses to add your apps. If any of them is missing or changed, Deployrr calls the file malformed. They are:

```yaml
  # NETWORKS-PLACEHOLDER-DO-NOT-DELETE
```

```yaml
  # SECRETS-PLACEHOLDER-DO-NOT-DELETE
```

```yaml
include:
```

```yaml
  # SERVICE-PLACEHOLDER-DO-NOT-DELETE
```

`include:` starts at the beginning of its line. The three comment lines start with two spaces. Each line must be on its own, with nothing else on it. Extra text or different indentation counts as missing.

When the error comes from **Prerequisites** > **Environment**, Deployrr has just copied in a fresh starter file and checked it, so your own edits are not the cause. The starter file it copied is damaged. Use [Option 2](#option-2-rebuild-the-file-with-the-environment-step), and ask on Discord if it fails again.

When the error comes after a **Socket Proxy** or **Deployrr Dashboard** install, the usual cause is a hand edit that removed or changed one of the lines. Use Option 1.

## Fix

### Option 1: Put the lines back by hand (keeps your apps)

1. Make a copy of the file first. Run this in your Docker folder:

   ```bash
   cp docker-compose-$HOSTNAME.yml docker-compose-$HOSTNAME.yml.bak
   ```

2. Open `docker-compose-HOSTNAME.yml` in a text editor.
3. Compare it with the layout of a fresh file. Missing lines go in these places:

   ```yaml
   networks:
     default:
       driver: bridge
     # (your other networks)
     # NETWORKS-PLACEHOLDER-DO-NOT-DELETE

   # secrets:
     # (your secrets)
     # SECRETS-PLACEHOLDER-DO-NOT-DELETE

   include:
     # (your app lines, such as - compose/$HOSTNAME/sonarr.yml)
     # SERVICE-PLACEHOLDER-DO-NOT-DELETE
   ```

   Each placeholder goes at the end of its section. Keep your own lines above it. Watch for spaces at the end of a placeholder line; they count as extra text.

4. Check the `include:` list. Apps you installed while a placeholder was missing were never added to it, and Deployrr didn't warn you. Every app file in `compose/HOSTNAME/` needs a line like `  - compose/$HOSTNAME/sonarr.yml` above the service placeholder. Type `$HOSTNAME` as written, not your machine's name.
5. Save the file.
6. Run the **Socket Proxy** or **Deployrr Dashboard** install again from the **Docker** menu. Deployrr shows an **Already Installed** box. Choose yes. It recreates the container and keeps its data. This time the check passes.

### Option 2: Rebuild the file with the Environment step

Use this if the file is badly damaged or you have no apps yet. A rebuild always replaces the main compose file and `custom.yml` with fresh starter files.

1. Back up first. With a Pro license, use **Tools** > **Backups** > **Backup** (see [Back up and restore your Docker folder](/using-deployrr/backups/)). It stops all running containers while it works. With any other license, copy your Docker folder somewhere safe by hand. Either way, keep your `custom.yml` and the app files in `compose/HOSTNAME/`.
2. Go to **Prerequisites** > **Environment**.
3. If Deployrr says the Docker Environment is already set up, read the warning. Choose **Yes** to continue.
4. If Deployrr asks what to do with your existing Docker folder, you see three options:
   - **Reuse**: keeps `appdata`, `.env` and `secrets`. Everything else in the folder is removed, including the app files in `compose/HOSTNAME/`. The menu says it keeps `custom.yml`, but your `custom.yml` is then replaced with the starter one. Reuse needs a Backups folder that is set under **Prerequisites** > **Backups Folder** and exists on disk. Without it, Deployrr says "Cannot preserve data" and stops.
   - **Recreate**: deletes everything in the Docker folder. Deployrr copies the folder to your Backups folder first, if one is set. With no Backups folder, nothing is kept.
   - **Exit**: makes no changes.
5. Wait for the "Creating starter compose files..." step. You should see "Base compose file created" with the file name, then "Compose file placeholders verified".
6. Copy your own services back into the new `custom.yml` from your backup. Install your apps again, so Deployrr adds them back to the stack.

### Find a YAML error

Use this when YAML Yoda reports a problem, or Docker names a line. YAML Yoda only checks syntax. It does not check the four placeholder lines.

1. Run **Tools** > **Diagnostics** > **YAML Yoda**. If it finds an error, it shows the file and the message. See [Deployrr shows "Unhealthy - Issues detected"](/using-deployrr/diagnostics/) for the other Diagnostics checks.

2. You can run the same check yourself in your Docker folder. Replace `FILE` with the path of the file you want to test:

   ```bash
   sudo docker compose -f FILE config
   ```

   If the file is broken, Docker prints an error with a line number, such as `yaml: line 12: found character that cannot start any token`. If the file is fine, Docker prints the whole file.

3. Open the file at that line. Look for these mistakes:

   - A tab instead of spaces. YAML only allows spaces.
   - A line indented by a different amount than its neighbors.
   - A missing colon, or a missing space after a colon.
   - A line you pasted in from another file and not lined up.

4. Fix the line, save the file, and run the check again until it passes.

Files you edit by hand, such as `custom.yml`, are the most likely source. See [Use custom.yml](/using-deployrr/custom-yml/) and [Second instances of apps](/using-deployrr/second-app-instances/) for how those files are meant to look.

:::note
Diagnostics and the Stack Manager actions need all Prerequisites done and a Basic, Plus or Pro license.
:::

### If it still fails

Generate a log and share it when you ask for help:

1. Open **Settings**.
2. Choose **Logs** (Generate Sanitized Deployrr Log) and press `Y` to continue.
3. Note the log path Deployrr shows at the end. The log is saved in the folder you started Deployrr from. Read the log yourself before you share it.
4. Share the log on Discord with the exact error message.

## Check it worked

1. The step that failed now finishes. For **Prerequisites** > **Environment**, you see "Compose file placeholders verified" and "Docker Environment setup complete".
2. Selecting **Tools** > **Diagnostics** > **YAML Yoda** shows "All good!". This only proves there are no syntax errors and no missing included files.

## Related

- [Use custom.yml](/using-deployrr/custom-yml/): the file you edit by hand, and the most common place for YAML mistakes.
- [Second instances of apps](/using-deployrr/second-app-instances/): another place where compose edits can go wrong.
- [Quick start](/getting-started/quick-start/): the setup steps, including the Docker Environment step.
- [Docker image pulls fail](/docker/rate-limit/): when an install stops because an image could not be pulled.
