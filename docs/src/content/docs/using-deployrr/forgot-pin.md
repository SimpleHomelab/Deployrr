---
title: I forgot my Deployrr PIN
description: View your Deployrr PIN, have it emailed to you, or reset it and set a new one when Deployrr asks for a PIN you can't remember.
type: troubleshooting
tags:
  - pin
  - support
applies_to: v6.0+
symptoms:
  - I forgot my Deployrr PIN
  - Previously set pin found. Enter your 6-digit pin for verification.
  - Forgot your pin? Check
  - Incorrect pin.
  - Invalid Pin
related:
  - getting-started/quick-start
  - support/discord
  - getting-started/updating-deployrr
further_reading: []
videos:
  - id: rdqbAr0TFnQ
    start: 906
    title: "Deployrr 5 walkthrough: License verification and creating a PIN"
    note: "Shows Deployrr v5. Menus and steps differ in v6."
last_reviewed: 2026-11-09
status: current
old_paths: ["/deployrr/forgot-pin"]
sidebar:
  order: 1
---

## Symptoms

Deployrr asks for your PIN and you don't remember it. The prompt looks like this:

```txt
Previously set pin found. Enter your 6-digit pin for verification.

NOTE: It must match what you provided previously. Forgot your pin? Check: https://docs.deployrr.app/deployrr/forgot-pin.
```

If you type the wrong PIN, you see an **Invalid Pin** box with this message and a link to Discord support:

```txt
Incorrect pin.
```

Your license stays unverified until you enter the right PIN.

## Cause

Your PIN is a 6-digit number. You created it the first time you ran **Prerequisites** > **Verify**. Deployrr asks for the same PIN each time you verify again.

You can look the PIN up, have it emailed to you, or reset it. All three are in the [Help menu](/using-deployrr/help-menu/), which you open from the main menu. With a Pro license, the same menu also has [Remote Assist](/support/ssh-access/) for a live support session.

## Fix

Try the options in this order. Stop when you have your PIN.

### Option 1: View your PIN

Use this if Deployrr still has your PIN saved on this machine.

1. Open Deployrr.
2. From the main menu, select **Help**.
3. Select **View Pin**.

Deployrr shows your 6-digit PIN. If you see `No pin found. Please re-run access Verify step from Prerequisites menu.`, Deployrr has no PIN saved on this machine. Go to option 2.

### Option 2: Have your PIN emailed to you

You must have completed **Prerequisites** > **Disclaimers** first. If not, Deployrr lists it as a missing requirement.

1. From the main menu, select **Help**.
2. Select **Request Pin**.
3. At `SimpleHomelab.com Account Email:`, check the email address of your SimpleHomelab.com account. Deployrr fills in the one it has saved. Change it if it is wrong.
4. Read the message that appears:

   ```txt
   If an account exists with the email YOUR_EMAIL, then the pin will be emailed within ~2 minutes.
   ```

5. Check your inbox, and your spam folder, for the email with your PIN.
6. Run **Prerequisites** > **Verify** again and enter the PIN.

### Option 3: Reset your PIN

Use this if the email doesn't arrive or you would rather pick a new PIN. As with option 2, **Disclaimers** must be done first.

1. From the main menu, select **Help**.
2. Select **Reset Pin**.
3. Read the **Reset Pin - Confirmation** box. It says the reset will clear your current PIN from this system and that you must set a new one via **Prerequisites** > **Verify**. Select **Yes** to continue. If you select **No**, nothing changes.
4. At `SimpleHomelab.com Account Email:`, check the email address of your SimpleHomelab.com account and change it if it is wrong.
5. Read the message that appears:

   ```txt
   If an account exists with the email YOUR_EMAIL, then the pin will be reset within ~2 minutes.

   Please go to Prerequisites -> Verify to set a new PIN.
   ```

6. Wait about 2 minutes.
7. From the main menu, open **Prerequisites** > **Verify**.
8. Enter your domain name when asked (optional for a Basic license), then your SimpleHomelab.com account email.
9. Select **Proceed**.
10. At `Create a personalized 6-digit numerical PIN to protect your account (note it down or remember it):`, enter a new 6-digit number.

Write the new PIN down somewhere safe.

To see a PIN created and then entered at the next verification, watch [Deployrr 5 walkthrough: License verification and creating a PIN at 15:06](https://youtu.be/rdqbAr0TFnQ?t=906) (shows Deployrr v5; menus and steps differ in v6).

:::note
Use the email address of your SimpleHomelab.com account. The message does not tell you whether an account exists for the email you typed. If you mistype it, nothing may arrive.
:::

### If none of this works

Ask for help on [Discord](https://www.simplehomelab.com/discord/) if any of these happen:

- You see `Could not request PIN.` or `Could not reset PIN.` Your PIN was not changed. Try again later.
- You see an error saying your email is not configured. Run **Prerequisites** > **Verify** first, then try again.
- No email arrives after several minutes.
- You see **Error Creating Pin** with `Pin could not be created.`

Support can reset your PIN for you. After they do, open **Prerequisites** > **Verify** in Deployrr and go through it again, as in steps 7 to 10 of option 3. Deployrr asks you to create a new PIN.

Tell them the email address of your SimpleHomelab.com account. Never post your PIN in a public channel.

## Check it worked

After a reset, **Prerequisites** > **Verify** shows a **Pin Created** box with `Pin created.` Later verifications accept your new PIN without the **Incorrect pin.** message.

## Related

- [Quick start](/getting-started/quick-start/): the full first-run steps, including Prerequisites and Verify.
- [Updating Deployrr](/getting-started/updating-deployrr/): keep Deployrr on the latest version.
- [Discord](https://www.simplehomelab.com/discord/): ask for help if the reset doesn't work.
