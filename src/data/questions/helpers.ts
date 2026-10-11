import type { CourseCode, Difficulty, Question, QuestionStyle } from '../../types'

export type QuestionSeed = [number, string, string, string, string, string, string, string, Difficulty?, QuestionStyle?]

export function makeQuestions(code: CourseCode, seeds: QuestionSeed[]): Question[] {
  return seeds.map(([unitNumber, topic, text, correct, second, third, fourth, explanation, difficulty = 'medium', style = 'conceptual'], index): Question => ({
    id: `${code}-u${unitNumber}-${String(index + 1).padStart(3, '0')}`,
    courseCode: code, unitNumber, topic, text,
    options: [
      { id: 'a', text: correct }, { id: 'b', text: second },
      { id: 'c', text: third }, { id: 'd', text: fourth },
    ],
    correctOptionId: 'a', explanation, difficulty, style,
  }))
}
