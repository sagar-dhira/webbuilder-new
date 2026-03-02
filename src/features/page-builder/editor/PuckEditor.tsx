/**
 * Same as framely - uses buildConfig with charts from API
 */

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { buildConfig } from "../config/puckConfig";
import { SidebarWithTabs } from "../components/SidebarWithTabs";
import { ETLActionBarOverride } from "../components/ETLActionBarOverride";
import { useSupersetCharts } from "../hooks/useSupersetCharts";

interface Props {
  onPublish: (data: any) => void;
  initialData?: any;
}

export default function PageEditor({ onPublish, initialData }: Props) {
  const { charts, baseUrl } = useSupersetCharts();
  const config = buildConfig(charts, baseUrl);

  return (
    <Puck
      config={config}
      data={initialData ?? { content: [], root: { props: {} } }}
      onPublish={(data) => {
        onPublish(data);
      }}
      overrides={{
        drawer: ({ children }) => (
          <SidebarWithTabs config={config}>
            {children}
          </SidebarWithTabs>
        ),
        actionBar: (props) => <ETLActionBarOverride {...props} />,
      }}
    />
  );
}
