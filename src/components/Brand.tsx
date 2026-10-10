import { BookOpenCheck } from 'lucide-react'
import { Check } from 'lucide-react'

export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="brand"><span className="brand-mark brand-mark-new"><BookOpenCheck size={23} strokeWidth={2.2} /></span>{!compact && <span>Quiz<span className="brand-rush">Rush</span><span className="brand-dot">.</span></span>}</span>
}

export function RevisionArt() {
  return <div className="revision-art" aria-hidden="true">
    <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
    <div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✧</div>
    <div className="art-card card-back"><span className="art-line" /><span className="art-line short" /><span className="art-line" /></div>
    <div className="art-card card-front"><div className="art-card-head"><span className="art-mini-logo"><BookOpenCheck size={17} /></span><span>ONE QUESTION CLOSER</span><span className="art-three">•••</span></div><div className="art-title">A little practice.<br />A lot more confidence.</div><div className="art-answer"><span>A</span><span className="art-line" /><Check size={17} /></div><div className="art-option"><span>B</span><span className="art-line" /></div><div className="art-option"><span>C</span><span className="art-line short" /></div><div className="art-card-footer"><span>Keep going. You’ve got this.</span><span>↗</span></div></div>
    <div className="art-floating"><span className="art-floating-check"><Check size={18} strokeWidth={3} /></span><div><strong>Small steps. Big scores.</strong><span>Make every question count.</span></div></div>
    <div className="art-bolt"><BookOpenCheck size={25} /></div>
  </div>
}
