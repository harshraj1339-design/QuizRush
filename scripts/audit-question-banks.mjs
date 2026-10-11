import { readFileSync } from 'node:fs'

const files = [
  ['CSE205', 'src/data/questions/cse205.ts', 450],
  ['CSE202', 'src/data/questions/cse202.ts', 450],
  ['CSE306', 'src/data/questions/cse306.ts', 600],
  ['CSE423', 'src/data/questions/cse423.ts', 600],
  ['MTH401', 'src/data/questions/mth401.ts', 600],
  ['INT335', 'src/data/questions/int335.ts', 600],
]
const tuplePattern = /^\s*\[(\d+),\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'((?:\\\\.|[^'])*)',\s*'([^']*)',\s*'([^']*)'\],?$/
const unescape = value => value.replace(/\\\\'/g, "'").replace(/\\\\\\\\/g, "\\\\")
let failed = false

for (const [code, path, expected] of files) {
  const source = readFileSync(path, 'utf8')
  const rows = source.split(/\r?\n/).flatMap(line => {
    const match = line.match(tuplePattern)
    if (!match) return []
    return [{
      unit: Number(match[1]),
      topic: unescape(match[2]),
      stem: unescape(match[3]).trim(),
      options: match.slice(4, 8).map(value => unescape(value).trim()),
      explanation: unescape(match[8]).trim(),
    }]
  })
  const stems = new Map()
  const units = new Map()
  const issues = []
  for (const [index, row] of rows.entries()) {
    units.set(row.unit, (units.get(row.unit) || 0) + 1)
    stems.set(row.stem, (stems.get(row.stem) || 0) + 1)
    if (new Set(row.options.map(option => option.toLowerCase())).size !== 4) {
      issues.push(`row ${index + 1}: duplicate answer options`)
    }
    if (row.options.some(option => /a protocol that serves a different network layer|a service unrelated to this function/i.test(option))) {
      issues.push(`row ${index + 1}: placeholder distractor`)
    }
    if (/this follows from the definition and operation of/i.test(row.explanation)) {
      issues.push(`row ${index + 1}: generic explanation`)
    }
  }
  const duplicateStemRows = [...stems.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0)
  const distinctStems = stems.size
  console.log(`\n${code}: ${rows.length}/${expected} rows; ${distinctStems} distinct stems; ${duplicateStemRows} repeated-stem rows`)
  console.log('  Units:', [...units.entries()].sort((a, b) => a[0] - b[0]).map(([unit, count]) => `U${unit}=${count}`).join(', '))
  if (rows.length !== expected) issues.push(`expected ${expected} records, found ${rows.length}`)
  if (issues.length) {
    failed = true
    console.log(`  Content-pattern warnings: ${issues.length}`)
    for (const issue of issues.slice(0, 5)) console.log(`   - ${issue}`)
    if (issues.length > 5) console.log(`   - …and ${issues.length - 5} more`)
  }
}
console.log('\nAudit is a structural screen only; it cannot verify factual correctness or whether a distractor is unambiguously wrong.')
if (failed) process.exitCode = 1
