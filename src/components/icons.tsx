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
