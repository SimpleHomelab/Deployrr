---
title: Block bad visitors with CrowdSec
description: Install CrowdSec, the Firewall Bouncer and the Traefik Bouncer from the Security menu, check they block, and unblock yourself if needed.
type: how-to
tags:
  - traefik
  - firewall
  - logs
apps:
  - crowdsec
  - traefik
applies_to: v6.0+
related:
  - reverse-proxy/traefik-setup
  - reverse-proxy/check-traefik-logs
  - using-deployrr/bash-aliases
  - reverse-proxy/choose-login-method
  - reverse-proxy/restrict-access-using-ip-allowlist
further_reading:
  - title: "UDMS part 22: understanding CrowdSec (manual setup)"
    url: https://www.simplehomelab.com/udms-22-crowdsec-docker-compose/#Understanding_CrowdSec
  - title: "UDMS part 25: the CrowdSec bouncer Traefik plugin (manual setup)"
    url: https://www.simplehomelab.com/udms-25-traefik-plugins/
videos:
  - id: cUZ6kkum1pc
    start: 1100
    title: "Traefik middlewares and chains: adding more middlewares, such as CrowdSec, to a chain"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
  - id: KMZIyoZ3jWM
    start: 3101
    title: "Traefik 3 guide: why CrowdSec helps against bad visitors"
    note: "Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens."
last_reviewed: 2026-11-10
status: current
old_paths: []
sources: []
sidebar:
  order: 12
---

CrowdSec reads your logs and spots bad visitors, such as password guessers and scanners. It decides which IP addresses to ban. Two add-ons enforce the bans: the **Firewall Bouncer** blocks the address on your server, and the **Traefik Bouncer** makes Traefik refuse it. This page shows how to install all three, check they work, and get yourself unblocked.

