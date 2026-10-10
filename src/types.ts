export type CourseCode = 'CSE205' | 'CSE202' | 'CSE306' | 'CSE423' | 'MTH401' | 'INT335'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionStyle = 'conceptual' | 'scenario-based' | 'calculation-based'
export interface Unit { number: number; title: string; topics: string[]; verified: boolean }
export interface Subject { code: CourseCode; name: string; description: string; accent: string; icon: string; units: Unit[] }
export interface Option { id: string; text: string }
export interface Question {
  id: string; courseCode: CourseCode; unitNumber: number; topic: string;
  text: string; options: [Option, Option, Option, Option]; correctOptionId: string;
  explanation: string; difficulty: Difficulty; style: QuestionStyle
}
export interface Student { name: string; registration: string; semester: 3 }
export interface QuizSession {
  id: string; courseCode: CourseCode; units: number[]; questions: Question[];
  answers: Record<string, string>; currentIndex: number; startedAt: number; durationMinutes: number;
  registration: string
}
export interface Attempt extends QuizSession {
  completedAt: string; correct: number; incorrect: number; unanswered: number;
  score: number; accuracy: number; timeTaken: number; synced?: boolean
}
export type Page = 'dashboard' | 'subjects' | 'history' | 'profile' | 'subject' | 'quiz' | 'results' | 'review'
