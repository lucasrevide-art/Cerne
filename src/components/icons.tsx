/**
 * Ícones de traço fino, peso único — geometria própria (não SF Symbols).
 */
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: "0 0 18 18",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function InboxIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9h3.6l1.2 2.4h2.4L11.4 9H15" />
      <path d="M3 9V4.5A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V9" />
      <path d="M3 9v4.5A1.5 1.5 0 0 0 4.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9" />
    </svg>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="3.25" />
      <path d="M9 2v1.75M9 14.25V16M16 9h-1.75M3.75 9H2M13.77 4.23l-1.24 1.24M5.47 12.53l-1.24 1.24M13.77 13.77l-1.24-1.24M5.47 5.47 4.23 4.23" />
    </svg>
  );
}

export function UpcomingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.75" y="3.5" width="12.5" height="11.5" rx="2" />
      <path d="M2.75 7h12.5M6 2v3M12 2v3" />
    </svg>
  );
}

export function AnytimeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 2.5 15.5 6 9 9.5 2.5 6 9 2.5Z" />
      <path d="M2.5 9.5 9 13l6.5-3.5" />
      <path d="M2.5 12.5 9 16l6.5-3.5" />
    </svg>
  );
}

export function SomedayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 10.6A6 6 0 1 1 7.4 3.5a5 5 0 0 0 7.1 7.1Z" />
    </svg>
  );
}

export function LogbookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 3.5h8a1.5 1.5 0 0 1 1.5 1.5v9.5H5.5A1.5 1.5 0 0 1 4 13V3.5Z" />
      <path d="M4 3.5A1.5 1.5 0 0 1 5.5 2H12" />
      <path d="M7 7h4M7 9.5h4" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6.75 3.75 12 9l-5.25 5.25" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.75 9.5 7 12.75 14.25 5.5" />
    </svg>
  );
}

export function AreasIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1.25" />
      <rect x="10" y="2.5" width="5.5" height="5.5" rx="1.25" />
      <rect x="2.5" y="10" width="5.5" height="5.5" rx="1.25" />
      <rect x="10" y="10" width="5.5" height="5.5" rx="1.25" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="5" />
      <path d="M15.25 15.25 12 12" />
    </svg>
  );
}

export function CircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6" />
    </svg>
  );
}

export function ProjectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="2.75" width="12" height="12.5" rx="1.5" />
      <path d="M6 6.5h6M6 9h6M6 11.5h3.5" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 5.5h12M3 9h12M3 12.5h12" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3.5v11M3.5 9h11" />
    </svg>
  );
}

export function HelpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M6.9 7.1a2.1 2.1 0 1 1 3.2 1.8c-.7.45-1.1.85-1.1 1.6" />
      <circle cx="9" cy="12.6" r="0.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M11.5 3.5 14.5 6.5 6 15H3v-3Z" />
      <path d="M10 5 13 8" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M15 9H3M8 4 3 9l5 5" />
    </svg>
  );
}

export function GripIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="6.5" cy="4.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="4.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="9" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TimerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="10" r="6" />
      <path d="M9 10V6.5M6.5 2.5h5" />
    </svg>
  );
}

export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 4v10M11.5 4v10" />
    </svg>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 3.5v11l9-5.5Z" />
    </svg>
  );
}

export function StopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="4.5" width="9" height="9" rx="1.5" />
    </svg>
  );
}

export function SkipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 3.5v11l8-5.5Z" />
      <path d="M13.5 3.5v11" />
    </svg>
  );
}

export function BackupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 2.5v8M5.5 7 9 10.5 12.5 7" />
      <path d="M3 12.5v1A1.5 1.5 0 0 0 4.5 15h9a1.5 1.5 0 0 0 1.5-1.5v-1" />
    </svg>
  );
}

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="12" r="3.25" />
      <path d="M8.3 9.7 15 3M12.5 5.5 14.5 7.5M10.5 7.5 12 9" />
    </svg>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 15.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3.5" />
      <path d="M11.5 12.5 15 9l-3.5-3.5" />
      <path d="M15 9H6.5" />
    </svg>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 2.5v1.3M9 14.2v1.3M2.5 9h1.3M14.2 9h1.3M4.4 4.4l.9.9M12.7 12.7l.9.9M13.6 4.4l-.9.9M5.3 12.7l-.9.9" />
    </svg>
  );
}

export function WaitingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M9 5.5V9l2.5 1.5" />
    </svg>
  );
}

export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 2.5 11.1 6.9 16 7.6 12.5 11 13.3 15.8 9 13.5 4.7 15.8 5.5 11 2 7.6 6.9 6.9 9 2.5Z" />
    </svg>
  );
}

export function StarFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M9 2.5 11.1 6.9 16 7.6 12.5 11 13.3 15.8 9 13.5 4.7 15.8 5.5 11 2 7.6 6.9 6.9 9 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RepeatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8.5V7a3 3 0 0 1 3-3h7" />
      <path d="M11.5 2 13.5 4l-2 2" />
      <path d="M14.5 9.5V11a3 3 0 0 1-3 3h-7" />
      <path d="M6.5 16 4.5 14l2-2" />
    </svg>
  );
}
