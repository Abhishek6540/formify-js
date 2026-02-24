'use client';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { useFB } from './FBProvider';
import { Field, FieldOption, FormSchema } from '@/utils/form-type';
import { Badge } from '@/components/ui/badge';



function FieldStyleInjector({ fields }: { fields: Field[] }) {
  useEffect(() => {
    let el = document.getElementById('fb-field-styles');
    if (!el) { el = document.createElement('style'); el.id = 'fb-field-styles'; document.head.appendChild(el); }
    const rules: string[] = [];
    fields.forEach(f => {
      const c = f.customCSS;
      if (!c) return;
      const sel = `[data-fid="${f.id}"]`;
      if (c.container) rules.push(`${sel} { ${c.container} }`);
      if (c.input) rules.push(`${sel} input, ${sel} textarea, ${sel} [role="combobox"], ${sel} select { ${c.input} }`);
      if (c.label) rules.push(`${sel} label { ${c.label} }`);
      if (c.helpText) rules.push(`${sel} .ht { ${c.helpText} }`);
      if (c.error) rules.push(`${sel} .et { ${c.error} }`);
    });
    el.textContent = rules.join('\n');
  }, [fields]);
  return null;
}
export const DynamicFormRenderer = ({ schema, onSubmit }: { schema: FormSchema; onSubmit?: (data: Record<string, any>) => Promise<void>; }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [opts, setOpts] = useState<Record<string, FieldOption[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [btnStatus, setBtnStatus] = useState<Record<string, { loading?: boolean; msg?: string; type?: 'ok' | 'err' }>>({});
  const { addSubmission } = useFB();
  // Track which parent→child deps have been loaded (to avoid loops)
  const depLoaded = useRef<Record<string, boolean>>({});

  const getNestedVal = (obj: any, path: string): any => {
    if (!path) return obj;
    return path.split('.').reduce((c: any, k: string) => c?.[k], obj);
  };

  const makeOpts = (data: any[], field: Field): FieldOption[] => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      label: field.apiDataSource?.labelKey ? String(getNestedVal(item, field.apiDataSource.labelKey) ?? '') : String(item),
      value: field.apiDataSource?.valueKey ? String(getNestedVal(item, field.apiDataSource.valueKey) ?? '') : String(item),
      _raw: item,
    })).filter(o => o.label && o.value);
  };

  // Load all API-type fields on mount
  useEffect(() => {
    schema.fields.forEach(field => {
      if (field.apiDataSource?.type === 'api' && field.apiDataSource.endpoint) {
        loadFieldApi(field);
      }
    });
  }, []); // eslint-disable-line

  const loadFieldApi = async (field: Field) => {
    const ep = field.apiDataSource?.endpoint; if (!ep) return;
    setLoading(p => ({ ...p, [field.id]: true }));
    try {
      const r = await fetch(ep, { method: field.apiDataSource?.method || 'GET', headers: field.apiDataSource?.headers });
      const d = await r.json();
      const rp = field.apiDataSource?.responsePath;
      const arr = rp ? getNestedVal(d, rp) : d;
      setOpts(p => ({ ...p, [field.id]: makeOpts(arr, field) }));
    } catch (e) { console.error('[API]', field.name, e); }
    finally { setLoading(p => ({ ...p, [field.id]: false })); }
  };

  const loadDepFieldApi = async (field: Field, parentId: string) => {
    const key = `${field.id}:${parentId}`;
    if (depLoaded.current[key]) return;
    depLoaded.current[key] = true;

    const ep = field.apiDataSource?.dependencyEndpoint?.replace('{value}', encodeURIComponent(parentId));
    if (!ep) return;

    setLoading(p => ({ ...p, [field.id]: true }));
    setOpts(p => ({ ...p, [field.id]: [] }));
    try {
      const r = await fetch(ep, { method: field.apiDataSource?.method || 'GET', headers: field.apiDataSource?.headers });
      const d = await r.json();
      const rp = field.apiDataSource?.responsePath;
      const arr = rp ? getNestedVal(d, rp) : d;
      setOpts(p => ({ ...p, [field.id]: makeOpts(arr, field) }));
    } catch (e) { console.error('[Dep]', field.name, e); }
    finally { setLoading(p => ({ ...p, [field.id]: false })); }
  };

  const handleChange = (field: Field, value: any, rawOpt?: FieldOption) => {
    setFormData(p => ({ ...p, [field.name]: value }));
    if (errors[field.name]) setErrors(p => { const e = { ...p }; delete e[field.name]; return e; });

    // Cascade: trigger any child dep fields
    schema.fields.forEach(child => {
      if (child.apiDataSource?.type !== 'dependency') return;
      if (child.apiDataSource.dependsOn !== field.id) return;

      const dvk = child.apiDataSource.dependencyValueKey || 'id';
      // The parent ID to use: prefer raw item's id field, else the selected value itself
      const parentId = rawOpt?._raw?.[dvk] ?? rawOpt?.value ?? value;
      if (!parentId) return;

      // Reset child value + clear its children too
      setFormData(p => ({ ...p, [child.name]: '' }));
      setOpts(p => ({ ...p, [child.id]: [] }));
      // Clear grandchild opts
      schema.fields.forEach(gc => {
        if (gc.apiDataSource?.type === 'dependency' && gc.apiDataSource.dependsOn === child.id) {
          setFormData(p => ({ ...p, [gc.name]: '' }));
          setOpts(p => ({ ...p, [gc.id]: [] }));
          // Reset grandchild dep loaded keys
          Object.keys(depLoaded.current).forEach(k => {
            if (k.startsWith(`${gc.id}:`)) delete depLoaded.current[k];
          });
        }
      });
      // Reset child dep loaded keys so it refetches
      Object.keys(depLoaded.current).forEach(k => {
        if (k.startsWith(`${child.id}:`)) delete depLoaded.current[k];
      });

      loadDepFieldApi(child, String(parentId));
    });
  };

  const handleBtnClick = async (field: Field) => {
    const cfg = field.buttonApiConfig;
    if (!cfg?.enabled || !cfg.url) return;
    setBtnStatus(p => ({ ...p, [field.id]: { loading: true } }));
    try {
      let body: string | undefined;
      if (cfg.bodyTemplate) {
        body = cfg.bodyTemplate.replace(/\{\{(\w+)\}\}/g, (_, n) => String(formData[n] ?? ''));
      } else if (['POST', 'PUT', 'PATCH'].includes(cfg.method || 'POST')) {
        body = JSON.stringify(formData);
      }
      const r = await fetch(cfg.url, {
        method: cfg.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...(cfg.headers || {}) },
        body,
      });
      const ok = r.ok;
      setBtnStatus(p => ({ ...p, [field.id]: { msg: ok ? (cfg.successMessage || 'Success!') : (cfg.errorMessage || `Error ${r.status}`), type: ok ? 'ok' : 'err' } }));
    } catch (e) {
      setBtnStatus(p => ({ ...p, [field.id]: { msg: cfg.errorMessage || String(e), type: 'err' } }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    schema.fields.forEach(f => {
      if (['heading', 'label', 'divider', 'button'].includes(f.type)) return;
      const v = f.validation || {};
      const val = formData[f.name];
      if (v.required && (val === undefined || val === null || val === '')) errs[f.name] = `${f.label || f.name} is required`;
      else if (val && v.minLength && String(val).length < v.minLength) errs[f.name] = `Min ${v.minLength} chars`;
      else if (val && v.maxLength && String(val).length > v.maxLength) errs[f.name] = `Max ${v.maxLength} chars`;
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (schema.settings.storeSubmissions) addSubmission(schema.id, formData);
    if (onSubmit) await onSubmit(formData);
    else { alert('Submitted!\n\n' + JSON.stringify(formData, null, 2)); setFormData({}); setErrors({}); }
  };

  const gcClass = schema.settings.formGridCols === 2 ? 'grid-cols-2' : schema.settings.formGridCols === 3 ? 'grid-cols-3' : schema.settings.formGridCols === 4 ? 'grid-cols-4' : 'grid-cols-1';

  const renderField = (field: Field): React.ReactNode => {
    const value = formData[field.name];
    const error = errors[field.name];
    const disabled = !!(field.validation?.disabled || field.validation?.readOnly);
    const isLoading = !!loading[field.id];
    const fieldOpts: FieldOption[] = field.apiDataSource?.type === 'static'
      ? (field.apiDataSource.staticData || field.options || [])
      : (opts[field.id] || []);
    const gcCls = field.gridCols === 2 ? 'col-span-2' : field.gridCols === 3 ? 'col-span-3' : field.gridCols === 4 ? 'col-span-4' : 'col-span-1';
    const status = btnStatus[field.id];

    const wrap = (content: React.ReactNode) => (
      <div data-fid={field.id} className={cn('space-y-1.5', gcCls)}>{content}</div>
    );

    const Lbl = ({ req }: { req?: boolean }) => field.label ? (
      <Label className="text-sm font-medium">{field.label}{req && <span className="text-red-500 ml-0.5">*</span>}</Label>
    ) : null;

    const Err = () => error ? <p className="et text-xs text-red-500 flex items-center gap-1"><Icons.AlertCircle className="w-3 h-3" />{error}</p> : null;
    const Help = () => field.helpText ? <p className="ht text-xs text-muted-foreground">{field.helpText}</p> : null;

    switch (field.type) {
      case 'heading': return <div data-fid={field.id} className={gcCls}><h2 className="text-2xl font-bold">{field.label}</h2></div>;
      case 'label': return <div data-fid={field.id} className={gcCls}><p className="text-sm text-muted-foreground">{field.label}</p></div>;
      case 'divider': return <div data-fid={field.id} className={cn(gcCls)}><Separator /></div>;
      case 'button': return (
        <div data-fid={field.id} className={cn(gcCls, 'space-y-1')}>
          <Button type={field.buttonApiConfig?.enabled ? 'button' : 'submit'} disabled={disabled || status?.loading} onClick={() => field.buttonApiConfig?.enabled && handleBtnClick(field)}>
            {status?.loading && <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {field.label || 'Submit'}
          </Button>
          {status?.msg && (
            <p className={cn('text-xs flex items-center gap-1', status.type === 'ok' ? 'text-green-600' : 'text-red-500')}>
              {status.type === 'ok' ? <Icons.CheckCircle2 className="w-3 h-3" /> : <Icons.AlertCircle className="w-3 h-3" />}
              {status.msg}
            </p>
          )}
        </div>
      );
      case 'textarea': return wrap(<><Lbl req={field.validation?.required} /><Textarea placeholder={field.placeholder} value={value || ''} onChange={e => handleChange(field, e.target.value)} disabled={disabled} rows={field.rows || 4} className={cn(error && 'border-red-400')} /><Help /><Err /></>);
      case 'country': case 'state': case 'city': case 'program': case 'scheme': case 'standard': case 'select': case 'multiselect':
        return wrap(<>
          <Lbl req={field.validation?.required} />
          <Select value={value || ''} onValueChange={v => { const o = fieldOpts.find(x => x.value === v); handleChange(field, v, o); }} disabled={disabled || isLoading}>
            <SelectTrigger className={cn(error && 'border-red-400')}>
              <SelectValue placeholder={isLoading ? 'Loading...' : (field.placeholder || `Select ${field.label || field.type}...`)} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {isLoading
                ? <SelectItem value="__l" disabled><Icons.Loader2 className="w-3 h-3 animate-spin inline mr-1" />Loading...</SelectItem>
                : fieldOpts.length === 0
                  ? <SelectItem value="__e" disabled className="italic text-muted-foreground">{field.apiDataSource?.type === 'dependency' ? '— Select parent first —' : '— No options —'}</SelectItem>
                  : fieldOpts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)
              }
            </SelectContent>
          </Select>
          <Help /><Err />
        </>);
      case 'cluster':
      case 'multiselect':
        return wrap(<>
          <Lbl req={field.validation?.required} />
          <div className="space-y-2">


            {/* Multi-select dropdown */}
            <Select
              value=""
              onValueChange={v => {
                const o = fieldOpts.find(x => x.value === v);
                if (o) {
                  const currentValue = Array.isArray(value) ? value : [];
                  // Toggle selection
                  if (currentValue.includes(v)) {
                    handleChange(field, currentValue.filter((item: string) => item !== v));
                  } else {
                    handleChange(field, [...currentValue, v]);
                  }
                }
              }}
              disabled={disabled || isLoading}
            >
              <SelectTrigger className={cn(error && 'border-red-400')}>
                <SelectValue placeholder={isLoading ? 'Loading...' : (field.placeholder || `Select ${field.label || field.type}...`)} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {isLoading ? (
                  <SelectItem value="__l" disabled>
                    <Icons.Loader2 className="w-3 h-3 animate-spin inline mr-1" />Loading...
                  </SelectItem>
                ) : fieldOpts.length === 0 ? (
                  <SelectItem value="__e" disabled className="italic text-muted-foreground">
                    {field.apiDataSource?.type === 'dependency' ? '— Select parent first —' : '— No options —'}
                  </SelectItem>
                ) : (
                  fieldOpts.map(o => {
                    const isSelected = Array.isArray(value) && value.includes(o.value);
                    return (
                      <SelectItem
                        key={o.value}
                        value={o.value}
                        className={cn(isSelected && 'bg-primary/10')}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <Icons.Check className="w-3 h-3" />}
                          {o.label}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            {/* Selected values display */}
            {Array.isArray(value) && value.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {value.map((v: string) => {
                  const option = fieldOpts.find(o => o.value === v);
                  return option ? (
                    <Badge key={v} variant="secondary" className="gap-1">
                      {option.label}
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = value.filter((item: string) => item !== v);
                          handleChange(field, newValue);
                        }}
                        className="hover:text-destructive"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <Help /><Err />
        </>);

      case 'multidate':
        return wrap(<>
          <Lbl req={field.validation?.required} />
          <div className="space-y-2">


            {/* Date picker input */}
            <div className="flex gap-2">
              <Input
                type="date"
                className={cn('flex-1', error && 'border-red-400')}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    const currentValue = Array.isArray(value) ? value : [];
                    // Check if date already selected
                    if (!currentValue.includes(selectedDate)) {
                      handleChange(field, [...currentValue, selectedDate]);
                    }
                  }
                }}
                disabled={disabled}
                min={field.min}
                max={field.max}
              />
              {Array.isArray(value) && value.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange(field, [])}
                  disabled={disabled}
                  className="shrink-0"
                >
                  <Icons.X className="w-4 h-4" />
                </Button>
              )}
              
            </div>

            {/* Quick select options if provided via API/static data */}
            {/* {fieldOpts.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Quick select:</p>
                <div className="flex flex-wrap gap-1">
                  {fieldOpts.map(option => {
                    const isSelected = Array.isArray(value) && value.includes(option.value);
                    return (
                      <Badge
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          'cursor-pointer',
                          isSelected ? 'bg-primary' : 'hover:bg-primary/10'
                        )}
                        onClick={() => {
                          const currentValue = Array.isArray(value) ? value : [];
                          if (isSelected) {
                            handleChange(field, currentValue.filter((v: string) => v !== option.value));
                          } else {
                            handleChange(field, [...currentValue, option.value]);
                          }
                        }}
                      >
                        {option.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )} */}

            {Array.isArray(value) && value.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {value.map((date: string, index: number) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {new Date(date).toLocaleDateString()}
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = value.filter((_: string, i: number) => i !== index);
                          handleChange(field, newValue);
                        }}
                        className="hover:text-destructive"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
          </div>
          <Help /><Err />
        </>);
      case 'checkbox': return wrap(
        <div className="flex items-start gap-2.5 py-1">
          <Checkbox id={field.name} checked={!!value} onCheckedChange={c => handleChange(field, c)} disabled={disabled} className="mt-0.5" />
          <div><Label htmlFor={field.name} className="font-normal cursor-pointer">{field.label}</Label><Help /></div>
          <Err />
        </div>
      );
      case 'switch': return wrap(
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border">
          <div><Label htmlFor={field.name}>{field.label}</Label><Help /></div>
          <Switch id={field.name} checked={!!value} onCheckedChange={c => handleChange(field, c)} disabled={disabled} />
        </div>
      );
      case 'radio': return wrap(<>
        <Lbl req={field.validation?.required} />
        <div className="space-y-2">
          {fieldOpts.map(o => (
            <label key={o.value} className={cn('flex items-center gap-2.5 py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm', value === o.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
              <input type="radio" name={field.name} value={o.value} checked={value === o.value} onChange={() => handleChange(field, o.value, o)} disabled={disabled} className="accent-primary" />
              {o.label}
            </label>
          ))}
        </div>
        <Err />
      </>);
      case 'range': return wrap(<>
        <div className="flex justify-between"><Lbl /><span className="text-sm font-mono text-primary bg-primary/10 px-2 rounded">{value ?? field.defaultValue ?? 50}</span></div>
        <input type="range" className="w-full accent-primary" min={field.min ?? 0} max={field.max ?? 100} step={field.step || 1} value={value ?? field.defaultValue ?? 50} onChange={e => handleChange(field, +e.target.value)} disabled={disabled} />
        <div className="flex justify-between text-xs text-muted-foreground"><span>{field.min ?? 0}</span><span>{field.max ?? 100}</span></div>
        <Err />
      </>);
      case 'color': return wrap(<>
        <Lbl />
        <div className="flex gap-3 items-center">
          <input type="color" className="w-12 h-10 rounded-lg cursor-pointer border-2 border-white shadow" value={value || field.defaultValue || '#3b82f6'} onChange={e => handleChange(field, e.target.value)} disabled={disabled} />
          <Input className="flex-1 font-mono" value={value || field.defaultValue || '#3b82f6'} onChange={e => handleChange(field, e.target.value)} disabled={disabled} />
        </div>
        <Err />
      </>);
      case 'date': case 'time': case 'datetime-local': return wrap(<><Lbl req={field.validation?.required} /><Input type={field.type} value={value || ''} onChange={e => handleChange(field, e.target.value)} disabled={disabled} className={cn(error && 'border-red-400')} /><Help /><Err /></>);
      case 'file': case 'image': return wrap(<>
        <Lbl />
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-primary/3 hover:border-primary/40 transition-all">
          <Icons.Upload className="w-5 h-5 text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">Drop or click to upload</p>
          <input type="file" className="hidden" accept={field.accept || (field.type === 'image' ? 'image/*' : undefined)} onChange={e => handleChange(field, e.target.files?.[0])} disabled={disabled} />
        </label>
        <Help /><Err />
      </>);
      case 'hidden': return <input key={field.id} type="hidden" name={field.name} value={value || field.defaultValue || ''} />;
      default: return wrap(<>
        <Lbl req={field.validation?.required} />
        <Input type={field.type} placeholder={field.placeholder} value={value || ''} onChange={e => handleChange(field, e.target.value)} disabled={disabled} className={cn(error && 'border-red-400')}
          min={field.validation?.min} max={field.validation?.max} minLength={field.validation?.minLength} maxLength={field.validation?.maxLength}
          required={field.validation?.required} pattern={field.validation?.pattern} />
        <Help /><Err />
      </>);
    }
  };

  return (
    <>
      <FieldStyleInjector fields={schema.fields} />
      <form onSubmit={handleSubmit}>
        <div className={cn('grid gap-5', gcClass)}>
          {schema.fields.map(f => <React.Fragment key={f.id}>{renderField(f)}</React.Fragment>)}
        </div>
      </form>
    </>
  );
}
