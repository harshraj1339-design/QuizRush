import { Logo } from './Brand'
import ProfileForm from './ProfileForm'
import type { Student } from '../types'

export default function Onboarding({ onSave }: { onSave: (student: Student) => void }) {
  return <main className="onboarding onboarding-clean">
    <header className="onboarding-header"><Logo /><span className="onboarding-badge">LPU STUDENTS</span></header>
    <div className="onboarding-body onboarding-body-clean">
      <section className="welcome-story welcome-story-clean">
        <span className="eyebrow">YOUR NEXT STUDY SESSION</span>
        <h1>Revise fast.<br /><span>Score high.</span></h1>
        <p className="welcome-description">Focused practice for your exams.<br />Make every minute count.</p>
      </section>
      <section className="welcome-form-card welcome-form-card-clean">
        <span className="eyebrow">GET STARTED</span>
        <h2>Create your student profile</h2>
        <p>For Lovely Professional University (LPU) students only.</p>
        <ProfileForm onSave={onSave} />
        <p className="onboarding-privacy">Your 8-digit registration number is saved in the QuizRush student directory. It does not verify your identity.</p>
      </section>
    </div>
    <footer className="onboarding-footer onboarding-footer-clean"><span>QuizRush · Revise Fast. Score High.</span></footer>
  </main>
}
