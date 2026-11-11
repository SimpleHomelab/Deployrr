---
title: Deployrr shows "Unhealthy - Issues detected"
sidebar:
  label: System Health and Diagnostics
description: "Run Tools > Diagnostics, read each line of the health check, and fix the permission, YAML and Remote Assist problems that make Deployrr show Unhealthy."
type: troubleshooting
tags:
  - docker
  - host
  - compose
  - traefik
  - support
applies_to: v6.0+
apps:
  - traefik
symptoms:
  - "System Health: Unhealthy (Run Tools->Diagnostics)"
  - "Overall System Health: Unhealthy - Issues detected"
  - "Run System Health Checks (Unhealthy)"
  - "Permissions should be 600: Unhealthy (644)"
  - "Permissions should be 600: Unhealthy ()"
  - "Permissions should be 600: File not found"
  - "Status - ACTIVE - Security Warning!"
  - "One or more compose files has errors"
  - "Compose Validation Error"
  - "System Health: Error - Hostname Mismatch (Run Tools->Change Hostname)"
  - "System Health: Not Applicable (until Prerequisites are completed)"
  - "Requirements Not Met"
related:
  - docker/compose-malformed
  - support/ssh-access
  - support/discord
  - reverse-proxy/check-traefik-logs
  - docker/waiting-for-container
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
---

Deployrr checks a few things on your server every time it draws the main menu. If one of them is wrong, the main menu says Unhealthy. This page shows how to find out which one and how to fix it.

## Symptoms

The main menu has a **System Health** line. It shows one of these:

```txt
System Health: Healthy
System Health: Unhealthy (Run Tools->Diagnostics)
System Health: Error - Hostname Mismatch (Run Tools->Change Hostname)
System Health: Not Applicable (until Prerequisites are completed)
```

In **Tools**, the **Diagnostics** entry ("Run System Health Checks") shows `(Healthy)` or `(Unhealthy)` after it.

When you open **Diagnostics**, the box says:

```txt
Overall System Health: Unhealthy - Issues detected
```

Healthy is shown in green. Unhealthy is shown in red.

## Cause

Deployrr flags your system as Unhealthy when any of these is true:

- The `.env` file in your Docker folder does not have permissions `600`.
- The `secrets` folder in your Docker folder does not have permissions `600`.
- Traefik is running, the file `acme.json` exists, and it does not have permissions `600`.
- Remote Assist is on.
- One or more compose files have a YAML syntax error.

Permissions `600` mean only the owner can read and write the file. These files hold passwords and keys, so Deployrr wants them locked down. Remote Assist counts as a problem because it gives the support team access to your server.

The other main menu messages mean something different:

- **Error - Hostname Mismatch** means your server's name changed. See [Change the hostname](/using-deployrr/change-hostname/). The main menu shows this instead of the other results, but **Tools** > **Diagnostics** still runs all the checks.
- **Not Applicable** means you have not finished the Prerequisites yet. See [Quick start](/getting-started/quick-start/).

## Fix

### 1. Open Diagnostics

You need all Prerequisites done and a Basic, Plus or Pro license. Without them, Deployrr shows a box titled **Requirements Not Met** with the number of missing items, such as "Requirements Not Met (1)", and lists them. For unfinished Prerequisites it says "Prerequisites - All steps must be completed". For a missing license it says "License - Basic, Plus, or Pro required", followed by your current license and a hint to **Prerequisites** > **Verify**. See [Deployrr shows "Requirements Not Met"](/using-deployrr/requirements-not-met/) for what each line means.

1. In Deployrr, open **Tools**.
2. Select **Diagnostics**.
3. Read the five lines. Each line is one check. Deployrr runs the checks when you open the screen. To share results, generate a log from **Settings** > **Logs**.

The lines are:

| Line | Healthy looks like | Problem looks like |
| --- | --- | --- |
| `.env` | `Permissions should be 600: Healthy (600)` | `Permissions should be 600: Unhealthy (644)` |
| `secrets` | `Permissions should be 600: Healthy (600)` | `Permissions should be 600: Unhealthy (755)` |
| `acme.json` | `Permissions should be 600: Healthy (600)` | `Permissions should be 600: Unhealthy (644)` or `File not found` |
| `Remote Assist` | `Status - NOT ACTIVE` | `Status - ACTIVE - Security Warning!` |
| `YAML Yoda` | `All good - No syntax errors in compose files` | `One or more compose files has errors` |

The number in brackets is the permission the file has now. Your number may differ from the examples.

For `acme.json`, you may also see `Not Applicable (Traefik not running)`. That is not a problem. Deployrr only checks this file while Traefik runs.

4. Pick the line that is not healthy and follow its section below. Selecting a line runs its fix or check.

### 2. Fix `.env`, `secrets` or `acme.json` permissions

Deployrr fixes these for you.

1. In **Diagnostics**, select the line (`.env`, `secrets` or `acme.json`).
2. Wait for the screen to finish. You should see these lines:

   ```txt
   Fixing permissions for: /home/USERNAME/docker/.env
   Permissions set to 600
   ```

   If the permissions were already right, you see `Permissions already correct (600)`.

3. Read "Going back to the menu in 60 seconds. Or, press OK to go back now...". Wait, or press Enter.
4. Select **Back**, then open **Diagnostics** again. The line now shows `Healthy (600)`.

The menu does not update its lines right after a fix. Leaving and opening **Diagnostics** again shows the new state.

