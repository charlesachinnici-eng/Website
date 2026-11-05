---
title: How to edit the website
permalink: editor-help.html
layout: page.njk
eleventyExcludeFromCollections: true
buttons:
  - label: Open the editor
    url: https://app.pagescms.org
    new_tab: true
  - label: Site check
    page: site-check
  - label: Home
    page: index
---
Everything on the Reno Chess Club website can be changed in the **editor**. It works like filling in a form, and you never need to touch code. Your changes appear on the website **about 1-2 minutes** after you save.

## Signing in

1. Open **[app.pagescms.org](https://app.pagescms.org)**. Bookmark it.
2. Sign in with the **email address you were invited with**. You don't need a GitHub account.
3. Choose the club website. You'll see a menu on the left with the sections below.

## What you can change

**Club info:** the club name, address, phone number, meeting times, footer text, and the Google Calendar. You can see these in the editor, but only the Super Admin can change them. Ask the Super Admin if something there needs updating.

**Colors & look:** pick one of the approved color schemes, a font, and the background picture. Text colors are chosen automatically, so the site always stays readable.

**Pages:** every page of the site. Each page has:
- a **title**,
- optional **page text**. Use the toolbar for bold, lists, headings, links and pictures. If a page has no text, it shows big buttons only. If it has text, the buttons become a row underneath.
- its **buttons**. For each button, set the text, and choose **either** a page of our site **or** a web address for other websites. Turn on "Open in a new browser tab" for other websites. Drag buttons to change their order.

To make a new page, click **Add** under Pages, then add a button somewhere else (for example on the Home page) that goes to it. Otherwise nobody can find it.

**News:** add a post with a headline, date, optional picture and story. The newest posts show on **Current News**. Older ones move to **Old News** on their own. (How many count as "current" is set in Club info by the Super Admin.)

**Events:** add the event name, date (and last day, for events longer than one day), and optionally the time, place, a link (such as the US Chess event page), a picture and a description. Events appear on **Current Club Events** and disappear by themselves after they're over.

**Games (Game Viewer):** add a game by pasting it in PGN notation and giving it a name. "Position in the list" controls the order (1 = top).

## Who can do what

- **Admins** (everyone invited by email) can change everything in the editor except Club info.
- **The Super Admin** can also change Club info, the editor's setup, and who is invited.

## Pictures

Use the picture button in any page text, or the picture fields. You can upload from your computer. Large photos are fine, but pictures under about 2 MB load faster for visitors.

## After you save

- Wait 1-2 minutes, then reload the website to see your change.
- Open the **[Site check](site-check.html)** page. It lists anything the website couldn't use. For example:
  - a **game with a typo** in its moves is held back from the Game Viewer until it's fixed, and Site check tells you the exact move,
  - a **button pointing to a deleted page** is listed so you can fix it.

## Made a mistake?

Every change is saved in the site's history, so nothing is ever lost. Fix it in the editor and save again. If something looks badly wrong, contact the site administrator, who can undo any change.

## Good to know

- Page names can't be changed after a page is created (so links don't break), but the **title** can be changed anytime.
- Deleting a page doesn't delete the buttons that point to it. Site check will list those buttons.
- Keep button text short. Long text gets smaller to fit.
