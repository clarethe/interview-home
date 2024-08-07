import { LeadsCreateInput, LeadsCreateOutput } from '../types/leads/create'
import { LeadsDeleteInput, LeadsDeleteOutput } from '../types/leads/delete'
import { LeadsGetManyInput, LeadsGetManyOutput } from '../types/leads/getMany'
import { LeadsGetOneInput, LeadsGetOneOutput } from '../types/leads/getOne'
import { LeadsUpdateInput, LeadsUpdateOutput } from '../types/leads/update'
import { LeadsDeleteManyInput, LeadsDeleteManyOutput } from '../types/leads/delete'
import { GuessGenderInput, GuessGenderOutput } from '../types/leads/guessGender'
import { InsertFromCSVInput, InsertFromCSVOutput } from '../types/leads/insertFromCSV'

import { ApiModule, endpoint } from '../utils'

export const leadsApi = {
  getMany: endpoint<LeadsGetManyOutput, LeadsGetManyInput>('get', '/leads'),
  getOne: endpoint<LeadsGetOneOutput, LeadsGetOneInput>('get', ({ id }) => `/leads/${id}`),
  create: endpoint<LeadsCreateOutput, LeadsCreateInput>('post', '/leads'),
  delete: endpoint<LeadsDeleteOutput, LeadsDeleteInput>('delete', ({ id }) => `/leads/${id}`),
  deleteMany: endpoint<LeadsDeleteManyOutput, LeadsDeleteManyInput>('delete', '/leads'),
  update: endpoint<LeadsUpdateOutput, LeadsUpdateInput>('patch', ({ id }) => `/leads/${id}`),
  guessGender: endpoint<GuessGenderOutput, GuessGenderInput>('post', ({ id }) => `/leads/${id}/guess-gender`),
  insertFromCSV: endpoint<InsertFromCSVOutput, InsertFromCSVInput>('post', '/leads/insert-from-csv'),
} as const satisfies ApiModule
