import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { GradientMesh } from '@/components/ui/gradient-mesh'
import titleImage from '@/components/ui/LIK_Title003.png'

type FormValues = {
  personAName: string
  personADob: string
  personBName: string
  personBDob: string
}

type ScoreResult = {
  score: number
  band: string
  title: string
  insight: string
  guidance: string
}

const DEFAULT_FORM: FormValues = {
  personAName: '',
  personADob: '',
  personBName: '',
  personBDob: '',
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, '')
}

function hashString(input: string) {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return Math.abs(hash >>> 0)
}

function digitalRoot(value: number) {
  let n = value
  while (n > 9) {
    n = n
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n
}

function nameFeatureScore(a: string, b: string) {
  const aCodes = a.split('').map((char) => char.charCodeAt(0) - 96)
  const bCodes = b.split('').map((char) => char.charCodeAt(0) - 96)
  const aTotal = aCodes.reduce((sum, n) => sum + n, 0)
  const bTotal = bCodes.reduce((sum, n) => sum + n, 0)
  const firstLetterMatch = a[0] === b[0] ? 12 : 3
  const lengthHarmony = 15 - Math.min(Math.abs(a.length - b.length) * 2, 15)
  const letterDistance = 20 - Math.min(Math.abs(aTotal - bTotal) % 20, 20)
  const vowels = /[aeiou]/g
  const aVowelRatio = ((a.match(vowels) ?? []).length + 1) / (a.length + 1)
  const bVowelRatio = ((b.match(vowels) ?? []).length + 1) / (b.length + 1)
  const vocalHarmony = Math.max(
    0,
    12 - Math.round(Math.abs(aVowelRatio - bVowelRatio) * 25),
  )
  return Math.min(
    40,
    Math.max(0, firstLetterMatch + lengthHarmony + letterDistance + vocalHarmony),
  )
}

function parseDob(dob: string) {
  const [year, month, day] = dob.split('-').map((value) => Number(value))
  return { year, month, day }
}

function dobFeatureScore(aDob: string, bDob: string) {
  const a = parseDob(aDob)
  const b = parseDob(bDob)
  const aPath = digitalRoot(a.year + a.month + a.day)
  const bPath = digitalRoot(b.year + b.month + b.day)
  const lifePathHarmony = 18 - Math.min(Math.abs(aPath - bPath) * 2, 18)
  const monthHarmony = 10 - Math.min(Math.abs(a.month - b.month), 10)
  const dayHarmony = 7 - Math.min(Math.abs(a.day - b.day) % 7, 7)
  const ageGap = Math.min(Math.abs(a.year - b.year), 20)
  const ageGapScore = 10 - Math.min(ageGap, 10)
  return Math.min(
    35,
    Math.max(0, lifePathHarmony + monthHarmony + dayHarmony + ageGapScore),
  )
}

function getBandData(score: number) {
  if (score >= 85) {
    return {
      band: 'Cosmic Chemistry',
      title: 'High-Voltage Heart Match',
      insight:
        'You two radiate a naturally magnetic vibe. Your personalities sync quickly and keep momentum strong.',
      guidance:
        'Plan one spontaneous date this week and one calm check-in conversation. You thrive with both excitement and stability.',
    }
  }
  if (score >= 70) {
    return {
      band: 'Golden Orbit',
      title: 'Strong Match Energy',
      insight:
        'There is clear alignment in your rhythm and emotional tone. You likely click in day-to-day interactions.',
      guidance:
        'Double down on shared routines. A small weekly tradition will keep this connection growing.',
    }
  }
  if (score >= 50) {
    return {
      band: 'Slow Burn',
      title: 'Balanced Potential',
      insight:
        'You have promising compatibility with room to discover each other. This match can deepen over time.',
      guidance:
        'Try activities that reveal personality, like games or travel planning. Curiosity unlocks your best dynamic.',
    }
  }
  if (score >= 25) {
    return {
      band: 'Playful Puzzle',
      title: 'Unexpected Mix',
      insight:
        'You bring different energies to the table, which can be either challenging or surprisingly fun.',
      guidance:
        'Keep expectations light and communication clear. Different styles can still create a memorable chemistry.',
    }
  }
  return {
    band: 'Meteor Mystery',
    title: 'Wild Card Connection',
    insight:
      'This score suggests opposite vibes, but opposites sometimes make the best stories.',
    guidance:
      'Focus on fun experiences over labels. Great moments can happen even in low-match zones.',
  }
}

function calculateLoveScore(values: FormValues): ScoreResult {
  const normalizedA = normalizeName(values.personAName)
  const normalizedB = normalizeName(values.personBName)
  const orderedNames = [normalizedA, normalizedB].sort()
  const orderedDobs = [values.personADob, values.personBDob].sort()
  const seedKey = `${orderedNames.join(':')}|${orderedDobs.join(':')}`
  const seed = hashString(seedKey)
  const nameAffinity = nameFeatureScore(normalizedA, normalizedB)
  const dobHarmony = dobFeatureScore(values.personADob, values.personBDob)
  const rhythmMatch = (digitalRoot(seed) / 9) * 15
  const sparkFactor = ((seed % 1000) / 1000) * 10
  const rawScore =
    nameAffinity * 0.4 +
    dobHarmony * 0.35 +
    rhythmMatch * 0.15 +
    sparkFactor * 0.1
  const microVariance = (seed % 7) - 3
  const score = Math.min(100, Math.max(1, Math.round(rawScore + microVariance)))
  return { score, ...getBandData(score) }
}

export default function LoveScorePage() {
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_FORM)
  const [errors, setErrors] = useState<string[]>([])
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [copied, setCopied] = useState(false)

  const shareText = useMemo(() => {
    if (!result) return ''
    return `Our LIK Love Score is ${result.score}% (${result.band})! Test your match at LIK: Love Insurance Kompany.`
  }, [result])

  function onFieldChange(field: keyof FormValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  function validate(values: FormValues) {
    const nextErrors: string[] = []
    if (values.personAName.trim().length < 2 || values.personBName.trim().length < 2) {
      nextErrors.push('Please enter both names with at least 2 letters.')
    }
    if (!values.personADob || !values.personBDob) {
      nextErrors.push('Please select both dates of birth.')
    }
    return nextErrors
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(formValues)
    setErrors(nextErrors)
    if (nextErrors.length > 0) {
      setResult(null)
      return
    }
    setCopied(false)
    setResult(calculateLoveScore(formValues))
  }

  async function copyResult() {
    if (!shareText) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="meshBackground">
        <GradientMesh colors={['#5636cb', '#d6cbff', '#ff6ea9']} waveAmp={0.08} waveFreq={8} grain={0.04} />
      </div>
      <main className="appShell loveScoreLayout relative z-10">
        <section className="hero">
          <img src={titleImage} alt="LIK title" className="heroTitleImage" />
        </section>

        <section className="card tilt3d">
          <h2>Start Your Love Check</h2>
          <form onSubmit={handleSubmit} className="scoreForm">
            <div className="gridTwo">
              <label>
                Person A Name
                <input
                  type="text"
                  value={formValues.personAName}
                  onChange={(event) => onFieldChange('personAName', event.target.value)}
                  placeholder="Name"
                  maxLength={40}
                />
              </label>
              <label>
                Person A DOB
                <input
                  type="date"
                  value={formValues.personADob}
                  onChange={(event) => onFieldChange('personADob', event.target.value)}
                />
              </label>
              <label>
                Person B Name
                <input
                  type="text"
                  value={formValues.personBName}
                  onChange={(event) => onFieldChange('personBName', event.target.value)}
                  placeholder="Name"
                  maxLength={40}
                />
              </label>
              <label>
                Person B DOB
                <input
                  type="date"
                  value={formValues.personBDob}
                  onChange={(event) => onFieldChange('personBDob', event.target.value)}
                />
              </label>
            </div>

            {errors.length > 0 && (
              <ul className="errorList">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

            <button type="submit" className="primaryBtn">
              Calculate Love Score
            </button>
          </form>
        </section>

        {result && (
          <section className="card resultCard tilt3d">
            <div className="scoreCircle tilt3d" aria-label={`Love score is ${result.score} percent`}>
              <span>{result.score}%</span>
            </div>
            <p className="band">{result.band}</p>
            <h3>{result.title}</h3>
            <p>{result.insight}</p>
            <p>{result.guidance}</p>
            <div className="resultActions">
              <button type="button" onClick={copyResult} className="secondaryBtn">
                {copied ? 'Copied!' : 'Copy Result'}
              </button>
              <button
                type="button"
                className="ghostBtn"
                onClick={() => {
                  setFormValues(DEFAULT_FORM)
                  setErrors([])
                  setResult(null)
                  setCopied(false)
                }}
              >
                Try Another Match
              </button>
            </div>
            <small className="disclaimer">
              LIK is an entertainment experience and not relationship or psychological advice.
            </small>
          </section>
        )}
      </main>
    </>
  )
}
