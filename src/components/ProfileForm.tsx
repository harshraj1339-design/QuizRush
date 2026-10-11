import { useState, type FormEvent } from 'react'
import { ArrowRight, Mail, ShieldCheck, UserRound } from 'lucide-react'
import type { Student } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function ProfileForm({ initial, onSave }: { initial?: Student; onSave: (student: Student) => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [registration, setRegistration] = useState(initial?.registration || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    if (!isSupabaseConfigured) { setErrors({ form: 'Secure sign-in is not configured yet. Please contact the QuizRush administrator.' }); return }
    setSubmitting(true)
    try {
      if (!otpSent) {
        const cleanName = name.trim().replace(/\s+/g, ' ')
        const cleanRegistration = registration.trim()
        const cleanEmail = email.trim().toLowerCase()
        const nextErrors: Record<string, string> = {}
        if (!/^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u.test(cleanName) || cleanName.length < 2 || cleanName.length > 80) nextErrors.name = 'Enter a valid full name.'
        if (!/^\d{8}$/.test(cleanRegistration)) nextErrors.registration = 'Enter your 8-digit university registration number.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) nextErrors.email = 'Enter a valid email address.'
        if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
        const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail, options: { shouldCreateUser: true } })
        if (error) throw error
        setName(cleanName); setRegistration(cleanRegistration); setEmail(cleanEmail); setOtpSent(true)
        return
      }
      if (!/^\d{6}$/.test(otp.trim())) { setErrors({ otp: 'Enter the 6-digit code sent to your email.' }); return }
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: otp.trim(), type: 'email' })
      if (error) throw error
      if (!data.user) throw new Error('Email verification did not return a user. Request a new code and try again.')
      const cleanName = name.trim().replace(/\s+/g, ' ')
      const cleanRegistration = registration.trim()
      const { error: profileError } = await supabase.from('student_profiles').upsert({
        user_id: data.user.id, email: data.user.email ?? email.trim().toLowerCase(),
        name: cleanName, registration_id: cleanRegistration, semester: 3, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      if (profileError) {
        if (profileError.code === '23505') throw new Error('That registration number is already linked to another account. Sign in with the email originally used for it.')
        throw new Error('Your verified account could not be linked to a student profile. Apply the latest Supabase migration and try again.')
      }
      onSave({ name: cleanName, registration: cleanRegistration, semester: 3, userId: data.user.id, email: data.user.email ?? email.trim().toLowerCase() })
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Secure sign-in failed. Please try again.' })
    } finally { setSubmitting(false) }
  }

  return <form className="profile-form" onSubmit={handleSubmit} noValidate>
    {!otpSent && <>
      <div className="form-field">
        <label htmlFor="full-name">Full name <span>*</span></label>
        <div className={'input-with-icon ' + (errors.name ? 'input-error' : '')}><UserRound size={18} /><input id="full-name" value={name} onChange={event => setName(event.target.value.replace(/[^\p{L} '\u2019-]/gu, ''))} placeholder="Enter your full name" autoComplete="name" maxLength={80} required aria-invalid={!!errors.name} /></div>
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="registration">LPU registration number <span>*</span></label>
        <input id="registration" className={errors.registration ? 'input-error' : ''} value={registration} onChange={event => setRegistration(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="8-digit registration number" inputMode="numeric" pattern="[0-9]{8}" autoComplete="off" maxLength={8} required aria-invalid={!!errors.registration} />
        {errors.registration && <p className="field-error">{errors.registration}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email address <span>*</span></label>
        <div className={'input-with-icon ' + (errors.email ? 'input-error' : '')}><Mail size={18} /><input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required aria-invalid={!!errors.email} /></div>
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
    </>}
    {otpSent && <div className="form-field">
      <label htmlFor="email-code">Email verification code <span>*</span></label>
      <div className="input-with-icon"><ShieldCheck size={18} /><input id="email-code" value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /></div>
      <p className="field-hint">Check {email} for your sign-in code.</p>
      {errors.otp && <p className="field-error">{errors.otp}</p>}
      <button className="button ghost" type="button" onClick={() => { setOtpSent(false); setOtp(''); setErrors({}) }}>Change email or details</button>
    </div>}
    {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
    <button className="button primary form-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : otpSent ? 'Verify & Continue' : 'Send Verification Code'}<ArrowRight size={18} /></button>
  </form>
}
