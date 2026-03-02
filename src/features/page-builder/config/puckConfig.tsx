import type { ReactNode } from "react";
import type { Config } from "@puckeditor/core";

// Layout blocks
import { SectionBlock } from "../blocks/SectionBlock";
import { ContainerBlock } from "../blocks/ContainerBlock";
import { TwoColumnBlock } from "../blocks/TwoColumnBlock";
import { ThreeColumnBlock } from "../blocks/ThreeColumnBlock";
import { TwoRowBlock } from "../blocks/TwoRowBlock";
import { ThreeRowBlock } from "../blocks/ThreeRowBlock";
import { Header2ColBlock } from "../blocks/Header2ColBlock";
import { TwoColFooterBlock } from "../blocks/TwoColFooterBlock";
import { Sidebar2RowBlock } from "../blocks/Sidebar2RowBlock";
import { Grid2x2Block } from "../blocks/Grid2x2Block";
import { Layout1Block } from "../blocks/Layout1Block";
import { Layout2Block } from "../blocks/Layout2Block";
import { Layout3Block } from "../blocks/Layout3Block";
import { Layout4Block } from "../blocks/Layout4Block";
import { Layout5Block } from "../blocks/Layout5Block";
import { Layout6Block } from "../blocks/Layout6Block";
import { Layout7Block } from "../blocks/Layout7Block";
import { Layout8Block } from "../blocks/Layout8Block";

// Text blocks
import { Heading1Block } from "../blocks/Heading1Block";
import { Heading2Block } from "../blocks/Heading2Block";
import { Heading3Block } from "../blocks/Heading3Block";
import { Heading4Block } from "../blocks/Heading4Block";
import { Heading5Block } from "../blocks/Heading5Block";
import { Heading6Block } from "../blocks/Heading6Block";
import { ParagraphBlock } from "../blocks/ParagraphBlock";
import { SpanBlock } from "../blocks/SpanBlock";

// Basic blocks
import { ButtonBlock } from "../blocks/ButtonBlock";
import { ImageBlock } from "../blocks/ImageBlock";

// Media blocks
import { VideoBlock } from "../blocks/VideoBlock";
import { AudioBlock } from "../blocks/AudioBlock";
import { MarqueeBlock } from "../blocks/MarqueeBlock";
import { IconBlock } from "../blocks/IconBlock";
import { EmbedBlock } from "../blocks/EmbedBlock";

// Link blocks
import { LinkBlock } from "../blocks/LinkBlock";

// Form blocks
import { FormBlock } from "../blocks/FormBlock";
import { InputBlock } from "../blocks/InputBlock";
import { TextareaBlock } from "../blocks/TextareaBlock";
import { SelectBlock } from "../blocks/SelectBlock";
import { CheckboxBlock } from "../blocks/CheckboxBlock";
import { RadioBlock } from "../blocks/RadioBlock";
import { SubmitButtonBlock } from "../blocks/SubmitButtonBlock";
import { FormSubmissionsTableBlock } from "../blocks/FormSubmissionsTableBlock";

// Content blocks
import { OrderedListBlock } from "../blocks/OrderedListBlock";
import { UnorderedListBlock } from "../blocks/UnorderedListBlock";
import { ListItemBlock } from "../blocks/ListItemBlock";
import { BlockquoteBlock } from "../blocks/BlockquoteBlock";
import { CodeBlock } from "../blocks/CodeBlock";
import { DividerBlock } from "../blocks/DividerBlock";
import { BadgeBlock } from "../blocks/BadgeBlock";
import { SpacerBlock } from "../blocks/SpacerBlock";
import { TableBlock } from "../blocks/TableBlock";
import { AccordionBlock } from "../blocks/AccordionBlock";
import { TabsBlock } from "../blocks/TabsBlock";
import { CardBlock } from "../blocks/CardBlock";

