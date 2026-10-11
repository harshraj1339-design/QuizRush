import { useState, type ReactNode } from 'react'
import { BookOpen, BookOpenCheck, ChevronDown, ChevronRight, GraduationCap, History, LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from 'lucide-react'
import type { Student } from '../types'
import { Logo } from './Brand'
import { Modal } from './Common'

const navigation = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/subjects', name: 'Subjects', icon: BookOpen },
  { path: '/browse-questions', name: 'Browse Questions', icon: BookOpenCheck },
  { path: '/history', name: 'Quiz History', icon: History },
  { path: '/profile', name: 'Profile', icon: UserRound },
]

export default function Shell({ student, route, navigate, dark, toggleTheme, onLogout, children }: {
  student: Student; route: string; navigate: (path: string) => void; dark: boolean; toggleTheme: () => void; onLogout: () => void; children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const pageTitle = route.startsWith('/subject/') ? 'Practice setup' : route.startsWith('/browse-questions') ? 'Browse Questions' : route.startsWith('/results/') ? 'Quiz results' : route.startsWith('/review/') ? 'Answer review' : navigation.find(item => route.startsWith(item.path))?.name || 'Dashboard'
  function go(path: string) { navigate(path); setMobileOpen(false) }
  return <div className="app-layout">
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation"><div className="sidebar-brand"><Logo /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button></div>
      <nav>{navigation.map(item => { const Icon = item.icon; const active = route.startsWith(item.path) || item.path === '/subjects' && route.startsWith('/subject/'); return <a key={item.path} href={`#${item.path}`} className={`nav-item ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} onClick={event => { event.preventDefault(); go(item.path) }}><Icon size={19} /><span>{item.name}</span>{active && <span className="nav-active-dot" />}</a> })}</nav>
      <div className="sidebar-bottom"><button className="sidebar-logout" onClick={onLogout}><LogOut size={19} /><span>Log out</span></button></div>
    </aside>
    <div className="workspace"><header className="topbar"><div className="topbar-breadcrumb"><button className="mobile-menu icon-button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button><LayoutDashboard size={17} /><ChevronRight size={14} /><span>{pageTitle}</span></div><div className="topbar-actions"><button className="icon-button theme-toggle" aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><span className="topbar-divider" /><button className="profile-button" onClick={() => go('/profile')} aria-label={`Edit ${student.name}'s profile`}><span className="avatar">{student.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</span><div><strong>{student.name.split(' ')[0]}</strong><span>Student</span></div><ChevronDown size={14} /></button></div></header>
      <main className="main-content" id="main-content" tabIndex={-1}>{children}</main>
    </div>
    {showInfo && <Modal title="About QuizRush" onClose={() => setShowInfo(false)}><p>QuizRush provides MCQ practice for course revision.</p><p>Your profile and quiz history are currently stored in this browser and do not sync automatically between devices.</p><p>Course unit topics are being aligned with official syllabus documents.</p><button className="button primary" onClick={() => setShowInfo(false)}>Got it</button></Modal>}
  </div>
}
