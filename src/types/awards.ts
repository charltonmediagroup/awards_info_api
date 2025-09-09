// Single Award
export interface Award {
  name: string
  description: string
  icon: string // URL or emoji
  url: string
  industries: Record<string, number> // { "Banking": 100 }
  recognitions: Record<string, number> // { "Banking": 80 }
}

// Synonyms mapping
export type Synonyms = Record<string, string[]> // { "Banking": ["Bank", "Funds"] }

// Full region data
export interface AwardsJson {
  awards: Award[]
  industries: string[]
  recognitions: string[]
  synonyms: Synonyms
}
