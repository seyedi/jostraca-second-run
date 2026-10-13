# The Second Run — Jostraca demo

A small, synthetic demo that tests one question: what does a code generator do
on its **second** run, after developers have edited the generated files?

It uses [Jostraca](https://jostraca.org/) 0.39.0 to generate three fictional
white-label SaaS websites that share a navigation bar, a footer, and a page
layout, but have their own branding and content. Developers then edit the output
by hand, the shared structure changes, and the sites are generated again.

This repo backs an article: **"The Second Run: Can Your Code Generator Handle
Real Developers?"**

## What it shows

- With `existing.txt.merge` enabled, Jostraca preserves hand edits across a
  regeneration: shared navigation and footer changes reach all three sites,
  while each client keeps its own changes.
- A file the generator never created is left alone.
- When a developer and the generator change the **same line**, Jostraca reports a
  conflict instead of silently choosing a side.
- The default `write` mode (no merge) silently overwrites the developer's work.

## Requirements

- Node.js >= 20

## Run it

```bash
npm install
npm run demo
```

That runs the whole story in order: generate v1, apply the developer edits,
regenerate with the updated generator, and print the resulting files.

To run it step by step:

```bash
node gen.mjs                 # run 1: generate the three sites
node edit.mjs                # simulate the three developers' edits
node gen.mjs --v2            # run 2: regenerate with the updated shared structure
node inspect.mjs --final     # print the files that matter
```

To see the destructive default, generate into a separate folder without merge:

```bash
rm -rf out-default
node gen.mjs --out=out-default
node edit.mjs                # note: edit.mjs targets ./out; see caveat below
```

(The `--write` flag is accepted by `gen.mjs` too, but `edit.mjs` writes into
`./out`, so the default-mode comparison is easiest in the `out-default` folder.)

## Expected result of run 2

```
[merge] === RUN 2 (v2 generator) ===  out=./out
written:   []
merged:    [ 'out/acme/index.html', 'out/acme/about.html',
             'out/bravo/index.html', 'out/bravo/about.html',
             'out/cirrus/config.json', 'out/cirrus/index.html',
             'out/cirrus/about.html' ]
conflicted: [ 'out/cirrus/index.html' ]
```

- **Acme** keeps its hand-written `pricing.html` (not part of the generator).
- **Bravo** keeps its rewritten headline and its added testimonial section.
- **Cirrus** keeps its `"stripe"` integration, but its homepage comes back with
  conflict markers because the developer and the generator changed the same
  headline line:

```
<<<<<<< GENERATED: <timestamp>/merge
  <h1>Customers, everywhere.</h1>
=======
  <h1>Customers, in the cloud. Really.</h1>
>>>>>>> EXISTING: <timestamp>/merge
```

## Files

- `gen.mjs` — the generator. `--v2` applies the shared "change request";
  `--write` uses the default overwrite mode; `--out=DIR` picks the output folder.
- `edit.mjs` — applies the three developers' edits to `./out`.
- `inspect.mjs` — prints the resulting files (`--final` for all of them).

## Caveats

This is a **synthetic scenario built to test a claim, not a Jostraca tutorial**
and not a production generator.

Jostraca keeps its merge baseline in an `out/.jostraca/` directory, which is
gitignored by default. If that baseline is missing — for example after a fresh
clone with a pre-existing `out/` — the merge has less information to work with.
That limitation is described in the article.
