import { useMemo, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { CourseCode } from '../types'
import { subjects } from '../data/subjects'
import { getQuestions } from '../services/quiz'

const PAGE_SIZE = 50

export default function QuestionBrowser() {
  const [course, setCourse] = useState<CourseCode | 'ALL'>('ALL')
  const [unit, setUnit] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return subjects.flatMap(subject => getQuestions(subject.code).filter(question =>
      (course === 'ALL' || question.courseCode === course) &&
      (unit === 'ALL' || question.unitNumber === Number(unit)) &&
      (!normalized || [question.text, question.topic, question.explanation, ...question.options.map(option => option.text)].some(value => value.toLowerCase().includes(normalized)))
    ))
  }, [course, unit, search])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  function updateCourse(value: CourseCode | 'ALL') { setCourse(value); setUnit('ALL'); setPage(1) }
  return <div className="question-browser">
    <section className="page-heading"><div><span className="eyebrow">QUESTION LIBRARY</span><h1>Browse all questions</h1><p>Explore the complete question bank by subject, unit, or keyword. Correct answers and explanations are shown for revision.</p></div></section>
    <div className="notice"><BookOpen size={18}/><p><strong>{filtered.length.toLocaleString()} questions found</strong> across the available question banks. Questions are shown in pages of {PAGE_SIZE} to keep the browser responsive.</p></div>
    <section className="panel question-browser-filters">
      <label><span>Subject</span><select value={course} onChange={event => updateCourse(event.target.value as CourseCode | 'ALL')}><option value="ALL">All subjects</option>{subjects.map(subject => <option key={subject.code} value={subject.code}>{subject.code} — {subject.name}</option>)}</select></label>
      <label><span>Unit</span><select value={unit} onChange={event => { setUnit(event.target.value); setPage(1) }}><option value="ALL">All units</option>{[1,2,3,4,5,6].map(number => <option key={number} value={number}>Unit {number}</option>)}</select></label>
      <label className="question-browser-search"><span>Search</span><div className="input-with-icon"><Search size={17}/><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Search question, topic, option…"/></div></label>
    </section>
    <div className="question-browser-list">
      {visible.map((question, index) => {
        const subject = subjects.find(item => item.code === question.courseCode)!
        const correct = question.options.find(option => option.id === question.correctOptionId)
        return <article className="panel browser-question" key={question.id}>
          <div className="browser-question-meta"><span>{subject.code}</span><span>Unit {question.unitNumber}</span><span>{question.topic}</span><span>{question.difficulty}</span></div>
          <h2>{(currentPage - 1) * PAGE_SIZE + index + 1}. {question.text}</h2>
          <ol className="browser-options" type="A">{question.options.map(option => <li key={option.id} className={option.id === question.correctOptionId ? 'browser-correct' : ''}><span>{option.text}</span>{option.id === question.correctOptionId && <strong>Correct answer</strong>}</li>)}</ol>
          <div className="browser-explanation"><strong>Explanation</strong><p>{question.explanation}</p></div>
        </article>
      })}
      {!visible.length && <div className="panel"><h2>No questions match</h2><p>Try another subject or search term.</p><button className="button secondary" onClick={() => { setCourse('ALL'); setUnit('ALL'); setSearch(''); setPage(1) }}>Clear filters</button></div>}
    </div>
    <div className="question-browser-pagination"><span>Page {currentPage} of {pages} · {filtered.length.toLocaleString()} questions</span><div><button className="button secondary" disabled={currentPage <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={16}/>Previous</button><button className="button secondary" disabled={currentPage >= pages} onClick={() => setPage(value => Math.min(pages, value + 1))}>Next<ChevronRight size={16}/></button></div></div>
  </div>
}
