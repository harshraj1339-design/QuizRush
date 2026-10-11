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
export const subjects: Subject[] = courseDefinitions.map(([code, name, description, accent, icon]) => ({
  code, name, description, accent, icon,
  units: romanUnits.map((roman, index) => ({
    number: index + 1, title: `Unit ${roman}`, topics: [], verified: false,
  })),
}))
export const getSubject = (code: CourseCode) => subjects.find(subject => subject.code === code)!
export const syllabusNotice = 'Unit topics are being aligned with official course documents. Please refer to your course materials for syllabus confirmation.'
