/**
 * Renders page - extracts chart refs from saved data for config
 */

import { Render } from "@puckeditor/core";
import { buildConfig } from "../config/puckConfig";

interface Props {
  data: any;
}

export default function PageRenderer({ data }: Props) {
  const config = buildConfig([], "", data);
  const normalizedData = {
    content: data?.content ?? [],
    root: data?.root ?? { props: {} },
    zones: data?.zones ?? {},
  };
  return <Render config={config} data={normalizedData} />;
}
