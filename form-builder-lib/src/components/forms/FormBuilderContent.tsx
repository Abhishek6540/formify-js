'use client';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import * as Icons from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import React, {  useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { ToolboxPanel } from './ToolboxPanel';
import { CanvasPanel } from './CanvasPanel';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { useFB } from './FBProvider';
import { genId, getDefaultField } from '../../utils/forms';
import { Field, FieldType } from '../../utils/form-type';
import { SettingsPanel } from './SettingsPanel';
import { useRouter } from 'next/navigation';


export const FormBuilderContent = () => {
    const router = useRouter();
    const { addField, reorderFields, formSchema, clearForm, fields, savedForms, saveForm, loadForm, deleteForm, createNewForm, isBuilderOpen, setIsBuilderOpen, selectedFields, selectAllFields, deselectAllFields, removeSelectedFields, duplicateSelectedFields, getSubmissions } = useFB();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showSave, setShowSave] = useState(false);
    const [formName, setFormName] = useState(formSchema.name);
    const [formDesc, setFormDesc] = useState(formSchema.description || '');
 
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
    const onDragEnd = (e: DragEndEvent) => {
        const { active, over } = e; setActiveId(null); if (!over) return;
        const ad = active.data.current;
        if (ad?.isToolbox && over.id === 'canvas') {
            const type = ad.type as FieldType;
            const def = getDefaultField(type, fields);
            addField({ id: genId(), type, order: fields.length, validation: {}, gridCols: 1, ...def } as Field);
            return;
        }
        if (active.id !== over.id) reorderFields(active.id as string, over.id as string);
    };

   
    return (
        <Card>
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="h-screen flex flex-col">
                <header className="h-12 border-b px-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => router.back()}>
                            <Icons.ChevronLeft className="w-3.5 h-3.5" />Back
                        </Button>
                        <Separator orientation="vertical" className="h-5" />
                        <span className="text-sm font-semibold text-slate-700">{formSchema.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{fields.length} fields</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {selectedFields.size > 0 && <>
                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={duplicateSelectedFields}><Icons.Copy className="w-3 h-3" />{selectedFields.size}</Button>
                            <Button variant="destructive" size="sm" className="h-8 text-xs gap-1" onClick={removeSelectedFields}><Icons.Trash2 className="w-3 h-3" />{selectedFields.size}</Button>
                            <Separator orientation="vertical" className="h-4" />
                        </>}
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={selectAllFields}><Icons.CheckSquare className="w-3 h-3 mr-1" />All</Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowSave(true)}><Icons.Save className="w-3 h-3 mr-1" />Save</Button>
                        <Button variant={showPreview ? 'default' : 'outline'} size="sm" className="h-8 text-xs" onClick={() => setShowPreview(!showPreview)}>
                            {showPreview ? <><Icons.PenLine className="w-3 h-3 mr-1" />Edit</> : <><Icons.Eye className="w-3 h-3 mr-1" />Preview</>}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearForm} title="Clear"><Icons.RotateCcw className="w-3.5 h-3.5" /></Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {!showPreview ? (
                        <><ToolboxPanel /><CanvasPanel /><SettingsPanel /></>
                    ) : (
                        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
                            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border">
                                <h2 className="text-2xl font-extrabold mb-1">{formSchema.name}</h2>
                                {formSchema.description && <p className="text-muted-foreground text-sm mb-6">{formSchema.description}</p>}
                                {formSchema.settings.customCSS && <style>{formSchema.settings.customCSS}</style>}
                                <DynamicFormRenderer schema={{ ...formSchema, fields }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DragOverlay>
                {activeId?.startsWith('toolbox-') && (
                    <div className="px-3 py-2 bg-white border-2 border-primary rounded-xl shadow-xl text-xs font-semibold text-primary flex items-center gap-2">
                        <Icons.Plus className="w-3.5 h-3.5" />Drop here
                    </div>
                )}
            </DragOverlay>

            <Dialog open={showSave} onOpenChange={setShowSave}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Save Form</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div><Label className="text-xs text-muted-foreground mb-1 block">Form Name</Label><Input value={formName} onChange={e => setFormName(e.target.value)} /></div>
                        <div><Label className="text-xs text-muted-foreground mb-1 block">Description</Label><Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} placeholder="Optional..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSave(false)}>Cancel</Button>
                        <Button onClick={() => { saveForm(formName, formDesc); setShowSave(false); }}><Icons.Save className="w-4 h-4 mr-2" />Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DndContext>
        </Card>
    );
}