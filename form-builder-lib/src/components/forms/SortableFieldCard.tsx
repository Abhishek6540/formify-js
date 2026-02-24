'use client';
import * as Icons from 'lucide-react';
import { Checkbox } from '../../../../components/ui/checkbox';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../../lib/utils';
import { Badge } from "../../../../components/ui/badge";
import { FieldPreview } from './FieldPreview';
import { useSortable } from '@dnd-kit/sortable';
import { Field } from '../../utils/form-type';


export const SortableFieldCard = ({ field, isSelected, onSelect, onToggle }: {
  field: Field; isSelected: boolean; onSelect: () => void; onToggle: (e: React.MouseEvent) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const gcCls = field.gridCols === 2 ? 'col-span-2' : field.gridCols === 3 ? 'col-span-3' : field.gridCols === 4 ? 'col-span-4' : 'col-span-1';

  return (
    <div ref={setNodeRef} style={style} className={cn('group relative', gcCls, isDragging && 'z-50 opacity-50')}>
      <div
        onClick={onSelect}
        className={cn(
          'rounded-xl border-2 transition-all cursor-pointer overflow-hidden',
          isSelected ? 'border-primary shadow-md shadow-primary/15 bg-primary/3' : 'border-border bg-white hover:border-primary/40 hover:shadow-sm',
        )}
      >
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 border-b',
          isSelected ? 'bg-primary/8 border-primary/20' : 'bg-slate-50 border-border'
        )}>
          <div {...attributes} {...listeners} onClick={e => e.stopPropagation()} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
            <Icons.GripVertical className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => {}}
            onClick={(e) => { e.stopPropagation(); onToggle(e as any); }}
            className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px] py-0 h-4 font-mono">{field.type}</Badge>
          <span className="text-[10px] text-muted-foreground font-mono truncate ml-auto">{field.name}</span>
          {field.gridCols && field.gridCols > 1 && <Badge variant="secondary" className="text-[9px] py-0 h-4 shrink-0">×{field.gridCols}</Badge>}
        </div>
        <div className="p-3">
          <FieldPreview field={field} />
        </div>
      </div>
    </div>
  );
}