import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, LogOut, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react'

type StudentRecord = {
  id: string
  name: string
  registrationId: string
  semester: string
  createdAt: string
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkSession() {
    setChecking(true)
    try {
      const response = await fetch('/.netlify/functions/admin-auth', { credentials: 'same-origin' })
      const payload = await response.json()
      setAuthenticated(response.ok && payload.authenticated === true)
    } catch { setAuthenticated(false) }
    finally { setChecking(false) }
  }

  async function loadStudents(query = search) {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('search', query.trim())
      const response = await fetch('/.netlify/functions/admin-students?' + params.toString(), { credentials: 'same-origin' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not load the student directory.')
      setStudents(Array.isArray(payload.students) ? payload.students : [])
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the student directory.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void checkSession() }, [])
  useEffect(() => { if (authenticated) void loadStudents('') }, [authenticated])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Admin sign-in failed.')
      setPassword('')
      setAuthenticated(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Admin sign-in failed.')
    }
  }

  async function signOut() {
    await fetch('/.netlify/functions/admin-auth', { method: 'DELETE', credentials: 'same-origin' }).catch(() => undefined)
    setAuthenticated(false)
    setStudents([])
  }

  if (checking) return <main className="onboarding"><section className="panel"><p>Checking admin session…</p></section></main>

  if (!authenticated) return <main className="onboarding">
    <header className="onboarding-header"><a className="button secondary" href="#/dashboard"><ArrowLeft size={16} /> Back to QuizRush</a></header>
    <div className="onboarding-body">
      <section className="welcome-story"><span className="eyebrow"><ShieldCheck size={16} /> PRIVATE ADMIN AREA</span><h1>Student<br /><span>directory.</span></h1><p className="welcome-description">Sign in to manage access to registered student records.</p></section>
      <section className="welcome-form-card"><span className="welcome-form-icon"><ShieldCheck size={24} /></span><span className="eyebrow">ADMINISTRATOR</span><h2>Admin sign-in</h2><form className="profile-form" onSubmit={signIn}><div className="form-field"><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></div><button className="button primary form-submit" type="submit">Sign in</button></form>{error && <p className="field-error" role="alert">{error}</p>}<p className="privacy-note">Admin credentials are stored in Netlify environment variables, never in frontend code.</p></section>
    </div>
  </main>

  return <main className="app-shell" style={{ minHeight: '100vh', padding: 'clamp(20px, 5vw, 56px)', background: 'var(--page, #f7f8fc)' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
      <div><span className="eyebrow"><ShieldCheck size={16} /> ADMIN CONSOLE</span><h1 style={{ margin: '8px 0' }}>Registered students</h1><p>Student details are visible only to authenticated administrators.</p></div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button className="button secondary" onClick={() => void loadStudents()}><RefreshCw size={16} /> Refresh</button><button className="button secondary" onClick={() => void signOut()}><LogOut size={16} /> Sign out</button></div>
    </header>
    <section className="panel" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={22} /><strong>{students.length} student{students.length === 1 ? '' : 's'} shown</strong></div>
        <form onSubmit={event => { event.preventDefault(); void loadStudents() }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><label htmlFor="student-search" className="sr-only">Search students</label><div className="input-with-icon"><Search size={17} /><input id="student-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name or registration ID" /></div><button className="button primary" type="submit">Search</button></form>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {loading ? <p>Loading student records…</p> : students.length === 0 ? <p>No student registrations found.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}><thead><tr>{['Full name', 'Registration ID', 'Semester', 'Registered on'].map(label => <th key={label} style={{ padding: '12px 10px', borderBottom: '1px solid var(--border, #ddd)' }}>{label}</th>)}</tr></thead><tbody>{students.map(student => <tr key={student.id}>{[student.name, student.registrationId, student.semester, new Date(student.createdAt).toLocaleString()].map((value, index) => <td key={index} style={{ padding: '14px 10px', borderBottom: '1px solid var(--border, #eee)' }}>{value}</td>)}</tr>)}</tbody></table></div>}
      <p className="privacy-note">Showing up to 500 records. Registration ID alone is not proof of student identity.</p>
    </section>
  </main>
}
