import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Info, Layers, Play, RotateCcw, Sparkles } from 'lucide-react'
import type { CourseCode, QuizSession } from '../types'
import { getSubject, romanUnits, syllabusNotice } from '../data/subjects'
import { createQuiz, getQuestions, QUIZ_LENGTH } from '../services/quiz'
import { SubjectIcon } from './Common'

export default function SubjectSetup({ code, registration, onStart, onBack, initialUnits }: { code: CourseCode; registration: string; onStart: (session: QuizSession) => void; onBack: () => void; initialUnits?: number[] }) {
  const subject = getSubject(code)
  const [unitCount, setUnitCount] = useState<number | null>(initialUnits?.length || null)
  const [selectedUnits, setSelectedUnits] = useState<number[]>(initialUnits || [])
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const available = getQuestions(code, selectedUnits).length
  const canStart = unitCount !== null && selectedUnits.length === unitCount && available >= QUIZ_LENGTH && Number.isInteger(duration) && duration >= 1 && duration <= 120
  function toggleUnit(number: number) {
    setError('')
    if (selectedUnits.includes(number)) setSelectedUnits(selectedUnits.filter(unit => unit !== number))
    else if (unitCount && selectedUnits.length < unitCount) setSelectedUnits([...selectedUnits, number])
  }
  function start() {
    try { onStart(createQuiz(code, selectedUnits, duration, registration)) } catch (caught) { setError(caught instanceof Error ? caught.message : 'Your quiz could not be prepared. Please try again.') }
  }
  return <>
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} />Back to subjects</button><section className="page-heading subject-heading"><div className="subject-title"><SubjectIcon subject={subject} size={30} /><div><span className="course-code">{subject.code} · SEMESTER 3</span><h1>{subject.name}</h1><p>{subject.description}</p></div></div></section>
    <div className="notice syllabus-notice"><Info size={19} /><div><strong>Syllabus verification pending</strong><p>{syllabusNotice} Demo topics below describe the sample questions only.</p></div></div>
    <div className="setup-layout"><div className="setup-steps"><section className="panel setup-panel"><div className="step-heading"><span className="step-number">01</span><div><h2>How many units would you like to practice?</h2><p>Choose the size of your revision session first.</p></div></div><div className="unit-count-options">{[1, 2, 3, 4, 5, 6].map(count => <button key={count} className={`unit-count ${unitCount === count ? 'selected' : ''}`} aria-pressed={unitCount === count} onClick={() => { setUnitCount(count); setSelectedUnits([]); setError('') }}><strong>{count}</strong><span>{count === 1 ? 'unit' : 'units'}</span></button>)}</div></section>
      {unitCount !== null ? <section className="panel setup-panel"><div className="step-heading"><span className="step-number">02</span><div><h2>Make it your own</h2><p>Select exactly {unitCount} {unitCount === 1 ? 'unit' : 'units'}. They don’t need to be consecutive.</p></div></div><div className="unit-selection-heading"><span>{selectedUnits.length} of {unitCount} selected</span><div>{unitCount === 6 && <button className="text-button" onClick={() => setSelectedUnits([1, 2, 3, 4, 5, 6])}>Select All</button>}<button className="text-button" disabled={!selectedUnits.length} onClick={() => setSelectedUnits([])}><RotateCcw size={13} />Clear</button></div></div><div className="unit-grid">{subject.units.map(unit => {
        const questions = getQuestions(code, [unit.number])
        const topics = [...new Set(questions.map(question => question.topic))]
        const selected = selectedUnits.includes(unit.number)
        return <button key={unit.number} className={`unit-card ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={!selected && selectedUnits.length >= unitCount} onClick={() => toggleUnit(unit.number)}><div><span className="unit-roman">UNIT {romanUnits[unit.number - 1]}</span><span className="unit-checkbox">{selected && <Check size={14} />}</span></div><h3>{unit.verified ? unit.title : 'Syllabus title pending'}</h3><p>{unit.verified ? unit.topics.join(' · ') : `Demo topics: ${topics.join(' · ')}`}</p><span className="unit-question-count"><BookOpen size={13} />{questions.length} demo questions</span></button>
      })}</div></section> : <div className="setup-waiting"><Layers size={30} /><h3>A focused session starts with a choice.</h3><p>Choose a unit count above to see your practice options.</p></div>}
      <div className="setup-tip"><Sparkles size={19} /><p><strong>A little heads-up</strong><br />This demo has 25 questions per subject. Select all six units to start a full quiz. Smaller selections remain unavailable until their banks reach 25 unique questions.</p></div>
    </div><aside className="panel quiz-config"><span className="eyebrow">YOUR PRACTICE PLAN</span><h2>Let’s get you ready.</h2><p>Focused practice. Immediate clarity.</p><div className="config-subject"><SubjectIcon subject={subject} /><div><strong>{subject.code}</strong><span>{subject.name}</span></div></div><div className="config-detail"><span><Layers size={16} />Selected units</span><strong>{selectedUnits.length ? selectedUnits.slice().sort((first, second) => first - second).map(unit => romanUnits[unit - 1]).join(', ') : 'Not selected'}</strong></div><div className="config-detail"><span><BookOpen size={16} />Quiz length</span><strong>25 questions</strong></div><div className="config-detail"><span><CheckCircle2 size={16} />Eligible questions</span><strong>{available}</strong></div><label className="duration-label" htmlFor="quiz-duration"><Clock3 size={16} />Time limit <span>(minutes)</span></label><input id="quiz-duration" type="number" value={Number.isNaN(duration) ? '' : duration} min="1" max="120" step="1" onChange={event => setDuration(event.target.valueAsNumber)} aria-invalid={!Number.isInteger(duration) || duration < 1 || duration > 120} /><span className="field-help">Choose 1–120 minutes. 30 is a good starting point.</span>
      {(!Number.isInteger(duration) || duration < 1 || duration > 120) && <p className="field-error" role="alert">Enter a whole number between 1 and 120 minutes.</p>}
      {selectedUnits.length > 0 && available < 25 && <div className="eligibility-warning" role="status"><Info size={16} /><p><strong>{available} questions available.</strong> You need 25 unique questions. Add more units to continue.</p></div>}
      {unitCount !== null && selectedUnits.length !== unitCount && <p className="selection-help">Select {unitCount - selectedUnits.length} more {unitCount - selectedUnits.length === 1 ? 'unit' : 'units'} to finish your setup.</p>}
      {error && <p className="field-error" role="alert">{error}</p>}<button className="button primary" disabled={!canStart} onClick={start}><Play size={16} fill="currentColor" />Start Quiz<ArrowRight size={16} /></button><p className="config-footnote"><Check size={13} />Answers include instant explanations</p></aside></div>
  </>
}
