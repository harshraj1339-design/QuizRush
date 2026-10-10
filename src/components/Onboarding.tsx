import { GraduationCap } from 'lucide-react'
import { Logo } from './Brand'
import ProfileForm from './ProfileForm'
import type { Student } from '../types'

export default function Onboarding({ onSave }: { onSave: (student: Student) => void }) {
  return <main className="onboarding onboarding-clean">
    <header className="onboarding-header"><Logo /><span className="onboarding-badge"><GraduationCap size={16} />Semester 3</span></header>
    <div className="onboarding-body onboarding-body-clean">
      <section className="welcome-story welcome-story-clean">
        <span className="eyebrow">SEMESTER 3 · QUICK PRACTICE</span>
        <h1>Revise fast.<br /><span>Score high.</span></h1>
        <p className="welcome-description">Six subjects. Focused practice.<br />Make every minute count.</p>
      </section>
      <section className="welcome-form-card welcome-form-card-clean">
        <span className="eyebrow">GET STARTED</span>
        <h2>Your student profile</h2>
        <p>Enter your details to start practising.</p>
        <ProfileForm onSave={onSave} />
        <p className="onboarding-privacy">Your registration number is stored in the QuizRush student directory. It does not verify your identity.</p>
      </section>
    </div>
    <footer className="onboarding-footer onboarding-footer-clean"><span>QuizRush · Revise Fast. Score High.</span></footer>
  </main>
}
