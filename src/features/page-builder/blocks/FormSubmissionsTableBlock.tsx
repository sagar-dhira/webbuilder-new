import { useFormSubmissions } from "./FormBlock";

type ColumnDefinition = {
    label: string;
    field: string;
};

const parseColumns = (raw: string): ColumnDefinition[] => {
    const lines = (raw || "").split("\n");

    return lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
            const [labelPart, fieldPart] = line.split(":");

            const label = (labelPart ?? "").trim();
            const field = (fieldPart ?? "").trim();

            return {
                label: label || field || "",
                field: field || label || "",
            };
        })
        .filter((column) => column.field.length > 0);
};

export const FormSubmissionsTableBlock = {
    fields: {
        columns: {
            type: "textarea",
            label: "Columns (Label:fieldName per line)",
        },
        emptyText: {
            type: "text",
        },
    },

    defaultProps: {
        columns: "First Name:firstName\nLast Name:lastName\nEmail:email\nRole:role\nMessage:message",
        emptyText: "No submissions yet.",
    },

    render: (props: any) => {
        const { isInForm, submissions } = useFormSubmissions();

        if (!isInForm) {
            return null;
        }

        const columns = parseColumns(props.columns);

        if (submissions.length === 0) {
            return (
                <div
                    style={{
                        marginTop: "24px",
                        fontSize: "14px",
                        color: "#6b7280",
                    }}
                >
                    {props.emptyText || "No submissions yet."}
                </div>
            );
        }

        if (columns.length === 0) {
            return null;
        }

        return (
            <div style={{ marginTop: "24px", overflowX: "auto" }}>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "14px",
                    }}
                >
                    <thead>
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        backgroundColor: "#f1f5f9",
                                        borderBottom: "2px solid #e2e8f0",
                                        fontWeight: 600,
                                        color: "#374151",
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((submission, rowIndex) => (
                            <tr key={rowIndex}>
                                {columns.map((column, columnIndex) => (
                                    <td
                                        key={columnIndex}
                                        style={{
                                            padding: "10px 16px",
                                            borderBottom: "1px solid #e2e8f0",
                                            color: "#4b5563",
                                        }}
                                    >
                                        {(submission[column.field] as any) ?? ""}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    },
};

