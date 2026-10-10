import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Flag, Info, Lightbulb, LogOut, X, XCircle } from 'lucide-react'
import type { Question, QuizSession } from '../types'
import { getSubject, romanUnits } from '../data/subjects'
import { formatTime } from '../services/quiz'
import { Logo } from './Brand'
import { Modal } from './Common'

export function AnswerOptions({ question, selected, onAnswer, review = false }: { question: Question; selected?: string; onAnswer?: (id: string) => void; review?: boolean }) {
  const checked = !!selected || review
  return <div className="answer-options">{question.options.map((option, index) => {
    const isSelected = selected === option.id
    const isCorrect = checked && option.id === question.correctOptionId
    const isIncorrect = isSelected && !isCorrect
    const stateClass = isCorrect ? 'correct' : isIncorrect ? 'incorrect' : ''
    const content = <><span className="option-letter">{String.fromCharCode(65 + index)}</span><span className="option-text">{option.text}</span>{isCorrect ? <span className="answer-state"><span>{isSelected ? 'Your answer · Correct' : 'Correct answer'}</span><CheckCircle2 size={20} /></span> : isIncorrect ? <span className="answer-state"><span>Your answer · Incorrect</span><XCircle size={20} /></span> : null}</>
    return review ? <div key={option.id} className={`answer-option ${stateClass}`}>{content}</div> : <button key={option.id} className={`answer-option ${stateClass}`} disabled={!!selected} onClick={() => onAnswer?.(option.id)} aria-label={`${String.fromCharCode(65 + index)}. ${option.text}${isCorrect ? ', correct answer' : isIncorrect ? ', your incorrect answer' : ''}`}>{content}</button>
  })}</div>
}

export function Explanation({ question, selected, review = false }: { question: Question; selected?: string; review?: boolean }) {
  const correct = selected === question.correctOptionId
  return <div className={`explanation ${correct ? 'explanation-correct' : selected ? 'explanation-incorrect' : ''}`} role={review ? undefined : 'status'}><span className="explanation-icon"><Lightbulb size={20} /></span><div><strong>{!selected ? 'Unanswered — here’s the explanation' : correct ? 'Nice work. You got it right!' : 'A mistake today. A lesson for exam day.'}</strong><p>{question.explanation}</p><span>{question.topic} · Unit {romanUnits[question.unitNumber - 1]} · Demo assignment</span></div></div>
}

