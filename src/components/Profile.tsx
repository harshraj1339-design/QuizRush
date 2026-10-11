import { useState } from 'react'
import { RotateCcw, UserRound } from 'lucide-react'
import type { Student } from '../types'
import { Modal } from './Common'
import ProfileForm from './ProfileForm'

export default function Profile({ student, onSave, onRestart }: { student: Student; onSave: (student: Student) => void; onRestart: () => void }) {
  const [confirmRestart, setConfirmRestart] = useState(false)
  return <><section className="page-heading"><div><span className="eyebrow">MAKE YOURSELF AT HOME</span><h1>Your student profile</h1><p>A few details to keep your workspace personal.</p></div></section><div className="profile-layout"><section className="panel profile-edit"><div className="profile-panel-heading"><UserRound size={21} /><h2>Basic details</h2></div><p>Update your name or registration number below. Changing your registration number opens the history saved for that registration number in this browser.</p><ProfileForm initial={student} onSave={onSave} /></section><aside><section className="panel profile-summary"><span className="profile-large-avatar">{student.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span><h2>{student.name}</h2><p>{student.registration}</p></section><button className="button secondary restart-button" onClick={() => setConfirmRestart(true)}><RotateCcw size={16} />Restart Onboarding</button></aside></div>{confirmRestart && <Modal title="Start fresh with your profile?" onClose={() => setConfirmRestart(false)}><p>This clears your current profile and returns to the welcome screen. Completed attempts and browser keys are kept. Enter the same registration number later to revisit that history.</p><div className="modal-actions"><button className="button secondary" onClick={() => setConfirmRestart(false)}>Cancel</button><button className="button primary" onClick={onRestart}>Restart Onboarding</button></div></Modal>}</>
}
