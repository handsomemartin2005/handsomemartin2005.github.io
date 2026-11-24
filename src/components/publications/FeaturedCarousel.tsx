'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMessages } from '@/lib/i18n/useMessages';
import type { Publication, ResearchArea } from '@/types/publication';
import type { CardItem } from '@/types/page';

interface Slide {
    id: string;
    area: ResearchArea;
    name: string;
    subtitle: string;
    meta: string;
    authors?: string;
    pdf?: string;
    cover?: string;
}

const leadingIds = ['zhang2026echoes', 'zhang-rigor-omr', 'henan-procurement', 'zhang-relief'];
const covers: Record<string, string> = {
    'zhang2026echoes': '/assets/echoes-cover.webp',
    'zhang-rigor-omr': '/assets/paper-covers/rigor-omr.webp',
    'zhang2026hgdefect': '/assets/paper-covers/hgdefect-yolo.webp',
    'zhang2026schmdetr': '/assets/paper-covers/sch-mdetr.webp',
    'zhang-uav-residual-adaptation': '/assets/paper-covers/language-conditioned-uav-control.webp',
};

function priority(id: string) {
    const rank = leadingIds.indexOf(id);
    return rank === -1 ? leadingIds.length : rank;
}

export default function FeaturedCarousel({ papers, energy, area, zh }: {
    papers: Publication[];
    energy?: CardItem;
    area: ResearchArea | 'all';
    zh: boolean;
}) {
    const { publications: labels } = useMessages();
    const [position, setPosition] = useState({ index: 0, previous: -1, direction: 1 });
    const touch = useRef<{ x: number; y: number } | null>(null);
    const slides: Slide[] = papers.map(p => {
        const colon = p.title.indexOf(':');
        return {
            id: p.id, area: p.researchArea,
            name: colon < 0 ? p.title : p.title.slice(0, colon),
            subtitle: colon < 0 ? p.description ?? '' : p.title.slice(colon + 1).trim(),
            meta: [p.targetVenue || p.conference || p.journal, labels.status[p.status]].filter(Boolean).join(' / '),
            authors: p.authors.map(a => a.name).join(', '), pdf: p.pdfUrl, cover: covers[p.id],
        };
    });
    if (energy && (area === 'all' || area === 'energy')) {
        slides.push({ id: 'henan-procurement', area: 'energy', name: zh ? '代理购电预测' : 'Procurement forecasting', subtitle: energy.title, meta: zh ? '科研项目' : 'Research project' });
    }
    slides.sort((a,b) => priority(a.id) - priority(b.id));
    if (!slides.length) return null;
    const current = slides[position.index];
    const multiple = slides.length > 1;
    function move(direction: number) {
        if (!multiple) return;
        setPosition(last => ({ index: (last.index + direction + slides.length) % slides.length, previous: last.index, direction }));
    }
    return <section className="rl-feature" data-field={current.area} data-direction={position.direction} tabIndex={multiple ? 0 : undefined}
        aria-label={zh ? '精选研究' : 'Featured research'} aria-roledescription={zh ? '轮播' : 'carousel'}
        onKeyDown={event => {
            if (multiple && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
            }
        }}
        onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={event => {
            if (!touch.current) return;
            const point = event.changedTouches[0];
            const dx = point.clientX - touch.current.x, dy = point.clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
        }}>
        <div className="rl-stage">
            {slides.map((slide, i) => <article key={slide.id} className="rl-slide" data-active={i === position.index} data-out={i === position.previous} data-animated={position.previous >= 0}
                inert={i !== position.index} aria-hidden={i !== position.index}>
                <div className="rl-feature-copy">
                    <p className="rl-kicker">{slide.meta}</p>
                    <h2 className={slide.name.length > 38 ? 'rl-long-title' : undefined} lang={slide.area === 'energy' && zh ? 'zh' : 'en'}>{slide.name}</h2>
                    <p className="rl-subtitle">{slide.subtitle}</p>
                    {slide.authors && <p className="rl-authors">{slide.authors}</p>}
                    {slide.pdf && <a href={slide.pdf} className="rl-primary" download aria-label={`${labels.downloadPdf} · ${slide.name}`}><ArrowDownTrayIcon width={15} aria-hidden="true" />{labels.downloadPdf}</a>}
                    {slide.area === 'energy' && <Link href="/experience/#energy-projects" className="rl-primary">{labels.viewEnergyProjects} →</Link>}
                </div>
                {slide.cover && <div className="rl-cover"><Image src={slide.cover} alt={zh ? `${slide.name} 稿件首页` : `${slide.name} manuscript cover`} width={506} height={716} priority={i === 0} /></div>}
            </article>)}
        </div>
        <div className="rl-carousel-bar">
            <span>{labels.researchAreas[current.area]}</span>
            {multiple && <div className="rl-pager">
                <button type="button" aria-label={zh ? '上一项研究' : 'Previous research item'} onClick={() => move(-1)}><ChevronLeftIcon width={17} /></button>
                <span aria-hidden="true">{position.index + 1} / {slides.length}</span>
                <button type="button" aria-label={zh ? '下一项研究' : 'Next research item'} onClick={() => move(1)}><ChevronRightIcon width={17} /></button>
            </div>}
        </div>
        <span role="status" className="sr-only">{`${position.index + 1} / ${slides.length} · ${current.name}`}</span>
    </section>;
}
