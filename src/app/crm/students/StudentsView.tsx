'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Calendar, Edit2, Plus, Mail, Clock, Globe, Tag } from 'lucide-react';
import { KanbanCard, KanbanStatus, normalizeCrmData } from '@/lib/crm-normalize';
import { fmt } from '@/lib/utils';
import AIGlow from '@/components/AIGlow/AIGlow';
import s from './PipelineView.module.css';


const countryFlag = {
  Indonesia: "🇮🇩", India: "🇮🇳", Singapore: "🇸🇬", Malaysia: "🇲🇾",
  Thailand: "🇹🇭", Vietnam: "🇻🇳", Philippines: "🇵🇭", Japan: "🇯🇵",
  China: "🇨🇳", USA: "🇺🇸", UK: "🇬🇧",
  Australia: "🇦🇺", Germany: "🇩🇪", Canada: "🇨🇦",
  Brazil: "🇧🇷", Russia: "🇷🇺", UAE: "🇦🇪",
} as Record<string,string>;
function getFlag(c: string | null): string {
  if (!c) return "";
  return countryFlag[c] || "🌍";
}

function formatPhone(p: string): string {
  const clean = p.replace(/\D/g, '');
  if (clean.startsWith('62') && clean.length >= 10) {
    return '+' + clean.slice(0,2) + ' ' + clean.slice(2,5) + '-' + clean.slice(5,9) + '-' + clean.slice(9);
  }
  return p;
}

const STAGES: Record<KanbanStatus, string> = {
  'NEW': 'Fresh',
  'CONTACTED': 'Contacted',
  'QUALIFIED': 'Qualified',
  'CONVERTED': 'Converted',
  'ARCHIVED': 'Archived',
};

export default function StudentsView({ students, freshLeads = [] }: { students: any[], freshLeads?: any[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setCards(normalizeCrmData(students, freshLeads));
    setIsReady(true);
  }, [students, freshLeads]);

  const filteredCards = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? cards.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.email.toLowerCase().includes(q) || 
          c.phone?.toLowerCase().includes(q)
        )
      : cards;
  }, [cards, search]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as KanbanStatus;
    const cardId = draggableId;

    const updatedCards = [...cards];
    const cardIdx = updatedCards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const targetCard = { ...updatedCards[cardIdx], status: newStatus };
    updatedCards.splice(cardIdx, 1);
    
    setCards([...updatedCards, targetCard]);

    try {
      let bodyStatus = newStatus;
      
      if (targetCard.type === 'STUDENT') {
        const studentMap: Record<KanbanStatus, string> = {
          'NEW': 'LEAD',
          'CONTACTED': 'LEAD',
          'QUALIFIED': 'LEAD',
          'CONVERTED': 'ACTIVE',
          'ARCHIVED': 'ARCHIVED'
        };
        bodyStatus = studentMap[newStatus] as KanbanStatus;
      }

      const endpoint = targetCard.type === 'LEAD' 
        ? `/api/admin/leads/${targetCard.originalId}`
        : `/api/admin/students/${targetCard.originalId}/status`;
      
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: bodyStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      router.refresh();
    } catch (err) {
      console.error('Pipeline update failed:', err);
    }
  };

  if (!isReady) return <div className={s.pipelineContainer}><AIGlow /></div>;

  return (
    <div className={s.pipelineContainer}>
      <AIGlow />
      <header className={s.header}>
        <div className={s.titleArea}>
          <h1>SALES PIPELINE</h1>
          <p>{cards.length} unified contacts active in funnel</p>
        </div>

        <div className={s.actions}>
          <div className={s.searchWrap}>
             <input
                className={s.searchInput}
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={s.board}>
          {Object.entries(STAGES).map(([key, label]) => {
            const columnCards = filteredCards.filter(c => c.status === key);
            return (
              <div key={key} className={s.column}>
                <div className={s.columnHeader}>
                  <div className={s.columnTitle}>
                    {label}
                    <span className={s.cardCount}>{columnCards.length}</span>
                  </div>
                  <button className={s.actionIcon} style={{ border: 'none' }}>
                    <Plus size={14} />
                  </button>
                </div>

                <Droppable droppableId={key}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={s.cardList}
                    >
                      {columnCards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${s.card} ${dragSnapshot.isDragging ? s.cardDragging : ''}`}
                              >
                                {/* Section 1: Header — Type + Country */}
                                <div className={s.cardHeader}>
                                  <div className={`${s.cardType} ${card.type === 'LEAD' ? s.leadType : s.studentType}`}>
                                    {card.type}
                                  </div>
                                  {card.country && (
                                    <div className={s.regionBadge}>
                                      {getFlag(card.country)} {card.country}
                                    </div>
                                  )}
                                </div>

                                {/* Section 2: Contact Info — Primary Focus */}
                                <div className={s.contactSection}>
                                  <div className={s.cardName}>{card.name}</div>
                                  {card.phone && (
                                    <a
                                      href={`https://wa.me/${card.phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={s.phoneRow}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Phone size={13} />
                                      <span>{formatPhone(card.phone)}</span>
                                    </a>
                                  )}
                                  {card.email && !card.email.includes('@noemail.gdi') && (
                                    <div className={s.emailRow}>
                                      <Mail size={11} />
                                      <span>{card.email}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Section 3: Course Info */}
                                {card.details?.course && (
                                  <div className={s.courseCard}>
                                    <div className={s.courseIcon}>📚</div>
                                    <div className={s.courseInfo}>
                                      <div className={s.courseName}>{card.details.course}</div>
                                      {(card.details.dates || card.details.times) && (
                                        <div className={s.courseSchedule}>
                                          {card.details.dates}{card.details.dates && card.details.times ? ' · ' : ''}{card.details.times}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Section 4: Metadata */}
                                <div className={s.metaRow}>
                                  <span className={s.metaSource}>{card.utmSource || card.source || 'Direct'}</span>
                                  <span className={s.metaDot}>·</span>
                                  <span className={s.metaCampaign}>{card.utmCampaign || 'Organic'}</span>
                                  <span className={s.metaDot}>·</span>
                                  <span className={s.metaTime}>
                                    {new Date(card.createdAt).toLocaleString('en-GB', {
                                      day: '2-digit', month: 'short',
                                      hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className={s.cardActions}>
                                  {card.phone && (
                                    <a
                                      href={`https://wa.me/${card.phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`${s.actionBtn} ${s.waBtn}`}
                                      onClick={e => e.stopPropagation()}
                                      title="WhatsApp"
                                    >
                                      <MessageCircle size={13} />
                                      <span>Chat</span>
                                    </a>
                                  )}
                                  {card.phone && (
                                    <a
                                      href={`tel:${card.phone}`}
                                      className={`${s.actionBtn} ${s.callBtn}`}
                                      onClick={e => e.stopPropagation()}
                                      title="Call"
                                    >
                                      <Phone size={13} />
                                    </a>
                                  )}
                                  <button className={s.actionBtn} title="Edit">
                                    <Edit2 size={13} />
                                  </button>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
