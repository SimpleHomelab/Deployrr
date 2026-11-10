---
# Copy this file to src/content/docs/<section>/<slug>.md and fill in every field.
title: Short name of the problem, in the words a user would use
description: One sentence, 50 to 160 characters, saying what is wrong and that this page fixes it.
type: troubleshooting
tags:
  - docker # 1 to 6 tags, only from tags.yml
applies_to: v6.0+
# apps: [traefik] # Optional. App folder names from the repo's apps/ folder.
symptoms:
  - The exact error message, as the user sees it
  - What the user notices, in their own words
related:
  - section/other-page # 2 to 5 page slugs, most useful first
  - section/another-page
further_reading: []
videos: []
last_reviewed: 2026-01-01
status: current # current, needs-review or archived
old_paths: [] # Old docs.deployrr.app paths, e.g. /docker/some-page. Each needs an entry in src/redirects.mjs.
sources: [] # Optional: - { type: issue, ref: "https://github.com/..." }
---

## Symptoms

What the user sees. Quote error messages in code blocks so search finds them.

```txt
Paste the exact error message here
```

## Cause

One or two short paragraphs on why this happens, from the user's point of view.

## Fix

1. One action per step.
2. Put commands in code blocks:

   ```bash
   sudo docker ps
   ```

3. Say what the user should see after each important step.

## Check it worked

How the user can tell the problem is gone.

## Related

- [Another page](/section/another-page/): why the reader might want it.
