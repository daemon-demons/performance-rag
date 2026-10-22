import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

function AttentionLines({ people, onOpen }) {
  if (!people?.length) {
    return <p className="type-secondary mt-3">No one needs monitoring.</p>
  }
  return (
    <ul className="mt-3">
      {people.map((person) => (
        <li
          key={person.id || person.name}
          className="border-b border-hairline py-3"
        >
          <div className="flex flex-wrap items-baseline gap-3">
            {person.id ? (
              <button
                type="button"
                onClick={() => onOpen(person.id)}
                className="hit text-left font-medium text-tessolve-navy"
              >
                {person.name}
              </button>
            ) : (
              <span className="font-medium">{person.name}</span>
            )}
            <span className="type-secondary">{person.billingMonths} mo</span>
            <span className="type-secondary">{person.reasons.join(' · ')}</span>
          </div>
          {person.action ? (
            <p className="type-secondary mt-3">{person.action}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function Worklist({ groups, onOpen }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.id}>
          <h3 className="type-title">{group.label}</h3>
          {group.items.length === 0 ? (
            <p className="type-secondary mt-3">None in this view.</p>
          ) : (
            <ul className="mt-3">
              {group.items.map((item) => (
                <li key={item.id} className="border-b border-hairline py-3">
                  {item.personId ? (
                    <button
                      type="button"
                      onClick={() => onOpen(item.personId)}
                      className="hit text-left"
                    >
                      {item.text}
                    </button>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

export default function ReportView() {
  const { employees, filteredEmployees, filters } = useApp()
  const location = useLocation()
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
    const next = location.state
    if (!next?.personId) return
    setLevel(next.level || 'person')
    setPersonId(next.personId)
  }, [location.state])

  useEffect(() => {
    if (!personId) {
      setPersonId(people[0]?.id || '')
      return
    }
    const known =
      people.some((person) => person.id === personId) ||
      employees.some((person) => person.id === personId)
    if (!known) setPersonId(people[0]?.id || '')
  }, [people, employees, personId])

  const openPerson = (id) => {
    setLevel('person')
    setPersonId(id)
  }

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
  const selected =
    people.find((person) => person.id === personId) ||
    employees.find((person) => person.id === personId) ||
    null
  const personBrief = buildPersonBrief(selected, filteredEmployees, employees)
  const clientBriefs = useMemo(
    () => buildClientBriefs(filteredEmployees, filters.client, employees),
    [filteredEmployees, filters.client, employees],
  )
  const teamBrief = useMemo(
    () => buildTeamBrief(filteredEmployees, employees),
    [filteredEmployees, employees],
  )
  const mentorBriefs = useMemo(
    () => buildMentorBriefs(filteredEmployees, employees),
    [filteredEmployees, employees],
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
            <div className="mt-6">
              <p className="type-title">{personBrief.status}</p>
              {personBrief.action ? (
                <p className="mt-3 font-medium">{personBrief.action}</p>
              ) : (
                <p className="type-secondary mt-3">No action in this view.</p>
              )}
              <ul className="mt-6">
                {personBrief.evidence.map((line) => (
                  <li key={line} className="border-b border-hairline py-3">
                    {line}
                  </li>
                ))}
              </ul>
              <dl className="mt-6">
                <Fact label="Platform" value={personBrief.platform ?? '—'} />
                <Fact label="Delivery" value={personBrief.delivery ?? '—'} />
                <Fact label="Depth" value={personBrief.depth ?? '—'} />
                <Fact label="Client" value={personBrief.client} />
                <Fact label="Mentor" value={personBrief.mentor} />
                <Fact label="Reports to" value={personBrief.reportsTo} />
              </dl>
            </div>
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
                    {block.spofNote ? ` · ${block.spofNote}` : ''}
                  </p>
                  {block.lines.length > 0 && (
                    <ul className="mt-3">
                      {block.lines.map((item) => (
                        <li key={item.id} className="border-b border-hairline py-3">
                          {item.personId ? (
                            <button
                              type="button"
                              onClick={() => openPerson(item.personId)}
                              className="hit text-left"
                            >
                              {item.text}
                            </button>
                          ) : (
                            item.text
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <AttentionLines people={block.attention} onOpen={openPerson} />
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
            <Worklist groups={teamBrief.worklist} onOpen={openPerson} />
            <section>
              <h3 className="type-title">Exceptions</h3>
              {teamBrief.attention.length === 0 ? (
                <p className="type-secondary mt-3">No one needs monitoring.</p>
              ) : (
                teamBrief.attention.map((group) => (
                  <div key={group.client} className="mt-6">
                    <h4 className="font-semibold">{group.client}</h4>
                    <AttentionLines people={group.people} onOpen={openPerson} />
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
                      <button
                        type="button"
                        onClick={() => openPerson(row.id)}
                        className="hit text-left font-medium"
                      >
                        {row.name}
                        <span className="ml-3 font-normal type-secondary">
                          {row.role} · {row.reportCount} reports
                        </span>
                      </button>
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
            <div className="mt-6 space-y-6">
              {mentorBriefs.map((row) => (
                <section key={row.mentor}>
                  <h3 className="type-title">{row.mentor}</h3>
                  <p className="type-secondary mt-3">
                    Ready {row.ready} · Watch {row.watch} · At risk {row.atRisk}
                  </p>
                  {row.overload ? <p className="mt-3">{row.overload}</p> : null}
                  {row.mentorDeparted && row.moved.length > 0 ? (
                    <p className="mt-3">
                      Moved after departure: {row.moved.join(', ')}.
                    </p>
                  ) : null}
                  <ul className="mt-3">
                    {row.mentees.map((mentee) => (
                      <li
                        key={mentee.id || mentee.name}
                        className="flex flex-wrap items-baseline gap-3 border-b border-hairline py-3"
                      >
                        {mentee.id ? (
                          <button
                            type="button"
                            onClick={() => openPerson(mentee.id)}
                            className="hit text-left font-medium text-tessolve-navy"
                          >
                            {mentee.name}
                          </button>
                        ) : (
                          <span className="font-medium">{mentee.name}</span>
                        )}
                        <span className="type-secondary">{mentee.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ))}
      </section>
    </div>
  )
}
