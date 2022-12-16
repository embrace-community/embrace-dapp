import { appMappings } from "../../lib/AppMappings";

export default function RenderCurrentApp({
  currentApp,
  query,
  space,
  membership,
}) {
  console.log("Current app:", currentApp);
  const Component = appMappings[currentApp].component;

  if (!Component) alert("App not found");
  return null;

  return <Component query={query} space={space} membership={membership} />;
}
