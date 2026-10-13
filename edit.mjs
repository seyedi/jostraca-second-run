// Simulate the three developers making real changes, plus a clash.
import { readFileSync, writeFileSync } from 'node:fs'

const edit = (path, fn) => writeFileSync(path, fn(readFileSync(path, 'utf8')))

// CLIENT A: developer creates a page the generator has never heard of.
writeFileSync(
  'out/acme/pricing.html',
  '<!doctype html>\n<html lang="en">\n<head><title>Acme — Pricing</title></head>\n' +
    '<body><main><h1>Hand-written pricing page</h1></main>\n' +
    '<!-- hand-written, not generated -->\n</body>\n</html>\n'
)

// CLIENT B: edits the homepage copy and adds a testimonial section.
edit('out/bravo/index.html', (s) =>
  s
    .replace('<h1>Plan together, ship faster.</h1>', '<h1>Plan together. Ship faster. Together.</h1>')
    .replace(
      '</main>',
      '  <section class="testimonial"><p>"Bravo changed how we work."</p></section>\n</main>'
    )
)

// CLIENT C: adds an integration to generated config.
edit('out/cirrus/config.json', (s) => s.replace('"integrations": []', '"integrations": ["stripe"]'))

// CLIENT C: also edits the exact line the v2 generator will change (forces a clash).
edit('out/cirrus/index.html', (s) =>
  s.replace('<h1>Customers, in the cloud.</h1>', '<h1>Customers, in the cloud. Really.</h1>')
)

console.log('developer edits applied')
