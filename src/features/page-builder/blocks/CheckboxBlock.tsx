import { useFormField } from "./FormBlock";

export const CheckboxBlock = {
    fields: {
        name: { type: "text" },
        innerText: { type: "text" },
        checked: {
            type: "select",
            options: [
                { label: "Unchecked", value: "false" },
                { label: "Checked", value: "true" },
            ],
        },
    },

    defaultProps: {
        name: "",
        innerText: "Checkbox",
        checked: "false",
    },

    render: (props: any) => {
        const field = useFormField(props.name, props.checked === "true");

        return (
            <label
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    marginBottom: "8px",
                }}
            >
                <input
                    type="checkbox"
                    name={props.name}
                    checked={
                        field.isInForm
                            ? Boolean(field.value)
                            : props.checked === "true"
                    }
                    onChange={field.isInForm ? field.onChange : undefined}
                    style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#2563eb",
                    }}
                />
                {props.innerText}
            </label>
        );
    },
};
