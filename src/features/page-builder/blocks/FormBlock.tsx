import { createContext, useContext, useMemo, useState, type FormEvent } from "react";

type FormValues = Record<string, unknown>;

type FormContextValue = {
    values: FormValues;
    submissions: FormValues[];
    updateValue: (name: string, value: unknown) => void;
    addSubmission: (values: FormValues) => void;
};

const FormContext = createContext<FormContextValue | null>(null);

export const useFormField = (
    name?: string,
    initialValue: unknown = ""
): {
    isInForm: boolean;
    value: unknown;
    onChange?: (event: any) => void;
} => {
    const ctx = useContext(FormContext);

    if (!ctx || !name) {
        return {
            isInForm: false,
            value: initialValue,
        };
    }

    const value = ctx.values[name] ?? initialValue;

    const handleChange = (event: any) => {
        const nextValue =
            event && event.target
                ? event.target.type === "checkbox"
                    ? event.target.checked
                    : event.target.value
                : event;

        ctx.updateValue(name, nextValue);
    };

    return {
        isInForm: true,
        value,
        onChange: handleChange,
    };
};

export const useFormSubmissions = (): {
    isInForm: boolean;
    submissions: FormValues[];
} => {
    const ctx = useContext(FormContext);

    if (!ctx) {
        return {
            isInForm: false,
            submissions: [],
        };
    }

    return {
        isInForm: true,
        submissions: ctx.submissions,
    };
};

export const FormBlock = {
    fields: {
        backgroundColor: { type: "text" },
        padding: { type: "text" },
        children: {
            type: "slot",
            allow: ["Input", "Textarea", "Select", "Checkbox", "Radio", "SubmitButton", "FormSubmissionsTable", "Heading1", "Heading2", "Heading3", "Heading4", "Heading5", "Heading6", "Paragraph", "Span", "Spacer", "Divider"],
        },
    },

    defaultProps: {
        backgroundColor: "#ffffff",
        padding: "24px",
    },

    render: (props: any) => {
        const { backgroundColor, padding, children: Children } = props;

        const [values, setValues] = useState<FormValues>({});
        const [submissions, setSubmissions] = useState<FormValues[]>([]);

        const contextValue = useMemo(
            () => ({
                values,
                submissions,
                updateValue: (name: string, value: unknown) => {
                    setValues((prev) => ({
                        ...prev,
                        [name]: value,
                    }));
                },
                addSubmission: (nextValues: FormValues) => {
                    setSubmissions((prev) => [...prev, nextValues]);
                },
            }),
            [values, submissions]
        );

        const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (Object.keys(values).length === 0) {
                return;
            }

            setSubmissions((prev) => [...prev, values]);
            setValues({});
        };

        return (
            <FormContext.Provider value={contextValue}>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        backgroundColor,
                        padding,
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <Children />
                </form>
            </FormContext.Provider>
        );
    },
};
