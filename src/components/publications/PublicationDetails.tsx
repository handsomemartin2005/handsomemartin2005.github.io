'use client';

import { useMessages } from '@/lib/i18n/useMessages';
import type { Publication } from '@/types/publication';

export default function PublicationDetails({ publication }: { publication: Publication }) {
  const { publications: labels } = useMessages();
  const venue = publication.journal || publication.conference;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-600">
      <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
        {labels.status[publication.status]}
      </span>
      <span>{publication.year}</span>
      {venue && <span>· {venue}</span>}
      {publication.targetVenue && (
        <span>· {publication.status === 'in-preparation' && `${labels.targetVenue} · `}{publication.targetVenue}</span>
      )}
    </div>
  );
}