// Chart blocks
import { BarChartBlock } from "../blocks/BarChartBlock";
import { DoughnutChartBlock } from "../blocks/DoughnutChartBlock";
import { AreaChartBlock } from "../blocks/AreaChartBlock";
import { createSupersetChartBlock } from "../blocks/SupersetChartBlock";
import { ETLBlockConfig } from "../blocks/ETLBlock";
import type { SupersetChart } from "../api/superset.api";

const baseComponents = {
    // Layout
    Section: SectionBlock,
    Container: ContainerBlock,
    TwoColumn: TwoColumnBlock,
    ThreeColumn: ThreeColumnBlock,
    TwoRow: TwoRowBlock,
    ThreeRow: ThreeRowBlock,
    Header2Col: Header2ColBlock,
    TwoColFooter: TwoColFooterBlock,
    Sidebar2Row: Sidebar2RowBlock,
    Grid2x2: Grid2x2Block,
    Layout1: Layout1Block,
    Layout2: Layout2Block,
    Layout3: Layout3Block,
    Layout4: Layout4Block,
    Layout5: Layout5Block,
    Layout6: Layout6Block,
    Layout7: Layout7Block,
    Layout8: Layout8Block,

    // Text
    Heading1: Heading1Block,
    Heading2: Heading2Block,
    Heading3: Heading3Block,
    Heading4: Heading4Block,
    Heading5: Heading5Block,
    Heading6: Heading6Block,
    Paragraph: ParagraphBlock,
    Span: SpanBlock,

    // Basic
    Button: ButtonBlock,
    Image: ImageBlock,

    // Media
    Video: VideoBlock,
    Audio: AudioBlock,
    Marquee: MarqueeBlock,
    Icon: IconBlock,
    Embed: EmbedBlock,

    // Link
    Link: LinkBlock,

    // Form
    Form: FormBlock,
    Input: InputBlock,
    Textarea: TextareaBlock,
    Select: SelectBlock,
    Checkbox: CheckboxBlock,
    Radio: RadioBlock,
    SubmitButton: SubmitButtonBlock,
    FormSubmissionsTable: FormSubmissionsTableBlock,

    // Content
    OrderedList: OrderedListBlock,
    UnorderedList: UnorderedListBlock,
    ListItem: ListItemBlock,
    Blockquote: BlockquoteBlock,
    Code: CodeBlock,
    Divider: DividerBlock,
    Badge: BadgeBlock,
    Spacer: SpacerBlock,
    Table: TableBlock,
    Accordion: AccordionBlock,
    Tabs: TabsBlock,
    Card: CardBlock,

    // Charts
    BarChart: BarChartBlock,
    DoughnutChart: DoughnutChartBlock,
    AreaChart: AreaChartBlock,

    // ETL
    ETL: ETLBlockConfig,
};

/** Walk all slot arrays in props (children, sidebar, main, left, right, etc.) */
function walkSlotArrays(items: any[], fn: (item: any) => void) {
  if (!Array.isArray(items)) return;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    fn(item);
    const props = item?.props;
    if (props && typeof props === "object") {
      for (const v of Object.values(props)) {
        if (Array.isArray(v) && v.some((x) => x && typeof x === "object" && "type" in x)) {
          walkSlotArrays(v, fn);
        }
      }
    }
  }
}

/** Extract baseUrl from first Superset chart in saved data */
function extractBaseUrlFromData(data: any): string {
  let result = "";
  walkSlotArrays(data?.content ?? [], (item) => {
    if (!result && item?.type?.startsWith?.("SupersetChart_") && item?.props?.baseUrl) {
      result = item.props.baseUrl;
    }
  });
  return result;
}

