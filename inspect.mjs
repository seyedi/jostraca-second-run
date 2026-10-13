import { readFileSync } from 'node:fs'

const show = (p) => {
  console.log('\n----- ' + p + ' -----')
  try {
    console.log(readFileSync(p, 'utf8'))
  } catch {
    console.log('(missing)')
  }
}

if (process.argv.includes('--final')) {
  show('out/acme/pricing.html')
  show('out/bravo/index.html')
  show('out/cirrus/index.html')
  show('out/cirrus/config.json')
  show('out/cirrus/about.html')
} else {
  show('out/bravo/index.html')
}
