import { Logo } from './Brand'
import ProfileForm from './ProfileForm'
import type { Student } from '../types'

export default function Onboarding({ onSave }: { onSave: (student: Student) => void }) {
  return <main className="onboarding onboarding-clean">
    <header className="onboarding-header"><Logo /><span className="onboarding-badge">LPU STUDENTS</span></header>
    <div className="onboarding-body onboarding-body-clean">
      <section className="welcome-story welcome-story-clean">
        <span className="eyebrow">MCQ PRACTICE · QUICK QUIZZES</span>
        <h1>Study smart.<br /><span>Quiz fast.</span></h1>
        <p className="welcome-description">Finished studying? Test what you know.<br />Quick MCQ quizzes for your last-minute revision.</p>
      </section>
      <section className="welcome-form-card welcome-form-card-clean">
        <span className="eyebrow">GET STARTED</span>
        <h2>Start your quiz</h2>
        <p>For Lovely Professional University (LPU) students only.</p>
        <ProfileForm onSave={onSave} />
      </section>
    </div>
    <footer className="onboarding-footer onboarding-footer-clean"><span>QuizRush · Revise Fast. Score High.</span></footer>
  </main>
}
