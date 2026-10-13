// White-label site generator.
//
// Run 1:  node gen.mjs
// Run 2:  node gen.mjs --v2     (after a "shared requirements change")
//
// The --v2 switch simulates the agency updating the shared structure:
//   * a new "Pricing" nav item for everyone
//   * a redesigned footer
//   * (deliberately) a changed tagline for one client, to force a conflict
import { readFileSync } from 'node:fs'
import { Jostraca, Project, File, Content, cmp, each } from 'jostraca'

const V2 = process.argv.includes('--v2')
const WRITE_DEFAULT = process.argv.includes('--write') // no merge: the default
const OUT = (process.argv.find((a) => a.startsWith('--out=')) || '--out=./out').slice(6)

// ---------------------------------------------------------------------------
// The shared model. In a real agency this is a database row per client.
// ---------------------------------------------------------------------------
const model = {
  // Shared across every client: editing this changes all three sites.
  nav: V2
    ? [
        { label: 'Home', href: 'index.html' },
        { label: 'About', href: 'about.html' },
        { label: 'Pricing', href: 'pricing.html' },
      ]
    : [
        { label: 'Home', href: 'index.html' },
        { label: 'About', href: 'about.html' },
      ],

  footer: V2
    ? { note: '© 2026 Nightshift Labs', columns: ['Privacy', 'Terms', 'Status'] }
    : { note: 'Made by Nightshift Labs', columns: ['Privacy', 'Terms'] },

  clients: [
    { id: 'acme',   name: 'Acme Notes',   tagline: 'Capture every idea.',       primary: '#4f46e5', pages: ['index', 'about'] },
    { id: 'bravo',  name: 'Bravo Boards', tagline: 'Plan together, ship faster.', primary: '#0ea5e9', pages: ['index', 'about'] },
    // v2 changes Cirrus's tagline in the generator, on lines a developer edited:
    { id: 'cirrus', name: 'Cirrus CRM',   tagline: V2 ? 'Customers, everywhere.' : 'Customers, in the cloud.', primary: '#16a34a', pages: ['index', 'about'] },
  ],
}

// ---------------------------------------------------------------------------
// Components. `cmp` turns a function into a component; `Content` appends text
// to whichever file is currently open.
// ---------------------------------------------------------------------------
const Nav = cmp(function Nav() {
  const links = model.nav
    .map((i) => '    <a href="' + i.href + '">' + i.label + '</a>')
    .join('\n')
  Content('<nav class="nav">\n' + links + '\n  </nav>\n')
})

const Footer = cmp(function Footer() {
  const cols = model.footer.columns.map((c) => '      <li>' + c + '</li>').join('\n')
  Content(
    '<footer class="footer">\n' +
      '  <p>' + model.footer.note + '</p>\n' +
      '  <ul>\n' + cols + '\n  </ul>\n' +
      '</footer>\n'
  )
})

const Page = cmp(function Page(props) {
  const c = props.client
  Content('<!doctype html>\n<html lang="en">\n<head>\n')
  Content('  <meta charset="utf-8">\n')
  Content('  <title>' + c.name + ' — ' + props.title + '</title>\n')
  Content('  <link rel="stylesheet" href="styles.css">\n')
  Content('</head>\n<body>\n')
  Nav()
  Content('<main>\n' + props.body + '</main>\n')
  Footer()
  Content('</body>\n</html>\n')
})

const bodyFor = (c, page) => {
  if (page === 'index') return '  <h1>' + c.tagline + '</h1>\n'
  if (page === 'about') return '  <p>' + c.name + ' is a fictional SaaS product.</p>\n'
  return '  <p>Pricing page.</p>\n'
}

const Site = cmp(function Site(props) {
  const c = props.client
  Project({ folder: c.id }, () => {
    File({ name: 'styles.css' }, () => {
      Content(':root { --primary: ' + c.primary + '; }\n')
      Content('body { font-family: system-ui; margin: 0; }\n')
      Content('.nav a { color: var(--primary); margin-right: 1rem; }\n')
    })

    File({ name: 'config.json' }, () => {
      Content(
        JSON.stringify({ name: c.name, primary: c.primary, integrations: [] }, null, 2) + '\n'
      )
    })

    for (const page of c.pages) {
      File({ name: page + '.html' }, () => {
        Page({ client: c, title: page === 'index' ? 'Home' : page, body: bodyFor(c, page) })
      })
    }
  })
})

// ---------------------------------------------------------------------------
// Run it. `existing.txt.merge` is what makes the second run preserve hand
// edits: the previous generate is the merge base.
// ---------------------------------------------------------------------------
const jostraca = Jostraca({
  model,
  existing: WRITE_DEFAULT
    ? { txt: { write: true } }
    : { txt: { write: true, merge: true } },
})

const result = await jostraca.generate({ folder: OUT }, () => {
  model.clients.forEach((client) => Site({ client }))
})

const files = result.files
console.log(
  (WRITE_DEFAULT ? '[default write] ' : '[merge] ') +
    (V2 ? '=== RUN 2 (v2 generator) ===' : '=== RUN 1 (v1 generator) ===') +
    '  out=' + OUT
)
console.log('written:  ', files.written)
console.log('merged:   ', files.merged)
console.log('conflicted:', files.conflicted)
