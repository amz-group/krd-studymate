import { Home, Presentation, Image, FileText, FolderOpen, Settings, Info } from 'lucide-react';

// Central navigation config shared by sidebar + mobile bottom nav.
export const navItems = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/presentation-builder', key: 'nav.presentation', icon: Presentation },
  { to: '/poster-maker', key: 'nav.poster', icon: Image },
  { to: '/report-assignment', key: 'nav.report', icon: FileText },
  { to: '/projects', key: 'nav.projects', icon: FolderOpen },
  { to: '/about', key: 'nav.about', icon: Info },
  { to: '/settings', key: 'nav.settings', icon: Settings },
];