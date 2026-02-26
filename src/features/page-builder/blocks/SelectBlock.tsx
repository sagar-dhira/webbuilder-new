import { useFormField } from "./FormBlock";

export const SelectBlock = {
    fields: {
        name: { type: "text" },
        options: { type: "textarea" },
        placeholder: { type: "text" },
        label: { type: "text" },
    },

    defaultProps: {
        name: "",
        options: "Option 1\nOption 2\nOption 3",
        placeholder: "Select...",
        label: "",
    },

    render: (props: any) => {
        const optionsList = (props.options || "")
            .split("\n")
            .map((o: string) => o.trim())
            .filter((o: string) => o.length > 0);

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
                <select
                    name={props.name}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontSize: "14px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                    }}
                    value={field.isInForm ? (field.value as string) ?? "" : undefined}
                    onChange={field.isInForm ? field.onChange : undefined}
                    defaultValue={field.isInForm ? undefined : ""}
                >
                    <option value="" disabled>
                        {props.placeholder}
                    </option>
                    {optionsList.map((opt: string, i: number) => (
                        <option key={i} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>
        );
    },
};
