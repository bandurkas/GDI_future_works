'use client';

import { useState, useMemo } from 'react';
import { Search, Globe, Mail, Phone, ExternalLink, Calendar } from 'lucide-react';
import { fmt } from '@/lib/utils';
import s from './InterestsView.module.css';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  createdAt: string;
  activities: {
    notes: string | null;
  }[];
}

export default function InterestsView({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('');

  const parsedLeads = useMemo(() => {
    return leads.map(l => {
      let details: any = {};
      try {
        if (l.activities[0]?.notes) {
          details = JSON.parse(l.activities[0].notes);
        }
      } catch (e) {}

      return {
        ...l,
        interest: details.interest || '—',
        goal: details.goal || '—',
        budget: details.budget || '—',
      };
    });
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return parsedLeads;
    return parsedLeads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.email.toLowerCase().includes(q) || 
      l.phone?.toLowerCase().includes(q) ||
      l.country?.toLowerCase().includes(q) ||
      l.interest.toLowerCase().includes(q)
    );
  }, [parsedLeads, search]);

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.titleArea}>
          <h1>Partnership Interests</h1>
          <p>{leads.length} registrations from the partnership form</p>
        </div>

        <div className={s.actions}>
          <div className={s.searchWrap}>
            <Search size={16} className={s.searchIcon} />
            <input
              className={s.searchInput}
              type="text"
              placeholder="Search prospects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className={s.tableCard}>
        <div className={s.tableScroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name & Email</th>
                <th>Channel</th>
                <th>Country</th>
                <th>Interest</th>
                <th>Goal</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(l => (
                <tr key={l.id}>
                  <td className={s.dateCell}>
                    <div className={s.date}>
                      {new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className={s.time}>
                      {new Date(l.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className={s.nameCell}>
                    <div className={s.name}>{l.name}</div>
                    <div className={s.email}>
                      <Mail size={12} />
                      {l.email}
                    </div>
                  </td>
                  <td className={s.contactCell}>
                    {l.phone ? (
                      <a 
                        href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className={s.waLink}
                      >
                        <Phone size={14} />
                        <span>{l.phone}</span>
                        <ExternalLink size={10} className={s.extIcon} />
                      </a>
                    ) : (
                      <span className={s.na}>No phone</span>
                    )}
                  </td>
                  <td className={s.countryCell}>
                    <div className={s.country}>
                      <Globe size={14} />
                      {l.country || '—'}
                    </div>
                  </td>
                  <td className={s.interestCell}>
                    <div className={s.interestTag}>{l.interest}</div>
                  </td>
                  <td className={s.goalCell}>{l.goal}</td>
                  <td className={s.budgetCell}>
                    <span className={s.budgetBadge}>{l.budget}</span>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className={s.empty}>
                    No interest registrations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
