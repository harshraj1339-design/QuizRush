import type { ReactNode } from 'react'
import { ArrowRight, BookOpenCheck, Check, Clock3, ListChecks, Target, TrendingUp, Zap } from 'lucide-react'
import type { Attempt, Student } from '../types'
import { getSubject, subjects } from '../data/subjects'
import { RevisionArt } from './Brand'
import { EmptyState, SubjectCard, SubjectIcon } from './Common'

export default function Dashboard({ student, attempts, navigate, quickQuiz }: { student: Student; attempts: Attempt[]; navigate: (path: string) => void; quickQuiz: () => void }) {
  const average = attempts.length ? Math.round(attempts.reduce((total, attempt) => total + attempt.accuracy, 0) / attempts.length) : null
  const correct = attempts.reduce((total, attempt) => total + attempt.correct, 0)
  const totalMinutes = Math.floor(attempts.reduce((total, attempt) => total + attempt.timeTaken, 0) / 60)
  const coveredUnits = new Set(attempts.flatMap(attempt => attempt.questions.filter(question => attempt.answers[question.id]).map(question => `${attempt.courseCode}:${question.unitNumber}`))).size
  const recentCodes = [...new Set(attempts.map(attempt => attempt.courseCode))].slice(0, 2)
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return <>
    <section className="page-heading dashboard-heading"><div><h1>Hey, {student.name.split(' ')[0]} <span className="wave">👋</span></h1></div><div className="heading-date"><span>{date}</span><span><span className="tiny-dot" />{student.registration}</span></div></section>
    <div className="dashboard-feature-grid"><section className="revision-hero"><div className="hero-copy"><span className="hero-eyebrow"><Zap size={14} />MCQ PRACTICE</span><h2>Quick quiz.<br /><span>Clear progress.</span></h2><p>Test what you studied with focused MCQ practice.</p><button className="button primary" onClick={quickQuiz}><Zap size={16} fill="currentColor" />Start Quiz<ArrowRight size={17} /></button></div><RevisionArt /></section>
      <section className="focus-card"><div className="card-section-heading"><h3>Your preparation</h3><span className="focus-icon"><Target size={19} /></span></div><div className="coverage-ring" style={{ background: `conic-gradient(var(--primary) ${coveredUnits / 36 * 360}deg, var(--ring-track) 0deg)` }} role="img" aria-label={`${coveredUnits} of 36 units practiced`}><div><strong>{Math.round(coveredUnits / 36 * 100)}<span>%</span></strong><span>practiced</span></div></div><div className="focus-count"><span className="tiny-dot" />{coveredUnits} units practiced</div></section></div>
    <div className="metrics-grid"><Metric icon={<ListChecks size={21} />} label="Quizzes attempted" value={String(attempts.length)} note="" color="violet" /><Metric icon={<TrendingUp size={21} />} label="Average score" value={average === null ? '—' : `${average}%`} note="" color="blue" /><Metric icon={<Check size={21} />} label="Correct answers" value={String(correct)} note="" color="green" /><Metric icon={<Clock3 size={21} />} label="Time invested" value={`${totalMinutes}m`} note="" color="orange" /></div>
    <section className="subjects-section"><div className="section-heading"><div><h2>Your subjects</h2></div><button className="text-button" onClick={() => navigate('/subjects')}>View all subjects<ArrowRight size={16} /></button></div><div className="subject-grid">{subjects.map(subject => <SubjectCard key={subject.code} subject={subject} attempts={attempts} onClick={() => navigate(`/subject/${subject.code}`)} />)}</div></section>
    <section className="panel question-library-cta"><div><span className="eyebrow">FULL QUESTION BANK</span><h2>Browse every available question</h2><p>Search by subject, unit, question text, option, or explanation. Review correct answers at your own pace.</p></div><button className="button primary" onClick={() => navigate('/browse-questions')}><BookOpenCheck size={17} />Browse questions<ArrowRight size={16} /></button></section>

  </>
}

function Metric({ icon, label, value, note, color }: { icon: ReactNode; label: string; value: string; note: string; color: string }) {
  return <section className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${color}`}>{icon}</span></div><strong>{value}</strong><p>{note}</p></section>
}
