import { BookOpen, CheckCircle2, GraduationCap, Sparkles, Zap } from 'lucide-react'
import { Logo, RevisionArt } from './Brand'
import ProfileForm from './ProfileForm'
import type { Student } from '../types'

export default function Onboarding({ onSave }: { onSave: (student: Student) => void }) {
  return <main className="onboarding">
    <header className="onboarding-header"><Logo /><span className="onboarding-badge"><GraduationCap size={16} />Made for your next big exam</span></header>
    <div className="onboarding-body"><section className="welcome-story"><span className="eyebrow"><span className="tiny-dot" /> LESS PANIC. MORE PREP.</span><h1>Revise Fast.<br /><span>Score High.</span></h1><p className="welcome-description">Your last-minute revision partner.<br />Turn “where do I start?” into “I’ve got this.”</p><RevisionArt /><div className="welcome-features"><span><BookOpen size={17} />6 Semester 3 subjects</span><span><CheckCircle2 size={17} />Instant explanations</span><span><Zap size={17} />25-question practice</span></div></section>
      <section className="welcome-form-card"><span className="welcome-form-icon"><Sparkles size={24} /></span><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>Let’s get you<br />exam-ready.</h2><p>A few details, and you’re ready to rush.<br />No passwords. No unnecessary steps.</p><ProfileForm onSave={onSave} /><div className="welcome-form-bottom"><span className="tiny-dot" /> Semester 3 is available in this demo</div></section>
    </div><footer className="onboarding-footer"><span>© {new Date().getFullYear()} QuizRush. A little practice goes a long way.</span><span>Local profile · Anonymous progress · No account required</span></footer>
  </main>
}
