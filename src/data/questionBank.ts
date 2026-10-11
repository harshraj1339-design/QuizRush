import type { Question } from '../types'
import { cse205 } from './questions/cse205'
import { cse202 } from './questions/cse202'
import { cse306 } from './questions/cse306'
import { cse306UnitI } from './questions/cse306-unit1'
import { cse306UnitII } from './questions/cse306-unit2'
import { cse306UnitIII } from './questions/cse306-unit3'
import { cse306UnitIV } from './questions/cse306-unit4'
import { cse306UnitV } from './questions/cse306-unit5'
import { cse423 } from './questions/cse423'
import { mth401 } from './questions/mth401'
import { int335 } from './questions/int335'

// Use rebuilt CSE306 Units I–V; retain existing drafts for Unit VI until rebuilt.
const cse306RemainingUnits = cse306.filter(question => ![1, 2, 3, 4, 5].includes(question.unitNumber))
export const questionBank: Question[] = [...cse205, ...cse202, ...cse306RemainingUnits, ...cse306UnitI, ...cse306UnitII, ...cse306UnitIII, ...cse306UnitIV, ...cse306UnitV, ...cse423, ...mth401, ...int335]
