---
title: Send email from your server with SMTP and Mail Relay
description: Save your SMTP provider details in Deployrr, set up Mail Relay, and send a test email so cron, smartd and fail2ban can mail you.
type: how-to
tags:
  - host
  - shell
applies_to: v6.0+
related:
  - getting-started/prerequisites
  - using-deployrr/edit-env-and-secrets
  - reverse-proxy/choose-login-method
  - getting-started/licenses
  - getting-started/requirements-not-met
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 2833
    title: "Deployrr 5 walkthrough: Authelia notifications saved to a text file"
    note: Shows Deployrr v5. Menus and steps differ in v6.
  - id: UIq8PLZHBtk
    start: 1671
    title: "Authelia 2FA guide: one-time code in notifications.txt"
    note: Manual Docker Compose setup. Deployrr does these steps for you; use it to understand what happens.
last_reviewed: 2026-11-14
status: current
old_paths: []
sources: []
sidebar:
  order: 6
---

Use this page to let your server send email. You save your SMTP provider details in Deployrr, then set up Mail Relay. After that, tools on the server such as cron, smartd and fail2ban can email you.

## What the details are used for

In v6, only Mail Relay uses the SMTP details you save. Mail Relay installs a small mail sender called ssmtp on the server. It sends system email through your SMTP provider.

The details are not passed on to your apps. Apps that send email need their own SMTP settings, which you enter in each app.

Authelia does not use them either. Authelia saves its emails to a file instead. See [Choose a login method](/reverse-proxy/choose-login-method/).

