'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Publication, researchAreas } from '@/types/publication';
import { CardItem, CardPageConfig, PublicationPageConfig } from '@/types/page';
import { CardGrid } from '@/components/pages/CardPage';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';
import PublicationDetails from './PublicationDetails';
import FormattedBibTeXText from './FormattedBibTeXText';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
    energyProjects?: CardPageConfig;
    agentProject?: CardItem;
    patents?: CardPageConfig;
}

export default function PublicationsList({ config, publications, embedded = false, energyProjects, agentProject, patents }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);

    // Extract unique years and types for filters
    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
        return uniqueYears.sort((a, b) => b - a);
    }, [publications]);

    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    // Filter publications
    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.targetVenue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;

            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    const matchesRelatedWork = (item: CardItem) => (
        selectedYear === 'all' && selectedType === 'all' &&
        `${item.title} ${item.subtitle ?? ''} ${item.content ?? ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    const areas = config.show_research_groups ? researchAreas : [undefined];
    const groups = areas.map(area => ({
        area,
        papers: area ? filteredPublications.filter(paper => paper.researchArea === area) : filteredPublications,
        energy: area === 'energy' ? (energyProjects?.items ?? []).filter(matchesRelatedWork) : [],
        agent: area === 'software-security' && agentProject && matchesRelatedWork(agentProject) ? agentProject : undefined,
    })).filter(({ papers, energy, agent }) => papers.length > 0 || energy.length > 0 || agent);

    const renderPublication = (pub: Publication, index: number) => (
        <motion.div
            key={pub.id}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200"
        >
            <div className="flex flex-col md:flex-row gap-6">
                {pub.preview && (
                    <div className="w-full md:w-48 flex-shrink-0">
                        <div className="aspect-video md:aspect-[4/3] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                            <Image
                                src={`/papers/${pub.preview}`}
                                alt={pub.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </div>
                )}
                <div className="flex-grow">
                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary mb-2 leading-tight`}>
                        <FormattedBibTeXText nodes={pub.titleNodes} fallback={pub.title} />
                    </h3>
                    {pub.authors.length > 0 && (
                        <p className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 mb-2`}>
                            {pub.authors.map((author, idx) => (
                                <span key={idx}>
                                    <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''} ${author.isCoAuthor ? `underline underline-offset-4 ${author.isHighlighted ? 'decoration-accent' : 'decoration-neutral-400'}` : ''}`}>
                                        {author.name}
                                    </span>
                                    {author.isCorresponding && (
                                        <sup className={`ml-0 ${author.isHighlighted ? 'text-accent' : 'text-neutral-600 dark:text-neutral-400'}`}>†</sup>
                                    )}
                                    {idx < pub.authors.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                    )}
                    <PublicationDetails publication={pub} />

                    {pub.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-4 line-clamp-3">
                            {pub.description}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {pub.pdfUrl && (
                            <a
                                href={pub.pdfUrl}
                                download
                                aria-label={`${messages.publications.downloadPdf} · ${pub.title}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors"
                            >
                                <ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                {messages.publications.downloadPdf}
                            </a>
                        )}
                        {pub.doi && (
                            <a
                                href={`https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                            >
                                DOI
                            </a>
                        )}
                        {pub.code && (
                            <a
                                href={pub.code}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                            >
                                {messages.publications.code}
                            </a>
                        )}
                        {pub.abstract && (
                            <button
                                onClick={() => setExpandedAbstractId(expandedAbstractId === pub.id ? null : pub.id)}
                                className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                    expandedAbstractId === pub.id
                                        ? "bg-accent text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                )}
                            >
                                <DocumentTextIcon className="h-3 w-3 mr-1.5" />
                                {messages.publications.abstract}
                            </button>
                        )}
                        {pub.status === 'published' && pub.bibtex && (
                            <button
                                onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors",
                                    expandedBibtexId === pub.id
                                        ? "bg-accent text-white"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white"
                                )}
                            >
                                <BookOpenIcon className="h-3 w-3 mr-1.5" />
                                {messages.publications.bibtex}
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {expandedAbstractId === pub.id && pub.abstract ? (
                            <motion.div
                                key="abstract"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-500 leading-relaxed">
                                        {pub.abstract}
                                    </p>
                                </div>
                            </motion.div>
                        ) : null}
                        {expandedBibtexId === pub.id && pub.bibtex ? (
                            <motion.div
                                key="bibtex"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                    <pre className="text-xs text-neutral-600 dark:text-neutral-500 overflow-x-auto whitespace-pre-wrap font-mono">
                                        {pub.bibtex}
                                    </pre>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(pub.bibtex || '');
                                            // Optional: Show copied feedback
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                        title={messages.common.copyToClipboard}
                                    >
                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {type === 'manuscript' ? messages.publications.manuscript : type.replaceAll('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-10">
                {groups.length === 0 && (
                    <p className="text-center py-12 text-neutral-500">{messages.publications.noResults}</p>
                )}
                {groups.map(({ area, papers, energy, agent }) => (
                    <section key={area ?? 'all'} className="space-y-4" aria-labelledby={area ? `research-${area}` : undefined}>
                        {area && (
                            <h2 id={`research-${area}`} className="border-b border-neutral-200 dark:border-neutral-800 pb-2 text-2xl font-serif font-bold text-primary">
                                {messages.publications.researchAreas[area]}
                            </h2>
                        )}
                        {energy.length > 0 && (
                            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
                                <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                                    {energy.map(project => <li key={project.title}>{project.title}</li>)}
                                </ul>
                                <Link href="/experience/#energy-projects" className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
                                    {messages.publications.viewEnergyProjects}
                                </Link>
                            </div>
                        )}
                        {agent && <CardGrid items={[agent]} />}
                        {papers.map(renderPublication)}
                    </section>
                ))}
                {patents && (
                    <section aria-labelledby="patents-title" className="space-y-4">
                        <h2 id="patents-title" className="border-b border-neutral-200 dark:border-neutral-800 pb-2 text-2xl font-serif font-bold text-primary">
                            {patents.title}
                        </h2>
                        <CardGrid items={patents.items} />
                    </section>
                )}
            </div>
        </motion.div>
    );
}
