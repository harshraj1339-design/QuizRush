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

// Unit names and topic summaries are based on the supplied Session 2026–27 syllabus PDFs.
// CSE423 uses the available course notes as a provisional guide; confirm against its official syllabus.
const unitDetails: Record<CourseCode, Array<{ title: string; topics: string[] }>> = {
  CSE205: [
    { title: 'Foundations, Arrays & Complexity', topics: ['Big-O, Omega and Theta notation', 'Time–space trade-offs', 'Array representation and operations', 'Bubble, insertion and selection sort', 'Linear and binary search'] },
    { title: 'Linked Lists', topics: ['Memory representation and allocation', 'Traversal, insertion and deletion', 'Grounded and circular header lists', 'Doubly linked lists', 'Linked-list operations'] },
    { title: 'Stacks & Queues', topics: ['Array and linked-list implementations', 'Push, pop and queue operations', 'Polish notation and expression evaluation', 'Priority queues', 'Deques'] },
    { title: 'Recursion & Trees', topics: ['Recursive problem solving', 'Binary and extended trees', 'Binary search tree operations', 'Tree traversals', 'Tower of Hanoi, merge sort and quicksort'] },
    { title: 'Heaps & Hashing', topics: ['Heap insertion and deletion', 'Heap sort', 'Hash functions and hash tables', 'Separate chaining', 'Linear probing, quadratic probing and double hashing'] },
    { title: 'Graphs & Shortest Paths', topics: ['Graph representation and traversal', 'Breadth-first search (BFS)', 'Depth-first search (DFS)', 'Dijkstra’s algorithm', 'Bellman–Ford and Floyd–Warshall'] },
  ],
  CSE202: [
    { title: 'C++ Foundations, Classes & Functions', topics: ['OOP concepts and programming paradigms', 'Classes, objects and access control', 'Static and inline members', 'Function overloading and default arguments', 'Friend functions, references and recursion'] },
    { title: 'Pointers, Arrays & Strings', topics: ['Pointer arithmetic and pointer-to-pointer', 'Dangling, wild and null pointers', 'Object pointers and the this pointer', 'Multidimensional arrays and arrays of objects', 'C++ string class and member functions'] },
    { title: 'File Handling, Constructors & Destructors', topics: ['File streams and file modes', 'Sequential and random access', 'Binary file operations', 'Default, parameterized and copy constructors', 'Destructors and initializer lists'] },
    { title: 'Operator Overloading & Inheritance', topics: ['Unary and binary operator overloading', 'Type conversion between classes and basic types', 'Base and derived classes', 'Inheritance types and access modes', 'Virtual base classes, aggregation and composition'] },
    { title: 'Dynamic Memory & Polymorphism', topics: ['new and delete operators', 'Compile-time and run-time polymorphism', 'Virtual functions and destructors', 'Abstract classes and pure virtual functions', 'Memory leaks and allocation failures'] },
    { title: 'Exceptions, Templates & STL', topics: ['Exception handling and rethrowing', 'Throw and catch mechanisms', 'Function and class templates', 'Templates with inheritance', 'STL containers, algorithms and iterators'] },
  ],
  CSE306: [
    { title: 'Network Fundamentals & Models', topics: ['Network types and topologies', 'Hubs, switches and routers', 'Network architecture, layers and protocols', 'OSI reference model', 'TCP/IP protocol suite'] },
    { title: 'Physical & Data Link Layers', topics: ['Data communication basics', 'Guided and unguided transmission media', 'Transmission impairment and performance', 'Elementary data-link protocols', 'Hamming code, CRC, parity and checksum'] },
    { title: 'MAC Sublayer & IP Addressing', topics: ['ALOHA and CSMA protocols', 'CSMA/CD and Ethernet', 'Classful and classless addressing', 'IPv4 addressing', 'Subnetting'] },
    { title: 'Routing, IP Headers & NAT', topics: ['Shortest-path routing', 'Distance-vector routing', 'Link-state routing', 'IPv4 and IPv6 headers and addressing', 'Network Address Translation (NAT)'] },
    { title: 'Transport Layer & Congestion Control', topics: ['Transport and network layer relationship', 'Transport-layer services and performance', 'TCP header and handshake', 'UDP header', 'Congestion-control algorithms and TCP congestion control'] },
    { title: 'Application & Wireless Networks', topics: ['Domain Name System (DNS)', 'Email and FTP', 'Wireless network fundamentals', 'IEEE 802.11a/b/g/n standards', 'Bluetooth architecture and layers'] },
  ],
  CSE423: [
    { title: 'Virtualization Fundamentals', topics: ['Purpose and benefits of virtualization', 'Virtual machines and virtual machine monitors', 'Hypervisors and resource allocation', 'Server and desktop virtualization', 'Isolation and consolidation'] },
    { title: 'x86 Hardware Virtualization', topics: ['x86 privilege rings', 'Full virtualization and binary translation', 'Hardware-assisted virtualization', 'Guest operating systems', 'VMware, Hyper-V, VirtualBox and KVM'] },
    { title: 'Virtual Networks & Storage', topics: ['Network virtualization', 'Virtual LANs (VLANs)', 'Virtual Storage Area Networks (VSANs)', 'Isolation and segmentation', 'Virtualized infrastructure management'] },
    { title: 'Cluster, Grid & Cloud Computing', topics: ['Cluster computing', 'Grid computing', 'Cloud computing fundamentals', 'On-demand compute and storage', 'Virtualization as a cloud foundation'] },
    { title: 'Cloud Models & Services', topics: ['Infrastructure as a Service (IaaS)', 'Platform as a Service (PaaS)', 'Software as a Service (SaaS)', 'Cloud deployment models', 'NIST and Cloud Cube models'] },
    { title: 'Cloud Applications & Management', topics: ['Cloud resource provisioning', 'Scalability and elasticity', 'Cloud security fundamentals', 'Data analytics in cloud environments', 'Availability, backup and disaster recovery'] },
  ],
  MTH401: [
    { title: 'Logic & Mathematical Proofs', topics: ['Propositional logic and equivalences', 'Quantifiers', 'Direct proof and contraposition', 'Vacuous and trivial proofs', 'Contradiction, counterexamples and proof errors'] },
    { title: 'Recurrence Relations & Generating Functions', topics: ['Recurrence relations and modelling', 'Homogeneous linear recurrences', 'Constant-coefficient recurrences', 'Inverse-operator method', 'Generating functions'] },
    { title: 'Counting Principles & Relations', topics: ['Inclusion–exclusion principle', 'Pigeonhole principle', 'Relations and their properties', 'Equivalence relations and composition', 'Partial orders, lattices and Hasse diagrams'] },
    { title: 'Graph Theory I', topics: ['Graph terminology and special graphs', 'Bipartite and complete graphs', 'Adjacency and incidence matrices', 'Graph isomorphism and connectivity', 'Dijkstra’s shortest-path algorithm'] },
    { title: 'Graph Theory II & Trees', topics: ['Planar graphs and Euler’s formula', 'Graph colouring and chromatic number', 'Rooted and spanning trees', 'Minimum spanning trees and decision trees', 'Infix, prefix and postfix notation'] },
    { title: 'Number Theory & Cryptography', topics: ['Divisibility and modular arithmetic', 'Prime numbers, GCD and LCM', 'Euclidean algorithm and Bezout’s lemma', 'Linear congruences and Chinese remainder theorem', 'Caesar cipher, affine cipher and Fermat’s little theorem'] },
  ],
  INT335: [
    { title: 'Learning, Creativity & Design Thinking', topics: ['Focused and diffuse thinking', 'VARK learning model', 'Functional fixedness and cognitive blocks', 'Creativity, invention and innovation', 'Stanford d.school, IDEO and design case studies'] },
    { title: 'Empathy, Observation & Problem Discovery', topics: ['Qualitative and quantitative research', 'Field observation and AEIOU framework', 'User interviews and inquiry', 'Explicit and implicit user needs', 'Personas, pain points and empathy maps'] },
    { title: 'Ideation & Creative Problem Solving', topics: ['Divergent and convergent thinking', 'Brainstorming and idea generation', 'SCAMPER and mind mapping', 'Reverse thinking and idea clustering', 'Screening matrices and prioritisation'] },
    { title: 'Product Design & Prototyping', topics: ['Prototyping philosophy and rapid learning', 'Low- and high-fidelity prototypes', 'Paper prototyping and storyboards', 'Digital wireframing and user flows', 'Minimum viable product (MVP)'] },
    { title: 'Testing, Validation & User Experience', topics: ['Neutral user testing', 'Task scenarios and show-don’t-tell testing', 'Feedback capture matrix', 'Customer journey and touchpoints', 'Usability, navigation and accessibility'] },
    { title: 'Iteration, Redesign & Presentation', topics: ['Design iteration and feedback analysis', 'Design refactoring and redesign', 'Strategic pivoting and continuous improvement', 'NABC model and elevator pitch', 'Case study and final project presentation'] },
  ],
}

export const subjects: Subject[] = courseDefinitions.map(([code, name, description, accent, icon]) => ({
  code, name, description, accent, icon,
  units: unitDetails[code].map((unit, index) => ({
    number: index + 1,
    title: unit.title,
    topics: unit.topics,
    verified: code !== 'CSE423',
  })),
}))

export const getSubject = (code: CourseCode) => subjects.find(subject => subject.code === code)!
export const syllabusNotice = 'Unit titles and topic summaries follow the available Session 2026–27 syllabi. CSE423 titles and topics are provisional, based on available course notes, pending confirmation against its official syllabus.'
