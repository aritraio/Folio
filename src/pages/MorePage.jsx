import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  TrendingUp,
  PieChart,
  Upload,
  Settings,
  ArrowUpRight,
  UserRound,
} from 'lucide-react';
import { PageHeading } from '../components/ui/WorkspaceUI';
const items = [
  ['/assistant', 'Your money assistant', 'Ask about spending, merchants and saving habits.', MessageCircle],
  ['/investments', 'Investments', 'Stocks, mutual funds and deposits in one simple view.', TrendingUp],
  ['/analytics', 'Spending insights', 'Explore your spending and cash flow.', PieChart],
  ['/imports/new', 'Import a statement', 'Review transactions before adding them.', Upload],
  ['/learn', 'Learn the basics', 'Short lessons about tax, saving and investing.', BookOpen],
  ['/settings', 'Settings', 'Appearance, profiles, backups and data controls.', Settings],
  ['/login', 'Cloud account', 'Sign in and manage your private cloud backup.', UserRound],
];
export default function MorePage() {
  return (
    <div className="v-stack">
      <PageHeading title="A little more." description="Your other tools, all in one place." />
      <div className="v-tool-grid">
        {items.map(([to, title, text, Icon]) => (
          <Link to={to} key={to} className="v-tool">
            <span className="v-icon-tile">
              <Icon size={20} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <ArrowUpRight size={17} />
          </Link>
        ))}
      </div>
    </div>
  );
}
