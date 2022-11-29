import { appMappings } from "../../lib/AppMappings";

export default function RenderCurrentApp({ currentApp, query, space }) {
  const Component = appMappings[currentApp].component;

  return <Component query={query} space={space} />;
}
