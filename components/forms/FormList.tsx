"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Icons from "lucide-react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { useFB } from "@/components/forms/FBProvider";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormList() {
  const router = useRouter();

  const {
    savedForms,
    loadForm,
    deleteForm,
    createNewForm,
    setIsBuilderOpen,
    getSubmissions,
    saveForm,
  } = useFB();

  const [delForm, setDelForm] = useState<string | null>(null);
  const [showSubs, setShowSubs] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<any | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  const subs = showSubs ? getSubmissions(showSubs) : [];

  // Sample data for country/city/state
  const countries = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "au", label: "Australia" },
    { value: "in", label: "India" },
  ];

  const states = {
    us: ["New York", "California", "Texas", "Florida", "Illinois"],
    ca: ["Ontario", "Quebec", "British Columbia", "Alberta"],
    uk: ["England", "Scotland", "Wales", "Northern Ireland"],
    au: ["New South Wales", "Victoria", "Queensland", "Western Australia"],
    in: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"],
  };

  const cities = {
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento"],
    "Texas": ["Houston", "Dallas", "Austin", "San Antonio"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
    "Illinois": ["Chicago", "Springfield", "Naperville", "Peoria"],
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge"],
    "England": ["London", "Manchester", "Birmingham", "Liverpool"],
    "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Bangor"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry"],
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"],
    "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville"],
    "Western Australia": ["Perth", "Fremantle", "Bunbury", "Albany"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy"],
  };

  const getFieldIcon = (type: string) => {
    const icons: Record<string, any> = {
      text: Icons.Type,
      textarea: Icons.FileText,
      number: Icons.Hash,
      email: Icons.Mail,
      phone: Icons.Phone,
      date: Icons.Calendar,
      time: Icons.Clock,
      select: Icons.ListChecks,
      checkbox: Icons.CheckSquare,
      radio: Icons.Radio,
      file: Icons.File,
      rating: Icons.Star,
      signature: Icons.PenTool,
      country: Icons.Flag,
      state: Icons.MapPin,
      city: Icons.Building,
      submit: Icons.Send,
      button: Icons.Square,
      reset: Icons.RotateCcw,
    };
    return icons[type] || Icons.HelpCircle;
  };

  const handleSaveForm = () => {
    if (previewForm) {
      saveForm(formName || previewForm.name, formDesc || previewForm.description);
      setShowSaveDialog(false);
      setPreviewForm(null);
    }
  };

  // Render actual form field based on type
  const renderFormField = (field: any, index: number) => {
    const value = previewValues[field.id] || '';

    switch (field.type) {
      case 'country':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Country'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => {
                // Find state and city fields to reset them
                const stateField = previewForm?.fields?.find((f: any) => f.type === 'state');
                const cityField = previewForm?.fields?.find((f: any) => f.type === 'city');

                setPreviewValues({
                  ...previewValues,
                  [field.id]: val,
                  // Reset state and city when country changes
                  ...(stateField ? { [stateField.id]: '' } : {}),
                  ...(cityField ? { [cityField.id]: '' } : {})
                });
              }}
            >
              <SelectTrigger id={field.id} className="w-full">
                <SelectValue placeholder={field.placeholder || 'Select a country'} />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    <span className="flex items-center gap-2">
                      <Icons.Flag className="w-4 h-4" />
                      {country.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'state':
        // Find the country field
        const countryField = previewForm?.fields?.find((f: any) => f.type === 'country');
        const selectedCountry = countryField ? previewValues[countryField.id] : null;
        const stateOptions = selectedCountry ? states[selectedCountry as keyof typeof states] || [] : [];

        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'State'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => {
                // Find city field to reset it
                const cityField = previewForm?.fields?.find((f: any) => f.type === 'city');

                setPreviewValues({
                  ...previewValues,
                  [field.id]: val,
                  // Reset city when state changes
                  ...(cityField ? { [cityField.id]: '' } : {})
                });
              }}
              disabled={!selectedCountry}
            >
              <SelectTrigger id={field.id} className="w-full">
                <SelectValue placeholder={
                  !selectedCountry
                    ? 'Select a country first'
                    : (field.placeholder || 'Select a state')
                } />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((state) => (
                  <SelectItem key={state} value={state}>
                    <span className="flex items-center gap-2">
                      <Icons.MapPin className="w-4 h-4" />
                      {state}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'city':
        // Find the state field
        const stateField = previewForm?.fields?.find((f: any) => f.type === 'state');
        const selectedState = stateField ? previewValues[stateField.id] : null;
        const cityOptions = selectedState ? cities[selectedState as keyof typeof cities] || [] : [];

        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'City'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setPreviewValues({ ...previewValues, [field.id]: val })}
              disabled={!selectedState}
            >
              <SelectTrigger id={field.id} className="w-full">
                <SelectValue placeholder={
                  !selectedState
                    ? 'Select a state first'
                    : (field.placeholder || 'Select a city')
                } />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => (
                  <SelectItem key={city} value={city}>
                    <span className="flex items-center gap-2">
                      <Icons.Building className="w-4 h-4" />
                      {city}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Untitled Field'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder || `Enter ${field.label || field.type}`}
              value={value}
              onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
              className="w-full"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Text Area'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder || 'Enter your text here...'}
              value={value}
              onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
              className="w-full min-h-[100px]"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Select Option'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setPreviewValues({ ...previewValues, [field.id]: val })}
            >
              <SelectTrigger id={field.id} className="w-full">
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt: string, i: number) => (
                  <SelectItem key={i} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label || 'Radio Options'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => setPreviewValues({ ...previewValues, [field.id]: val })}
              className="space-y-2"
            >
              {field.options?.map((opt: string, i: number) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${field.id}-${i}`} />
                  <Label htmlFor={`${field.id}-${i}`} className="text-sm font-normal cursor-pointer">
                    {opt}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id || index} className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id={field.id}
                checked={value}
                onCheckedChange={(checked) => setPreviewValues({ ...previewValues, [field.id]: checked })}
                className="mt-0.5"
              />
              <div className="grid gap-1">
                <Label htmlFor={field.id} className="text-sm font-medium leading-none">
                  {field.label || 'Checkbox'}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.helpText && (
                  <p className="text-xs text-muted-foreground">{field.helpText}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Date'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
              className="w-full"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'time':
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || 'Time'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="time"
              value={value}
              onChange={(e) => setPreviewValues({ ...previewValues, [field.id]: e.target.value })}
              className="w-full"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'submit':
        return (
          <div key={field.id || index} className="space-y-2">
            {/* Show label if it exists and not hidden */}
            {field.label && !field.hideLabel && (
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            <Button
              id={field.id}
              type="submit"
              variant={field.buttonVariant || 'default'}
              size={field.buttonSize || 'default'}
              className={`w-full ${field.buttonClassName || ''}`}
              onClick={() => {
                alert('Form submitted! (Preview mode)');
                console.log('Form values:', previewValues);
              }}
            >
              {field.buttonIcon && (
                <span className="mr-2">
                  {field.buttonIcon === 'send' && <Icons.Send className="w-4 h-4" />}
                  {field.buttonIcon === 'save' && <Icons.Save className="w-4 h-4" />}
                  {field.buttonIcon === 'check' && <Icons.Check className="w-4 h-4" />}
                  {field.buttonIcon === 'arrow-right' && <Icons.ArrowRight className="w-4 h-4" />}
                </span>
              )}
              {field.buttonText || field.label || 'Submit'}
            </Button>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <div key={field.id || index} className="space-y-2">
            {field.label && !field.hideLabel && (
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            <Button
              id={field.id}
              type="button"
              variant={field.buttonVariant || 'default'}
              size={field.buttonSize || 'default'}
              className={`w-full ${field.buttonClassName || ''}`}
              onClick={() => {
                if (field.buttonAction === 'submit') {
                  alert('Form submitted! (Preview mode)');
                  console.log('Form values:', previewValues);
                } else if (field.buttonAction === 'reset') {
                  setPreviewValues({});
                  alert('Form reset! (Preview mode)');
                } else {
                  alert(`Button clicked: ${field.label || 'Button'}`);
                }
              }}
              disabled={field.disabled}
            >
              {field.buttonIcon && (
                <span className="mr-2">
                  {field.buttonIcon === 'save' && <Icons.Save className="w-4 h-4" />}
                  {field.buttonIcon === 'send' && <Icons.Send className="w-4 h-4" />}
                  {field.buttonIcon === 'reset' && <Icons.RotateCcw className="w-4 h-4" />}
                  {field.buttonIcon === 'download' && <Icons.Download className="w-4 h-4" />}
                  {field.buttonIcon === 'upload' && <Icons.Upload className="w-4 h-4" />}
                  {field.buttonIcon === 'plus' && <Icons.Plus className="w-4 h-4" />}
                  {field.buttonIcon === 'edit' && <Icons.Edit className="w-4 h-4" />}
                  {field.buttonIcon === 'delete' && <Icons.Trash2 className="w-4 h-4" />}
                  {field.buttonIcon === 'settings' && <Icons.Settings className="w-4 h-4" />}
                  {field.buttonIcon === 'user' && <Icons.User className="w-4 h-4" />}
                  {field.buttonIcon === 'mail' && <Icons.Mail className="w-4 h-4" />}
                  {field.buttonIcon === 'phone' && <Icons.Phone className="w-4 h-4" />}
                  {field.buttonIcon === 'link' && <Icons.Link className="w-4 h-4" />}
                </span>
              )}
              {field.buttonText || field.label || 'Button'}
            </Button>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case 'reset':
        return (
          <div key={field.id || index} className="space-y-2">
            {field.label && !field.hideLabel && (
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            <Button
              id={field.id}
              type="button"
              variant={field.buttonVariant || 'outline'}
              size={field.buttonSize || 'default'}
              className={`w-full ${field.buttonClassName || ''}`}
              onClick={() => {
                setPreviewValues({});
                alert('Form reset! (Preview mode)');
              }}
            >
              {field.buttonIcon && (
                <span className="mr-2">
                  {field.buttonIcon === 'reset' && <Icons.RotateCcw className="w-4 h-4" />}
                  {field.buttonIcon === 'clear' && <Icons.X className="w-4 h-4" />}
                  {field.buttonIcon === 'refresh' && <Icons.RefreshCw className="w-4 h-4" />}
                </span>
              )}
              {field.buttonText || field.label || 'Reset'}
            </Button>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id || index} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label || field.type}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder || `Enter ${field.label || field.type}`}
              className="w-full"
              disabled
            />
          </div>
        );
    }
  };

  return (
    <div className="h-full p-4">
      <Card className="border-2 shadow-lg">
        <CardHeader className="py-4 border-b">
          <div className="sm:flex justify-between items-center">
            <CardTitle>
              <h3>Form Builder</h3>
            </CardTitle>

            <Button
              size="sm"
              onClick={() => {
                createNewForm();
                router.push("/forms/add-edit");
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add Form
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 min-h-screen">
          {savedForms.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-16 text-center bg-slate-50">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <Icons.FileQuestion className="w-8 h-8 text-primary/30" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No forms yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first form to get started
              </p>
              <Button onClick={() => {
                createNewForm();
                router.push("/forms/add-edit");
              }}>
                <Icons.Plus className="w-4 h-4 mr-2" /> Create Form
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForms.map((form: any) => (
                <div
                  key={form.id}
                  className="group relative bg-white rounded-xl border hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Form Preview Thumbnail */}
                  <div
                    className="h-24 bg-linear-to-br from-slate-50 to-white p-3 border-b cursor-pointer relative"
                    onClick={() => {
                      setPreviewForm(form);
                      setPreviewValues({});
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Badge variant="secondary" className="gap-1.5 shadow-lg">
                        <Icons.Eye className="w-3 h-3" /> Click to Preview
                      </Badge>
                    </div>

                    {/* Mini Form Preview */}
                  <div className="space-y-1">
                        {form.fields?.slice(0, 3).map((field: any, i: number) => {
                          const Icon = getFieldIcon(field.type);
                          return (
                            <div key={i} className="flex items-center gap-1.5 text-[9px]">
                              <Icon className="w-2.5 h-2.5 text-primary" />
                              <span className="truncate flex-1">{field.label || field.type}</span>
                              <div className="w-12 h-2 bg-slate-200 rounded-full" />
                            </div>
                          );
                        })}
                        {form.fields?.length > 3 && (
                          <div className="text-[8px] text-muted-foreground pl-4">
                            +{form.fields.length - 3} more fields
                          </div>
                        )}
                  </div>
                  </div>

                  {/* Form Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                          {form.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {form.description || "No description"}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-[10px] shrink-0">
                        v{form.version || 1}
                      </Badge>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Icons.LayoutGrid className="w-3 h-3" />
                        {form.fields.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icons.Inbox className="w-3 h-3" />
                        {form.submissions?.length || 0}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Icons.Clock className="w-3 h-3" />
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={() => {
                          loadForm(form.id);
                          setIsBuilderOpen(true);
                          router.push("/forms/add-edit");
                        }}
                      >
                        <Icons.Edit className="w-3 h-3" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowSubs(form.id)}
                        title="View Submissions"
                      >
                        <Icons.Inbox className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const blob = new Blob(
                            [JSON.stringify(form, null, 2)],
                            { type: "application/json" }
                          );
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${form.name}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        title="Download JSON"
                      >
                        <Icons.Download className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-200"
                        onClick={() => setDelForm(form.id)}
                        title="Delete"
                      >
                        <Icons.Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Form Card */}
              <div
                className="bg-white rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center p-6 min-h-[240px]"
                onClick={() => {
                  createNewForm();
                  router.push("/forms/add-edit");
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-sm mb-1">Create New Form</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Start from scratch
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog - Professional Form Design */}
      <Dialog open={!!previewForm} onOpenChange={() => {
        setPreviewForm(null);
        setPreviewValues({});
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {/* Form Header */}
          <div className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{previewForm?.name}</h2>
                {previewForm?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{previewForm.description}</p>
                )}
              </div>
              {/* <Badge variant="outline" className="px-3 py-1">
                <Icons.Eye className="w-3 h-3 mr-1" /> Preview Mode
              </Badge> */}
            </div>
          </div>

          {/* Form Body - Looks exactly like a real form */}
          <div className="px-6 py-6 overflow-y-auto mb-6 max-h-[calc(80vh-100px)]">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg border p-8">
                {/* Form Title */}
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-slate-800">{previewForm?.name}</h1>
                  {previewForm?.description && (
                    <p className="text-sm text-muted-foreground mt-2">{previewForm.description}</p>
                  )}
                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icons.LayoutGrid className="w-3 h-3" />
                      {previewForm?.fields?.length} fields
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Icons.Clock className="w-3 h-3" />
                      {previewForm && new Date(previewForm.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator className="mb-8" />

                {/* Form Fields - Professional Layout */}
                <div className="space-y-6">
                  {previewForm?.fields?.map((field: any, index: number) => renderFormField(field, index))}
                </div>

                {/* Default Submit Button if no submit button in fields
                {!previewForm?.fields?.some((f: any) => f.type === 'submit') && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-end gap-3">
                      <Button variant="outline" onClick={() => setPreviewValues({})}>
                        <Icons.RotateCcw className="w-4 h-4 mr-2" /> Reset
                      </Button>
                      <Button
                        className="min-w-[120px]"
                        onClick={() => {
                          alert('Form submitted! (Preview mode)');
                          console.log('Form values:', previewValues);
                        }}
                      >
                        <Icons.Send className="w-4 h-4 mr-2" /> Submit
                      </Button>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.Save className="w-5 h-5" /> Save as Template
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Save as Template</Label>
                <p className="text-xs text-muted-foreground">Make this reusable</p>
              </div>
              <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} />
            </div>
            <Separator />
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                This will save the current form structure as a template for future use.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveForm}>
              <Icons.Save className="w-4 h-4 mr-2" /> Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={!!showSubs} onOpenChange={() => setShowSubs(null)}>
        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.Inbox className="w-5 h-5" /> Submissions
            </DialogTitle>
          </DialogHeader>

          {subs.length === 0 ? (
            <div className="text-center py-8">
              <Icons.Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subs.map((s: any) => (
                <Card key={s.id}>
                  <CardHeader className="py-2 px-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-[10px]">
                        ID: {s.id.slice(-6)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(s.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <pre className="text-xs bg-slate-50 p-2 rounded border overflow-x-auto">
                      {JSON.stringify(s.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!delForm} onOpenChange={() => setDelForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Icons.AlertTriangle className="w-5 h-5" /> Delete Form?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the form.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDelForm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (delForm) {
                  deleteForm(delForm);
                  setDelForm(null);
                }
              }}
            >
              <Icons.Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}