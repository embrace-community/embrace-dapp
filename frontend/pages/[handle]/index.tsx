import { useRouter } from "next/router";
import { useEffect } from "react";
import AppLayout from "../../components/AppLayout";
import Spinner from "../../components/Spinner";

export default function SpaceIndexPage() {
  const { isReady, push, query, route } = useRouter();

  useEffect(() => {
    const handle = query.handle;
    const newRoute = `/${handle}/home`;

    if (isReady && route !== newRoute) {
      push(newRoute);
    }
  }, [isReady, push, query.handle, route]);

  return (
    <AppLayout title="Community Page">
      <div className="w-full justify-center p-10">
        <Spinner />
      </div>
    </AppLayout>
  );
}
