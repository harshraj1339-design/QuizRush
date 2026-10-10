import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowRight, BookOpen, Boxes, Braces, Cloud, Lightbulb, Network, Sigma, X } from 'lucide-react'
import type { Attempt, Subject } from '../types'
import { getQuestions } from '../services/quiz'

const icons = { structures: Boxes, code: Braces, network: Network, cloud: Cloud, math: Sigma, design: Lightbulb }
export function SubjectIcon({ subject, size = 23 }: { subject: Subject; size?: number }) {
  const Icon = icons[subject.icon as keyof typeof icons] || BookOpen
  return <span className={`subject-icon ${subject.accent}`}><Icon size={size} strokeWidth={1.8} /></span>
}

export function SubjectCard({ subject, attempts, onClick }: { subject: Subject; attempts: Attempt[]; onClick: () => void }) {
  const count = getQuestions(subject.code).length
  const subjectAttempts = attempts.filter(attempt => attempt.courseCode === subject.code)
  const best = subjectAttempts.length ? Math.max(...subjectAttempts.map(attempt => attempt.accuracy)) : 0
  return <button className="subject-card" onClick={onClick}>
    <div className="subject-card-top"><SubjectIcon subject={subject} /><span className="course-code">{subject.code}</span><ArrowRight className="subject-card-arrow" size={19} /></div>
    <h3>{subject.name}</h3><p>{subject.description}</p>
    <div className="subject-card-meta"><span><BookOpen size={14} />6 units</span><span>{count} questions</span></div>
    <div className="subject-card-bottom"><span>{subjectAttempts.length ? `${subjectAttempts.length} ${subjectAttempts.length === 1 ? 'quiz' : 'quizzes'} completed` : 'Ready when you are'}</span><span className={subjectAttempts.length ? 'progress-label' : ''}>{subjectAttempts.length ? `${best}% best` : 'Start practicing'}<ArrowRight size={13} /></span></div>
    <div className={`mini-progress ${subject.accent}`}><span style={{ width: `${best}%` }} /></div>
  </button>
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon">{icon || <BookOpen size={25} />}</span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return <dialog ref={dialog} className="modal" aria-labelledby="modal-title" onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === dialog.current) onClose() }}><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>{children}</dialog>
}

export function Donut({ correct, incorrect, unanswered, children, size = 200 }: { correct: number; incorrect: number; unanswered: number; children: ReactNode; size?: number }) {
  const total = correct + incorrect + unanswered
  const circumference = 2 * Math.PI * 78
  const counts = [correct, incorrect, unanswered]
  const colors = ['#25b17b', '#ef6474', '#e4e5ee']
  let offset = 0
  return <div className="donut" style={{ width: size, height: size }} role="img" aria-label={`${correct} correct, ${incorrect} incorrect, ${unanswered} unanswered`}>
    <svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="78" fill="none" stroke="#e4e5ee" strokeWidth="14" />{counts.map((count, index) => {
      const length = total ? count / total * circumference : 0
      const start = offset
      offset += length
      return <circle key={index} cx="90" cy="90" r="78" fill="none" stroke={colors[index]} strokeWidth="14" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-start} transform="rotate(-90 90 90)" />
    })}</svg><div className="donut-center">{children}</div>
  </div>
}
