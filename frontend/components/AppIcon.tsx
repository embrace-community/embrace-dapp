import { appMappings } from "../lib/AppMappings";

export default function AppIcon({ appId }) {
  const Component = appMappings[appId]?.icon;

  if (Component === undefined) return null;

  return <Component width={24} height={24} className="m-2 ml-0" />;
}
