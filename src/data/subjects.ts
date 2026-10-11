import type { CourseCode, Subject } from '../types'

const courseDefinitions: Array<[CourseCode, string, string, string, string]> = [
  ['CSE205', 'Data Structures and Algorithms', 'Think logically. Build efficiently. Explore the structures and algorithms behind great software.', 'violet', 'structures'],
  ['CSE202', 'Object Oriented Programming', 'Turn real-world problems into well-designed objects, classes, and reusable programs.', 'blue', 'code'],
  ['CSE306', 'Computer Networks', 'Connect the dots between devices, protocols, and the systems that keep the internet moving.', 'orange', 'network'],
  ['CSE423', 'Virtualization and Cloud Computing', 'Explore virtual machines, scalable infrastructure, and modern cloud computing concepts.', 'cyan', 'cloud'],
  ['MTH401', 'Discrete Mathematics', 'Sharpen your reasoning with logic, sets, counting, relations, and graph problems.', 'rose', 'math'],
  ['INT335', 'Design Thinking', 'Solve meaningful problems through empathy, experimentation, and human-centered design.', 'green', 'design'],
]

export const romanUnits = ['I', 'II', 'III', 'IV', 'V', 'VI']

// Verified against the available official MTH401 and INT335 Session 2026–27 syllabus PDFs.
// CSE423 unit topics remain provisional until its official syllabus is located.
const verifiedUnitTopics: Partial<Record<CourseCode, string[][]>> = {
  MTH401: [
    ['Propositional logic', 'Propositional equivalences', 'Quantifiers', 'Direct proof', 'Contraposition', 'Vacuous and trivial proofs', 'Contradiction', 'Proof equivalence', 'Counterexamples', 'Mistakes in proof'],
    ['Recurrence relations', 'Recurrence modelling', 'Homogeneous linear recurrences', 'Characteristic equations', 'Non-homogeneous recurrences', 'Inverse-operator method', 'Generating functions'],
    ['Inclusion-exclusion', 'Pigeonhole principle', 'Generalized pigeonhole principle', 'Relations and properties', 'Composition of relations', 'Relation matrices and graphs', 'Equivalence relations', 'Partial and total orders', 'Lattices and sublattices', 'Hasse diagrams'],
    ['Graph terminology', 'Complete, cycle, regular, wheel and cube graphs', 'Bipartite graphs', 'Adjacency and incidence matrices', 'Graph isomorphism', 'Paths and connectivity', 'Directed graphs', 'Dijkstra shortest-path algorithm'],
    ['Planar graphs', 'Euler formula', 'Graph colouring', 'Chromatic number', 'Trees and tree properties', 'Rooted trees', 'Spanning trees', 'Minimum spanning trees', 'Decision trees', 'Infix, prefix and postfix notation'],
    ['Divisibility', 'Primes', 'Modular arithmetic', 'GCD and LCM', 'Euclidean algorithm', 'Bezout lemma', 'Linear congruences', 'Modular inverse', 'Chinese remainder theorem', 'Caesar and affine ciphers', 'Fermat little theorem'],
  ],
  INT335: [
    ['Focused and diffuse modes', 'VARK learning model', 'Functional fixedness and cognitive blocks', 'Creativity, invention and innovation', 'History of design thinking', 'Stanford d.school framework', 'IDEO human-centred design', 'Design case studies'],
    ['Computational empathy', 'Qualitative and quantitative research', 'Field observation', 'AEIOU framework', 'User interviews', 'Explicit and implicit needs', 'Pain points', 'Personas and target archetypes', 'Empathy mapping and insights'],
    ['Divergent and convergent thinking', 'Brainstorming', 'SCAMPER', 'Mind mapping', 'Reverse thinking', 'Idea clustering', 'Feasibility and relevance analysis', 'Screening matrices', 'Idea prioritisation'],
    ['Prototyping philosophy', 'Rapid learning', 'Low- and high-fidelity prototypes', 'Paper prototyping', 'Storyboarding', 'Digital wireframing', 'Wireframe conventions', 'User flows', 'Minimum viable product'],
    ['Neutral user testing', 'Task scenarios', 'Show-don’t-tell testing', 'Feedback capture matrix', 'Customer journey mapping', 'Touchpoints and pain points', 'Usability and navigation', 'Accessibility in digital products'],
    ['Design iteration', 'User feedback analysis', 'Design refactoring and redesign', 'Strategic pivoting', 'Continuous improvement', 'Product presentation', 'NABC model', 'Elevator pitching', 'Technical design case study', 'Final project presentation'],
  ],
}

export const subjects: Subject[] = courseDefinitions.map(([code, name, description, accent, icon]) => ({
  code, name, description, accent, icon,
  units: romanUnits.map((roman, index) => ({
    number: index + 1,
    title: `Unit ${roman}`,
    topics: verifiedUnitTopics[code]?.[index] ?? [],
    verified: Boolean(verifiedUnitTopics[code]),
  })),
}))
export const getSubject = (code: CourseCode) => subjects.find(subject => subject.code === code)!
export const syllabusNotice = 'Unit topics are listed where an official course syllabus was available. CSE423 unit alignment remains provisional pending confirmation against its official course document.'
