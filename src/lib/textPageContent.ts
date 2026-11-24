import { parseBibTeX } from './bibtexParser';
import { getBibtexContent, getMarkdownContent, getPageConfig } from './content';
import { getMessages } from './i18n/messages';
import type { CardItem, CardPageConfig, PublicationPageConfig, TextPageConfig } from '@/types/page';

function getCardItems(page: string, locale?: string): CardItem[] {
  return getPageConfig<CardPageConfig>(page, locale)?.items ?? [];
}

function formatCard(item: CardItem, projectLinkLabel: string): string {
  const metadata = [item.subtitle, item.date].filter(Boolean).join(' · ');
  const link = item.link ? `[${item.link_label ?? projectLinkLabel}](${item.link})` : '';
  return [`### ${item.title}`, metadata, item.content?.trim(), link].filter(Boolean).join('\n\n');
}

export function loadTextPageContent(config: TextPageConfig, locale?: string): string {
  const intro = getMarkdownContent(config.source, locale).trim();
  const sections = config.cv_sections;
  if (!sections) return intro;

  const labels = getMessages(locale ?? 'en').publications;
  const publicationPage = getPageConfig<PublicationPageConfig>('publications', locale);
  const papers = publicationPage ? parseBibTeX(getBibtexContent(publicationPage.source, locale), locale) : [];
  const publicationList = papers.map((paper) => {
    const authors = paper.authors.map((author) => author.isHighlighted ? `**${author.name}**` : author.name).join(', ');
    const venue = paper.journal || paper.conference || paper.targetVenue;
    const venueLabel = venue && paper.status === 'in-preparation' ? `${labels.targetVenue} ${venue}` : venue;
    const details = [labels.status[paper.status], venueLabel, paper.year, paper.reviewScores && `${labels.reviewScores} ${paper.reviewScores}`];
    return `- **${paper.title}**  \n  ${[authors, details.filter(Boolean).join(' · ')].filter(Boolean).join('  \n  ')}`;
  });
  const awardList = getCardItems('awards', locale).map((item) => (
    `- **${item.title}** · ${[item.subtitle, item.date].filter(Boolean).join(' · ')}`
  ));
  const internshipCards = getCardItems('experience', locale).map((item) => formatCard(item, sections.projectLink));
  const projectCards = getCardItems('projects', locale).map((item) => formatCard(item, sections.projectLink));

  return [
    intro,
    `## ${sections.internships}`, ...internshipCards,
    `## ${sections.projects}`, ...projectCards,
    `## ${sections.publications}`, publicationList.join('\n'),
    `## ${sections.awards}`, awardList.join('\n'),
    config.appendix ? getMarkdownContent(config.appendix, locale).trim() : '',
  ].filter(Boolean).join('\n\n');
}
