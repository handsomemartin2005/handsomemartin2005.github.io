import { BeakerIcon, BoltIcon, PaperAirplaneIcon, ShieldCheckIcon, Squares2X2Icon, ViewfinderCircleIcon } from '@heroicons/react/24/outline';
import type { ResearchArea } from '@/types/publication';

const icons = {
    all: Squares2X2Icon,
    'software-security': ShieldCheckIcon,
    'computer-vision': ViewfinderCircleIcon,
    energy: BoltIcon,
    vla: PaperAirplaneIcon,
    other: BeakerIcon,
} satisfies Record<ResearchArea | 'all', typeof Squares2X2Icon>;

export default function ResearchAreaIcon({ area }: { area: ResearchArea | 'all' }) {
    const Icon = icons[area];
    return <Icon className="rl-area-icon" aria-hidden="true" focusable="false" />;
}
