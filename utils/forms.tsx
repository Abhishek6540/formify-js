import { Field, FieldType } from "./form-type";

export function getDefaultField(type: FieldType, existingFields?: Field[]): Partial<Field> {
    const lastOfType = (t: FieldType) => existingFields?.filter(f => f.type === t).slice(-1)[0];
    const defs: Partial<Record<FieldType, Partial<Field>>> = {
        text: { label: 'Text Field', name: 'text_field', placeholder: 'Enter text...' },
        email: { label: 'Email', name: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', name: 'password', placeholder: '••••••••' },
        number: { label: 'Number', name: 'number', placeholder: '0' },
        tel: { label: 'Phone', name: 'phone', placeholder: '+1 (555) 000-0000' },
        url: { label: 'Website', name: 'url', placeholder: 'https://' },
        textarea: { label: 'Message', name: 'message', placeholder: 'Enter message...', rows: 4 },
        country: {
            label: 'Country', name: 'country', placeholder: 'Select country...', apiDataSource: {
                type: 'api',
                endpoint: 'https://crmapi.thinkdatalabs.com/api/global/country/',
                method: 'GET', labelKey: 'name', valueKey: 'id', responsePath: '',
            }
        },
        state: {
            label: 'State', name: 'state', placeholder: 'Select state...', apiDataSource: {
                type: 'dependency',
                dependsOn: lastOfType('country')?.id || '',
                dependencyEndpoint: 'https://crmapi.thinkdatalabs.com/api/global/state/?country={value}',
                dependencyParam: 'country', dependencyValueKey: 'id',
                method: 'GET', responsePath: '', labelKey: 'name', valueKey: 'id',
            }
        },
        city: {
            label: 'City', name: 'city', placeholder: 'Select city...', apiDataSource: {
                type: 'dependency',
                dependsOn: lastOfType('state')?.id || '',
                dependencyEndpoint: 'https://crmapi.thinkdatalabs.com/api/global/city/?state={value}',
                dependencyParam: 'state', dependencyValueKey: 'id',
                method: 'GET', responsePath: '', labelKey: 'name', valueKey: 'id',
            }
        },
        program: {
            label: 'Program', name: 'program', placeholder: 'Select program', apiDataSource: {
                type: 'api',
                endpoint: "https://crmapi.thinkdatalabs.com/api/global/programme/",
                method: 'GET', labelKey: 'name', valueKey: 'id', responsePath: '',
            }
        },
        scheme: {
            label: 'Scheme', name: 'scheme', placeholder: 'Select scheme...', apiDataSource: {
                type: 'dependency',
                dependsOn: lastOfType('program')?.id || '',
                dependencyEndpoint: 'https://crmapi.thinkdatalabs.com/api/global/scheme/?programme={value}',
                dependencyParam: 'program', dependencyValueKey: 'id',
                method: 'GET', responsePath: '', labelKey: 'name', valueKey: 'id',
            }
        },
        standard: {
            label: 'Standard', name: 'standard', placeholder: 'Select standard...', apiDataSource: {
                type: 'dependency',
                dependsOn: lastOfType('scheme')?.id || '',
                dependencyEndpoint: 'https://crmapi.thinkdatalabs.com/api/global/standard/?scheme={value}',
                dependencyParam: 'scheme', dependencyValueKey: 'id',
                method: 'GET', responsePath: '', labelKey: 'name', valueKey: 'id',
            },
            multiple: true,
        },
        cluster: {
            label: 'Cluster', name: 'cluster', placeholder: 'Select cluster...', apiDataSource: {
                type: 'dependency',
                dependsOn: lastOfType('standard')?.id || '',
                dependencyEndpoint: 'https://crmapi.thinkdatalabs.com/api/global/cluster/?standard={value}',
                dependencyParam: 'standard', dependencyValueKey: 'id',
                method: 'GET', responsePath: '', labelKey: 'name', valueKey: 'id',
            }
        },
        select: {
            label: 'Select', name: 'select', placeholder: 'Choose...', apiDataSource: {
                type: 'static', staticData: [
                    { label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' },
                ]
            }
        },
        multiselect: {
            label: 'Multi Select', name: 'multi_select', apiDataSource: {
                type: 'static', staticData: [
                    { label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' },
                ]
            }
        },
        multidate: {
            label: 'Multiple Dates', name: 'multi_date', placeholder: 'Select dates...',
            min: undefined, max: undefined,
            apiDataSource: {
                type: 'static',
                staticData: [
                    // { label: 'Today', value: new Date().toISOString().split('T')[0] },
                    // { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                ]
            }
        },
        checkbox: { label: 'I agree to the terms', name: 'agree' },
        radio: {
            label: 'Choose one', name: 'choice', apiDataSource: {
                type: 'static', staticData: [
                    { label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' },
                ]
            }
        },
        switch: { label: 'Enable notifications', name: 'toggle' },
        date: { label: 'Date', name: 'date' },
        time: { label: 'Time', name: 'time' },
        'datetime-local': { label: 'Date & Time', name: 'datetime' },
        file: { label: 'Upload File', name: 'file' },
        image: { label: 'Upload Image', name: 'image', accept: 'image/*' },
        range: { label: 'Range', name: 'range', min: 0, max: 100, defaultValue: 50 },
        color: { label: 'Color', name: 'color', defaultValue: '#3b82f6' },
        hidden: { label: 'Hidden', name: 'hidden_field' },
        label: { label: 'This is a label', name: 'label' },
        heading: { label: 'Section Heading', name: 'heading' },
        divider: { label: '', name: 'divider' },
        button: { label: 'Submit', name: 'submit_btn', buttonApiConfig: { enabled: false, method: 'POST', successMessage: 'Submitted!', errorMessage: 'Something went wrong.' } },
        otp: { label: 'Enter OTP', name: 'otp' },
        captcha: { label: 'Captcha', name: 'captcha' },
    };
    return defs[type] || { label: 'Field', name: 'field' };
}
export const FIELD_CATEGORIES = [
    {
        key: 'basic', label: 'Basic', color: 'blue', fields: [
            { type: 'text', label: 'Text', icon: 'Type' },
            { type: 'email', label: 'Email', icon: 'Mail' },
            { type: 'password', label: 'Password', icon: 'Lock' },
            { type: 'number', label: 'Number', icon: 'Hash' },
            { type: 'tel', label: 'Phone', icon: 'Phone' },
            { type: 'url', label: 'URL', icon: 'Link' },
        ]
    },
    {
        key: 'location', label: 'Location', color: 'emerald', fields: [
            { type: 'country', label: 'Country', icon: 'Globe' },
            { type: 'state', label: 'State', icon: 'Map' },
            { type: 'city', label: 'City', icon: 'Building2' },
        ]
    },
    {
        key: "program",
        label: "Program",
        color: "red",
        fields: [
            { type: "program", label: "Program", icon: "Globe" },
            { type: "scheme", label: "Scheme", icon: "MapPinned" },
            { type: "standard", label: "Standard", icon: "BadgeCheck" },
            { type: "cluster", label: "Cluster", icon: "Layers" },
        ],
    },
    {
        key: 'choice', label: 'Choice', color: 'violet', fields: [
            { type: 'textarea', label: 'Textarea', icon: 'AlignLeft' },
            { type: 'select', label: 'Dropdown', icon: 'ChevronDown' },
            { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare' },
            { type: 'radio', label: 'Radio', icon: 'CircleDot' },
            { type: 'switch', label: 'Switch', icon: 'ToggleLeft' },
        ]
    },
    {
        key: 'datetime', label: 'Date/Time', color: 'amber', fields: [
            { type: 'date', label: 'Date', icon: 'Calendar' },
            { type: 'time', label: 'Time', icon: 'Clock' },
            { type: 'datetime-local', label: 'Date & Time', icon: 'CalendarDays' },
            { type: 'multidate', label: 'Multiple Dates', icon: 'CalendarRange' },
        ]
    },
    {
        key: 'file', label: 'Files', color: 'rose', fields: [
            { type: 'file', label: 'File Upload', icon: 'Upload' },
            { type: 'image', label: 'Image', icon: 'ImagePlus' },
        ]
    },
    {
        key: 'advanced', label: 'Advanced', color: 'sky', fields: [
            { type: 'range', label: 'Slider', icon: 'Sliders' },
            { type: 'color', label: 'Color', icon: 'Palette' },
            { type: 'hidden', label: 'Hidden', icon: 'EyeOff' },
            { type: 'otp', label: 'OTP', icon: 'ShieldCheck' },
        ]
    },
    {
        key: 'layout', label: 'Layout', color: 'slate', fields: [
            { type: 'label', label: 'Label', icon: 'Tag' },
            { type: 'heading', label: 'Heading', icon: 'Heading1' },
            { type: 'divider', label: 'Divider', icon: 'Minus' },
            { type: 'button', label: 'Button', icon: 'MousePointer' },
        ]
    },
] as const;



export const COLORBADGE: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    sky: 'bg-sky-100 text-sky-600',
    slate: 'bg-slate-100 text-slate-500',
};
export function getN(obj: any, path: string): any {
    if (!path) return obj;
    return path.split('.').reduce((c: any, k: string) => c?.[k], obj);
}

export function parseCSStoObj(css?: string): React.CSSProperties {
    if (!css?.trim()) return {};
    try {
        return Object.fromEntries(
            css.split(';').filter(r => r.trim()).map(r => {
                const i = r.indexOf(':');
                if (i === -1) return null;
                const k = r.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                return [k, r.slice(i + 1).trim()];
            }).filter(Boolean) as [string, string][]
        ) as React.CSSProperties;
    } catch { return {}; }
}
export const genFormId = () => `form_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
export const genId = () => `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
export const genSubId = () => `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