/** Extract Superset chart refs from saved data for rendering */
function extractSupersetChartRefs(data: any): Array<{ id: number; slice_name: string }> {
  const refs: Array<{ id: number; slice_name: string }> = [];
  walkSlotArrays(data?.content ?? [], (item) => {
    if (item?.type?.startsWith?.("SupersetChart_")) {
      const id = parseInt(item.type.replace("SupersetChart_", ""), 10);
      if (!isNaN(id) && item.props) {
        refs.push({ id, slice_name: item.props.chartTitle || `Chart ${id}` });
      }
    }
  });
  return refs;
}

/** Chart and ETL components that can be placed inside containers/layouts */
const CHART_COMPONENTS = ["BarChart", "DoughnutChart", "AreaChart"];
const ETL_COMPONENTS = ["ETL"];

/** Patch component to allow chart components in slot zones */
function patchSlotAllows(comp: any, extraAllow: string[]): any {
  if (!comp?.fields) return comp;
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(comp.fields)) {
    const f = v as { type?: string; allow?: string[] };
    if (f?.type === "slot" && Array.isArray(f.allow)) {
      fields[k] = { ...f, allow: [...new Set([...f.allow, ...extraAllow])] };
    } else {
      fields[k] = v;
    }
  }
  return Object.keys(fields).length ? { ...comp, fields: { ...comp.fields, ...fields } } : comp;
}

/** Build full config - from API charts or from saved data for rendering */
export function buildConfig(charts: SupersetChart[] = [], baseUrl: string = "", savedData?: any): Config {
  let supersetRefs = charts.map((c) => ({ id: c.id, slice_name: c.slice_name }));
  if (supersetRefs.length === 0 && savedData) {
    supersetRefs = extractSupersetChartRefs(savedData);
    baseUrl = baseUrl || extractBaseUrlFromData(savedData) || "";
  }
  const supersetBlocks = Object.fromEntries(
    supersetRefs.map((r) => [
      `SupersetChart_${r.id}`,
      createSupersetChartBlock(r.id, r.slice_name, baseUrl || ""),
    ])
  );
  const supersetNames = supersetRefs.map((r) => `SupersetChart_${r.id}`);
  const allChartNames = [...CHART_COMPONENTS, ...ETL_COMPONENTS, ...supersetNames];
  const patchedBase = Object.fromEntries(
    Object.entries(baseComponents).map(([k, v]) => [k, patchSlotAllows(v, allChartNames)])
  );
  return {
    components: {
      ...patchedBase,
      ...supersetBlocks,
    } as Config["components"],
    root: {
      render: ({ children }: { children: ReactNode }) => <>{children}</>,
    },
    categories: {
    Layout: {
      components: [
        "Section", "Container", "TwoColumn", "ThreeColumn",
        "TwoRow", "ThreeRow", "Header2Col", "TwoColFooter",
        "Sidebar2Row", "Grid2x2",
        "Layout1", "Layout2", "Layout3", "Layout4",
        "Layout5", "Layout6", "Layout7", "Layout8",
      ],
    },
    Text: {
      components: ["Heading1", "Heading2", "Heading3", "Heading4", "Heading5", "Heading6", "Paragraph", "Span"],
    },
    Basic: {
      components: ["Button", "Image"],
    },
    Media: {
      components: ["Video", "Audio", "Marquee", "Icon", "Embed"],
    },
    Link: {
      components: ["Link"],
    },
    Form: {
      components: ["Form", "Input", "Textarea", "Select", "Checkbox", "Radio", "SubmitButton", "FormSubmissionsTable"],
    },
    Content: {
      components: ["OrderedList", "UnorderedList", "ListItem", "Blockquote", "Code", "Divider", "Badge", "Spacer", "Table", "Accordion", "Tabs", "Card"],
    },
    Charts: {
      components: ["BarChart", "DoughnutChart", "AreaChart"],
    },
    ETL: {
      title: "ETL",
      components: ["ETL"],
      visible: false,
    },
    SupersetCharts: {
      title: "Superset Charts",
      components: supersetRefs.map((c) => `SupersetChart_${c.id}`),
      visible: false,
    },
  },
  };
}
