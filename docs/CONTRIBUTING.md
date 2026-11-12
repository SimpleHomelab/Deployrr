# Contributing to the Deployrr docs

These docs live at [docs.deployrr.app](https://docs.deployrr.app). They help you fix problems and get more out of Deployrr. Fixes and new pages are welcome.

The site is built with [Starlight](https://starlight.astro.build). Every page is a Markdown file under `src/content/docs/`.

## Small fixes

Click **Edit page** at the bottom of any page. GitHub opens the file so you can suggest a change.

## Run the site on your computer

You need Node.js 22.23 or newer.

```bash
cd docs
npm ci
npm run dev
```

Open the address it prints (usually `http://localhost:4321`).

## Add a page

1. Pick the section folder under `src/content/docs/`:

   | Folder | What goes there |
   |---|---|
   | `getting-started` | Installing, updating, first steps |
   | `using-deployrr` | Everyday tasks in Deployrr |
   | `apps` | Tips and fixes for one app |
   | `reverse-proxy` | Traefik and remote access |
   | `networking` | Firewalls, routers and network conflicts |
   | `docker` | Docker and container problems |
   | `host` | The operating system Deployrr runs on |
   | `support` | Getting help |
   | `archive` | Pages for older versions, kept for reference |

2. Copy a template from `templates/` into that folder and rename it. The file name becomes the page address, so use short lowercase words with hyphens, for example `src/content/docs/docker/rate-limit.md` becomes `/docker/rate-limit/`.

   | Template | Use it for |
   |---|---|
   | `templates/troubleshooting.md` | Something is broken and the reader wants it fixed. Sections: Symptoms, Cause, Fix, Check it worked, Related. |
   | `templates/how-to.md` | The reader wants to get one task done. Sections: Before you start, Steps, Check it worked, Related. |
   | `templates/guide.md` | A longer walk-through of a topic. |

3. Fill in the frontmatter (see below) and write the page.
4. Run `npm run check`. Fix anything it reports.
5. Open a pull request.

## Frontmatter

`npm run check` fails if a required field is missing or wrong.

| Field | Required | What to put |
|---|---|---|
| `title` | Yes | The page title. |
| `description` | Yes | One sentence, 50 to 160 characters. Shown in search results and link previews. |
| `type` | Yes | `how-to`, `troubleshooting`, `guide`, `reference` or `archive`. |
| `tags` | Yes | 1 to 6 tags from `tags.yml`. |
| `applies_to` | Yes | The Deployrr versions the page covers, for example `v6.0+`. |
| `apps` | No | App names the page is about. Each must match a folder name under the repo's `apps/` folder, for example `traefik`. |
| `symptoms` | For troubleshooting | Error messages or what you see, in the words you would search for. |
| `related` | Yes | 2 to 5 other pages, as slugs like `docker/rate-limit`, most useful first. They show in the "Related articles" box. |
| `further_reading` | No | Outside links, as `{ title, url }`. At most 3 SimpleHomelab posts (for example UDMS guide parts). Link a section with its `#Heading_Anchor` where it helps. |
| `videos` | No | Up to 3 video chapters, as `{ id, start, title, note }`. `id` is the YouTube video id, `start` the moment in seconds where the topic begins (see [Videos and guides](#videos-and-guides)), `title` what the chapter shows. Add `note` when the video shows an older Deployrr or a manual setup. They show in the "Watch" box. |
| `last_reviewed` | Yes | The date you last checked the page against Deployrr, like `2026-01-31`. |
| `status` | Yes | `current`, `needs-review` or `archived`. |
| `old_paths` | No | Old addresses for this page. Each one also needs an entry in `src/redirects.mjs`, unless it is the same as the page's new address. |
| `sources` | No | Where the content came from, as `{ type: issue, ref: ... }` or `{ type: discord, ref: ... }`. |

## Tags

Tags come from a fixed list in `tags.yml`. Each tag has a label and a one-line description. To add a tag, add it to `tags.yml` in the same pull request as the page that uses it. Every tag in the list must be used by at least one page.

## Videos and guides

Link SimpleHomelab videos and guides where they help the reader at that point of the page.

- Link a video at the exact moment where the topic begins, with `?t=` and that time in seconds. This is often later than the chapter start: find the first subtitle line where the video starts on the step, and use the start of that line, never a time in the middle of a sentence. Use the chapter start only when the video has no subtitles or the topic begins right there. Example: `[Deployrr 5 walkthrough: Socket Proxy setup at 26:13](https://youtu.be/rdqbAr0TFnQ?t=1573) (shows Deployrr v5; menus differ in v6)`. Add the same video to `videos`, with the same note in `note`.
- Only link a video or guide when it covers what the page does there. If it shows Deployrr v5 or a manual Docker Compose setup, say so next to the link, for example "(shows Deployrr v5; menus differ in v6)", and add the same `note` in `videos`.
- Never link a chapter whose steps contradict the page.
- Keep it to 3 videos and 3 SimpleHomelab posts per page, and one link to the same video or post in the text.

## What `npm run check` does

- Type-checks the site and checks every page's frontmatter.
- Checks that every page in `related` exists and that no page links to itself.
- Checks that every page has at least 2 links from other pages, so readers can find it.
- Checks that every old address has a redirect, and every redirect belongs to a page.
- Checks that every tag is in `tags.yml`, and every tag in `tags.yml` is used.
- Checks that every image has alt text, and that there are no em dashes.
- Checks that `further_reading` has at most 3 SimpleHomelab posts, and warns when a video linked in the text is missing from `videos`.
- Builds the site and fails on broken internal links.
- Starts the dev server and checks that the homepage, the troubleshooting page, the tag pages and an article load without errors.

## Writing style

- Write for someone who just wants the problem fixed. Second person ("you").
- Short sentences and plain words.
- Numbered steps for anything done in order. One action per step.
- Commands in code blocks with a language, for example `bash` or `yaml`.
- When you give a `docker` or `docker compose` command, also give the matching [Deployrr bash alias](src/content/docs/using-deployrr/bash-aliases.md) if there is one, for example "With the Deployrr bash aliases: `dps`." Use only aliases listed on that page. If no alias does the same thing, give only the command.
- Use asides (`:::note`, `:::caution`, `:::tip`) for warnings and tips.
- Images go in `src/assets/<section>/`. Link them with a relative path and always add alt text.
- Link to other docs pages wherever you mention something that has its own page.
- No em dashes.
