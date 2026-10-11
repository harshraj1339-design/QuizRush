import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, UserRound } from 'lucide-react'
import type { Student } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function ProfileForm({ initial, onSave }: { initial?: Student; onSave: (student: Student) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [registration, setRegistration] = useState(initial?.registration || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanRegistration = registration.trim()
    const nextErrors: Record<string, string> = {}
    if (!cleanName) nextErrors.name = 'Please enter your full name.'
    else if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(cleanName)) nextErrors.name = 'Use letters only for your name.'
    else if (cleanName.length > 80) nextErrors.name = 'Please use 80 characters or fewer.'
    if (!/^\d{8}$/.test(cleanRegistration)) nextErrors.registration = 'Incorrect reg ID.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      if (!initial) {
        if (!isSupabaseConfigured) throw new Error('Registration is temporarily unavailable. The app administrator must configure Supabase.')
        const { error } = await supabase.from('students').insert({
          name: cleanName,
          registration_id: cleanRegistration,
          semester: 3,
        })
        // A duplicate registration ID means the student already has a directory entry.
        // Let them continue to the app instead of treating every repeat visit as a new registration.
        if (error && error.code !== '23505') throw new Error('Could not save your registration. Please try again later.')
      }
      // Record every successful entry, including repeat visits by an existing registration ID.
      const { error: loginEventError } = await supabase.from('student_login_events').insert({
        name: cleanName,
        registration_id: cleanRegistration,
      })
      if (loginEventError) throw new Error('Could not record your entry. Please try again.')

      setName(cleanName); setRegistration(cleanRegistration)
      onSave({ name: cleanName, registration: cleanRegistration, semester: 3 })
      setSaved(true)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Registration could not be saved. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return <form className="profile-form" onSubmit={handleSubmit} noValidate>
    <div className="form-field">
      <label htmlFor="full-name">Full name <span>*</span></label>
      <div className={`input-with-icon ${errors.name ? 'input-error' : ''}`}><UserRound size={18} /><input id="full-name" value={name} onChange={event => { setName(event.target.value.replace(/[^\p{L} '\u2019-]/gu, '')); setSaved(false) }} placeholder="Enter your full name" autoComplete="name" maxLength={80} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} /></div>
      {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
    </div>
    <div className="form-field">
      <label htmlFor="registration">LPU registration number <span>*</span></label>
      <input id="registration" className={errors.registration ? 'input-error' : ''} value={registration} onChange={event => { setRegistration(event.target.value.replace(/\D/g, '').slice(0, 8)); setSaved(false) }} placeholder="Reg ID: 12345678" inputMode="numeric" pattern="[0-9]{8}" autoComplete="off" minLength={8} maxLength={8} required aria-invalid={!!errors.registration} aria-describedby={errors.registration ? 'registration-error' : 'registration-help'} />
      {errors.registration && <p id="registration-error" className="field-error">{errors.registration}</p>}
    </div>
    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
    <button className="button primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Saving profile…' : initial ? 'Save Changes' : 'Start Quiz'}{!submitting && (saved && initial ? <Check size={18} /> : <ArrowRight size={18} />)}</button>
    {saved && initial && <p className="success-message" role="status">Your profile has been updated.</p>}
  </form>
}
