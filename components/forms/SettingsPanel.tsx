'use client';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ApiDataSource, CustomCSS } from '@/utils/form-type';
import { getN } from '@/utils/forms';
import { useFB } from './FBProvider';


export const SettingsPanel = () => {
    const { selectedField, updateField, removeField, duplicateField, formSchema, updateFormSchema, fields } = useFB();
    console.log(selectedField, "selectedField")
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    if (!selectedField) {
        return (
            <div className="w-72 border-l bg-white flex flex-col">
                <div className="px-4 py-3 border-b bg-slate-50">
                    <p className="text-xs font-bold text-slate-700">FORM SETTINGS</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <div className="rounded-xl bg-slate-50 border border-dashed p-5 text-center mb-4">
                            <Icons.MousePointerClick className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Click any field to edit it</p>
                        </div>

                        <Accordion type="multiple" defaultValue={['grid', 'submit']} className="space-y-2">
                            <AccordionItem value="grid" className="border rounded-xl px-3">
                                <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                                    <span className="flex items-center gap-2"><Icons.LayoutGrid className="w-3.5 h-3.5 text-primary" />Layout Grid</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3">
                                    <p className="text-[10px] text-muted-foreground mb-2">Canvas columns — each field can override its span.</p>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {[1, 2, 3, 4].map(n => (
                                            <button key={n} onClick={() => updateFormSchema({ settings: { ...formSchema.settings, formGridCols: n as 1 | 2 | 3 | 4 } })}
                                                className={cn('h-10 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all',
                                                    (formSchema.settings.formGridCols || 1) === n ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 border-border text-slate-500 hover:border-primary/40')}>
                                                {n}
                                                <span className="text-[9px] font-normal opacity-70">col</span>
                                            </button>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="submit" className="border rounded-xl px-3">
                                <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                                    <span className="flex items-center gap-2"><Icons.Send className="w-3.5 h-3.5 text-emerald-500" />Submission</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3 space-y-3">
                                    <div><Label className="text-xs text-muted-foreground mb-1 block">Submit URL</Label>
                                        <Input className="h-8 text-xs" value={formSchema.settings.submitUrl || ''} onChange={e => updateFormSchema({ settings: { ...formSchema.settings, submitUrl: e.target.value } })} placeholder="https://api.example.com/submit" /></div>
                                    <div><Label className="text-xs text-muted-foreground mb-1 block">Method</Label>
                                        <Select value={formSchema.settings.submitMethod || 'POST'} onValueChange={(v: 'POST' | 'PUT') => updateFormSchema({ settings: { ...formSchema.settings, submitMethod: v } })}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem></SelectContent>
                                        </Select></div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Store Submissions</Label>
                                        <Switch checked={formSchema.settings.storeSubmissions || false} onCheckedChange={c => updateFormSchema({ settings: { ...formSchema.settings, storeSubmissions: c } })} />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="css" className="border rounded-xl px-3">
                                <AccordionTrigger className="text-xs font-semibold py-3 hover:no-underline">
                                    <span className="flex items-center gap-2"><Icons.Code2 className="w-3.5 h-3.5 text-pink-500" />Global CSS</span>
                                </AccordionTrigger>
                                <AccordionContent className="pb-3">
                                    <Textarea value={formSchema.settings.customCSS || ''} rows={6}
                                        onChange={e => updateFormSchema({ settings: { ...formSchema.settings, customCSS: e.target.value } })}
                                        placeholder=".form-container { ... }" className="font-mono text-[11px]" />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        );
    }

    const upd = (k: string, v: any) => updateField(selectedField.id, { [k]: v });
    const updV = (k: string, v: any) => updateField(selectedField.id, { validation: { ...(selectedField.validation || {}), [k]: v } });
    const updCSS = (k: keyof CustomCSS, v: string) => updateField(selectedField.id, { customCSS: { ...(selectedField.customCSS || {}), [k]: v } });
    const updADS = (v: Partial<ApiDataSource>) => updateField(selectedField.id, { apiDataSource: { ...(selectedField.apiDataSource || { type: 'static' }), ...v } as ApiDataSource });
    const updBtn = (k: string, v: any) => updateField(selectedField.id, { buttonApiConfig: { ...(selectedField.buttonApiConfig || {}), [k]: v } });

    const parentFields = fields.filter(f =>
        (selectedField.type === 'state' && f.type === 'country') ||
        (selectedField.type === 'city' && (f.type === 'state'))
    );
    const programParentFields = fields.filter(f => {
        if (selectedField.type === 'scheme') return f.type === 'program';
        if (selectedField.type === 'standard') return f.type === 'scheme';
        if (selectedField.type === 'cluster') return f.type === 'standard';
        return false;
    });
    const isSelectType = ['select', 'radio', 'multiselect', 'country', 'state', 'city', 'program', 'scheme', 'standard', 'cluster', 'multidate'].includes(selectedField.type); const isDepTypes = ['scheme', 'standard', "cluster"].includes(selectedField.type);
    const isMultiValueType = ['multiselect', 'cluster'].includes(selectedField.type);
    const isDepType = ['state', 'city'].includes(selectedField.type);
    const isBtnType = selectedField.type === 'button';

    const testApi = async () => {
        const ep = selectedField.apiDataSource?.endpoint; if (!ep) return;
        setTesting(true); setTestResult(null);
        try {
            const r = await fetch(ep, { method: selectedField.apiDataSource?.method || 'GET' });
            const d = await r.json();
            const rp = selectedField.apiDataSource?.responsePath;
            const arr = rp ? getN(d, rp) : d;
            setTestResult({ ok: true, data: Array.isArray(arr) ? arr.slice(0, 3) : arr });
        } catch (e) { setTestResult({ ok: false, err: String(e) }); }
        finally { setTesting(false); }
    };

    const testDependencyApi = async () => {
        const apiDataSource = selectedField.apiDataSource;
        if (!apiDataSource?.dependencyEndpoint || !apiDataSource?.dependsOn) return;

        setTesting(true);
        setTestResult(null);

        try {
            // Use a sample value for testing
            const sampleValue = '123'; // You might want to make this configurable
            const endpoint = apiDataSource.dependencyEndpoint.replace('{value}', sampleValue);

            const r = await fetch(endpoint, {
                method: apiDataSource.method || 'GET'
            });
            const d = await r.json();

            const rp = apiDataSource.responsePath;
            const arr = rp ? getN(d, rp) : d;

            setTestResult({
                ok: true,
                data: Array.isArray(arr) ? arr.slice(0, 3) : arr
            });
        } catch (e) {
            setTestResult({ ok: false, err: String(e) });
        } finally {
            setTesting(false);
        }
    };

    const tabCount = 2 + (isSelectType ? 1 : 0) + (isDepType ? 1 : 0) + (isDepTypes ? 1 : 0) + (isBtnType ? 1 : 0);

    return (
        <div className="w-72 border-l bg-white flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 font-mono">{selectedField.type}</Badge>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{selectedField.name}</p>
                    </div>
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateField(selectedField.id)}><Icons.Copy className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => removeField(selectedField.id)}><Icons.Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="basic">
                    <div className="px-3 pt-3 pb-0">
                        <TabsList className={cn('w-full h-7', `grid grid-cols-${tabCount}`)}>
                            <TabsTrigger value="basic" className="text-[10px] h-6">Basic</TabsTrigger>
                            <TabsTrigger value="style" className="text-[10px] h-6">Style</TabsTrigger>
                            {isSelectType && <TabsTrigger value="data" className="text-[10px] h-6">Data</TabsTrigger>}
                            {(isDepType || isDepTypes) && <TabsTrigger value="chain" className="text-[10px] h-6">Chain</TabsTrigger>}
                            {isBtnType && <TabsTrigger value="api" className="text-[10px] h-6">API</TabsTrigger>}
                        </TabsList>
                    </div>

                    {/* BASIC */}
                    <TabsContent value="basic" className="px-3 py-3 space-y-3">
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Label</Label>
                            <Input className="h-8 text-xs" value={selectedField.label || ''} onChange={e => upd('label', e.target.value)} /></div>
                        <div className="space-y-1"><Label className="text-xs text-muted-foreground">Name</Label>
                            <Input className="h-8 text-xs font-mono" value={selectedField.name || ''} onChange={e => upd('name', e.target.value)} /></div>
                        {!['heading', 'label', 'divider', 'button', 'checkbox', 'switch'].includes(selectedField.type) && (
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Placeholder</Label>
                                <Input className="h-8 text-xs" value={selectedField.placeholder || ''} onChange={e => upd('placeholder', e.target.value)} /></div>
                        )}
                        {!['heading', 'label', 'divider'].includes(selectedField.type) && (
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Help Text</Label>
                                <Input className="h-8 text-xs" value={selectedField.helpText || ''} onChange={e => upd('helpText', e.target.value)} /></div>
                        )}
                        {/* Grid span */}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Column Span</Label>
                            <div className="grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4].map(n => (
                                    <button key={n} onClick={() => upd('gridCols', n)}
                                        className={cn('h-8 rounded-lg border text-xs font-bold transition-all',
                                            (selectedField.gridCols || 1) === n ? 'bg-primary text-white border-primary' : 'bg-slate-50 border-border text-slate-500 hover:border-primary/40')}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {selectedField.type === 'textarea' && (
                            <div className="space-y-1"><Label className="text-xs text-muted-foreground">Rows</Label>
                                <Input className="h-8 text-xs" type="number" value={selectedField.rows || 4} onChange={e => upd('rows', +e.target.value || 4)} /></div>
                        )}
                        {selectedField.type === 'range' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1"><Label className="text-xs text-muted-foreground">Min</Label><Input className="h-8 text-xs" type="number" value={selectedField.min ?? 0} onChange={e => upd('min', +e.target.value)} /></div>
                                <div className="space-y-1"><Label className="text-xs text-muted-foreground">Max</Label><Input className="h-8 text-xs" type="number" value={selectedField.max ?? 100} onChange={e => upd('max', +e.target.value)} /></div>
                            </div>
                        )}
                        {!['heading', 'label', 'divider', 'button'].includes(selectedField.type) && (
                            <div className="rounded-lg bg-slate-50 border p-3 space-y-2">
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Constraints</p>
                                {['required', 'disabled', 'readOnly'].map(k => (
                                    <div key={k} className="flex items-center justify-between">
                                        <Label className="text-xs">{k === 'readOnly' ? 'Read Only' : k.charAt(0).toUpperCase() + k.slice(1)}</Label>
                                        <Switch className="h-4 w-7 data-[state=checked]:bg-primary" checked={(selectedField.validation as any)?.[k] || false} onCheckedChange={c => updV(k, c)} />
                                    </div>
                                ))}
                                {['text', 'textarea', 'password', 'email', 'url'].includes(selectedField.type) && (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <div><Label className="text-[10px] text-muted-foreground">Min Len</Label><Input className="h-7 text-xs mt-0.5" type="number" value={selectedField.validation?.minLength || ''} onChange={e => updV('minLength', parseInt(e.target.value) || undefined)} /></div>
                                        <div><Label className="text-[10px] text-muted-foreground">Max Len</Label><Input className="h-7 text-xs mt-0.5" type="number" value={selectedField.validation?.maxLength || ''} onChange={e => updV('maxLength', parseInt(e.target.value) || undefined)} /></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* STYLE */}
                    <TabsContent value="style" className="px-3 py-3 space-y-3">
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[10px] text-amber-700">
                            CSS rules applied via stylesheet — fully overrides component styles.
                        </div>
                        {[
                            { k: 'input', lbl: 'Input CSS', ph: 'border-radius:12px; background:#f0f9ff;' },
                            { k: 'label', lbl: 'Label CSS', ph: 'color:#1e40af; font-weight:700;' },
                            { k: 'container', lbl: 'Container CSS', ph: 'padding:8px; border:2px solid #e2e8f0;' },
                            { k: 'helpText', lbl: 'Help Text CSS', ph: 'color:#6b7280; font-style:italic;' },
                            { k: 'error', lbl: 'Error CSS', ph: 'color:#ef4444; font-weight:600;' },
                        ].map(({ k, lbl, ph }) => (
                            <div key={k} className="space-y-1">
                                <Label className="text-xs text-muted-foreground">{lbl}</Label>
                                <Textarea value={(selectedField.customCSS as any)?.[k] || ''} rows={2}
                                    onChange={e => updCSS(k as keyof CustomCSS, e.target.value)}
                                    placeholder={ph} className="font-mono text-[11px] resize-none" />
                            </div>
                        ))}
                    </TabsContent>

                    {/* DATA */}
                    {isSelectType && (
                        <TabsContent value="data" className="px-3 py-3 space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Source</Label>
                                <Select value={selectedField.apiDataSource?.type || 'static'} onValueChange={(v: 'static' | 'api' | 'dependency') => updADS({ type: v })}>
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="static">Static</SelectItem>
                                        <SelectItem value="api">API Endpoint</SelectItem>
                                        <SelectItem value="dependency">Dependency Chain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedField.apiDataSource?.type === 'static' && (
                                <div className="space-y-1.5">
                                    {(selectedField.apiDataSource.staticData || []).map((o, i) => (
                                        <div key={i} className="flex gap-1">
                                            <Input className="h-7 text-xs" value={o.label} onChange={e => {
                                                const d = [...(selectedField.apiDataSource?.staticData || [])];
                                                d[i] = { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                                                updADS({ staticData: d });
                                            }} />
                                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => updADS({ staticData: (selectedField.apiDataSource?.staticData || []).filter((_, j) => j !== i) })}>
                                                <Icons.X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => {
                                        const d = [...(selectedField.apiDataSource?.staticData || [])];
                                        d.push({ label: `Option ${d.length + 1}`, value: `option_${d.length + 1}` });
                                        updADS({ staticData: d });
                                    }}><Icons.Plus className="w-3 h-3 mr-1" />Add</Button>
                                </div>
                            )}

                            {selectedField.apiDataSource?.type === 'api' && (
                                <div className="space-y-2">
                                    <div><Label className="text-xs text-muted-foreground">Endpoint</Label><Input className="h-8 text-xs mt-0.5" value={selectedField.apiDataSource?.endpoint || ''} onChange={e => updADS({ endpoint: e.target.value })} placeholder="https://api.example.com/data" /></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label className="text-xs text-muted-foreground">Method</Label>
                                            <Select value={selectedField.apiDataSource?.method || 'GET'} onValueChange={(v: 'GET' | 'POST') => updADS({ method: v })}>
                                                <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                                <SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem></SelectContent>
                                            </Select></div>
                                        <div><Label className="text-xs text-muted-foreground">Resp. Path</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.responsePath || ''} onChange={e => updADS({ responsePath: e.target.value })} placeholder="data.items" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><Label className="text-xs text-muted-foreground">Label Key</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.labelKey || ''} onChange={e => updADS({ labelKey: e.target.value })} placeholder="name" /></div>
                                        <div><Label className="text-xs text-muted-foreground">Value Key</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.valueKey || ''} onChange={e => updADS({ valueKey: e.target.value })} placeholder="id" /></div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={testApi} disabled={testing}>
                                        {testing ? <><Icons.Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Testing...</> : <><Icons.FlaskConical className="w-3 h-3 mr-1.5" />Test</>}
                                    </Button>
                                    {testResult && (
                                        <div className={cn('rounded-lg p-2.5 text-[11px]', testResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
                                            {testResult.ok ? <><p className="text-green-700 font-semibold mb-1">✓ First 3 items:</p><pre className="overflow-x-auto text-green-800 text-[10px]">{JSON.stringify(testResult.data, null, 2)}</pre></> : <p className="text-red-600">{testResult.err}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* CHAIN */}
                    {isDepType && (
                        <TabsContent value="chain" className="px-3 py-3 space-y-3">
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-700 space-y-1">
                                <p className="font-semibold">Dependency chaining:</p>
                                <p>When parent value changes, <code className="bg-blue-100 px-1 rounded">{'{value}'}</code> is replaced with the selected ID.</p>
                            </div>
                            <div><Label className="text-xs text-muted-foreground">Depends On</Label>
                                <Select value={Array.isArray(selectedField.apiDataSource?.dependsOn) ? selectedField.apiDataSource?.dependsOn[0] || '' : selectedField.apiDataSource?.dependsOn || ''} onValueChange={v => updADS({ dependsOn: v, type: 'dependency' })}>
                                    <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue placeholder="Select parent field" /></SelectTrigger>
                                    <SelectContent>{parentFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label} ({f.type})</SelectItem>)}</SelectContent>
                                </Select></div>
                            <div><Label className="text-xs text-muted-foreground">API Endpoint Template</Label>
                                <Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.dependencyEndpoint || ''} onChange={e => updADS({ dependencyEndpoint: e.target.value, type: 'dependency' })} placeholder="https://api.com/states?country={value}" /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs text-muted-foreground">Parent Value Key</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.dependencyValueKey || 'id'} onChange={e => updADS({ dependencyValueKey: e.target.value, type: 'dependency' })} /></div>
                                <div><Label className="text-xs text-muted-foreground">Method</Label>
                                    <Select value={selectedField.apiDataSource?.method || 'GET'} onValueChange={(v: 'GET' | 'POST') => updADS({ method: v, type: 'dependency' })}>
                                        <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem></SelectContent>
                                    </Select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs text-muted-foreground">Resp. Path</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.responsePath || ''} onChange={e => updADS({ responsePath: e.target.value, type: 'dependency' })} placeholder="" /></div>
                                <div><Label className="text-xs text-muted-foreground">Label Key</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.labelKey || 'name'} onChange={e => updADS({ labelKey: e.target.value, type: 'dependency' })} /></div>
                            </div>
                            <div><Label className="text-xs text-muted-foreground">Value Key</Label><Input className="h-8 text-xs font-mono mt-0.5" value={selectedField.apiDataSource?.valueKey || 'id'} onChange={e => updADS({ valueKey: e.target.value, type: 'dependency' })} /></div>
                        </TabsContent>
                    )}

                    {/* Program / Scheme / Standard / Cluster Chain */}
                    {isDepTypes && (
                        <TabsContent value="chain" className="px-3 py-3 space-y-3">
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-700 space-y-1">
                                <p className="font-semibold">Dependency chaining:</p>
                                <p>
                                    When parent value changes, <code className="bg-blue-100 px-1 rounded">{'{value}'}</code> is replaced with the selected ID.
                                </p>
                                {isMultiValueType && (
                                    <p className="font-semibold text-indigo-700">Multiple parent selection enabled</p>
                                )}
                            </div>

                            {/* Depends On */}
                            <div>
                                <Label className="text-xs text-muted-foreground">Depends On</Label>

                                {/* Regular select for single dependency */}
                                {!isMultiValueType ? (
                                    <Select
                                        value={selectedField.apiDataSource?.dependsOn as string || ''}
                                        onValueChange={(v: string) => {
                                            updADS({
                                                dependsOn: v,
                                                type: 'dependency',
                                                // Reset endpoint when parent changes to remind user to update
                                                dependencyEndpoint: selectedField.apiDataSource?.dependencyEndpoint || ''
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-xs mt-0.5">
                                            <SelectValue placeholder="Select parent field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programParentFields.map(f => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.label} ({f.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    /* Multi-select for fields that can depend on multiple parents (like cluster) */
                                    <div className="space-y-2 mt-0.5">
                                        <p className="text-[10px] text-muted-foreground">Select parent fields (in order):</p>
                                        {(programParentFields.length > 0 ? programParentFields : []).map((f, index) => {
                                            const dependsOnArray = (selectedField.apiDataSource?.dependsOn as string[]) || [];
                                            const isSelected = dependsOnArray.includes(f.id);

                                            return (
                                                <div key={f.id} className="flex items-center space-x-2">
                                                    <Switch
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            let newDependsOn = [...dependsOnArray];
                                                            if (checked) {
                                                                // Add in order of selection
                                                                newDependsOn.push(f.id);
                                                            } else {
                                                                newDependsOn = newDependsOn.filter(id => id !== f.id);
                                                            }
                                                            updADS({
                                                                dependsOn: newDependsOn,
                                                                type: 'dependency'
                                                            });
                                                        }}
                                                    />
                                                    <span className="text-xs">{f.label} ({f.type})</span>
                                                    {isSelected && (
                                                        <Badge variant="outline" className="text-[10px] ml-auto">
                                                            Position: {dependsOnArray.indexOf(f.id) + 1}
                                                        </Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* API Endpoint Template - Show different placeholder based on field type */}
                            <div>
                                <Label className="text-xs text-muted-foreground">API Endpoint Template</Label>
                                <Input
                                    className="h-8 text-xs font-mono mt-0.5"
                                    value={selectedField.apiDataSource?.dependencyEndpoint || ''}
                                    onChange={e =>
                                        updADS({ dependencyEndpoint: e.target.value, type: 'dependency' })
                                    }
                                    placeholder={
                                        selectedField.type === 'scheme'
                                            ? "https://api.com/scheme/?programme={value}"
                                            : selectedField.type === 'standard'
                                                ? "https://api.com/standard/?scheme={value}"
                                                : selectedField.type === 'cluster'
                                                    ? "https://api.com/cluster/?standard={value}"
                                                    : "https://api.com/endpoint?parent={value}"
                                    }
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Use {'{value}'} as placeholder for parent field value
                                    {isMultiValueType && " (multiple values will be joined with commas)"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Parent Value Key</Label>
                                    <Input
                                        className="h-8 text-xs font-mono mt-0.5"
                                        value={selectedField.apiDataSource?.dependencyValueKey || 'id'}
                                        onChange={e =>
                                            updADS({ dependencyValueKey: e.target.value, type: 'dependency' })
                                        }
                                        placeholder="id"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Key to extract from parent value
                                    </p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Method</Label>
                                    <Select
                                        value={selectedField.apiDataSource?.method || 'GET'}
                                        onValueChange={(v: 'GET' | 'POST') =>
                                            updADS({ method: v, type: 'dependency' })
                                        }
                                    >
                                        <SelectTrigger className="h-8 text-xs mt-0.5">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Response Path</Label>
                                    <Input
                                        className="h-8 text-xs font-mono mt-0.5"
                                        value={selectedField.apiDataSource?.responsePath || ''}
                                        onChange={e =>
                                            updADS({ responsePath: e.target.value, type: 'dependency' })
                                        }
                                        placeholder="data.items or leave empty"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Label Key</Label>
                                    <Input
                                        className="h-8 text-xs font-mono mt-0.5"
                                        value={selectedField.apiDataSource?.labelKey || 'name'}
                                        onChange={e =>
                                            updADS({ labelKey: e.target.value, type: 'dependency' })
                                        }
                                        placeholder="name"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Value Key</Label>
                                <Input
                                    className="h-8 text-xs font-mono mt-0.5"
                                    value={selectedField.apiDataSource?.valueKey || 'id'}
                                    onChange={e =>
                                        updADS({ valueKey: e.target.value, type: 'dependency' })
                                    }
                                    placeholder="id"
                                />
                            </div>

                            {/* Test button for dependency API */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-8 text-xs mt-2"
                                onClick={testDependencyApi}
                                disabled={testing || !selectedField.apiDataSource?.dependsOn}
                            >
                                {testing ? (
                                    <><Icons.Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Testing...</>
                                ) : (
                                    <><Icons.FlaskConical className="w-3 h-3 mr-1.5" />Test with sample value</>
                                )}
                            </Button>

                            {testResult && (
                                <div className={cn('rounded-lg p-2.5 text-[11px]',
                                    testResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')}>
                                    {testResult.ok ? (
                                        <>
                                            <p className="text-green-700 font-semibold mb-1">✓ First 3 items:</p>
                                            <pre className="overflow-x-auto text-green-800 text-[10px]">
                                                {JSON.stringify(testResult.data, null, 2)}
                                            </pre>
                                        </>
                                    ) : (
                                        <p className="text-red-600">{testResult.err}</p>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* BUTTON API */}
                    {isBtnType && (
                        <TabsContent value="api" className="px-3 py-3 space-y-3">
                            <div className="flex items-center justify-between bg-slate-50 rounded-lg border p-3">
                                <div>
                                    <p className="text-xs font-semibold">Enable API Call</p>
                                    <p className="text-[10px] text-muted-foreground">Call an API on click</p>
                                </div>
                                <Switch checked={selectedField.buttonApiConfig?.enabled || false} onCheckedChange={c => updBtn('enabled', c)} />
                            </div>
                            {selectedField.buttonApiConfig?.enabled && <>
                                <div><Label className="text-xs text-muted-foreground">URL</Label><Input className="h-8 text-xs mt-0.5" value={selectedField.buttonApiConfig?.url || ''} onChange={e => updBtn('url', e.target.value)} placeholder="https://api.example.com/endpoint" /></div>
                                <div><Label className="text-xs text-muted-foreground">Method</Label>
                                    <Select value={selectedField.buttonApiConfig?.method || 'POST'} onValueChange={v => updBtn('method', v)}>
                                        <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                                        <SelectContent>{['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                    </Select></div>
                                <div><Label className="text-xs text-muted-foreground">Headers (JSON)</Label>
                                    <Textarea className="font-mono text-[11px] resize-none mt-0.5" rows={2}
                                        value={JSON.stringify(selectedField.buttonApiConfig?.headers || {}, null, 2)}
                                        onChange={e => { try { updBtn('headers', JSON.parse(e.target.value)); } catch { } }}
                                        placeholder='{"Authorization": "Bearer token"}' /></div>
                                <div><Label className="text-xs text-muted-foreground">Body Template — use {'{{fieldName}}'}</Label>
                                    <Textarea className="font-mono text-[11px] resize-none mt-0.5" rows={3}
                                        value={selectedField.buttonApiConfig?.bodyTemplate || ''}
                                        onChange={e => updBtn('bodyTemplate', e.target.value)}
                                        placeholder='{"name": "{{name}}", "email": "{{email}}"}' /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label className="text-[10px] text-muted-foreground">Success msg</Label><Input className="h-7 text-xs mt-0.5" value={selectedField.buttonApiConfig?.successMessage || ''} onChange={e => updBtn('successMessage', e.target.value)} placeholder="Submitted!" /></div>
                                    <div><Label className="text-[10px] text-muted-foreground">Error msg</Label><Input className="h-7 text-xs mt-0.5" value={selectedField.buttonApiConfig?.errorMessage || ''} onChange={e => updBtn('errorMessage', e.target.value)} placeholder="Error occurred." /></div>
                                </div>
                            </>}
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}