import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { lessons } from '../data/lessons';
import { useData } from '../contexts/DataContext';
import { getPlanning, completeLesson } from '../services/planning';
import { PageHeading, Panel } from '../components/ui/WorkspaceUI';
export default function LearnPage() {
  useData();
  const [params, setParams] = useSearchParams(),
    [answer, setAnswer] = useState(null);
  const selected = lessons.find((l) => l.id === params.get('lesson')),
    done = getPlanning().completedLessons;
  if (selected)
    return (
      <div className="v-stack v-reading">
        <button
          className="v-text-link"
          onClick={() => {
            setParams({});
            setAnswer(null);
          }}
        >
          <ArrowLeft size={16} />
          All lessons
        </button>
        <PageHeading
          title={selected.title}
          description={`${selected.category} · ${selected.minutes} minute read`}
        />
        <p className="v-notice">
          General education, not personal investment or tax advice. India-focused tax topics; verify current
          rules for your tax year.
        </p>
        <Panel>
          {selected.sections.map(([title, text]) => (
            <div className="v-lesson-section" key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          ))}
          <a className="v-text-link" href={selected.url} target="_blank" rel="noreferrer">
            {selected.source}
            <ArrowUpRight size={15} />
          </a>
          <p className="v-caption">
            Reference reviewed 4 November 2026. Follow the official source for updates.
          </p>
        </Panel>
        <Panel title="A quick check">
          <p>{selected.question}</p>
          <div className="v-quiz">
            {selected.options.map((o, i) => (
              <button
                key={o}
                aria-pressed={answer === i}
                className={answer === i ? 'selected' : ''}
                onClick={() => setAnswer(i)}
              >
                {o}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p role="status" className="v-notice">
              {answer === selected.answer
                ? 'That’s right.'
                : 'Not quite. ' + selected.options[selected.answer]}
            </p>
          )}
          {answer === selected.answer && (
            <button className="v-button v-primary" onClick={() => completeLesson(selected.id)}>
              <CheckCircle2 size={16} />
              {done.includes(selected.id) ? 'Completed' : 'Mark as read'}
            </button>
          )}
        </Panel>
        <Link to="/assistant" className="v-text-link">
          Ask about your own spending <ArrowUpRight size={15} />
        </Link>
      </div>
    );
  return (
    <div className="v-stack">
      <PageHeading
        title="A little knowledge goes a long way."
        description="Short, practical lessons. No market noise."
      />
      <div className="v-row">
        <span className="v-tag">
          <BookOpen size={14} />
          Your learning shelf
        </span>
        <span className="v-muted">
          {done.length} of {lessons.length} completed
        </span>
      </div>
      <div className="v-tool-grid">
        {lessons.map((l) => (
          <button
            className="v-tool v-lesson-tile"
            key={l.id}
            onClick={() => {
              setAnswer(null);
              setParams({ lesson: l.id });
            }}
          >
            <span className="v-icon-tile">
              {done.includes(l.id) ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
            </span>
            <div>
              <small>
                {l.category} · {l.minutes} min
              </small>
              <h2>{l.title}</h2>
              <p>{l.summary}</p>
            </div>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      <p className="v-caption">
        Educational content only. No stock tips, tax filing or product recommendations.
      </p>
    </div>
  );
}
