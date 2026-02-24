'use client';
import * as Icons from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../../../../lib/utils';
import { Separator } from "../../../../components/ui/separator";
import { SortableFieldCard } from './SortableFieldCard';
import { useFB } from './FBProvider';


export const CanvasPanel = () => {
    // const { fields, setSelectedField, selectedFields, toggleFieldSelection, formSchema, applyLayoutToSelected, deselectAllFields } = useFB();
        const { fields, setSelectedField, selectedFields, toggleFieldSelection, formSchema, deselectAllFields } = useFB();

    const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });
    const gcClass = formSchema.settings.formGridCols === 2 ? 'grid-cols-2' : formSchema.settings.formGridCols === 3 ? 'grid-cols-3' : formSchema.settings.formGridCols === 4 ? 'grid-cols-4' : 'grid-cols-1';

    return (
        <div className="flex-1 bg-slate-50 overflow-y-auto flex flex-col">
            {/* Selection toolbar */}
            {selectedFields.size > 0 && (
                <div className="px-5 pt-4 pb-0">
                    <div className="bg-white border border-primary/25 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-semibold text-primary">{selectedFields.size} selected</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xs text-muted-foreground">Span columns:</span>
                        {[1, 2, 3, 4].map(n => (
                            <button key={n} 
                            // onClick={() =>
                            //      applyLayoutToSelected(n as 1 | 2 | 3 | 4)
                            //     }
                                className="w-6 h-6 rounded border border-border bg-slate-50 hover:bg-primary hover:text-white hover:border-primary text-xs font-bold transition-all">
                                {n}
                            </button>
                        ))}
                        <button onClick={deselectAllFields} className="ml-auto text-xs text-muted-foreground hover:text-slate-700 flex items-center gap-1">
                            <Icons.X className="w-3 h-3" />Clear
                        </button>
                    </div>
                </div>
            )}

            <div className="p-5 flex-1">
                <div ref={setNodeRef} className={cn(
                    'min-h-[550px] rounded-2xl border-2 border-dashed transition-all',
                    isOver ? 'border-primary bg-primary/3' : (fields.length > 0 ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-white/60'),
                )}>
                    {fields.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[550px] text-center px-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-4">
                                <Icons.Layers className="w-8 h-8 text-primary/40" />
                            </div>
                            <h3 className="text-base font-bold text-slate-600 mb-1.5">Your canvas is empty</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">Check fields in the sidebar to add them here, or drag them onto the canvas.</p>
                        </div>
                    ) : (
                        <div className="p-5">
                            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                <div className={cn('grid gap-3', gcClass)}>
                                    {fields.map(field => (
                                        <SortableFieldCard
                                            key={field.id} field={field}
                                            isSelected={selectedFields.has(field.id)}
                                            onSelect={() => setSelectedField(field)}
                                            onToggle={e => { e.stopPropagation(); toggleFieldSelection(field.id); }}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}