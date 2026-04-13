'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { KanbanCard, KanbanStatus, normalizeCrmData } from '@/lib/crm-normalize';
import { fmt } from '@/lib/utils';
import s from './PipelineView.module.css';

const COLUMNS: { id: KanbanStatus; label: string; icon: string }[] = [
  { id: 'NEW',       label: '🔥 Fresh',      icon: '⚡' },
  { id: 'CONTACTED', label: '📞 Contacted',  icon: '🗣️' },
  { id: 'QUALIFIED', label: '💬 Qualified',  icon: '✨' },
  { id: 'CONVERTED', label: '🎓 Converted',  icon: '✅' },
];

export default function StudentsView({ students, freshLeads = [] }: { students: any[], freshLeads?: any[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false); // DnD needs client-side only mount

  useEffect(() => {
    setCards(normalizeCrmData(students, freshLeads));
    setIsReady(true);
  }, [students, freshLeads]);

  // Group cards by column
  const columnsData = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? cards.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.email.toLowerCase().includes(q) || 
          c.phone?.toLowerCase().includes(q)
        )
      : cards;

    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = filtered.filter(c => c.status === col.id);
      return acc;
    }, {} as Record<KanbanStatus, KanbanCard[]>);
  }, [cards, search]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as KanbanStatus;
    const cardId = draggableId;

    // Optimistic Update
    const updatedCards = [...cards];
    const cardIdx = updatedCards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return;

    const targetCard = { ...updatedCards[cardIdx], status: newStatus };
    updatedCards.splice(cardIdx, 1);
    
    // Logic to insert into correct position if we want to preserve order
    // For now, we just add it to the list and memo will resort
    setCards([...updatedCards, targetCard]);

    // API Call
    try {
      let bodyStatus = newStatus;
      
      // Map KanbanStatus to DB StudentStatus if needed
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
      // Revert if error? Maybe too jarring. 
      // User can refresh.
    }
  };

  if (!isReady) return <div className={s.pipelineContainer}>Loading Pipeline...</div>;

  return (
    <div className={s.pipelineContainer}>
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
          {COLUMNS.map(col => (
            <div key={col.id} className={col.id === 'CONVERTED' ? `${s.column} ${s.columnConverted}` : s.column}>
              <div className={s.columnHeader}>
                <div className={s.columnTitle}>
                  <span>{col.icon}</span> {col.label}
                </div>
                <span className={s.cardCount}>{columnsData[col.id]?.length || 0}</span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={s.cardList}
                    style={{ background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                  >
                    <AnimatePresence>
                      {columnsData[col.id].map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={{ ...dragProvided.draggableProps.style }}
                            >
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className={`${s.card} ${dragSnapshot.isDragging ? s.cardDragging : ''} ${s.glassEffect}`}
                              >
                                <div className={s.accentGlow} />
                                <div className={`${s.cardType} ${card.type === 'LEAD' ? s.leadType : s.studentType}`}>
                                  {card.type}
                                </div>
                                <div className={s.cardName}>{card.name}</div>
                                <div className={s.cardSource}>
                                  {card.source} • {fmt(new Date(card.createdAt))}
                                </div>

                                {card.details?.course && (
                                  <div className={s.leadIntent}>
                                    📚 {card.details.course}
                                  </div>
                                )}

                                <div className={s.cardFooter}>
                                  {card.phone ? (
                                    <a 
                                      href={`https://wa.me/${card.phone.replace(/\D/g, '')}`} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className={s.waLink}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      💬 WhatsApp
                                    </a>
                                  ) : <div />}
                                  <div className={s.cardTime}>
                                    {card.originalId.slice(0, 4)}
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
