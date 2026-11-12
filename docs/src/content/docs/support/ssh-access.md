---
title: Get remote help with Remote Assist
description: Turn on Remote Assist in Deployrr so the support team can help on your system, then turn it off and restore your password when you are done.
type: how-to
tags:
  - support
applies_to: v6.0+
related:
  - support/discord
  - getting-started/quick-start
  - reverse-proxy/check-traefik-logs
  - support/forgot-pin
videos:
  - id: Nuo83uzTWco
    start: 532
    title: "Deployrr 6 overview: Remote Assistance with Tmate"
further_reading: []
last_reviewed: 2026-11-09
status: current
old_paths: ["/deployrr/get-support-via-ssh"]
sidebar:
  order: 4
---

Some problems are easier to fix with someone looking at your system. Remote Assist lets the support team connect to your host for a short session. You start it and stop it from the Deployrr **Help** menu. For a short look at the feature, watch [Deployrr 6 overview: Remote Assistance with Tmate at 8:52](https://youtu.be/Nuo83uzTWco?t=532).

:::caution[Remote Assist may not work right now]
Remote Assist has a known problem and may fail to start a session. If it does not work, ask for help on [Discord](/support/discord/) instead.
:::

:::caution
While Remote Assist is on, the support team can see your system and its contents. Turn it off as soon as the session ends. Never post the session details in a public channel.
:::

## Before you start

- A Pro license. Remote Assist only appears in the **Help** menu for Pro.
- An open help request on Discord. Ask there first. See [Get help on Discord](/support/discord/).
- A Discord direct message window open with the support team member who is helping you.

You do not need to forward a port on your router or change your firewall for Remote Assist. Your host does need outgoing internet access.

## Steps

### Turn on Remote Assist

1. Open Deployrr and select **Help** from the main menu.
2. Find **Remote Assist**. Its description reads "Toggle remote SSH support session -" followed by **NOT ACTIVE** in green.
3. Select **Remote Assist**.
4. Read the **Remote Assist - Warning** box. It says Deployrr installs tmate, a terminal sharing tool, if it is missing. Select **Yes** to continue. Select **No** to cancel.
5. In the **Session Password** box, keep the password Deployrr suggests, or type your own. Select **OK**.

   :::note
   Deployrr also sets this password as the temporary Linux password for your user. You are offered a chance to change it back when you turn Remote Assist off.
   :::

6. Wait while Deployrr works through its steps on screen.
7. When the **Remote Assist Enabled** box appears, read it and select **OK**.
8. Open the file `Remote_SSH_Support_Details.txt` in your Docker folder. The box shows the exact path.

### Share the details

1. Copy the SSH connection line and the session password from the file.
2. Send them in a Discord direct message to the support team member who is helping you.
3. Wait for them to connect. They need the session password to get in.

:::caution
Send the details only in a direct message. Do not post them in a channel, a forum or a screenshot.
:::

### Turn off Remote Assist when done

1. In Deployrr, select **Help**, then **Remote Assist**. The status now shows **ACTIVE** in red.
2. Read the **Remote Assist - Confirm Stop** box. Select **Yes**.
3. Wait for Deployrr to finish. It stops the session and deletes the details file.
4. When the **Change Password** box appears, select **Yes** to set your original password back. This is the recommended choice.
5. Type your new password, then type it again to confirm.

If you select **No**, Deployrr reminds you to run `passwd` yourself later. Do that soon, because the temporary password stays active until you change it.

You can also stop Remote Assist from **Tools** > **Diagnostics**. While a session is on, the Remote Assist row there reads "Status - ACTIVE - Security Warning!" and the overall health shows "Unhealthy - Issues detected". Diagnostics can only stop a session. To start one, use **Help** > **Remote Assist**. See [Deployrr shows "Unhealthy - Issues detected"](/support/diagnostics/) for the other Diagnostics checks.

If your host restarts while Remote Assist is on, open **Help** and check the status. If it still shows **ACTIVE**, select **Remote Assist** to stop it. That cleans up the details file and lets you restore your password.

## Check it worked

- After you turn it on, the **Help** menu shows **Remote Assist** with **ACTIVE** in red.
- After you turn it off, the **Help** menu shows **NOT ACTIVE** in green.
- The file `Remote_SSH_Support_Details.txt` is gone from your Docker folder.
- If you changed your password back, you see a **Password Changed** box.

## If something goes wrong

- **Remote Assist - Pro License Required.** The box says "Remote Assist is only available for Pro license holders." Ask on Discord. Support will tell you if remote access is needed and what to do instead.
- **Remote Assist Already Active.** A session is already running. Select **Remote Assist** again to stop it.
- **Failed to create tmate session.** Deployrr could not start the session. It adds "tmate may not be able to connect to its servers". Check that your host has internet access, then try again. Deployrr has already set the temporary password at this point and does not change it back. Run `passwd` to set your own password again. If it still fails, tell support on Discord.
- **Password Mismatch.** The two passwords you typed were different. The temporary password is still active. Run `passwd` to set your password.
- **Password Change Failed.** Deployrr could not change the password. Run `passwd` to set it yourself.

## If you do not have a Pro license

Remote Assist is not in your **Help** menu. Discord is the way to get help for every license. Post your question there, and support will tell you how to go on. See [Get help on Discord](/support/discord/).

:::note
Do not open SSH on your router to the internet so someone can log in with a password. It is not safe.
:::

## Related

- [Get help on Discord](/support/discord/): ask for help first and what to include.
- [Quick start](/getting-started/quick-start/): the first-run steps in order.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): find log detail yourself before you ask for a session.
- [I forgot my Deployrr PIN](/support/forgot-pin/): the other support tools in the **Help** menu.
