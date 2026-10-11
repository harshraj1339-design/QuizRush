import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Check, Info, Search, X, Zap } from 'lucide-react'
import type { Attempt, CourseCode, QuizSession, Student } from './types'
import { subjects } from './data/subjects'
import { calculateResult } from './services/quiz'
import { getCachedAttempts, mergeAttempts, readStorage, writeStorage } from './services/storage'
import { markQuestionsUsed } from './services/questionUsage'
import { fetchCloudAttempts, fetchCloudProgress, fetchCloudStudent, saveCloudAttempt, saveCloudProgress } from './services/cloudProgress'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import Onboarding from './components/Onboarding'
import Shell from './components/Shell'
import Dashboard from './components/Dashboard'
import SubjectSetup from './components/SubjectSetup'
import QuizView from './components/QuizView'
import Results, { AnswerReview } from './components/Results'
import History from './components/History'
import Profile from './components/Profile'
import AdminPanel from './components/AdminPanel'
import { EmptyState, Modal, SubjectCard, SubjectIcon } from './components/Common'

const readRoute = () => window.location.hash.slice(1) || '/dashboard'

export default function App() {
  const [student, setStudent] = useState<Student | null>(null)
  const [route, setRoute] = useState(readRoute)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [active, setActive] = useState<QuizSession | null>(null)
  const [dark, setDark] = useState(() => readStorage<boolean>('dark', false) === true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [setupSeed, setSetupSeed] = useState<{ code: CourseCode; units: number[] } | null>(null)
  const finishedIds = useRef(new Set<string>())

  useEffect(() => {
    function changeRoute() { setRoute(readRoute()); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', changeRoute)
    const storageError = () => setMessage('Browser storage is full or blocked. Your session works for now, but changes may not survive a refresh.')
    window.addEventListener('quizrush-storage-error', storageError)
    return () => { window.removeEventListener('hashchange', changeRoute); window.removeEventListener('quizrush-storage-error', storageError) }
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; writeStorage('dark', dark) }, [dark])
  useEffect(() => { writeStorage('attempts', attempts) }, [attempts])
  useEffect(() => { if (active) writeStorage('active', active) }, [active])
  useEffect(() => {
    document.title = 'QuizRush — Revise Fast. Score High.'
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [route])
  useEffect(() => {
    let cancelled = false
    async function restoreAccount() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user || cancelled) return
        const profile = await fetchCloudStudent(session.user.id)
        if (!profile || cancelled) return
        const [cloudAttempts, cloudProgress] = await Promise.all([
          fetchCloudAttempts(session.user.id),
          fetchCloudProgress(session.user.id),
        ])
        if (cancelled) return
        setStudent(profile)
        setAttempts(cloudAttempts)
        writeStorage('student', profile)
        writeStorage('attempts', cloudAttempts)
        writeStorage('question-usage', cloudProgress.question_usage)
        writeStorage('bookmarkedQuestions', cloudProgress.bookmarked_questions)
        const savedSession = cloudProgress.active_session
        if (savedSession && savedSession.registration === profile.registration && Date.now() < savedSession.startedAt + savedSession.durationMinutes * 60000) {
          setActive(savedSession)
          writeStorage('active', savedSession)
        } else {
          setActive(null)
          writeStorage('active', null)
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not restore your saved progress.')
      } finally { if (!cancelled) setLoading(false) }
    }
    void restoreAccount()
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    if (student?.userId && active) {
      void saveCloudProgress(student.userId, { active_session: active }).catch(() => setMessage('Your latest quiz progress could not sync. Check your connection.'))
    }
  }, [student?.userId, active])

  const navigate = useCallback((path: string) => {
    if (window.location.hash === `#${path}`) { setRoute(path); window.scrollTo({ top: 0 }) }
    else window.location.hash = path
  }, [])

  function saveProfile(value: Student) {
    writeStorage('student', value)
    const firstVisit = !student
    setStudent(value)
    if (firstVisit) navigate('/dashboard')
  }
  function startQuiz(session: QuizSession) { writeStorage('active', session); setActive(session); setQuickOpen(false); window.scrollTo({ top: 0 }) }
  const finishQuiz = useCallback((session: QuizSession) => {
    if (finishedIds.current.has(session.id)) return
    finishedIds.current.add(session.id)
    markQuestionsUsed(session)
    if (student?.userId) {
      const questionUsage = readStorage<Record<string, string[]>>('question-usage', {})
      void saveCloudProgress(student.userId, { question_usage: questionUsage }).catch(() => setMessage('Question practice progress could not sync.'))
    }
    const result = calculateResult(session)
    setAttempts(current => mergeAttempts(current, [result]))
    writeStorage('attempts', mergeAttempts(getCachedAttempts(), [result]))
    if (student?.userId) void saveCloudAttempt(student.userId, result).catch(() => setMessage('Your result could not sync to your account. Please check your connection.'))
    if (student?.userId) void saveCloudProgress(student.userId, { active_session: null }).catch(() => setMessage('Your completed quiz was saved locally but cloud progress could not update.'))
    writeStorage('active', null)
    setActive(null)
    navigate(`/results/${result.id}`)
    if (Date.now() >= session.startedAt + session.durationMinutes * 60000) setMessage('Time’s up. Your quiz has been submitted automatically with your saved answers.')
  }, [navigate, student?.userId])
  function exitQuiz() { writeStorage('active', null); setActive(null); if (student?.userId) void saveCloudProgress(student.userId, { active_session: null }).catch(() => setMessage('Could not clear the saved quiz session.')); navigate('/subjects') }

  const visibleAttempts = attempts.filter(attempt => attempt.registration === student?.registration)
  const parts = route.split('/').filter(Boolean)
  const selectedCode = subjects.find(subject => subject.code === parts[1])?.code
  const result = visibleAttempts.find(attempt => attempt.id === parts[1])
  const notification = message && <div className="toast" role="status"><Info size={19} /><p>{message}</p><button aria-label="Dismiss notice" className="icon-button" onClick={() => setMessage('')}><X size={17} /></button></div>
  if (route.split('/').filter(Boolean)[0] === 'admin') return <><AdminPanel />{notification}</>
  if (!student) return <><Onboarding onSave={saveProfile} />{notification}</>
  if (active) return <><QuizView session={active} onChange={setActive} onFinish={finishQuiz} onExit={exitQuiz} userId={student.userId} />{notification}</>

  let content
  if (parts[0] === 'subjects') {
    const filtered = subjects.filter(subject => `${subject.code} ${subject.name}`.toLowerCase().includes(subjectSearch.toLowerCase()))
    content = <><section className="page-heading"><div><span className="eyebrow">YOUR NEXT STUDY SESSION</span><h1>Find your focus.</h1><p>Pick a subject, choose your units, and make a little progress.</p></div></section><div className="subjects-toolbar"><div className="input-with-icon"><Search size={17} /><input aria-label="Search subjects" placeholder="Search a subject or course code…" value={subjectSearch} onChange={event => setSubjectSearch(event.target.value)} /></div></div><div className="subject-grid full-subject-grid">{filtered.map(subject => <SubjectCard key={subject.code} subject={subject} attempts={visibleAttempts} onClick={() => { setSetupSeed(null); navigate(`/subject/${subject.code}`) }} />)}</div>{!filtered.length && <EmptyState title="No subjects found" description="Try a course code or a different subject name." action={<button className="button secondary" onClick={() => setSubjectSearch('')}>Clear Search</button>} />}</>
  } else if (parts[0] === 'subject' && selectedCode) {
    content = <SubjectSetup key={`${selectedCode}-${setupSeed?.code === selectedCode ? setupSeed.units.join('-') : 'new'}`} code={selectedCode} registration={student.registration} initialUnits={setupSeed?.code === selectedCode ? setupSeed.units : undefined} onStart={startQuiz} onBack={() => navigate('/subjects')} />
  } else if (parts[0] === 'history') {
    content = <History attempts={visibleAttempts} navigate={navigate} loading={loading} />
  } else if (parts[0] === 'profile') {
    content = <Profile key={student.registration} student={student} onSave={saveProfile} onRestart={() => { writeStorage('student', null); writeStorage('active', null); if (student.userId) void supabase.auth.signOut(); setStudent(null); setActive(null); navigate('/dashboard') }} />
  } else if (parts[0] === 'results' || parts[0] === 'review') {
    content = result ? parts[0] === 'results' ? <Results attempt={result} navigate={navigate} practiceAgain={() => { setSetupSeed({ code: result.courseCode, units: result.units }); navigate(`/subject/${result.courseCode}`) }} /> : <AnswerReview attempt={result} navigate={navigate} /> : <section className="panel"><EmptyState title={loading ? 'Loading your quiz…' : 'This quiz isn’t available here'} description={loading ? 'Checking anonymous history for this browser.' : 'The attempt may belong to a different local profile or device. Your current history is a good place to start.'} action={<button className="button primary" onClick={() => navigate('/history')}>Open Quiz History<ArrowRight size={16} /></button>} /></section>
  } else {
    content = <Dashboard student={student} attempts={visibleAttempts} navigate={path => { setSetupSeed(null); navigate(path) }} quickQuiz={() => setQuickOpen(true)} />
  }
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus() }}>Skip to content</a><Shell student={student} route={route} navigate={path => { setSetupSeed(null); navigate(path) }} dark={dark} toggleTheme={() => setDark(!dark)} onLogout={() => { writeStorage('student', null); writeStorage('active', null); void supabase.auth.signOut(); setStudent(null); setActive(null); setQuickOpen(false); window.location.hash = ''; setRoute('/'); window.scrollTo({ top: 0 }) }}>{content}</Shell>{notification}{quickOpen && <Modal title="What are we practicing today?" onClose={() => setQuickOpen(false)}><p>A fresh 25-question quiz starts with your subject. Choose your units and time limit on the next screen.</p><div className="quick-subjects">{subjects.map(subject => <button key={subject.code} onClick={() => { setQuickOpen(false); setSetupSeed(null); navigate(`/subject/${subject.code}`) }}><SubjectIcon subject={subject} /><div><span>{subject.code}</span><strong>{subject.name}</strong></div><ArrowRight size={17} /></button>)}</div><p className="quick-footer"><Zap size={14} />One small session. One big step forward.<Check size={14} /></p></Modal>}</>
}