If you prefer to do it yourself, run the command for the file that is flagged. Replace `YOUR_DOCKER_FOLDER` with the path of your Docker folder. This is a value you fill in. The path is the one Deployrr shows on the fix screen. A common path is `/home/USERNAME/docker`.

```bash
sudo chmod 600 YOUR_DOCKER_FOLDER/.env
sudo chmod 600 YOUR_DOCKER_FOLDER/secrets
sudo chmod 600 YOUR_DOCKER_FOLDER/appdata/traefik3/acme/acme.json
```

Run only the line for the file Deployrr flagged.

#### The line says `File not found` or `Unhealthy ()`

For `acme.json`, `File not found` means Traefik is running but the file is missing. Deployrr shows this at the end of the fix screen:

```txt
acme.json file not found at expected path
```

Deployrr adds the path it looked in. It can't recreate the file. Don't create it by hand. [Read the Traefik logs](/reverse-proxy/check-traefik-logs/) to see why it is missing.

For `.env` or `secrets`, `Unhealthy ()` with nothing in the brackets means Deployrr could not find the file or folder. The fix screen says `File/folder not found:` and the path, and offers no repair. Check the path in your Docker folder. If it is really gone, ask for help on [Discord](/support/discord/).

A missing `acme.json`, `.env` or `secrets` does not make the overall result Unhealthy, so the header can say Healthy while a row shows a problem. A wrong permission on a file that exists does make it Unhealthy, as do an active Remote Assist session and YAML errors.

#### Selecting `acme.json` says Traefik is not running

If Traefik is not running, selecting `acme.json` shows a box titled **acme.json - Not Applicable**. It says "Traefik is not currently running." Start Traefik first, then try again. If Traefik does not start, see [Deployrr times out waiting for a container to start](/docker/waiting-for-container/).

### 3. Stop Remote Assist

If the `Remote Assist` line says `ACTIVE`, a remote support session is running on your server, even one Deployrr did not start. If a support member is still helping you, wait until they finish. If you did not start a session, we suggest you treat it as a security problem.

Stopping needs a Pro license.

1. In **Diagnostics**, select **Remote Assist**.
2. In the **Remote Assist - Confirm Stop** box, select **Yes**. Stopping also ends any other remote terminal-sharing session on the server.
3. Wait for Deployrr to finish stopping the session.
4. In the **Change Password** box, select **Yes** to set a new password. Follow the **Set New Password** and **Confirm Password** prompts. If you select **No**, you see a **Password Reminder** box instead.
5. You return to **Diagnostics**. The line now shows `NOT ACTIVE`.

With a Basic or Plus license, the line still shows, but selecting it opens **Remote Assist - Pro License Required**: "Remote Assist is only available for Pro license holders." Deployrr can't stop the session for you then. Ask for help on [Discord](/support/discord/).

Diagnostics can only stop Remote Assist. If the line says `NOT ACTIVE` and you select it, Deployrr shows **Remote Assist Not Active** and tells you to use **Help** > **Remote Assist** to turn it on. See [Get remote help with Remote Assist](/support/ssh-access/) for the full steps and what the password prompts mean.

### 4. Fix YAML errors

YAML Yoda checks the compose files in `compose/HOSTNAME/` and your main compose file `docker-compose-HOSTNAME.yml` for syntax errors and missing included files. It shows one error at a time.

1. In **Diagnostics**, select **YAML Yoda**.
2. Read the box.
   - A **Compose Validation Success** box starts with "All good!". There is nothing to fix.
   - For a file in `compose/HOSTNAME/`, a **Compose Validation Error** box names the file after `Error found in:` and shows Docker's message, such as `yaml: line 12: found character that cannot start any token`.
   - For the main compose file, the **Compose Validation Error** box shows only Docker's message, with no file name.
3. Open the named file and go to that line. Common causes are a tab instead of spaces, wrong indentation and a missing colon.
4. Save the file.
5. Select **YAML Yoda** again until you see "All good!". After each fix, run it again, because it may show another error.

For the full walk through, see [Compose file is malformed](/docker/compose-malformed/).

:::note
"All good!" only means no common syntax errors were found. Deployrr says there may be errors it does not check for.
:::

### 5. Check the main menu

1. Select **Back** until you reach the main menu.
2. Read the **System Health** line. It should say **Healthy**.

If it still says Unhealthy, open **Diagnostics** again and look for the line that is not healthy.

## Check it worked

- **Tools** > **Diagnostics** shows `Overall System Health: Healthy`.
- The **Tools** menu shows `Run System Health Checks (Healthy)`.
- The **System Health** line on the main menu shows Healthy.

## If it still fails

Generate a log and share it with the exact line that stays red.

1. Open **Settings**.
2. Choose **Logs** ("Generate Sanitized Deployrr Log") and press `Y` to continue.
3. Note the log path Deployrr shows at the end.
4. Share the log on Discord. See [Get help on Discord](/support/discord/) for what else to include.

## Related

- [Compose file is malformed](/docker/compose-malformed/): find and fix the YAML error that YAML Yoda reports.
- [Get remote help with Remote Assist](/support/ssh-access/): start and stop a support session.
- [Get help on Discord](/support/discord/): share a sanitized log and ask for help.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): look into a missing or odd `acme.json`.
- [Deployrr times out waiting for a container to start](/docker/waiting-for-container/): when Traefik or an app does not start.
