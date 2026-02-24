
export interface ApiDataSource {
    type: 'static' | 'api' | 'dependency';
    endpoint?: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    responsePath?: string;
    labelKey?: string;
    valueKey?: string;
    staticData?: FieldOption[];
    dependsOn?: string | string[];
    dependencyEndpoint?: string;
    dependencyParam?: string;
    dependencyValueKey?: string;
}

export interface ButtonApiConfig {
    enabled?: boolean;
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    bodyTemplate?: string;
    successMessage?: string;
    errorMessage?: string;
}

export interface FieldValidation {
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
}

export interface CustomCSS {
    container?: string;
    label?: string;
    input?: string;
    helpText?: string;
    error?: string;
    wrapper?: string;
}
export type FieldType =
    | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    | 'textarea' | 'select' | 'multiselect'
    | 'checkbox' | 'radio' | 'switch'
    | 'date' | 'time' | 'datetime-local' | "multidate"
    | 'file' | 'image'
    | 'range' | 'color' | 'hidden'
    | 'label' | 'heading' | 'divider'
    | 'button' | 'otp' | 'captcha'
    | 'country' | 'state' | 'city'
    | 'program' | "scheme" | "standard" | "cluster";

export interface FieldOption { label: string; value: string; _raw?: any;[key: string]: any; }


export interface Field {
    id: string;
    type: FieldType;
    name: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    validation: FieldValidation;
    options?: FieldOption[];
    apiDataSource?: ApiDataSource;
    buttonApiConfig?: ButtonApiConfig;
    defaultValue?: any;
    gridCols?: 1 | 2 | 3 | 4;
    alignment?: 'left' | 'center' | 'right';
    customCSS?: CustomCSS;
    step?: number;
    rows?: number;
    min?: number;
    max?: number;
    accept?: string;
    order: number;
    multiple?: boolean;
}
export interface FormSchema {
    id: string;
    name: string;
    description?: string;
    fields: Field[];
    settings: {
        submitUrl?: string;
        submitMethod?: 'POST' | 'PUT';
        redirectUrl?: string;
        storeSubmissions?: boolean;
        customCSS?: string;
        formGridCols?: 1 | 2 | 3 | 4;
    };
    createdAt: string;
    updatedAt: string;
}

export interface FormSubmission {
    id: string;
    formId: string;
    formName: string;
    data: Record<string, any>;
    submittedAt: string;
    userAgent?: string;
}


export type Store = {
    fields: Field[];
    selectedField: Field | null;
    formSchema: FormSchema;
    savedForms: SavedForm[];
    isBuilderOpen: boolean;
    selectedFields: Set<string>;

    setFields: (f: Field[]) => void;
    setSelectedField: (f: Field | null) => void;
    setFormSchema: (f: FormSchema) => void;
    setIsBuilderOpen: (v: boolean) => void;
    setSelectedFields: (s: Set<string>) => void;

    toggleFieldSelection: (id: string) => void;
    selectAllFields: () => void;
    deselectAllFields: () => void;

    addField: (field: Field, index?: number) => void;
    updateField: (id: string, updates: Partial<Field>) => void;
    removeField: (id: string) => void;
    removeSelectedFields: () => void;
    duplicateField: (id: string) => void;
    duplicateSelectedFields: () => void;
    reorderFields: (activeId: string, overId: string) => void;

    updateFormSchema: (u: Partial<FormSchema>) => void;
    saveForm: (name: string, desc?: string) => void;
    loadForm: (id: string) => void;
    deleteForm: (id: string) => void;
    createNewForm: () => void;
    clearForm: () => void;

    addSubmission: (formId: string, data: Record<string, any>) => void;
    getSubmissions: (formId: string) => FormSubmission[];
};
export interface Ctx {
    fields: Field[]; selectedField: Field | null; formSchema: FormSchema; savedForms: SavedForm[];
    isBuilderOpen: boolean; selectedFields: Set<string>;
    setFields: (f: Field[]) => void; setSelectedField: (f: Field | null) => void;
    setFormSchema: (s: FormSchema) => void; setIsBuilderOpen: (b: boolean) => void;
    setSelectedFields: (s: Set<string>) => void;
    toggleFieldSelection: (id: string) => void; selectAllFields: () => void; deselectAllFields: () => void;
    addField: (f: Field, idx?: number) => void; updateField: (id: string, u: Partial<Field>) => void;
    removeField: (id: string) => void; removeSelectedFields: () => void;
    duplicateField: (id: string) => void; duplicateSelectedFields: () => void;
    reorderFields: (a: string, o: string) => void;
    updateFormSchema: (u: Partial<FormSchema>) => void;
    saveForm: (name: string, desc?: string) => void; loadForm: (id: string) => void;
    deleteForm: (id: string) => void; createNewForm: () => void; clearForm: () => void;
    addSubmission: (formId: string, data: Record<string, any>) => void;
    getSubmissions: (formId: string) => FormSubmission[];
    getFieldById: (id: string) => Field | undefined;
    applyLayoutToSelected: (cols: 1 | 2 | 3 | 4) => void;

}
export interface SavedForm extends FormSchema { submissions?: FormSubmission[]; }
