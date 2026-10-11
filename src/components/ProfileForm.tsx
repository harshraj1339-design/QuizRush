import { useState, type FormEvent } from 'react'
import { ArrowRight, Check, GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import type { Student } from '../types'

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
    const cleanRegistration = registration.trim().toUpperCase()
    const nextErrors: Record<string, string> = {}
    if (!cleanName) nextErrors.name = 'Please enter your full name.'
    else if (cleanName.length > 80) nextErrors.name = 'Please use 80 characters or fewer.'
    if (!cleanRegistration) nextErrors.registration = 'Please enter your university registration number.'
    else if (cleanRegistration.length > 50) nextErrors.registration = 'Please use 50 characters or fewer.'
    if (semester !== '3') nextErrors.semester = 'Please select Semester 3.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitting(true)
    try {
      if (!initial) {
        const response = await fetch('/.netlify/functions/register-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, registrationId: cleanRegistration, semester: 3 }),
        })
        // Read the body as text first so an empty/non-JSON response does not
        // surface as the confusing "Unexpected end of JSON input" error.
        const responseText = await response.text()
        let payload: { error?: string; student?: unknown } = {}
        if (responseText.trim()) {
          try {
            payload = JSON.parse(responseText) as { error?: string; student?: unknown }
          } catch {
            throw new Error(
              'The registration API returned an invalid response. For local development, stop Vite and run "npx netlify dev", then open the URL it prints (usually http://localhost:8888).'
            )
          }
        } else if (!response.ok) {
          throw new Error(
            `The registration API is unavailable (HTTP ${response.status}). For local development, run "npx netlify dev" and open the URL it prints.`
          )
        } else {
          throw new Error(
            'The registration API returned an empty response. Run the app with "npx netlify dev" so the Netlify functions are available.'
          )
        }

        if (!response.ok) {
          throw new Error(
            payload.error ||
              `Registration failed (HTTP ${response.status}). Check the Netlify function logs.`
          )
        }
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
    <div className="form-field"><label htmlFor="full-name">Full name <span>*</span></label><div className={`input-with-icon ${errors.name ? 'input-error' : ''}`}><UserRound size={18} /><input id="full-name" value={name} onChange={event => { setName(event.target.value); setSaved(false) }} placeholder="Enter your full name" autoComplete="name" maxLength={81} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} /></div>{errors.name && <p id="name-error" className="field-error">{errors.name}</p>}</div>
    <div className="form-field"><label htmlFor="registration">University registration number <span>*</span></label><input id="registration" className={errors.registration ? 'input-error' : ''} value={registration} onChange={event => { setRegistration(event.target.value); setSaved(false) }} placeholder="e.g. 12345678" autoComplete="off" maxLength={51} required aria-invalid={!!errors.registration} aria-describedby="registration-help registration-error" />{errors.registration && <p id="registration-error" className="field-error">{errors.registration}</p>}<span id="registration-help" className="field-help">Just for your local student profile. No login needed.</span></div>
    <div className="form-field"><label htmlFor="semester">Semester <span>*</span></label><div className={`input-with-icon ${errors.semester ? 'input-error' : ''}`}><GraduationCap size={19} /><select id="semester" value={semester} onChange={event => setSemester(event.target.value)} required aria-invalid={!!errors.semester} aria-describedby={errors.semester ? 'semester-error' : undefined}><option value="" disabled>Select your semester</option><option value="3">Semester 3</option></select></div>{errors.semester && <p id="semester-error" className="field-error">{errors.semester}</p>}</div>
    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}<button className="button primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Saving registration…' : initial ? 'Save Changes' : 'Start Preparing'}{!submitting && (saved && initial ? <Check size={18} /> : <ArrowRight size={18} />)}</button>
    {saved && initial && <p className="success-message" role="status">Your profile has been updated.</p>}
    <p className="privacy-note"><ShieldCheck size={16} />Your name and registration number are saved to QuizRush's protected student directory. Registration ID alone does not verify identity.</p>
  </form>
}
