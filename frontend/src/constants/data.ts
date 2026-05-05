const DATA_START_YEAR = 2017
const DATA_END_YEAR = 2025

export default {
  DATA_START_YEAR,
  DATA_END_YEAR,
  YEAR_OPTIONS: generateYears(2017, 2025),
}

function generateYears(start: number, end: number): string[] {
  if (start > end) {
    return []
  }
  const result = []
  let year = start
  while (year <= end) {
    result.push(`${year}`)
    year += 1
  }
  return result
}
