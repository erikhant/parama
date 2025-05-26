// import {
//   DndContext,
//   DragEndEvent,
//   DragOverEvent,
//   DragStartEvent,
//   PointerSensor,
//   rectIntersection,
//   useSensor,
//   useSensors
// } from '@dnd-kit/core';
// import { useState } from 'react';
// import { DragPreview } from './components/DragPreview';
// import { List } from './List';
// import { SortableList } from './SortableList';

// type ItemId = string;

// const initialListA: ItemId[] = ['Apple', 'Banana', 'Cherry'];
// const initialListB: ItemId[] = [];

// export default function App() {
//   const [listA, setListA] = useState<ItemId[]>(initialListA);
//   const [listB, setListB] = useState<ItemId[]>(initialListB);
//   const [activeId, setActiveId] = useState<ItemId | null>(null);
//   const [insertionIndex, setInsertionIndex] = useState<number | null>(null);

//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragStart = (event: DragStartEvent) => {
//     setActiveId(event.active.id as ItemId);
//     if (listB.length === 0) {
//       setInsertionIndex(0);
//     }
//   };

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active } = event;
//     const draggedId = active.id as string;

//     if (listA.includes(draggedId) && insertionIndex !== null) {
//       // ✅ Prevent duplicates
//       if (!listB.includes(draggedId)) {
//         setListA((prev) => prev.filter((id) => id !== draggedId));
//         setListB((prev) => {
//           const newList = [...prev];
//           newList.splice(insertionIndex, 0, draggedId);
//           return newList;
//         });
//       }
//     }

//     setActiveId(null);
//     setInsertionIndex(null);
//   };

//   const handleDragOver = (event: DragOverEvent) => {
//     const { active, over } = event;
//     console.log('active', active);
//     console.log('over', over);
//     if (!over || !active) return;

//     const isDraggingFromA = listA.includes(active.id as string);
//     const isOverB = over.data.current?.listB;

//     if (isDraggingFromA) {
//       if (listB.length === 0) {
//         setInsertionIndex(0);
//       } else if (isOverB) {
//         console.log('isOverB', isOverB);
//         console.log('over.id', over.id);
//         const overIndex = listB.indexOf(over.id as string);
//         const overElement = document.querySelector(`[data-id="${over.id}"]`);
//         console.log('overElement', overElement);
//         if (overElement) {
//           const rect = overElement.getBoundingClientRect();
//           const midpoint = rect.top + rect.height / 2;
//           const shouldInsertAfter =
//             event.delta.y > 0 ||
//             event.active.rect.current.translated?.top! > midpoint;
//           setInsertionIndex(shouldInsertAfter ? overIndex + 1 : overIndex);
//         }
//       }
//     }
//   };

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={rectIntersection}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//       onDragOver={handleDragOver}>
//       <div style={{ display: 'flex', gap: '100px', padding: '20px' }}>
//         <List title="List A" items={listA} />
//         <SortableList
//           title="List B"
//           items={listB}
//           insertionIndex={insertionIndex}
//         />
//       </div>
//       {activeId && <DragPreview>{activeId}</DragPreview>}
//     </DndContext>
//   );
// }
