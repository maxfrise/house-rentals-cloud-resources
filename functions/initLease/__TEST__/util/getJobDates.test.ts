import { getJobDates } from "../../src/util/getJobDates"

describe('getJobDates', () => {

  it('handles 12 months terms', () => {
    const dates = getJobDates("2024-08-09", "12")
    expect(dates).toStrictEqual([
      '2024-08-09T00:00:00.000Z',
      '2024-09-09T00:00:00.000Z',
      '2024-10-09T00:00:00.000Z',
      '2024-11-11T00:00:00.000Z',
      '2024-12-09T00:00:00.000Z',
      '2025-01-09T00:00:00.000Z',
      '2025-02-10T00:00:00.000Z',
      '2025-03-10T00:00:00.000Z',
      '2025-04-09T00:00:00.000Z',
      '2025-05-09T00:00:00.000Z',
      '2025-06-09T00:00:00.000Z',
      '2025-07-09T00:00:00.000Z'
    ])
  })

  it('handles month boundary limits, using the last day of the month', () => {
    const dates = getJobDates("2024-01-31", "2")
    expect(dates).toStrictEqual([
      '2024-01-31T00:00:00.000Z',
      '2024-02-29T00:00:00.000Z'
    ])
  })

  it('handles start dates on saturday that moves to monday', () => {
    const dates = getJobDates("2024-01-24", "2")
    expect(dates).toStrictEqual(['2024-01-24T00:00:00.000Z', '2024-02-26T00:00:00.000Z'])
  })

  it('handles start dates on saturday that moves to monday on the next month', () => {
    const dates = getJobDates("2024-05-30", "2")
    expect(dates).toStrictEqual(['2024-05-30T00:00:00.000Z', '2024-07-01T00:00:00.000Z'])
  })

  it('handles start dates on sunday that moves to monday', () => {
    const dates = getJobDates("2024-05-15", "2")
    expect(dates).toStrictEqual(['2024-05-15T00:00:00.000Z', '2024-06-17T00:00:00.000Z'])
  })

  it('handles start dates on sunday that moves to monday on the next month', () => {
    const dates = getJobDates("2024-01-31", "3")
    expect(dates).toStrictEqual([
      '2024-01-31T00:00:00.000Z',
      '2024-02-29T00:00:00.000Z',
      '2024-04-01T00:00:00.000Z'
    ])
  })
})
