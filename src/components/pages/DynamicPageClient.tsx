'use client';

import ResearchLibrary from '@/components/publications/ResearchLibrary';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import { Publication } from '@/types/publication';
import {
  PublicationPageConfig,
  TextPageConfig,
  CardPageConfig,
  CardItem,
} from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

export type DynamicPageLocaleData =
  | {
      type: 'publication';
      config: PublicationPageConfig;
      publications: Publication[];
      energyProjects?: CardPageConfig;
      agentProject?: CardItem;
    }
  | { type: 'text'; config: TextPageConfig; content: string }
  | { type: 'card'; config: CardPageConfig; additionalSection?: CardPageConfig };

interface DynamicPageClientProps {
  dataByLocale: Record<string, DynamicPageLocaleData>;
  defaultLocale: string;
}

export default function DynamicPageClient({ dataByLocale, defaultLocale }: DynamicPageClientProps) {
  const locale = useLocaleStore((state) => state.locale);
  const fallback = dataByLocale[defaultLocale] || Object.values(dataByLocale)[0];
  const pageData = dataByLocale[locale] || fallback;

  if (!pageData) {
    return null;
  }

  if (pageData.type === 'publication' && pageData.config.show_research_groups) {
    return <ResearchLibrary
      locale={locale}
      publications={pageData.publications}
      agentProject={pageData.agentProject}
      energyProjects={pageData.energyProjects?.items ?? []}
    />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {pageData.type === 'publication' && (
        <PublicationsList
          config={pageData.config}
          publications={pageData.publications}
          energyProjects={pageData.energyProjects}
          agentProject={pageData.agentProject}
        />
      )}
      {pageData.type === 'text' && (
        <TextPage config={pageData.config} content={pageData.content} />
      )}
      {pageData.type === 'card' && (
        <CardPage config={pageData.config} additionalSection={pageData.additionalSection} />
      )}
    </div>
  );
}
