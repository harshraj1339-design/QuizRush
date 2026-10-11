import type { Question } from '../types'
import { cse205 } from './questions/cse205'
import { cse202 } from './questions/cse202'
import { cse306 } from './questions/cse306'
import { cse306UnitI } from './questions/cse306-unit1'
import { cse423 } from './questions/cse423'
import { mth401 } from './questions/mth401'
import { int335 } from './questions/int335'

// Use the rebuilt Unit I set; retain existing drafts for Units II–VI until they are rebuilt.
const cse306RemainingUnits = cse306.filter(question => question.unitNumber !== 1)
export const questionBank: Question[] = [...cse205, ...cse202, ...cse306RemainingUnits, ...cse306UnitI, ...cse423, ...mth401, ...int335]
