import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, GraduationCap, UserRound } from 'lucide-react'
import type { Student } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function ProfileForm({ initial, onSave }: { initial?: Student; onSave: (student: Student) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [registration, setRegistration] = useState(initial?.registration || '')
  const [semester, setSemester] = useState(initial ? '3' : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanRegistration = registration.trim()
    const nextErrors: Record<string, string> = {}
    if (!cleanName) nextErrors.name = 'Please enter your full name.'
    else if (cleanName.length > 80) nextErrors.name = 'Please use 80 characters or fewer.'
    if (!/^\d{8}$/.test(cleanRegistration)) nextErrors.registration = 'Incorrect reg ID.'
    if (semester !== '3') nextErrors.semester = 'Please select a semester.'
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
        if (error?.code === '23505') throw new Error('This registration number is already registered. Contact the administrator if you believe this is a mistake.')
        if (error) throw new Error('Could not save your registration. Please try again later.')
      }
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
      <div className={`input-with-icon ${errors.name ? 'input-error' : ''}`}><UserRound size={18} /><input id="full-name" value={name} onChange={event => { setName(event.target.value); setSaved(false) }} placeholder="Enter your full name" autoComplete="name" maxLength={80} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} /></div>
      {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
    </div>
    <div className="form-field">
      <label htmlFor="registration">LPU registration number <span>*</span></label>
      <input id="registration" className={errors.registration ? 'input-error' : ''} value={registration} onChange={event => { setRegistration(event.target.value.replace(/\D/g, '').slice(0, 8)); setSaved(false) }} placeholder="Reg ID: 12345678" inputMode="numeric" pattern="[0-9]{8}" autoComplete="off" minLength={8} maxLength={8} required aria-invalid={!!errors.registration} aria-describedby={errors.registration ? 'registration-error' : 'registration-help'} />
      {errors.registration && <p id="registration-error" className="field-error">{errors.registration}</p>}
    </div>
    <div className="form-field">
      <label htmlFor="semester">Semester <span>*</span></label>
      <div className={`input-with-icon ${errors.semester ? 'input-error' : ''}`}><GraduationCap size={19} /><select id="semester" value={semester} onChange={event => setSemester(event.target.value)} required aria-invalid={!!errors.semester} aria-describedby={errors.semester ? 'semester-error' : undefined}><option value="" disabled>Select semester</option><option value="3">Semester 3</option></select></div>
      {errors.semester && <p id="semester-error" className="field-error">{errors.semester}</p>}
    </div>
    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
    <button className="button primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Saving profile…' : initial ? 'Save Changes' : 'Start Preparing'}{!submitting && (saved && initial ? <Check size={18} /> : <ArrowRight size={18} />)}</button>
    {saved && initial && <p className="success-message" role="status">Your profile has been updated.</p>}
  </form>
}
