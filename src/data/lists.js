import grades34 from './grades-3-4.json'
import grades56 from './grades-5-6.json'
import grades78 from './grades-7-8.json'

export const LIST_IDS = ['grades-3-4', 'grades-5-6', 'grades-7-8']

export const WORD_LISTS = {
  'grades-3-4': {
    id: 'grades-3-4',
    label: 'Grades 3–4',
    contestNote: '50 words + 15-word tiebreaker',
    words: grades34,
  },
  'grades-5-6': {
    id: 'grades-5-6',
    label: 'Grades 5–6',
    contestNote: '80 words + 20-word tiebreaker',
    words: grades56,
  },
  'grades-7-8': {
    id: 'grades-7-8',
    label: 'Grades 7–8',
    contestNote: '110 words + 30-word tiebreaker',
    words: grades78,
  },
}

export const POOL_MODES = {
  ALL_WORDS: 'ALL_WORDS',
  UNLEARNED_DIFFICULT: 'UNLEARNED_DIFFICULT',
}
