'use client';
import * as Icons from 'lucide-react';
import { Badge } from "../../../../components/ui/badge";
import { parseCSStoObj } from '../../utils/forms';
import { Field } from '../../utils/form-type';

export const FieldPreview = ({ field }: { field: Field }) => {
    const lCss = parseCSStoObj(field.customCSS?.label);
    const iCss = parseCSStoObj(field.customCSS?.input);
    const lbl = field.label ? <label className="text-xs font-semibold text-slate-500 block mb-1.5" style={lCss}>{field.label}</label> : null;
    const inp = (ph: string) => <div className="w-full h-8 px-2.5 rounded-md border border-input bg-slate-50 text-xs text-muted-foreground flex items-center" style={iCss}>{ph}</div>;

    switch (field.type) {
        case 'heading': return <h3 className="text-base font-bold" style={lCss}>{field.label || 'Heading'}</h3>;
        case 'label': return <p className="text-xs text-muted-foreground" style={lCss}>{field.label}</p>;
        case 'divider': return <div className="flex items-center gap-2"><div className="flex-1 border-t border-dashed" /><span className="text-[10px] text-muted-foreground">—</span><div className="flex-1 border-t border-dashed" /></div>;
        case 'button': return (
            <div className="flex items-center gap-2">
                <button className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-medium" style={iCss}>{field.label || 'Button'}</button>
                {field.buttonApiConfig?.enabled && <Badge className="text-[9px] h-4 py-0 bg-emerald-100 text-emerald-700 border-0">API</Badge>}
            </div>
        );
        case 'textarea': return <>{lbl}<div className="w-full h-14 px-2.5 py-2 rounded-md border bg-slate-50 text-xs text-muted-foreground" style={iCss}>{field.placeholder || '...'}</div></>;
        case 'checkbox': return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-primary/30 flex items-center justify-center"><Icons.Check className="w-2.5 h-2.5 text-primary/30" /></div>
                <span className="text-xs text-slate-600" style={lCss}>{field.label}</span>
            </div>
        );
        case 'switch': return (
            <div className="flex items-center gap-2">
                <div className="w-8 h-4 rounded-full bg-slate-200 flex items-center px-0.5"><div className="w-3 h-3 rounded-full bg-white shadow-sm" /></div>
                <span className="text-xs text-slate-600" style={lCss}>{field.label}</span>
            </div>
        );
        case 'country': case 'state': case 'city': case 'program': case 'scheme': case 'standard': case 'cluster': case 'select':
            return <>
                {lbl}
                <div className="w-full h-8 px-2.5 rounded-md border bg-slate-50 text-xs text-muted-foreground flex items-center justify-between" style={iCss}>
                    <span>{field.placeholder || `Select ${field.type}...`}</span>
                    <div className="flex items-center gap-1">
                        {field.apiDataSource?.type === 'dependency' && <Badge className="text-[9px] h-4 py-0 bg-orange-100 text-orange-600 border-0">linked</Badge>}
                        {field.apiDataSource?.type === 'api' && <Badge className="text-[9px] h-4 py-0 bg-blue-100 text-blue-600 border-0">API</Badge>}
                        <Icons.ChevronDown className="w-3 h-3" />
                    </div>
                </div>
            </>;
        case 'range': return <>
            {lbl}
            <div className="w-full h-2 rounded-full bg-slate-200 relative"><div className="absolute left-0 h-full w-1/2 rounded-full bg-primary/30" /></div>
        </>;
        case 'file': case 'image': return <>
            {lbl}
            <div className="border-2 border-dashed border-primary/20 rounded-lg py-2.5 text-center bg-primary/3">
                <Icons.Upload className="w-4 h-4 mx-auto mb-0.5 text-primary/30" />
                <p className="text-[10px] text-muted-foreground">Upload</p>
            </div>
        </>;
        default: return <>{lbl}{inp(field.placeholder || `Enter ${field.type}...`)}</>;
    }
}