import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Info, Layers, Play, RotateCcw } from 'lucide-react'
import type { CourseCode, QuizSession } from '../types'
import { getSubject, romanUnits, syllabusNotice } from '../data/subjects'
import { createQuiz, getQuestions, QUIZ_LENGTH } from '../services/quiz'
import { SubjectIcon } from './Common'

export default function SubjectSetup({ code, registration, onStart, onBack, initialUnits }: { code: CourseCode; registration: string; onStart: (session: QuizSession) => void; onBack: () => void; initialUnits?: number[] }) {
  const subject = getSubject(code)
  const [selectedUnits, setSelectedUnits] = useState<number[]>(initialUnits || [])
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const available = getQuestions(code, selectedUnits).length
  const canStart = selectedUnits.length > 0 && available >= QUIZ_LENGTH && Number.isInteger(duration) && duration >= 1 && duration <= 120

  function toggleUnit(number: number) {
    setError('')
    setSelectedUnits(current => current.includes(number) ? current.filter(unit => unit !== number) : [...current, number])
  }

  function start() {
    try {
      onStart(createQuiz(code, selectedUnits, duration, registration))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your quiz could not be prepared. Please try again.')
    }
  }

  return <>
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} />Back to subjects</button>
    <section className="page-heading subject-heading">
      <div className="subject-title"><SubjectIcon subject={subject} size={30} /><div><span className="course-code">{subject.code}</span><h1>{subject.name}</h1><p>{subject.description}</p></div></div>
    </section>
    <div className="notice syllabus-notice"><Info size={19} /><div><strong>Unit-wise syllabus guide</strong><p>{syllabusNotice}</p></div></div>
    <div className="setup-layout">
      <div className="setup-steps">
        <section className="panel setup-panel">
          <div className="step-heading"><span className="step-number">01</span><div><h2>Select units to practice</h2><p>Choose one or more units, then start your quiz.</p></div></div>
          <div className="unit-selection-heading"><span>{selectedUnits.length} {selectedUnits.length === 1 ? 'unit' : 'units'} selected</span><div><button className="text-button" onClick={() => { setSelectedUnits(subject.units.map(unit => unit.number)); setError('') }}>Select All</button><button className="text-button" disabled={!selectedUnits.length} onClick={() => setSelectedUnits([])}><RotateCcw size={13} />Clear</button></div></div>
          <div className="unit-grid">{subject.units.map(unit => {
            const questions = getQuestions(code, [unit.number])
            const topics = [...new Set(questions.map(question => question.topic))]
            const selected = selectedUnits.includes(unit.number)
            return <button key={unit.number} className={`unit-card ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => toggleUnit(unit.number)}><div><span className="unit-roman">UNIT {romanUnits[unit.number - 1]}</span><span className="unit-checkbox">{selected && <Check size={14} />}</span></div><h3>{unit.title}</h3><p className="unit-topics">{unit.topics.slice(0, 5).join(' · ')}</p><span className="unit-question-count"><BookOpen size={13} />{questions.length} questions</span></button>
          })}</div>
        </section>
      </div>
      <aside className="panel quiz-config"><span className="eyebrow">YOUR PRACTICE PLAN</span><h2>Ready to quiz?</h2><p>Choose your units and start practising.</p><div className="config-subject"><SubjectIcon subject={subject} /><div><strong>{subject.code}</strong><span>{subject.name}</span></div></div><div className="config-detail"><span><Layers size={16} />Selected units</span><strong>{selectedUnits.length ? selectedUnits.slice().sort((a, b) => a - b).map(unit => romanUnits[unit - 1]).join(', ') : 'None'}</strong></div><div className="config-detail"><span><BookOpen size={16} />Quiz length</span><strong>{QUIZ_LENGTH} questions</strong></div><div className="config-detail"><span><CheckCircle2 size={16} />Available questions</span><strong>{available}</strong></div><label className="duration-label" htmlFor="quiz-duration"><Clock3 size={16} />Time limit <span>(minutes)</span></label><input id="quiz-duration" type="number" value={Number.isNaN(duration) ? '' : duration} min="1" max="120" step="1" onChange={event => setDuration(event.target.valueAsNumber)} aria-invalid={!Number.isInteger(duration) || duration < 1 || duration > 120} /><span className="field-help">Choose 1–120 minutes.</span>{(!Number.isInteger(duration) || duration < 1 || duration > 120) && <p className="field-error" role="alert">Enter a whole number between 1 and 120 minutes.</p>}{selectedUnits.length > 0 && available < QUIZ_LENGTH && <div className="eligibility-warning" role="status"><Info size={16} /><p><strong>{available} questions available.</strong> Select more units to reach {QUIZ_LENGTH} questions.</p></div>}{error && <p className="field-error" role="alert">{error}</p>}<button className="button primary" disabled={!canStart} onClick={start}><Play size={16} fill="currentColor" />Start Quiz<ArrowRight size={16} /></button><p className="config-footnote"><Check size={13} />Answers include instant explanations</p></aside>
    </div>
  </>
}
