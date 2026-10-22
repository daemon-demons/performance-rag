import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  buildClientBriefs,
  buildMentorBriefs,
  buildPersonBrief,
  buildTeamBrief,
  describeScope,
  reportTitle,
} from '../../utils/reportBrief'

const LEVELS = [
  { id: 'person', label: 'Person' },
  { id: 'client', label: 'Client' },
  { id: 'team', label: 'Team' },
  { id: 'mentor', label: 'Mentor' },
]

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-hairline py-3">
      <dt className="type-secondary">{label}</dt>
      <dd className="min-w-0 text-right break-words">{value}</dd>
    </div>
  )
}

function AttentionLines({ people }) {
  if (!people?.length) {
    return <p className="type-secondary mt-3">No one needs monitoring.</p>
  }
  return (
    <ul className="mt-3">
      {people.map((person) => (
        <li
          key={person.name}
          className="flex flex-wrap items-baseline gap-3 border-b border-hairline py-3"
        >
          <span className="font-medium">{person.name}</span>
          <span className="type-secondary">{person.billingMonths} mo</span>
          <span className="type-secondary">{person.reasons.join(' · ')}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ReportView() {
  const { filteredEmployees, filters } = useApp()
  const [level, setLevel] = useState('team')
  const [personId, setPersonId] = useState('')

  const people = useMemo(
    () =>
      [...filteredEmployees].sort((a, b) =>
        String(a.Employee_Name).localeCompare(String(b.Employee_Name)),
      ),
    [filteredEmployees],
  )

  useEffect(() => {
    if (!people.some((person) => person.id === personId)) {
      setPersonId(people[0]?.id || '')
    }
  }, [people, personId])

  const title = reportTitle(level)
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [],
  )

  const scope = describeScope(filters)
  const selected = people.find((person) => person.id === personId) || null
  const personBrief = buildPersonBrief(selected)
  const clientBriefs = useMemo(
    () => buildClientBriefs(filteredEmployees, filters.client),
    [filteredEmployees, filters.client],
  )
  const teamBrief = useMemo(
    () => buildTeamBrief(filteredEmployees),
    [filteredEmployees],
  )
  const mentorBriefs = useMemo(
    () => buildMentorBriefs(filteredEmployees),
    [filteredEmployees],
  )

  return (
    <div className="page-shell pb-6">
      <section className="panel p-6">
        <div
          className="report-controls grid grid-cols-4 overflow-hidden rounded-md border border-hairline"
          role="tablist"
          aria-label="Report level"
        >
          {LEVELS.map((item) => {
            const selectedLevel = level === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selectedLevel}
                onClick={() => setLevel(item.id)}
                className={`hit border-r border-hairline px-3 last:border-r-0 ${
                  selectedLevel
                    ? 'bg-tessolve-navy font-semibold text-white'
                    : 'bg-white text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {level === 'person' && (
          <label className="report-controls mt-6 flex flex-wrap items-center gap-3">
            <span className="type-secondary">Person</span>
            <select
              aria-label="Person"
              value={personId}
              onChange={(event) => setPersonId(event.target.value)}
              className="hit min-w-[12rem] rounded-md border border-hairline bg-white px-3"
            >
              {people.length === 0 && <option value="">No people</option>}
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.Employee_Name}
                </option>
              ))}
            </select>
          </label>
        )}

        <header className="mt-6">
          <h2 className="type-title">{title}</h2>
          <p className="type-secondary mt-3">
            {scope} · {dateLabel} · {filteredEmployees.length} people
          </p>
        </header>

        {level === 'person' &&
          (personBrief ? (
            <dl className="mt-6">
              <Fact label="Status" value={personBrief.status} />
              <Fact label="Overall" value={personBrief.overall ?? '—'} />
              <Fact label="Platform" value={personBrief.platform ?? '—'} />
              <Fact label="Delivery" value={personBrief.delivery ?? '—'} />
              <Fact label="Depth" value={personBrief.depth ?? '—'} />
              <Fact
                label="Failed checks"
                value={
                  personBrief.failed.length ? personBrief.failed.join(', ') : 'None'
                }
              />
              <Fact label="Client" value={personBrief.client} />
              <Fact label="Billing months" value={personBrief.billingMonths} />
              <Fact label="Mentor" value={personBrief.mentor} />
              <Fact label="Reports to" value={personBrief.reportsTo} />
            </dl>
          ) : (
            <p className="type-secondary mt-6">No one is in this view.</p>
          ))}

        {level === 'client' &&
          (clientBriefs.length === 0 ? (
            <p className="type-secondary mt-6">No clients are in this view.</p>
          ) : (
            <div className="mt-6 space-y-6">
              {clientBriefs.map((block) => (
                <section key={block.client}>
                  <h3 className="type-title">{block.client}</h3>
                  <p className="mt-3">
                    Ready {block.ready} · Watch {block.watch} · At risk {block.atRisk}
                  </p>
                  <p className="type-secondary mt-3">
                    Shortest billing{' '}
                    {block.shortestBilling === null
                      ? '—'
                      : `${block.shortestBilling} mo`}
                    {block.spof ? ' · Single point of failure' : ''}
                  </p>
                  <AttentionLines people={block.attention} />
                </section>
              ))}
            </div>
          ))}

        {level === 'team' && (
          <div className="mt-6 space-y-6">
            <p>
              Ready {teamBrief.ready} · Watch {teamBrief.watch} · At risk{' '}
              {teamBrief.atRisk}
            </p>
            <section>
              <h3 className="type-title">Exceptions</h3>
              {teamBrief.attention.length === 0 ? (
                <p className="type-secondary mt-3">No one needs monitoring.</p>
              ) : (
                teamBrief.attention.map((group) => (
                  <div key={group.client} className="mt-6">
                    <h4 className="font-semibold">{group.client}</h4>
                    <AttentionLines people={group.people} />
                  </div>
                ))
              )}
            </section>
            <section>
              <h3 className="type-title">Span of control</h3>
              {teamBrief.leadership.length === 0 ? (
                <p className="type-secondary mt-3">No leaders in this view.</p>
              ) : (
                <ul className="mt-3">
                  {teamBrief.leadership.map((row) => (
                    <li
                      key={row.name}
                      className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline py-3"
                    >
                      <span className="font-medium">
                        {row.name}
                        <span className="ml-3 font-normal type-secondary">
                          {row.role} · {row.reportCount} reports
                        </span>
                      </span>
                      <span className="font-semibold">{row.score}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {level === 'mentor' &&
          (mentorBriefs.length === 0 ? (
            <p className="type-secondary mt-6">No mentors in this view.</p>
          ) : (
            <ul className="mt-6">
              {mentorBriefs.map((row) => (
                <li
                  key={row.mentor}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline py-3"
                >
                  <span className="font-medium">{row.mentor}</span>
                  <span className="type-secondary">
                    Ready {row.ready} · Watch {row.watch} · At risk {row.atRisk}
                  </span>
                </li>
              ))}
            </ul>
          ))}
      </section>
    </div>
  )
}
