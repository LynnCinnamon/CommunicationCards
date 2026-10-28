# Communication Cards

A mobile-first web app for precise, fast communication when speaking isn't practical, such as in loud environments like trains, buses, concerts or bars.

You prepare sentences in advance as **cards**, organized into sets by situation. In the moment, you pick a card, tap to fill in the parts that change, and show the screen. The other person answers by tapping one of the prepared replies.

## Why not just a notes app?

Typing a message by hand is slow and fiddly in a moving bus. Word-by-word message builders, as used in many AAC apps, are flexible but need many taps per sentence.

Communication Cards sits in between: whole sentences are written in advance, and only the variable parts are chosen live, mostly with a single tap and without opening the keyboard.

## Example

A card from an "ÖPNV" set:

> Noch **[Zahl]** Haltestellen?

1. You set the number to `3`, and the screen shows **"Noch 3 Haltestellen?"**
2. The other person taps one of the replies:
   - **Ja**
   - **Nein**
   - **Nein, noch [Zahl] Haltestellen**, filling in the number themselves

Another card:

> Steigen wir am **[Haltestelle]** aus?

Here `[Haltestelle]` is a choice from a shared list (`Hagenmarkt`, `Rathaus`, `Schloss`, …) and appears as a row of buttons.

## Concepts

- **Card:** A prepared sentence with optional fields, plus an optional list of reply options.
- **Field:** A placeholder filled in live. Types:
  - Number (quick buttons or stepper, no keyboard)
  - Choice from a list
  - Date / time
  - Free text (only when nothing else fits)
- **Reply:** A prepared answer the other person taps. Replies can contain fields of their own, such as "Nein, noch [Zahl] Haltestellen".
- **List:** A reusable set of values, such as stops or places, shared by several cards. It is defined once and referenced from any field.
- **Set:** A group of cards for one situation (ÖPNV, Restaurant, Konzert, …).

## Goals

- **Speed:** Picking a card, filling its fields and showing the message should take about three taps.
- **Mobile first:** Designed for one-handed use on a phone.
- **Works offline, no backend:** Installable as a PWA (Progressive Web App). All data stays on the device.
- **Portable data:** Cards, lists and sets can be exported and imported as a versioned file. This file is also the backup.

## First Version

- [ ] Cards with fields (number, list choice, date/time, free text)
- [ ] Reply options, including replies with fields
- [ ] Shared lists
- [ ] Sets organized by situation, with favorites / recently used cards
- [ ] Fullscreen display view in large, high-contrast text
- [ ] Editor for cards, lists and sets
- [ ] Export / import with a schema version
- [ ] Installable PWA with persistent storage

## Ideas for Later

- Preset card sets to import (German first, then English)
- Follow-up questions: a reply links to an existing card, so cards form a graph rather than a nested tree. Version 1 is limited to one question and one answer.
- Flip the display 180° for the person opposite
- Optional PIN lock on the editor, e.g. so children can use cards without editing them
- Use with deaf or hard-of-hearing conversation partners

## Status

Early planning stage. No code yet.
