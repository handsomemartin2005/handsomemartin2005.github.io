'use client';

import { useState } from 'react';
import FeaturedCarousel from './FeaturedCarousel';
import ResearchAreaIcon from './ResearchAreaIcon';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Publication, ResearchArea } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import './research-library.css';

const areas: ResearchArea[] = ['software-security', 'computer-vision', 'energy', 'other'];

export default function ResearchLibrary({ publications, locale }: {
    publications: Publication[];
    locale: string;
}) {
    const { common, publications: labels } = useMessages();
    const zh = locale.startsWith('zh');
    const [area, setArea] = useState<ResearchArea | 'all'>('all');
    const [query, setQuery] = useState('');
    const [year, setYear] = useState('');
    const [type, setType] = useState('');
    const needle = query.trim().toLowerCase();
    const matches = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' ').toLowerCase().includes(needle);
    const papers = publications.filter(p => (area === 'all' || area === p.researchArea) && (!year || String(p.year) === year) && (!type || type === p.type) &&
        matches(p.title, p.targetVenue, p.conference, p.journal, ...p.tags, ...p.authors.map(a => a.name), labels.researchAreas[p.researchArea]));
    const reset = () => { setArea('all'); setQuery(''); setYear(''); setType(''); };
    const download = (p: Publication) => p.pdfUrl && (
        <a className="rl-download" href={p.pdfUrl} download aria-label={`${labels.downloadPdf} · ${p.title}`}>
            <ArrowDownTrayIcon width={15} aria-hidden="true" />PDF
        </a>
    );
    return <div className="research-library">
        <header className="rl-mast">
            <p className="rl-kicker">{zh ? '论文与研究' : 'Publications'}</p>
            <h1 lang="en">Research library</h1>
        </header>
        {!needle && !year && !type && <FeaturedCarousel key={area} papers={papers} zh={zh} />}
        <section className="rl-controls" aria-label={labels.filters}>
            <div className="rl-areas" role="group" aria-label={zh ? '研究方向' : 'Research area'}>
                {(['all', ...areas] as const).map(key => <button key={key} data-field={key} type="button" aria-pressed={area === key} onClick={() => setArea(key)}>
                    <ResearchAreaIcon area={key} />
                    {key === 'all' ? common.all : labels.researchAreas[key]}
                </button>)}
            </div>
            <div className="rl-tools">
                <label className="rl-search"><MagnifyingGlassIcon width={16} aria-hidden="true" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} aria-label={labels.searchPlaceholder} placeholder={labels.searchPlaceholder} /></label>
                <select aria-label={labels.year} value={year} onChange={e => setYear(e.target.value)}><option value="">{zh ? '全部年份' : 'All years'}</option>{[...new Set(publications.map(p => p.year))].sort((a,b) => b-a).map(y => <option key={y}>{y}</option>)}</select>
                <select aria-label={labels.type} value={type} onChange={e => setType(e.target.value)}><option value="">{zh ? '全部类型' : 'All types'}</option>{[...new Set(publications.map(p => p.type))].map(t => <option key={t} value={t}>{t === 'manuscript' ? labels.manuscript : t === 'conference' ? (zh ? '会议论文' : 'Conference paper') : t}</option>)}</select>
            </div>
        </section>
        <div className="rl-results" aria-live="polite">
            {areas.map(field => {
                const group = papers.filter(p => p.researchArea === field);
                if (!group.length) return null;
                return <section key={field} data-field={field} aria-label={labels.researchAreas[field]}>
                    {group.map(p => <article key={p.id} className="rl-row">
                        <p className="rl-field">
                            <ResearchAreaIcon area={field} />
                            <span>{labels.researchAreas[field]}</span>
                        </p>
                        <div><h3 lang="en">{p.title}</h3><p className="rl-meta">{[p.targetVenue || p.conference || p.journal || p.year, labels.status[p.status], p.reviewScores && `${labels.reviewScores} ${p.reviewScores}`].filter(Boolean).join(' · ')}</p>
                            {p.authors.length > 0 && <p className="rl-authors">{p.authors.map(a => a.name).join(', ')}</p>}
                            {p.description && <p className="rl-description">{p.description}</p>}
                            {p.abstract && <details><summary>{labels.abstract}</summary><p>{p.abstract}</p></details>}
                            {p.status === 'published' && p.bibtex && <details><summary>{labels.bibtex}</summary><pre>{p.bibtex}</pre><button className="rl-inline" onClick={() => navigator.clipboard.writeText(p.bibtex || '')}>{common.copyToClipboard}</button></details>}
                        </div>
                        <div className="rl-actions">{download(p)}{p.code && <a href={p.code}>{labels.code} ↗</a>}{p.doi && <a href={`https://doi.org/${p.doi}`}>DOI ↗</a>}</div>
                    </article>)}
                </section>;
            })}
            {!papers.length && <div className="rl-empty"><p>{labels.noResults}</p><button className="rl-inline" onClick={reset}>{zh ? '清除筛选' : 'Clear filters'}</button></div>}
        </div>
    </div>;
}