To see why CrowdSec is worth running, watch [Traefik 3 guide: why CrowdSec helps at 51:41](https://youtu.be/KMZIyoZ3jWM?t=3101) (manual setup). To understand how it works, read [UDMS part 22: Understanding CrowdSec](https://www.simplehomelab.com/udms-22-crowdsec-docker-compose/#Understanding_CrowdSec) (manual setup, background only).

## Before you start

- A Pro license. All three items need it. See [Licenses](/getting-started/licenses/).
- All **Prerequisites** steps are done.
- For **Firewall Bouncer**: CrowdSec is installed and running.
- For **Traefik Bouncer**: CrowdSec and Traefik are both running. See [Set up Traefik](/reverse-proxy/traefik-setup/).
- Install Traefik before CrowdSec if you can. CrowdSec reads the Traefik logs only if they exist when you install it. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

If something is missing, Deployrr shows a **Requirements Not Met** box that lists it. For example: "License - Pro required" or "CrowdSec - Must be running (Security menu)".

:::note
CrowdSec is not fully tested with [Nginx Proxy Manager](/reverse-proxy/nginx-proxy-manager/), and Deployrr says manual configuration may be required. The Traefik Bouncer needs Traefik running, so it is blocked there.
:::

## Steps

Open **Security** from the main menu. The CrowdSec items sit under their own heading. Once installed, each shows `RUNNING` or `STOPPED` after its name. The main menu also shows a status next to **Security**, such as `CrowdSec Active` or `1 Auth + 2 CrowdSec`.

### Install CrowdSec

1. Select **CrowdSec** ("Open-source Collaborative IPS").
2. Read the **CrowdSec Console** box. Connecting to the CrowdSec console (a free web account) is optional. You need it only to share bad IPs with the community and to see metrics online. The box also says that `journalctl` will be replaced with `rsyslog` for logging. It has two buttons:
   - **Yes, Proceed** continues the install.
   - **No, Go Back** returns to the menu, so you can create the account first.
3. If you want the console, create an account at `https://app.crowdsec.net` and add a Security Engine. The page shows an enroll command. Copy the key after `-e context`.
4. Select **Yes, Proceed**.
5. At "Enter the enroll context key", paste your key. Leave it empty to skip the console.
6. If CrowdSec is already installed, Deployrr asks: "CrowdSec appears to be already installed. Do you want to reinstall/reconfigure it? WARNING: This will reset your CrowdSec configuration." Say no unless you want to start over.
7. In the **Port Configuration** box, accept the suggested port. The default is 8080. Deployrr suggests the first free port from there.
8. Wait. The install pulls the image and can take a few minutes. It also installs `rsyslog`.
9. If you gave a console key, Deployrr says "Enrollment requires manual approval on CrowdSec Console". Open `https://app.crowdsec.net`, approve the enrollment, and press any key. It continues by itself after 120 seconds.
10. Wait for "All done with CrowdSec setup!".

During the install, Deployrr prints which logs CrowdSec will watch. It adds each of these only if the file exists on your server:

- `/var/log/auth.log`
- `/var/log/syslog`
- `/var/log/kern.log`
- `/var/log/ufw.log`
- `/var/log/mail.log`
- The Traefik logs, from `logs/HOSTNAME/traefik/` in your Docker folder. This happens when `traefik.log` or `access.log` exists there.

If the Traefik logs are missing, Deployrr says "No Traefik logs found at ..." and "Skipping Traefik log acquisition". Install Traefik, then run **CrowdSec** again. Running it again means answering **Yes** to the reinstall question in step 6. That resets your CrowdSec configuration, and the enrollment key prompt appears again.

CrowdSec also never bans these addresses:

- Your public IP at install time.
- `127.0.0.1`.
- The private IPv4 ranges `192.168.0.0/16`, `10.0.0.0/8` and `172.16.0.0/12`.
- The private IPv6 ranges `fe80::/10` and `fc00::/7`. The install message lists only the IPv4 ranges, but they are in the file.

If Deployrr can't read your public IP, it warns "Could not determine public WAN IP - using placeholder". The list then keeps a placeholder instead of your IP. Replace it in the file below.

The list is `appdata/crowdsec/config/parsers/s02-enrich/custom-whitelists.yaml` in your Docker folder. Single IPs go under `ip:` and ranges go under `cidr:`.

### Install the Firewall Bouncer

The Firewall Bouncer blocks banned addresses at your server's firewall. It runs as a service on your server, not as a container.

1. Select **Firewall Bouncer** ("Firewall Bouncer for CrowdSec").
2. If it is already running, Deployrr asks "Do you want to reinstall it?" and warns that this will regenerate the API key. Say yes only if you want that. Reinstalling deletes the bouncer's old key and creates a new one.
3. Wait through the eight steps. Deployrr adds the CrowdSec package source, creates a key for the bouncer, installs the package and starts the service. It shows "API key extracted successfully (stored securely)" and never prints the key.
4. Wait for "Firewall Bouncer service is active and running".
5. Read the **Current CrowdSec bouncers** list that follows. It should include `firewall-bouncer-HOSTNAME`, where `HOSTNAME` is your server's name.

If you see "Firewall Bouncer service failed to start", run this to read the service log:

```bash
sudo journalctl -u crowdsec-firewall-bouncer -f
```

What the Firewall Bouncer does to a banned visitor:

- It covers the `INPUT` and `DOCKER-USER` firewall chains. That includes ports that Docker publishes.
- It blocks banned IPv4 addresses. Packets are dropped without an answer. The page hangs or times out. This is general behavior of a DROP rule, not a Deployrr message.
- It does not block IPv6 addresses.

### Install the Traefik Bouncer

The Traefik Bouncer makes Traefik check every visitor against CrowdSec before it reaches an app.

1. Back up your Docker folder first. See [Backups](/using-deployrr/backups/).
2. Select **Traefik Bouncer** ("Traefik Bouncer for CrowdSec").
3. Read the **CrowdSec Traefik Bouncer Setup** box. It lists what Deployrr will change:
   - The main compose file.
   - The Traefik compose file. Deployrr adds the CrowdSec plugin there.
   - The CrowdSec compose file.
   - The Traefik rules folder. Deployrr adds the file `middlewares-crowdsec-bouncer.yml`.
4. Select **Yes** to continue.
5. If the bouncer is already installed, Deployrr asks whether to reinstall it and warns that this will regenerate the API key. Reinstalling deletes the old key and creates a new one.
6. At **Add to Chain Files?**, choose **Yes** unless you edit your chains by hand. Deployrr then adds `middlewares-crowdsec-bouncer` as the first middleware of each login chain file it finds (`chain-no-auth`, `chain-basic-auth`, and the Authelia, Authentik, Google OAuth and TinyAuth chains if you installed them). If you choose **No**, the bouncer is not applied until you add it. Deployrr says: "manually add middlewares-crowdsec-bouncer as the first middleware in your chain files."
7. Wait while Deployrr restarts CrowdSec and Traefik. It says "Traefik container restarted and running". If Traefik is slow, it says "Traefik may not have fully started". In that case, [read the Traefik logs](/reverse-proxy/check-traefik-logs/).
8. Read the **Current CrowdSec bouncers** list. It should include `traefik-bouncer-HOSTNAME`.

Expect your apps to be unreachable for a short moment while Traefik restarts. Deployrr does not show a message about this. A banned visitor now gets a `403 Forbidden` from Traefik.

By default, `middlewares-crowdsec-bouncer.yml` trusts `10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16`. The plugin does not check visitors from trusted addresses, so your own network is not checked.

To see how a middleware chain takes extra middlewares such as CrowdSec, watch [Traefik middlewares and chains at 18:20](https://youtu.be/cUZ6kkum1pc?t=1100) (manual setup). To understand how the Traefik plugin works, read [UDMS part 25: Traefik plugins](https://www.simplehomelab.com/udms-25-traefik-plugins/) (manual setup, background only).

For how the chain names relate to login methods, see [Choose a login method](/reverse-proxy/choose-login-method/). To allow only some addresses in the first place, see [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/).

## Check it worked

Each command comes in two forms. The short alias works if you installed the [Deployrr bash aliases](/using-deployrr/bash-aliases/). The long form works anywhere. It is equivalent, and Deployrr prints the same form in its own messages. The aliases run through Docker Compose, and the long form calls Docker directly.

1. Open **Security** again. **CrowdSec**, **Firewall Bouncer** and **Traefik Bouncer** should each show `RUNNING`. For the Traefik Bouncer, `RUNNING` does not prove that CrowdSec accepts the bouncer's key. Step 2 checks that.
2. List the registered bouncers:

   ```bash
   csbouncers
   ```

   ```bash
   sudo docker exec -t crowdsec cscli bouncers list
   ```

   You should see one `firewall-bouncer-HOSTNAME` and one `traefik-bouncer-HOSTNAME`, depending on what you installed.
3. Check the Firewall Bouncer service:

   ```bash
   csfbstatus
   ```

   ```bash
   sudo systemctl status crowdsec-firewall-bouncer.service
   ```

   A healthy systemd service says `active (running)`. That is general systemd output.
4. List current bans. An empty list is normal on a quiet server. That is general CrowdSec behavior.

   ```bash
   csdecisions
   ```

   ```bash
   sudo docker exec -t crowdsec cscli decisions list
   ```

5. Test a block. This uses general CrowdSec commands, not a Deployrr feature. Find the public IPv4 address of a device that is not on your home network, such as a phone on mobile data. Ban it for five minutes. Replace `TEST_IP` with that address:

   ```bash
   cscli decisions add --ip TEST_IP --duration 5m
   ```

   ```bash
   sudo docker exec -t crowdsec cscli decisions add --ip TEST_IP --duration 5m
   ```

   Wait a short while, then open one of your apps from that device. With the Traefik Bouncer you should see `403 Forbidden`. With the Firewall Bouncer the page should hang or time out. Then remove the ban:

   ```bash
   cscli decisions delete --ip TEST_IP
   ```

   ```bash
   sudo docker exec -t crowdsec cscli decisions delete --ip TEST_IP
   ```

   :::caution
   Do not ban your own address. The bouncer you installed may then lock you out of your apps. The Firewall Bouncer may also lock you out of SSH. That is general firewall behavior.
   :::

Deployrr says: "When an IP is blocked, you will see [CSFB_BLOCK] in the logs." If you installed the aliases, `tailkern` follows `/var/log/kern.log` and `tailcsfb` follows `/var/log/crowdsec-firewall-bouncer.log`. For the Traefik Bouncer, run `sudo docker logs traefik`. See [Read the Traefik logs](/reverse-proxy/check-traefik-logs/).

## Unblock yourself

If CrowdSec bans your own address, work from another network or from the server's console, then remove the ban.

1. Find your public IP. Use a "what is my IP" site from the blocked device. This is general advice.
2. Check that it is listed:

   ```bash
   csdecisions
   ```

3. Delete the ban. Replace `YOUR_IP` with your public IP:

   ```bash
   cscli decisions delete --ip YOUR_IP
   ```

   ```bash
   sudo docker exec -t crowdsec cscli decisions delete --ip YOUR_IP
   ```

4. To stop it happening again, add your address to `custom-whitelists.yaml` (see the path above). Put a single IP under `ip:` and a range under `cidr:`. Then restart CrowdSec. This step is general CrowdSec practice, not something Deployrr documents:

   ```bash
   sudo docker restart crowdsec
   ```

If your home IP changes, the address Deployrr whitelisted at install time no longer matches your connection. You can add the new one by hand as above. Or run **Security** > **CrowdSec** again. It rebuilds the file with your current public IP. But it shows the reinstall question from step 6 of the install: "CrowdSec appears to be already installed. Do you want to reinstall/reconfigure it? WARNING: This will reset your CrowdSec configuration." Answering yes resets your CrowdSec configuration.

## Alias cheat sheet

These aliases need the Deployrr bash aliases and a CrowdSec installed by Deployrr. For the full list, see [Bash aliases](/using-deployrr/bash-aliases/).

| Alias | What it does |
| --- | --- |
| `csdecisions` | Lists current bans. |
| `csalerts` | Lists alerts CrowdSec has raised. |
| `csinspect ALERT_ID` | Shows one alert in detail. Replace `ALERT_ID` with an ID from `csalerts`. |
| `csbouncers` | Lists registered bouncers. |
| `csmetrics` | Shows CrowdSec metrics. |
| `csmachines` | Lists machines linked to CrowdSec. |
| `cshubs` | Lists hub items. |
| `csparsers` | Lists installed parsers. |
| `cscollections` | Lists installed collections. |
| `cshubupdate` | Updates the hub index. |
| `cshubupgrade` | Upgrades all hub items. |
| `cscli` | Runs any `cscli` command inside the CrowdSec container. Use it for `cscli decisions delete --ip YOUR_IP`. |
| `csfbstatus` | Shows the Firewall Bouncer service status. |
| `csfbstart`, `csfbstop`, `csfbrestart` | Starts, stops or restarts the Firewall Bouncer. |
| `tailcsfb` | Follows the Firewall Bouncer log. |

The `cscli` alias runs this command. Replace `DOCKER_FOLDER` with the path to your Docker folder and `HOSTNAME` with your server's hostname. The other `cs*` aliases build on it:

```bash
sudo docker compose --profile all -f DOCKER_FOLDER/docker-compose-HOSTNAME.yml exec -t crowdsec cscli
```

:::caution
`csbrestart` is meant to restart both bouncers. Its first part fails with `command not found`, then `csfbrestart` still runs. So it restarts only the Firewall Bouncer. To restart Traefik, which loads the Traefik Bouncer, run `sudo docker restart traefik`. That workaround is general Docker, not a Deployrr alias.
:::

## Related

- [Set up Traefik](/reverse-proxy/traefik-setup/): the Traefik Bouncer needs it running.
- [Read the Traefik logs](/reverse-proxy/check-traefik-logs/): see blocked requests and bouncer errors.
- [Bash aliases](/using-deployrr/bash-aliases/): the full alias list.
- [Choose a login method](/reverse-proxy/choose-login-method/): the chains the Traefik Bouncer joins.
- [Allow only some IP addresses to reach an app](/reverse-proxy/restrict-access-using-ip-allowlist/): limit an app to chosen addresses.
