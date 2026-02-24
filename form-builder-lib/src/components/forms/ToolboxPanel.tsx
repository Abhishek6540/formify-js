"use client";
import { Checkbox } from '../../../../components/ui/checkbox';
import * as Icons from 'lucide-react';
import { useFB } from './FBProvider';
import { Field, FieldType } from '../../utils/form-type';
import { COLORBADGE, FIELD_CATEGORIES, genId, getDefaultField } from '../../utils/forms';
import { cn } from '../../../../lib/utils';

export const ToolboxPanel = () => {
    const { fields, addField, removeField } = useFB();
    const typesInForm = new Set(fields.map(f => f.type));

    const handleToggle = (type: FieldType) => {
        const ex = fields.find(f => f.type === type);
        if (ex) { removeField(ex.id); return; }
        const def = getDefaultField(type, fields);
        addField({ id: genId(), type, order: fields.length, validation: {}, gridCols: 1, ...def } as Field);
    };

    return (
        <div className="w-56 border-r flex flex-col bg-white">
            <div className="px-4 py-3 border-b bg-slate-50">
                <p className="text-xs font-bold text-slate-700 tracking-tight">FIELDS</p>
                <p className="text-[10px] text-muted-foreground">✓ Check to add · drag to reorder</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {FIELD_CATEGORIES.map(cat => (
                    <div key={cat.key} className="border-b last:border-0">
                        <div className="px-3 py-1.5 bg-slate-50/80 flex items-center gap-1.5">
                            <div className={cn('w-1.5 h-1.5 rounded-full', {
                                'bg-blue-400': cat.color === 'blue', 'bg-emerald-400': cat.color === 'emerald',
                                'bg-violet-400': cat.color === 'violet', 'bg-amber-400': cat.color === 'amber',
                                'bg-rose-400': cat.color === 'rose', 'bg-sky-400': cat.color === 'sky', 'bg-slate-400': cat.color === 'slate',
                                "bg-red-400": cat.color === 'red'
                            })} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{cat.label}</span>
                        </div>
                        <div className="px-2 py-1.5 space-y-0.5">
                            {cat.fields.map(f => {
                                const isIn = typesInForm.has(f.type as FieldType);
                                const IconC = (Icons as any)[f.icon] || Icons.Type;
                                return (
                                    <div
                                        key={f.type}
                                        className={cn(
                                            'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer group',
                                            isIn ? 'bg-primary/8 border border-primary/20' : 'hover:bg-slate-50 border border-transparent'
                                        )}
                                        onClick={() => handleToggle(f.type as FieldType)}
                                    >
                                        <Checkbox
                                            checked={isIn}
                                            onCheckedChange={() => handleToggle(f.type as FieldType)}
                                            onClick={e => e.stopPropagation()}
                                            className="h-3.5 w-3.5 shrink-0"
                                        />
                                        <div className={cn('w-5 h-5 rounded flex items-center justify-center shrink-0', COLORBADGE[cat.color] || 'bg-slate-100 text-slate-500')}>
                                            <IconC className="w-3 h-3" />
                                        </div>
                                        <span className={cn('text-xs truncate', isIn ? 'font-semibold text-primary' : 'text-slate-600')}>{f.label}</span>
                                        {isIn && <Icons.Check className="w-3 h-3 text-primary ml-auto shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}