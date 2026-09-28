"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from 'react';

type Position = { left: number; width: number; opacity: number };
type NavItem = { label: string; href: string };
const defaultItems: NavItem[] = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Impact', href: '#impact' },
  { label: 'Initiatives', href: '#events' },
  { label: 'Members', href: '/members.html' },
];

/** User-supplied sliding-pill navigation, with typed state and keyboard links. */
export default function NavHeader({ items = defaultItems }: { items?: NavItem[] }) {
  const [position, setPosition] = useState<Position>({ left: 0, width: 0, opacity: 0 });

  return (
    <nav aria-label="Main navigation" className="pill-navigation">
      <ul
        className="glass-control nav-glass relative mx-auto flex w-fit list-none rounded-full p-1"
        onMouseLeave={event => {
          if (!event.currentTarget.contains(document.activeElement)) setPosition(value => ({ ...value, opacity: 0 }));
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPosition(value => ({ ...value, opacity: 0 }));
        }}
      >
        {items.map(item => <Tab key={item.href} item={window.location.pathname === '/members.html' && item.href.startsWith('#') ? { ...item, href: `/${item.href}` } : item} setPosition={setPosition} />)}
        <li
          aria-hidden="true"
          className="nav-cursor glass-cursor pointer-events-none absolute bottom-1 top-1 z-0 rounded-full"
          style={{ width: position.width, opacity: position.opacity, transform: `translateX(${position.left}px)`, left: 0 }}
        />
      </ul>
    </nav>
  );
}

function Tab({ item, setPosition }: { item: NavItem; setPosition: Dispatch<SetStateAction<Position>> }) {
  const ref = useRef<HTMLLIElement>(null);
  function moveCursor() {
    if (!ref.current) return;
    setPosition({ width: ref.current.getBoundingClientRect().width, left: ref.current.offsetLeft, opacity: 1 });
  }
  return (
    <li ref={ref} onMouseEnter={moveCursor} onFocus={moveCursor} className="relative z-10">
      <a href={item.href} className="pill-link relative flex min-h-11 items-center justify-center rounded-full px-3 text-[10px] uppercase tracking-[0.06em] md:px-5 md:text-[11px]">{item.label}</a>
    </li>
  );
}
