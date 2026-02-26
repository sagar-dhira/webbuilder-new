import { useFormField } from "./FormBlock";

export const InputBlock = {
    fields: {
        name: { type: "text" },
        inputType: {
            type: "select",
            options: [
                { label: "Text", value: "text" },
                { label: "Email", value: "email" },
                { label: "Password", value: "password" },
                { label: "Number", value: "number" },
                { label: "Tel", value: "tel" },
                { label: "URL", value: "url" },
                { label: "Date", value: "date" },
            ],
        },
        placeholder: { type: "text" },
        label: { type: "text" },
    },

    defaultProps: {
        name: "",
        inputType: "text",
        placeholder: "Enter text...",
        label: "",
    },

    render: (props: any) => {
        const field = useFormField(props.name, "");

        return (
            <div style={{ marginBottom: "16px" }}>
                {props.label && (
                    <label
                        style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#374151",
                        }}
                    >
                        {props.label}
                    </label>
                )}
                <input
                    type={props.inputType}
                    name={props.name}
                    placeholder={props.placeholder}
                    value={field.isInForm ? (field.value as string) ?? "" : undefined}
                    onChange={field.isInForm ? field.onChange : undefined}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
            </div>
        );
    },
};
