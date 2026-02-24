

"use client";

import { create } from "zustand";
import { Field, Store, FormSchema, FormSubmission, SavedForm } from "@/utils/form-type";
import { genFormId, genId, genSubId } from "@/utils/forms";


export const useFormBuilderStore = create<Store>((set, get) => ({
  fields: [],
  selectedField: null,

  formSchema: {
    id: genFormId(),
    name: "Untitled Form",
    description: "",
    fields: [],
    settings: { storeSubmissions: true, submitMethod: "POST", formGridCols: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  savedForms: JSON.parse(
    typeof window !== "undefined"
      ? localStorage.getItem("fb-forms") || "[]"
      : "[]"
  ),

  isBuilderOpen: false,
  selectedFields: new Set(),

  setFields: (fields) => set({ fields }),
  setSelectedField: (selectedField) => set({ selectedField }),
  setFormSchema: (formSchema) => set({ formSchema }),
  setIsBuilderOpen: (isBuilderOpen) => set({ isBuilderOpen }),
  setSelectedFields: (selectedFields) => set({ selectedFields }),

  toggleFieldSelection: (id) =>
    set((state) => {
      const s = new Set(state.selectedFields);
      s.has(id) ? s.delete(id) : s.add(id);
      return { selectedFields: s };
    }),

  selectAllFields: () =>
    set((state) => ({
      selectedFields: new Set(state.fields.map((f) => f.id)),
    })),

  deselectAllFields: () => set({ selectedFields: new Set() }),

  addField: (field, index) =>
    set((state) => {
      const n = [...state.fields];
      n.splice(index ?? n.length, 0, field);
      return { fields: n.map((f, i) => ({ ...f, order: i })) };
    }),

  updateField: (id, updates) =>
    set((state) => ({
      fields: state.fields.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
      selectedField:
        state.selectedField?.id === id
          ? { ...state.selectedField, ...updates }
          : state.selectedField,
    })),

  removeField: (id) =>
    set((state) => ({
      fields: state.fields
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, order: i })),
      selectedField:
        state.selectedField?.id === id ? null : state.selectedField,
      selectedFields: new Set(
        [...state.selectedFields].filter((x) => x !== id)
      ),
    })),

  removeSelectedFields: () =>
    set((state) => ({
      fields: state.fields
        .filter((f) => !state.selectedFields.has(f.id))
        .map((f, i) => ({ ...f, order: i })),
      selectedField: null,
      selectedFields: new Set(),
    })),

  duplicateField: (id) =>
    set((state) => {
      const i = state.fields.findIndex((f) => f.id === id);
      if (i === -1) return {};
      const nf: Field = {
        ...state.fields[i],
        id: genId(),
        label: `${state.fields[i].label} (Copy)`,
        name: `${state.fields[i].name}_copy`,
      };
      const n = [...state.fields];
      n.splice(i + 1, 0, nf);
      return { fields: n.map((f, j) => ({ ...f, order: j })) };
    }),

  duplicateSelectedFields: () =>
    set((state) => {
      const sorted = [...state.selectedFields].sort(
        (a, b) =>
          state.fields.findIndex((f) => f.id === a) -
          state.fields.findIndex((f) => f.id === b)
      );

      const n = [...state.fields];
      let off = 0;

      sorted.forEach((id) => {
        const i = n.findIndex((f) => f.id === id);
        if (i === -1) return;
        const nf: Field = {
          ...n[i + off],
          id: genId(),
          label: `${n[i + off].label} (Copy)`,
          name: `${n[i + off].name}_copy`,
        };
        n.splice(i + off + 1, 0, nf);
        off++;
      });

      return { fields: n.map((f, i) => ({ ...f, order: i })) };
    }),

  reorderFields: (activeId, overId) =>
    set((state) => {
      const oi = state.fields.findIndex((f) => f.id === activeId);
      const ni = state.fields.findIndex((f) => f.id === overId);
      if (oi === -1 || ni === -1) return {};
      const n = [...state.fields];
      const [r] = n.splice(oi, 1);
      n.splice(ni, 0, r);
      return { fields: n.map((f, i) => ({ ...f, order: i })) };
    }),

  updateFormSchema: (u) =>
    set((state) => ({
      formSchema: {
        ...state.formSchema,
        ...u,
        updatedAt: new Date().toISOString(),
      },
    })),

  saveForm: (name, desc) =>
    set((state) => {
      const f: SavedForm = {
        ...state.formSchema,
        name,
        description: desc || "",
        fields: state.fields,
        updatedAt: new Date().toISOString(),
        submissions: (state.formSchema as any).submissions || [],
      };

      const forms = [...state.savedForms];
      const i = forms.findIndex((x) => x.id === state.formSchema.id);

      if (i >= 0) forms[i] = f;
      else forms.push(f);

      localStorage.setItem("fb-forms", JSON.stringify(forms));
      return { savedForms: forms };
    }),

  loadForm: (id) =>
    set((state) => {
      const f = state.savedForms.find((x) => x.id === id);
      if (!f) return {};
      return {
        formSchema: f,
        fields: f.fields,
        selectedField: null,
        selectedFields: new Set(),
        isBuilderOpen: true,
      };
    }),

  deleteForm: (id) =>
    set((state) => {
      const forms = state.savedForms.filter((f) => f.id !== id);
      localStorage.setItem("fb-forms", JSON.stringify(forms));
      return { savedForms: forms };
    }),

  createNewForm: () =>
    set(() => ({
      formSchema: {
        id: genFormId(),
        name: "Untitled Form",
        description: "",
        fields: [],
        settings: {
          storeSubmissions: true,
          submitMethod: "POST",
          formGridCols: 1,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      fields: [],
      selectedField: null,
      selectedFields: new Set(),
      isBuilderOpen: true,
    })),

  clearForm: () =>
    set((state) => ({
      fields: [],
      selectedField: null,
      selectedFields: new Set(),
      formSchema: {
        ...state.formSchema,
        id: genFormId(),
        fields: [],
        createdAt: new Date().toISOString(),
      },
    })),

  addSubmission: (formId, data) =>
    set((state) => {
      const sub: FormSubmission = {
        id: genSubId(),
        formId,
        formName: state.formSchema.name,
        data,
        submittedAt: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      const forms = state.savedForms.map((f) =>
        f.id === formId
          ? { ...f, submissions: [...(f.submissions || []), sub] }
          : f
      );

      localStorage.setItem("fb-forms", JSON.stringify(forms));

      return { savedForms: forms };
    }),

  applyLayoutToSelected: (cols: any) =>
    set((state) => ({
      fields: state.fields.map((f) =>
        state.selectedFields.has(f.id) ? { ...f, gridCols: cols } : f
      ),
      selectedField:
        state.selectedField && state.selectedFields.has(state.selectedField.id)
          ? { ...state.selectedField, gridCols: cols }
          : state.selectedField,
    })),

  getFieldById: (id: string) => get().fields.find((f) => f.id === id),

  getSubmissions: (formId) =>
    get().savedForms.find((f) => f.id === formId)?.submissions || [],
}));

export const useFB = useFormBuilderStore;


// 'use client';
// import { Ctx, Field, FormSchema, FormSubmission, SavedForm } from '@/lib/types/forms';
// import { genFormId, genId, genSubId } from '@/utils/static-data/forms';
// import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';


// const FBCtx = createContext<Ctx | undefined>(undefined);

// export const FBProvider = ({ children }: { children: React.ReactNode }) => {
//   const [fields, setFields] = useState<Field[]>([]);
//   const [selectedField, setSelectedField] = useState<Field | null>(null);
//   const [formSchema, setFormSchema] = useState<FormSchema>({
//     id: genFormId(), name: 'Untitled Form', description: '', fields: [],
//     settings: { storeSubmissions: true, submitMethod: 'POST', formGridCols: 1 },
//     createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
//   });
//   const [savedForms, setSavedForms] = useState<SavedForm[]>([]);
//   const [isBuilderOpen, setIsBuilderOpen] = useState(false);
//   const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

//   useEffect(() => { try { const s = localStorage.getItem('fb-forms'); if (s) setSavedForms(JSON.parse(s)); } catch {} }, []);
//   useEffect(() => { try { localStorage.setItem('fb-forms', JSON.stringify(savedForms)); } catch {} }, [savedForms]);

//   const toggleFieldSelection = useCallback((id: string) => setSelectedFields(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; }), []);
//   const selectAllFields = useCallback(() => setSelectedFields(new Set(fields.map(f => f.id))), [fields]);
//   const deselectAllFields = useCallback(() => setSelectedFields(new Set()), []);
//   const getFieldById = useCallback((id: string) => fields.find(f => f.id === id), [fields]);
//   const applyLayoutToSelected = useCallback((cols: 1|2|3|4) => {
//     setFields(p => p.map(f => selectedFields.has(f.id) ? { ...f, gridCols: cols } : f));
//     setSelectedField(p => p && selectedFields.has(p.id) ? { ...p, gridCols: cols } : p);
//   }, [selectedFields]);

//   const addField = useCallback((field: Field, index?: number) => {
//     setFields(p => { const n = [...p]; n.splice(index ?? n.length, 0, field); return n.map((f,i) => ({ ...f, order: i })); });
//   }, []);

//   const updateField = useCallback((id: string, updates: Partial<Field>) => {
//     setFields(p => p.map(f => f.id === id ? { ...f, ...updates } : f));
//     setSelectedField(p => p?.id === id ? { ...p, ...updates } : p);
//   }, []);

//   const removeField = useCallback((id: string) => {
//     setFields(p => p.filter(f => f.id !== id).map((f,i) => ({ ...f, order: i })));
//     setSelectedField(p => p?.id === id ? null : p);
//     setSelectedFields(p => { const s = new Set(p); s.delete(id); return s; });
//   }, []);

//   const removeSelectedFields = useCallback(() => {
//     setFields(p => p.filter(f => !selectedFields.has(f.id)).map((f,i) => ({ ...f, order: i })));
//     setSelectedField(null); setSelectedFields(new Set());
//   }, [selectedFields]);

//   const duplicateField = useCallback((id: string) => {
//     setFields(p => {
//       const i = p.findIndex(f => f.id === id); if (i === -1) return p;
//       const nf: Field = { ...p[i], id: genId(), label: `${p[i].label} (Copy)`, name: `${p[i].name}_copy` };
//       const n = [...p]; n.splice(i + 1, 0, nf); return n.map((f,j) => ({ ...f, order: j }));
//     });
//   }, []);

//   const duplicateSelectedFields = useCallback(() => {
//     const sorted = Array.from(selectedFields).sort((a,b) => fields.findIndex(f=>f.id===a) - fields.findIndex(f=>f.id===b));
//     setFields(p => {
//       const n = [...p]; let off = 0;
//       sorted.forEach(id => {
//         const i = n.findIndex(f => f.id === id); if (i === -1) return;
//         const nf: Field = { ...n[i+off], id: genId(), label: `${n[i+off].label} (Copy)`, name: `${n[i+off].name}_copy` };
//         n.splice(i + off + 1, 0, nf); off++;
//       });
//       return n.map((f,i) => ({ ...f, order: i }));
//     });
//   }, [fields, selectedFields]);

//   const reorderFields = useCallback((activeId: string, overId: string) => {
//     setFields(p => {
//       const oi = p.findIndex(f => f.id === activeId), ni = p.findIndex(f => f.id === overId);
//       if (oi === -1 || ni === -1) return p;
//       const n = [...p]; const [r] = n.splice(oi, 1); n.splice(ni, 0, r); return n.map((f,i) => ({ ...f, order: i }));
//     });
//   }, []);

//   const updateFormSchema = useCallback((u: Partial<FormSchema>) => setFormSchema(p => ({ ...p, ...u, updatedAt: new Date().toISOString() })), []);

//   const saveForm = useCallback((name: string, desc?: string) => {
//     const f: SavedForm = { ...formSchema, name, description: desc || '', fields, updatedAt: new Date().toISOString(), submissions: (formSchema as any).submissions || [] };
//     setSavedForms(p => { const i = p.findIndex(x => x.id === formSchema.id); if (i >= 0) { const n=[...p]; n[i]=f; return n; } return [...p, f]; });
//   }, [formSchema, fields]);

//   const loadForm = useCallback((id: string) => {
//     const f = savedForms.find(x => x.id === id);
//     if (f) { setFormSchema(f); setFields(f.fields); setSelectedField(null); setSelectedFields(new Set()); setIsBuilderOpen(true); }
//   }, [savedForms]);

//   const deleteForm = useCallback((id: string) => setSavedForms(p => p.filter(f => f.id !== id)), []);

//   const createNewForm = useCallback(() => {
//     setFormSchema({ id: genFormId(), name: 'Untitled Form', description: '', fields: [],
//       settings: { storeSubmissions: true, submitMethod: 'POST', formGridCols: 1 },
//       createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
//     setFields([]); setSelectedField(null); setSelectedFields(new Set()); setIsBuilderOpen(true);
//   }, []);

//   const clearForm = useCallback(() => {
//     setFields([]); setSelectedField(null); setSelectedFields(new Set());
//     setFormSchema(p => ({ ...p, id: genFormId(), fields: [], createdAt: new Date().toISOString() }));
//     try { localStorage.removeItem('fb-draft'); } catch {}
//   }, []);

//   const addSubmission = useCallback((formId: string, data: Record<string, any>) => {
//     const sub: FormSubmission = { id: genSubId(), formId, formName: formSchema.name, data, submittedAt: new Date().toISOString(), userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '' };
//     setSavedForms(p => p.map(f => f.id === formId ? { ...f, submissions: [...(f.submissions||[]), sub] } : f));
//     if (formSchema.settings.submitUrl) {
//       fetch(formSchema.settings.submitUrl, { method: formSchema.settings.submitMethod||'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(console.error);
//     }
//   }, [formSchema]);

//   const getSubmissions = useCallback((formId: string) => savedForms.find(f => f.id === formId)?.submissions || [], [savedForms]);

//   return (
//     <FBCtx.Provider value={{
//       fields, selectedField, formSchema, savedForms, isBuilderOpen, selectedFields,
//       setFields, setSelectedField, setFormSchema, setIsBuilderOpen, setSelectedFields,
//       toggleFieldSelection, selectAllFields, deselectAllFields,
//       addField, updateField, removeField, removeSelectedFields, duplicateField, duplicateSelectedFields,
//       reorderFields, updateFormSchema, saveForm, loadForm, deleteForm, createNewForm, clearForm,
//       addSubmission, getSubmissions, getFieldById, applyLayoutToSelected,
//     }}>
//       {children}
//     </FBCtx.Provider>
//   );
// }

// // At the end of FBProvider.tsx, add this export:
// export const useFB = () => {
//   const context = useContext(FBCtx);
//   if (!context) {
//     throw new Error('useFB must be used within a FBProvider');
//   }
//   return context;
// };