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

// Unit titles and topic summaries transcribed from the uploaded Session 2026–27 syllabi.
// CSE423 uses the user's course slides/notes because a complete official six-unit syllabus PDF was not found.
const syllabusUnits: Record<CourseCode, Array<{ title: string; topics: string[]; verified: boolean }>> = {
  CSE205: [
    { title: 'Introduction, Arrays, Sorting and Searching', topics: ['Basic concepts and notations', 'Time and space complexity', 'Big O, Omega and Theta', 'Linear arrays and operations', 'Bubble, insertion and selection sort', 'Linear and binary search'], verified: true },
    { title: 'Linked Lists', topics: ['Memory representation and allocation', 'Traversal, insertion and deletion', 'Grounded and circular header lists', 'Doubly linked lists'], verified: true },
    { title: 'Stacks and Queues', topics: ['Array and linked representations', 'Push, pop and traversal', 'Polish notation and expression evaluation', 'Queue operations', 'Priority queues and deques'], verified: true },
    { title: 'Recursion and Trees', topics: ['Recursion', 'Binary trees and representations', 'Binary search trees', 'Tree traversals', 'Tower of Hanoi', 'Merge sort and quick sort'], verified: true },
    { title: 'Heaps and Hashing', topics: ['Heap insertion and deletion', 'Heap sort', 'Hash functions and hash tables', 'Separate chaining', 'Linear probing, quadratic probing and double hashing'], verified: true },
    { title: 'Graphs and Shortest-Path Algorithms', topics: ['Graph traversal', 'Breadth-first search (BFS)', 'Depth-first search (DFS)', 'Dijkstra algorithm', 'Bellman–Ford algorithm', 'Floyd–Warshall algorithm'], verified: true },
  ],
  CSE202: [
    { title: 'C++ Basics, OOP Concepts and Functions', topics: ['OOP concepts and languages', 'cin and cout', 'Classes and objects', 'Accessing members', 'Structures, unions, enumerations and classes', 'Inline and static members', 'Function overloading', 'Friend functions and classes', 'References and recursion'], verified: true },
    { title: 'Pointers, Arrays and Strings', topics: ['Void pointers and pointer arithmetic', 'Pointer to pointer', 'Dangling, wild and null pointers', 'Pointers to objects and this pointer', 'Array of objects', 'C++ string class', 'Multidimensional arrays', 'Pointer to data members'], verified: true },
    { title: 'File Operations, Constructors and Destructors', topics: ['File streams and modes', 'Sequential and random access', 'Binary file operations', 'Classes and file handling', 'Default and parameterized constructors', 'Copy constructors', 'Destructors and initializer lists'], verified: true },
    { title: 'Operator Overloading, Type Conversion and Inheritance', topics: ['Unary and binary operator overloading', 'Basic-to-class and class-to-basic conversion', 'Base and derived classes', 'Inheritance types and access modes', 'Overriding', 'Constructor/destructor order', 'Virtual base classes', 'Aggregation and composition'], verified: true },
    { title: 'Dynamic Memory Management and Polymorphism', topics: ['new and delete', 'Virtual destructors', 'Compile-time and run-time polymorphism', 'Virtual functions', 'Dynamic constructors', 'Abstract and concrete classes', 'Self-referential classes', 'Pure virtual functions', 'Memory leaks'], verified: true },
    { title: 'Exception Handling, Templates and STL', topics: ['Exception handling mechanism', 'Throwing, catching and rethrowing', 'Function and class templates', 'Templates with inheritance', 'STL containers', 'STL algorithms and iterators'], verified: true },
  ],
  CSE306: [
    { title: 'Introduction to Computer Networks and Network Models', topics: ['Network types', 'Network hardware and topologies', 'Hubs, switches and routers', 'Network software, layers and protocols', 'OSI model', 'TCP/IP protocol suite'], verified: true },
    { title: 'Physical Layer and Data Link Layer', topics: ['Data communication basics', 'Guided and unguided media', 'Transmission impairments and performance', 'Elementary data-link protocols', 'Hamming code', 'CRC, parity and checksum'], verified: true },
    { title: 'MAC Sublayer and IP Addressing', topics: ['ALOHA', 'CSMA and CSMA/CD', 'Ethernet', 'Classful and classless IP addressing', 'Subnetting'], verified: true },
    { title: 'Routing and IP Headers', topics: ['Shortest-path routing', 'Distance-vector routing', 'Link-state routing', 'IPv4 header', 'IPv6 header and addressing', 'Network Address Translation (NAT)'], verified: true },
    { title: 'Transport Layer and Congestion Control', topics: ['Transport/network layer relationship', 'Transport services and performance', 'TCP header and handshake', 'UDP header', 'Congestion-control algorithms', 'TCP congestion control'], verified: true },
    { title: 'Application Layer and Wireless Networks', topics: ['DNS', 'Email', 'FTP', 'IEEE 802.11a/b/g/n', 'Bluetooth architecture and layers'], verified: true },
  ],
  CSE423: [
    { title: 'Virtualization Fundamentals', topics: ['Virtualization concepts and benefits', 'Virtual machines', 'Hypervisors', 'Host and guest systems'], verified: false },
    { title: 'Cloud Computing Fundamentals', topics: ['Cloud computing definition', 'On-demand resources', 'Service characteristics', 'Cloud providers'], verified: false },
    { title: 'Cloud Service and Deployment Models', topics: ['IaaS, PaaS and SaaS', 'Public, private and hybrid clouds', 'Community cloud'], verified: false },
    { title: 'Virtual Networking and Storage', topics: ['Virtual networks', 'VLAN and VSAN', 'Virtual storage concepts'], verified: false },
    { title: 'Cloud Architecture and Resource Management', topics: ['Resource pooling', 'Elasticity and scalability', 'Provisioning and monitoring'], verified: false },
    { title: 'Cloud Security and Applications', topics: ['Shared-responsibility concepts', 'Security and privacy basics', 'Cloud use cases'], verified: false },
  ],
  MTH401: [
    { title: 'Logic and Proofs', topics: ['Propositional logic and equivalences', 'Quantifiers', 'Direct proof and contraposition', 'Vacuous and trivial proofs', 'Contradiction', 'Proof equivalence', 'Counterexamples and mistakes in proof'], verified: true },
    { title: 'Recurrence Relations', topics: ['Recurrence relations and modelling', 'Homogeneous linear recurrences', 'Constant coefficients', 'Inverse-operator method', 'Generating functions'], verified: true },
    { title: 'Counting Principles and Relations', topics: ['Inclusion–exclusion', 'Pigeonhole principles', 'Relations and properties', 'Composition and representations', 'Equivalence relations', 'Partial and total orders', 'Lattices and Hasse diagrams'], verified: true },
    { title: 'Graph Theory I', topics: ['Graph terminology and special graphs', 'Adjacency and incidence matrices', 'Graph isomorphism', 'Paths and connectivity', 'Directed graphs', 'Dijkstra algorithm'], verified: true },
    { title: 'Graph Theory II', topics: ['Planar graphs and Euler formula', 'Graph colouring and chromatic number', 'Trees and rooted trees', 'Spanning and minimum spanning trees', 'Decision trees', 'Infix, prefix and postfix notation'], verified: true },
    { title: 'Number Theory and Cryptography', topics: ['Divisibility and modular arithmetic', 'Primes, GCD and LCM', 'Euclidean algorithm and Bezout lemma', 'Linear congruences and modular inverse', 'Chinese remainder theorem', 'Caesar and affine ciphers', 'Fermat little theorem'], verified: true },
  ],
  INT335: [
    { title: 'Introduction to Design Thinking and Creativity', topics: ['Focused and diffuse modes', 'VARK learning model', 'Functional fixedness and cognitive blocks', 'Creativity, invention and innovation', 'History of design thinking', 'Stanford d.school and IDEO frameworks', 'Design case studies'], verified: true },
    { title: 'Empathy and User Research', topics: ['Computational empathy', 'Qualitative and quantitative research', 'Field observation and AEIOU', 'User interviews', 'Explicit and implicit needs', 'Pain points', 'Personas and empathy maps'], verified: true },
    { title: 'Ideation and Concept Selection', topics: ['Divergent and convergent thinking', 'Brainstorming and SCAMPER', 'Mind mapping and reverse thinking', 'Idea clustering', 'Feasibility and relevance', 'Screening and prioritisation'], verified: true },
    { title: 'Prototyping and Wireframing', topics: ['Prototyping philosophy', 'Rapid learning', 'Low- and high-fidelity prototypes', 'Paper prototypes and storyboards', 'Digital wireframes', 'User flows and MVP'], verified: true },
    { title: 'User Testing and Experience Evaluation', topics: ['Neutral user testing', 'Task scenarios', 'Feedback capture', 'Customer journey mapping', 'Touchpoints and pain points', 'Usability, navigation and accessibility'], verified: true },
    { title: 'Iteration, Communication and Final Project', topics: ['Design iteration and feedback analysis', 'Redesign and pivoting', 'Continuous improvement', 'Product presentation', 'NABC model and elevator pitch', 'Technical design case study', 'Final project presentation'], verified: true },
  ],
}

export const subjects: Subject[] = courseDefinitions.map(([code, name, description, accent, icon]) => ({
  code, name, description, accent, icon,
  units: syllabusUnits[code].map((unit, index) => ({
    number: index + 1, title: unit.title, topics: unit.topics, verified: unit.verified,
  })),
}))

export const getSubject = (code: CourseCode) => subjects.find(subject => subject.code === code)!
export const syllabusNotice = 'Unit titles and topics follow the uploaded Session 2026–27 syllabi where available. CSE423 titles remain provisional pending confirmation against a complete official syllabus.'
