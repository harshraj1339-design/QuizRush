import { useState, type FormEvent } from 'react'
import { ArrowRight, UserRound } from 'lucide-react'
import type { Student } from '../types'

export default function ProfileForm({ initial, onSave }: { initial?: Student; onSave: (student: Student) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [registration, setRegistration] = useState(initial?.registration || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanRegistration = registration.trim()
    const nextErrors: Record<string, string> = {}
    if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(cleanName) || cleanName.length < 2 || cleanName.length > 80) nextErrors.name = 'Enter a valid full name.'
    if (!/^\d{8}$/.test(cleanRegistration)) nextErrors.registration = 'Enter your 8-digit university registration number.'
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    setSubmitting(true)
    try { onSave({ name: cleanName, registration: cleanRegistration, semester: 3 }) }
    finally { setSubmitting(false) }
  }

  return <form className="profile-form" onSubmit={handleSubmit} noValidate>
    <div className="form-field">
      <label htmlFor="full-name">Full name <span>*</span></label>
      <div className={'input-with-icon ' + (errors.name ? 'input-error' : '')}><UserRound size={18} /><input id="full-name" value={name} onChange={event => setName(event.target.value.replace(/[^\p{L} '\u2019-]/gu, ''))} placeholder="Enter your full name" autoComplete="name" maxLength={80} required aria-invalid={!!errors.name} /></div>
      {errors.name && <p className="field-error">{errors.name}</p>}
    </div>
    <div className="form-field">
      <label htmlFor="registration">LPU registration number <span>*</span></label>
      <input id="registration" className={errors.registration ? 'input-error' : ''} value={registration} onChange={event => setRegistration(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="eg. 12512814" inputMode="numeric" pattern="[0-9]{8}" autoComplete="off" maxLength={8} required aria-invalid={!!errors.registration} />
      {errors.registration && <p className="field-error">{errors.registration}</p>}
    </div>
    <button className="button primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Saving…' : initial ? 'Save Profile' : 'Start Practicing'}<ArrowRight size={18} /></button>
  </form>
}
