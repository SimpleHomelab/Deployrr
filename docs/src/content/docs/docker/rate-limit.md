---
title: "Docker image pulls fail with: toomanyrequests or TLS handshake timeout"
sidebar:
  order: 8
  label: Image pulls fail (rate limit)
description: Fix Docker Hub pull errors and TLS handshake timeouts when installing or updating apps by signing in to Docker Hub and pulling fewer images at once.
type: troubleshooting
tags:
  - docker
  - updates
  - shell
applies_to: v6.0+
symptoms:
  - "toomanyrequests: You have reached your pull rate limit"
  - "Get \"https://registry-1.docker.io/v2/\": net/http: TLS handshake timeout"
  - "Docker Compose failed to pull image for"
  - "Failed to pull image for required dependency"
  - docker compose pull fails on some images and works on others when you run it again
  - Docker prints Error next to several apps during Update Stack or the dcpull alias
related:
  - using-deployrr/bash-aliases
  - docker/compose-malformed
  - networking/ufw-firewall-vps
  - docker/waiting-for-container
further_reading:
  - title: Docker Hub usage and limits
    url: https://docs.docker.com/docker-hub/usage/
last_reviewed: 2026-11-08
status: current
old_paths: ["/docker/docker-rate-limit"]
sources:
  - { type: discord, ref: "https://discord.com/channels/974306760171073556/1365888310500655124" }
---

Docker Hub limits how many images you can pull. If you pull many images in a short time without signing in, some pulls fail. This page shows how to sign in and how to avoid the errors.

## Symptoms

You install an app, or you pull several images at once with **Tools** > **Stack Manager** > **Update Stack** or the `dcpull` alias. Some images fail and others work. The failures move to different apps each time you try again.

These messages come from Docker. You can see a timeout:

```txt
✘ portainer Error  Get "https://registry-1.docker.io/v2/": net/http: TLS handshake timeout
```

You can see Docker's rate limit message:

```txt
toomanyrequests: You have reached your pull rate limit
```

During an app install, Deployrr stops with this message:

```txt
Docker Compose failed to pull image for APP
```

Here `APP` is the name of the app you were installing. For apps that install extra containers, the message is "Failed to pull image for required dependency" followed by the name.

During **Update Stack** or **Update App** (see [Update your apps](/using-deployrr/update-apps/)), Deployrr keeps going when a pull fails and still reports success at the end. Read the lines Docker prints during the pull step for `Error`.

## Cause

Docker Hub limits pulls. Pulls that are not signed in get a lower limit than pulls from a signed-in account. Pulling a whole stack can use up the limit quickly. Docker changes the numbers from time to time. See [Docker's usage and limits page](https://docs.docker.com/docker-hub/usage/) for the current ones.

:::note
A TLS handshake timeout does not always mean a rate limit. It can also be a slow or broken network, DNS, or VPN. If signing in does not help, check your internet connection and DNS from the host.
:::

## Fix

### Sign in to Docker Hub

1. Create a free account at [hub.docker.com](https://hub.docker.com) if you do not have one.
2. Optional but safer (Docker's advice): in Docker Hub, open your account settings and create an access token. You can paste the token at the password prompt instead of your password.
3. In Deployrr, complete the **Prerequisites** menu if you haven't. Docker Login works with any license.
4. Open the **Docker** menu and choose **Docker Login**. Before you sign in, the line reads "Login to Docker Account (higher rate limits)". Deployrr shows an info box about rate limits. Press **OK**. It then asks for your **Docker Hub Username**, and Docker asks for your password.

   To do it by hand instead, run this in your terminal:

   ```bash
   sudo docker login
   ```

   Always use `sudo`. Deployrr runs Docker with `sudo`, so the login must be saved for the root user. A login without `sudo` does not help.

5. When it works, Deployrr shows "Successfully logged into Docker Hub" and "Docker Hub login complete". If it fails, you see "Docker login failed". Check your username and password or token, and try again.

   Docker may also print a warning that your credentials are stored unencrypted in `/root/.docker/config.json`. Docker saves your login in root's home folder, and that file is not encrypted. This is why an access token is a better choice than your password.

If Deployrr says you are already logged in and you want another account, run `sudo docker logout` first, then choose **Docker Login** again.

### Wait for the limit to reset

If you still see `toomanyrequests` after you sign in, you have used up your limit. Wait and try again later. Docker's page lists how long the limit lasts.

### Pull fewer images at once

1. Update one app at a time. Use **Tools** > **Stack Manager** > **Update App** instead of **Update Stack**. Pick the app at the "Select an app to update:" prompt. Stack Manager actions need all Prerequisites done and a Basic, Plus or Pro license.
2. If **Update Stack** asks for a **Stack Update Mode**, that is because you have locally built apps. **Standard** pulls from Docker Hub only.
3. Use the `dcpull` alias when you do update everything. It pulls one image at a time and only pulls. Run `dcup` afterwards to start the new versions. The alias exists only after you install Deployrr's Bash aliases. See [Bash aliases](/using-deployrr/bash-aliases/).
4. Run the update again after a failure. Docker reuses image layers it already has.

## Check it worked

1. In the **Docker** menu, the **Docker Login** line shows **Logged In**.
2. Run `dcpull` or **Update Stack** again. In Docker's pull output, every app shows `Pulled` and none shows `Error`.