export default function QuizView({ session, onChange, onFinish, onExit }: { session: QuizSession; onChange: (session: QuizSession) => void; onFinish: (session: QuizSession) => void; onExit: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((session.startedAt + session.durationMinutes * 60000 - Date.now()) / 1000)))
  const [dialog, setDialog] = useState<'submit' | 'exit' | null>(null)
  const latestSession = useRef(session)
  latestSession.current = session
  const finished = useRef(false)
  const latestFinish = useRef(onFinish)
  latestFinish.current = onFinish
  useEffect(() => {
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((latestSession.current.startedAt + latestSession.current.durationMinutes * 60000 - Date.now()) / 1000))
      setRemaining(seconds)
      if (!seconds && !finished.current) { finished.current = true; latestFinish.current(latestSession.current) }
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])
  const subject = getSubject(session.courseCode)
  const question = session.questions[session.currentIndex]
  const selected = session.answers[question.id]
  const answered = session.questions.filter(item => session.answers[item.id]).length
  function answer(id: string) {
    if (session.answers[question.id] || remaining === 0 || Date.now() >= session.startedAt + session.durationMinutes * 60000) return
    onChange({ ...session, answers: { ...session.answers, [question.id]: id } })
  }
  function submit() {
    if (finished.current) return
    finished.current = true
    onFinish(latestSession.current)
  }
  return <div className="quiz-page"><header className="quiz-header"><Logo /><span className="quiz-header-caption">A little focus goes a long way.</span><button className="button ghost" onClick={() => setDialog('exit')}><LogOut size={16} />Exit Quiz</button></header>
    <main className="quiz-main"><section className="quiz-title-row"><div><span className="course-code">{subject.code} · PRACTICE QUIZ</span><h1>{subject.name}</h1><p>Units {session.units.map(unit => romanUnits[unit - 1]).join(', ')} <span>·</span> Original demo questions</p></div><div className={`quiz-timer ${remaining <= 60 ? 'timer-warning' : ''}`} role="timer" aria-label={`${formatTime(remaining)} remaining`}><Clock3 size={21} /><div><span>TIME REMAINING</span><strong>{formatTime(remaining)}</strong></div></div></section>
      <div className="quiz-layout"><section className="quiz-question-area"><div className="quiz-progress-info"><span>Question <strong>{session.currentIndex + 1}</strong> of 25</span><span>{answered} answered</span></div><div className="quiz-progress" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={25} aria-valuenow={answered}><span style={{ width: `${answered / 25 * 100}%` }} /></div>
        <article className="panel question-panel" key={question.id}><div className="question-tags"><span>Unit {romanUnits[question.unitNumber - 1]}</span><span>{question.topic}</span><span className="difficulty-tag">{question.difficulty}</span></div><h2>{question.text}</h2><p className="question-hint">Choose one answer. Feedback appears immediately.</p><AnswerOptions question={question} selected={selected} onAnswer={answer} />{selected && <Explanation question={question} selected={selected} />}</article>
        <div className="question-navigation"><button className="button secondary" disabled={session.currentIndex === 0} onClick={() => onChange({ ...session, currentIndex: session.currentIndex - 1 })}><ArrowLeft size={17} />Previous</button><span>{selected ? <><Check size={14} />Answer checked and saved</> : <><Info size={14} />You can skip and come back</>}</span><button className="button primary" disabled={session.currentIndex === 24} onClick={() => onChange({ ...session, currentIndex: session.currentIndex + 1 })}>Next Question<ArrowRight size={17} /></button></div>
      </section><aside className="panel question-navigator"><div className="navigator-title"><h2>Your question map</h2><Flag size={18} /></div><p>Jump to any question, anytime.</p><div className="question-number-grid">{session.questions.map((item, index) => {
        const answerId = session.answers[item.id]
        const state = answerId ? answerId === item.correctOptionId ? 'correct' : 'incorrect' : 'unanswered'
        return <button key={item.id} className={`question-number ${state} ${index === session.currentIndex ? 'current' : ''}`} aria-label={`Question ${index + 1}, ${state}${index === session.currentIndex ? ', current question' : ''}`} aria-current={index === session.currentIndex ? 'step' : undefined} onClick={() => onChange({ ...session, currentIndex: index })}>{index + 1}</button>
      })}</div><div className="navigator-legend"><span><Check size={12} className="legend-correct" />Correct</span><span><X size={12} className="legend-incorrect" />Incorrect</span><span><i />Unanswered</span></div><div className="navigator-summary"><strong>{answered}<span> / 25</span></strong><span>questions answered</span></div><button className="button primary submit-quiz" onClick={() => setDialog('submit')}>Submit Quiz<ArrowRight size={17} /></button><div className="navigator-tip"><Lightbulb size={18} /><p>This is practice, not pressure. Read the explanation — that’s where the learning happens.</p></div></aside></div>
    </main>{dialog && <Modal title={dialog === 'submit' ? 'Ready to see how you did?' : 'Leave this practice session?'} onClose={() => setDialog(null)}>{dialog === 'submit' ? <><p>You’ve answered <strong>{answered} of 25 questions.</strong>{answered < 25 && ` The remaining ${25 - answered} will be marked unanswered, not correct.`}</p><p>Your results and explanations will be available in Quiz History.</p><div className="modal-actions"><button className="button secondary" onClick={() => setDialog(null)}>Keep Practicing</button><button className="button primary" onClick={submit}>Submit Quiz<Check size={17} /></button></div></> : <><p>Answers from this unfinished quiz will be discarded. Your previously completed quizzes are safe.</p><div className="modal-actions"><button className="button secondary" onClick={() => setDialog(null)}>Stay in Quiz</button><button className="button danger" onClick={onExit}>Exit Quiz<LogOut size={16} /></button></div></>}</Modal>}
  </div>
}
