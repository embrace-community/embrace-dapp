import { appMappings } from "../../lib/AppMappings";

export default function RenderCurrentApp({
  currentApp,
  query,
  space,
  membership,
}) {
  console.log("Current app:", currentApp);
  const Component = appMappings[currentApp].component;

  if (!Component) {
    console.log("RENDER CURRENT APP: APP NOT FOUND");
    return null;
  }

  return <Component query={query} space={space} membership={membership} />;
}
