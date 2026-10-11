import type { Question } from '../types'
import { cse205 } from './questions/cse205'
import { cse202 } from './questions/cse202'
import { cse306 } from './questions/cse306'
import { cse306UnitI } from './questions/cse306-unit1'
import { cse306UnitII } from './questions/cse306-unit2'
import { cse423 } from './questions/cse423'
import { mth401 } from './questions/mth401'
import { int335 } from './questions/int335'

// Use rebuilt CSE306 Units I–II; retain existing drafts for Units III–VI until rebuilt.
const cse306RemainingUnits = cse306.filter(question => question.unitNumber !== 1 && question.unitNumber !== 2)
export const questionBank: Question[] = [...cse205, ...cse202, ...cse306RemainingUnits, ...cse306UnitI, ...cse306UnitII, ...cse423, ...mth401, ...int335]
