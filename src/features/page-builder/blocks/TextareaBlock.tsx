import { useFormField } from "./FormBlock";

export const TextareaBlock = {
    fields: {
        name: { type: "text" },
        placeholder: { type: "text" },
        label: { type: "text" },
        rows: {
            type: "number",
            min: 2,
            max: 20,
        },
    },

    defaultProps: {
        name: "",
        placeholder: "Enter your message...",
        label: "",
        rows: 4,
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
                <textarea
                    name={props.name}
                    placeholder={props.placeholder}
                    rows={props.rows}
                    value={field.isInForm ? (field.value as string) ?? "" : undefined}
                    onChange={field.isInForm ? field.onChange : undefined}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                    }}
                />
            </div>
        );
    },
};