To see where Authelia puts those emails, watch [Deployrr 5 walkthrough: Authelia notifications at 47:13](https://youtu.be/rdqbAr0TFnQ?t=2833) (shows Deployrr v5; menus differ in v6). For the same file in a manual setup, watch [Authelia 2FA guide: one-time code in notifications.txt at 27:51](https://youtu.be/UIq8PLZHBtk?t=1671) (manual Docker Compose setup).

## Before you start

- Deployrr [Prerequisites](/getting-started/prerequisites/) are done.
- **Domain 1** is set in Prerequisites. Mail Relay needs it. In Local [setup mode](/getting-started/setup-mode/), Prerequisites can be done without a domain, so check this one.
- You have a Basic, Plus or Pro [license](/getting-started/licenses/). Without these, you see the Requirements Not Met box. See [Requirements not met](/getting-started/requirements-not-met/).
- Your server runs Debian, Ubuntu or Arch. Mail Relay installs its packages with `apt` or, on Arch, from the AUR.
- You have an account with an SMTP provider, such as Gmail or Brevo. The Deployrr info box mentions that Brevo's free plan allows up to 300 emails per day.
- You have your provider's SMTP host, port, username and password or key. Check your provider's SMTP settings page for them.

Use your provider's STARTTLS port, which is usually 587. Mail Relay always uses STARTTLS. Port 465 does not work with this setup.

| Provider | Host | Port | Username and password |
| --- | --- | --- | --- |
| Gmail | `smtp.gmail.com` | `587` | Your Gmail address and an app password. You need 2-Step Verification to create one. Your normal password does not work. |
| Brevo | `smtp-relay.brevo.com` | `587` | The SMTP login and an SMTP key, both shown in Brevo's SMTP and API settings. |

Providers can change these values. Confirm them on your provider's site.

## Steps

### Save your SMTP details

1. Open the **System** menu (**System Preparation**).
2. Select **SMTP** (**Add SMTP Details**).
3. Read the info box and continue.
4. In the form **Enter SMTP server details:**, fill in **SMTP Host:**.
5. Fill in **SMTP Port:**. Use `587` in most cases.
6. Fill in **Username:**.
7. Fill in **Password/Key:**. The characters show as `*` as you type.
8. Confirm the form.

You need all four fields. If one is empty, nothing is saved. The Deployrr log says "Incomplete or incorrect information." If you cancel, nothing is saved.

When it works, you see "Details saved." The **SMTP** entry shows ` - DONE`.

Deployrr stores the password in your Docker folder as `secrets/smtp_server_password`. Only root can read it.

### Set up Mail Relay

1. In the **System** menu, select **Mail Relay** (**Setup Mail Relay (ssmtp)**).
2. If you see "SMTP details must be configured first", finish the SMTP steps above first.
3. Read the box that explains Mail Relay. Select **Yes** to continue.

Deployrr installs the mail packages. If you already have files in `/etc/ssmtp`, Deployrr moves that folder to a name like `/etc/ssmtp.bak.20261112143005` (the date and time). You see "Existing /etc/ssmtp backed up to" and the new name. Deployrr then creates a fresh `/etc/ssmtp`.

:::caution
Set **Domain 1** in Prerequisites before you start. Without it, Mail Relay stops with "DOMAINNAME_1 is not set" and "Please configure your domain name in Prerequisites before setting up Mail Relay." By then your old `/etc/ssmtp` is already moved to the `.bak` folder. Set the domain, then run Mail Relay again. Copy anything you need back from the `.bak` folder.
:::

On Arch, Deployrr installs ssmtp from the AUR with `yay` or `paru`. If you have neither, you see "No AUR helper found. Please install ssmtp manually from AUR." and then "Failed to install ssmtp package". Install an AUR helper, or ssmtp by hand, and run the step again.

4. In the box that asks for the FROM address, check the address. It is pre-filled as `USERNAME@YOUR_DOMAIN`. You can use something like `webmaster@YOUR_DOMAIN` instead.

   This is the address that shows as the sender when your Linux user or root sends mail. It is not your SMTP username. The SMTP username is only used to log in. If you cancel or leave it empty, Deployrr uses the pre-filled address.

   Many providers only accept a From address they have verified. In Brevo, use a verified sender or domain. Gmail replaces the From address with your Gmail address unless you added the address under **Send mail as** in Gmail.

5. Read the "Mail Relay configuration complete" screen. It shows the configuration folder `/etc/ssmtp/`, a **Root email** line with `root@YOUR_DOMAIN` and a **User email** line with your From address. `root@YOUR_DOMAIN` is where mail for root and other system accounts goes (see [Mail for root](#mail-for-root)). Mail that root sends uses the From address from step 4.
6. When you see "Let's send a test email to make sure everything works", press any key.
7. In the **Test Email** box, enter the address that should get the test email. It needs an `@`, or you see "Invalid email address format." If you cancel or leave it empty, the test is skipped.

The test email has the subject `Deployrr Test Email from HOSTNAME`. The test summary lists your SMTP username on its **From:** line. The From address from step 4 is used for mail that your user and root send.

## Check it worked

1. Look for "Test email sent successfully to ..." and then "Mail Relay configured successfully".
2. Open your inbox and find the test email. Check your spam folder too.

:::note
The **System** menu shows Mail Relay as ` - DONE` once ssmtp is installed and its settings file exists. It also shows after a skipped or failed test. To confirm that email works, check that the test email arrived.
:::

If the test fails, you see "Test email failed - check SMTP settings and logs" and "Mail Relay configuration was NOT marked as complete." If the test fails or you skip it, you see "Mail Relay setup incomplete - test email required for completion" and "Re-run Mail Relay setup and complete a successful test to finish." See [If the test fails](#if-the-test-fails).

## Send email yourself

Once the test works, you can send mail from the command line:

```bash
echo "Body" | mail -s "Subject" you@example.com
```

Replace `you@example.com` with your own address.

Cron emails a job's output to the job's owner. To get that mail, add this line at the top of the crontab. Open it with `crontab -e`:

```text
MAILTO=you@example.com
```

Replace `you@example.com` with your own address.

### Mail for root

Many system tools, such as smartd, fail2ban and root's cron jobs, send their mail to the root account by default. Mail Relay sends mail for root and other system accounts to `root@YOUR_DOMAIN`. It does not go to the address you used for the test.

ssmtp has no local mailboxes. A name without an `@`, such as `root`, goes to the root address if it is a system account. Your own user name gets your domain added, so it goes to `USERNAME@YOUR_DOMAIN`. An address that already has an `@`, such as `root@localhost`, is sent as is, and your provider will most likely reject it.

To get these alerts, pick one of these:

- Forward `root@YOUR_DOMAIN` to your own inbox at your domain's email provider.
- Change the root address on the server (next section).
- Set your own address in each tool (the section after that).

### Change the root address

All mail for root then goes to your address.

1. Back up the file:

   ```bash
   sudo cp -a /etc/ssmtp/ssmtp.conf /etc/ssmtp/ssmtp.conf.orig
   ```

2. Open the file:

   ```bash
   sudo nano /etc/ssmtp/ssmtp.conf
   ```

3. Change the `root=` line to your address, for example `root=you@example.com`. Replace `you@example.com` with your own address.
4. Save the file and exit.
5. Send a test to root:

   ```bash
   echo test | mail -s "root test" root
   ```

6. Check that the test arrives in your inbox.

:::caution
Running Mail Relay again writes a fresh `/etc/ssmtp/ssmtp.conf`. Your edit is lost from the live file. The edited copy is in the new `.bak` folder. Make the change again after each rerun.
:::

### Set your address in each tool

Deployrr does not install smartd or fail2ban. The Scrutiny app shows disk health in a web page, but it does not install smartd on the host. If you want these tools, install them yourself. Use these settings once they are running.

**Cron.** Root's cron jobs need their own line. Run `sudo crontab -e` to open root's crontab and put `MAILTO=you@example.com` at the top, as shown above. Cron only sends mail when a job prints output.

**smartd.** Edit `/etc/smartd.conf`. Find the `DEVICESCAN` line, or each device line. If it already has `-m root`, change it to `-m you@example.com`. If it has no `-m`, add `-m you@example.com`. To get a test mail, also add `-M test`, restart the service, then remove `-M test`. The service is `smartmontools` on Debian and Ubuntu and `smartd` on Arch:

```bash
sudo systemctl restart smartmontools
```

Options can differ by version. Check `man smartd.conf`.

**fail2ban.** Do not edit `jail.conf`. Create or edit `/etc/fail2ban/jail.local` and add:

```ini
[DEFAULT]
destemail = you@example.com
sender = YOUR_FROM_ADDRESS
mta = sendmail
action = %(action_mw)s
```

Replace `you@example.com` with your own address. Replace `YOUR_FROM_ADDRESS` with the From address from Mail Relay step 4. Many providers reject unverified senders. The default `destemail` is `root@localhost`, which ssmtp cannot deliver, so set it.

`action_mw` bans and mails you a whois report. Use `action_mwl` to add log lines. Depending on your fail2ban version, it may also mail you when a jail starts and stops. Restart it to apply the change:

```bash
sudo systemctl restart fail2ban
```

Back up a config file with `cp -a` before you edit it. See each tool's man page for more options.

## If the test fails

1. Check the host and port. Use the STARTTLS port, usually `587`. Port 465 does not work.
2. Check the username. Some providers use a login that is not your email address.
3. Check the password. Gmail needs an app password. Brevo needs an SMTP key.
4. Check the From address. Your provider may need to verify it first.
5. Check your provider's sending limits. A free plan can stop sending when you reach the daily limit.
6. Check your spam folder.
7. Send a message by hand and read the error it prints:

   ```bash
   echo test | mail -s test you@example.com
   ```

   Replace `you@example.com` with your own address.

8. Fix the details in **System** > **SMTP**, then run **System** > **Mail Relay** again and complete the test.

## Change your SMTP details later

Use this when you have a new password or a new provider.

1. Run **System** > **SMTP** again. Your current values are pre-filled. Change what you need and confirm.
2. Run **System** > **Mail Relay** again. This writes the new details to `/etc/ssmtp/ssmtp.conf`. Saving SMTP alone does not change it.
3. Complete the test email.

Mail Relay moves the current `/etc/ssmtp` to a new `.bak` folder each time you run it. Apps you set up by hand keep the old details until you edit them. See [Edit .env and secrets](/using-deployrr/edit-env-and-secrets/) for where Deployrr keeps its files.

:::caution
Your SMTP password is stored in plain text in `/etc/ssmtp/ssmtp.conf`. The file belongs to root, group `mail`, and has mode 640. The From address mapping in `/etc/ssmtp/revaliases` has the same owner and mode. Keep the `.bak` folders private as well. Delete old ones when you no longer need them.
:::

## Remove Mail Relay

The menu has no option to remove Mail Relay. On Debian or Ubuntu, remove it by hand:

:::caution
Back up `/etc/ssmtp` first. Other tools on the server may rely on ssmtp to send mail.
:::

```bash
sudo cp -a /etc/ssmtp ~/ssmtp-backup
sudo apt remove ssmtp mailutils
```

The `/etc/ssmtp` folder may stay behind. Once ssmtp is uninstalled, the **DONE** label goes away.
