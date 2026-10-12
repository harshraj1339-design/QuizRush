import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Clock3, LogOut, Moon, RefreshCw, Search, ShieldCheck, Sun, Users } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type LoginEvent = {
  id: string
  name: string
  registration_id: string
  logged_in_at: string
}

type ActivityRecord = { registration_id: string; student_name: string; seconds_spent: number; last_seen_at: string }

type StudentRecord = {
  id: string
  name: string
  registration_id: string
  semester: number
  created_at: string
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem('quizrush:admin-theme') === 'dark' } catch { return false } })
  const [activity, setActivity] = useState<ActivityRecord[]>([])

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    try { localStorage.setItem('quizrush:admin-theme', darkMode ? 'dark' : 'light') } catch { /* optional */ }
  }, [darkMode])

  async function checkSession() {
    setChecking(true)
    try {
      if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (session) {
        const { data, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle()
        if (adminError) throw adminError
        setAuthenticated(Boolean(data))
      } else setAuthenticated(false)
    } catch (reason) {
      setAuthenticated(false)
      if (reason instanceof Error && reason.message.includes('not configured')) setError(reason.message)
    } finally { setChecking(false) }
  }

  async function loadStudents(query = search) {
    setLoading(true)
    setError('')
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Your admin session expired. Please sign in again.')
      const { data: admin, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
      if (adminError) throw adminError
      if (!admin) throw new Error('This account is not authorized to view student records.')

      let request = supabase.from('students').select('id,name,registration_id,semester,created_at').order('created_at', { ascending: false }).limit(500)
      if (query.trim()) {
        const safe = query.trim().replace(/[,%()]/g, ' ')
        request = request.or(`name.ilike.%${safe}%,registration_id.ilike.%${safe}%`)
      }
      const { data, error: queryError } = await request
      if (queryError) throw queryError
      setStudents((data || []) as StudentRecord[])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : typeof reason === 'object' && reason !== null && 'message' in reason ? String((reason as { message: unknown }).message) : 'Could not load the student directory.')
      setLoading(false)
      return
    }

    // These panels are optional: their table/policy errors must not hide the student directory.
    try {
      const { data, error } = await supabase.from('student_login_events').select('id,name,registration_id,logged_in_at').order('logged_in_at', { ascending: false }).limit(1000)
      if (error) throw error
      setLoginEvents((data || []) as LoginEvent[])
    } catch {
      setLoginEvents([])
    }
    try {
      const { data, error } = await supabase.from('student_activity_sessions').select('registration_id,student_name,seconds_spent,last_seen_at').order('last_seen_at', { ascending: false }).limit(5000)
      if (error) throw error
      setActivity((data || []) as ActivityRecord[])
    } catch {
      setActivity([])
    }
    setLoading(false)
  }

  useEffect(() => { void checkSession() }, [])
  useEffect(() => { if (authenticated) void loadStudents('') }, [authenticated])

  // Keep student registrations, login events, and website-time totals current while the admin console stays open.
  useEffect(() => {
    if (!authenticated) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadStudents()
    }, 15000)
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') void loadStudents()
    }
    document.addEventListener('visibilitychange', refreshOnVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshOnVisible)
    }
  }, [authenticated, search])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!isSupabaseConfigured) { setError('Supabase is not configured. Add the project URL and publishable/anon key.'); return }
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (signInError) throw new Error('Sign-in failed. Check your email and password.')
      const { data: admin, error: adminError } = await supabase.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle()
      if (adminError) throw new Error('Could not verify admin access. Check the Supabase policies.')
      if (!admin) {
        await supabase.auth.signOut()
        throw new Error('This account is not an authorized QuizRush administrator.')
      }
      setPassword('')
      setAuthenticated(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Admin sign-in failed.')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setAuthenticated(false)
    setStudents([])
    setLoginEvents([])
    setActivity([])
  }

  if (checking) return <main className="onboarding"><section className="panel"><p>Checking admin session…</p></section></main>

  if (!authenticated) return <main className="onboarding">
    <header className="onboarding-header"><a className="button secondary" href="#/dashboard"><ArrowLeft size={16} /> Back to QuizRush</a></header>
    <div className="onboarding-body">
      <section className="welcome-story"><span className="eyebrow"><ShieldCheck size={16} /> PRIVATE ADMIN AREA</span><h1>Student<br /><span>directory.</span></h1><p className="welcome-description">Sign in to view registered student records.</p></section>
      <section className="welcome-form-card"><span className="welcome-form-icon"><ShieldCheck size={24} /></span><span className="eyebrow">ADMINISTRATOR</span><h2>Admin sign-in</h2><form className="profile-form" onSubmit={signIn}><div className="form-field"><label htmlFor="admin-email">Admin email</label><input id="admin-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></div><div className="form-field"><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></div><button className="button primary form-submit" type="submit">Sign in</button></form>{error && <p className="field-error" role="alert">{error}</p>}<p className="privacy-note">Only Supabase Auth accounts explicitly added to the admin list can view student details.</p></section>
    </div>
  </main>

  const activityByRegistration = activity.reduce<Record<string, { name: string; seconds: number; lastSeen: string }>>((acc, row) => {
    const current = acc[row.registration_id] ?? { name: row.student_name, seconds: 0, lastSeen: row.last_seen_at }
    current.seconds += row.seconds_spent
    if (Date.parse(row.last_seen_at) > Date.parse(current.lastSeen)) current.lastSeen = row.last_seen_at
    acc[row.registration_id] = current
    return acc
  }, {})
  const formatDuration = (seconds: number) => { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); const secs = seconds % 60; return hours ? hours + 'h ' + minutes + 'm' : minutes ? minutes + 'm ' + secs + 's' : secs + 's' }

  return <main data-theme={darkMode ? 'dark' : 'light'} className={'app-shell ' + (darkMode ? 'admin-dark' : '')} style={{ minHeight: '100vh', padding: 'clamp(20px, 5vw, 56px)', background: darkMode ? '#101322' : 'var(--page, #f7f8fc)', color: darkMode ? '#f3f4f6' : 'var(--text, #172033)' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
      <div><span className="eyebrow"><ShieldCheck size={16} /> ADMIN CONSOLE</span><h1 style={{ margin: '8px 0' }}>Registered students</h1><p>Student details are visible only to authorized administrators.</p></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="button secondary" onClick={() => setDarkMode(value => !value)}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}{darkMode ? 'Light mode' : 'Dark mode'}</button><button className="button secondary" onClick={() => void loadStudents()}><RefreshCw size={16} /> Refresh</button><button className="button secondary" onClick={() => void signOut()}><LogOut size={16} /> Sign out</button></div>
    </header>
    <section className="panel" style={{ padding: 24, background: darkMode ? '#191d2e' : undefined, color: darkMode ? '#f3f4f6' : undefined, borderColor: darkMode ? '#30364b' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={22} /><strong>{students.length} student{students.length === 1 ? '' : 's'} shown</strong></div>
        <form onSubmit={event => { event.preventDefault(); void loadStudents() }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><label htmlFor="student-search" className="sr-only">Search students</label><div className="input-with-icon"><Search size={17} /><input id="student-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or registration ID" /></div><button className="button primary" type="submit">Search</button></form>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {loading ? <p>Loading student records…</p> : students.length === 0 ? <p>No student registrations found.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{['Full name', 'Registration ID', 'Semester', 'Registered on'].map(label => <th key={label} style={{ padding: '12px 10px', borderBottom: '1px solid var(--border, #ddd)' }}>{label}</th>)}</tr></thead><tbody>{students.map(student => <tr key={student.id}>{[student.name, student.registration_id, String(student.semester), new Date(student.created_at).toLocaleString()].map((value, index) => <td key={index} style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{value}</td>)}</tr>)}</tbody></table></div>}
      <p className="privacy-note">Showing up to 500 registered students.</p>
    </section>
    <section className="panel" style={{ padding: 24, marginTop: 24, background: darkMode ? '#191d2e' : undefined, color: darkMode ? '#f3f4f6' : undefined, borderColor: darkMode ? '#30364b' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <RefreshCw size={22} /><strong>{loginEvents.length} recent quiz entries</strong>
      </div>
      {loading ? <p>Loading entry history…</p> : loginEvents.length === 0 ? <p>No entries recorded yet.</p> : <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead><tr>{['Student name', 'Registration ID', 'Entry time'].map(label => <th key={label} style={{ padding: '12px 10px', borderBottom: '1px solid var(--border, #ddd)' }}>{label}</th>)}</tr></thead>
          <tbody>{loginEvents.map(entry => <tr key={entry.id}>
            <td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{entry.name}</td>
            <td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{entry.registration_id}</td>
            <td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{new Date(entry.logged_in_at).toLocaleString()}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <p className="privacy-note">Shows up to 1,000 most recent entry events. Repeated entries are listed separately.</p>
    </section>
    <section className="panel" style={{ padding: 24, marginTop: 24, background: darkMode ? '#191d2e' : undefined, color: darkMode ? '#f3f4f6' : undefined, borderColor: darkMode ? '#30364b' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}><Clock3 size={22} /><strong>Website time spent by students</strong></div>
      {loading ? <p>Loading activity…</p> : Object.keys(activityByRegistration).length === 0 ? <p>No activity durations recorded yet. Apply the activity-tracking migration and have students use the updated app.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{['Student name', 'Registration ID', 'Time on website', 'Last active'].map(label => <th key={label} style={{ padding: '12px 10px', borderBottom: '1px solid var(--border, #ddd)' }}>{label}</th>)}</tr></thead><tbody>{Object.entries(activityByRegistration).sort((a, b) => b[1].seconds - a[1].seconds).map(([registration, row]) => <tr key={registration}><td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{row.name}</td><td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{registration}</td><td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{formatDuration(row.seconds)}</td><td style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{new Date(row.lastSeen).toLocaleString()}</td></tr>)}</tbody></table></div>}
      <p className="privacy-note">Approximate active time is recorded while the QuizRush tab is visible. Registration IDs are self-entered, so this is not verified attendance.</p>
    </section>
  </main>
}
