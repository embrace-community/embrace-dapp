import { useRouter } from "next/router";
import { useEffect } from "react";
import AppLayout from "../../components/AppLayout";
import Spinner from "../../components/Spinner";

export default function SpaceIndexPage() {
  const { isReady, push, query } = useRouter();

  useEffect(() => {
    if (isReady) {
      const handle = query.handle;
      push(`/${handle}/home`);
    }
  }, [isReady]);

  return (
    <AppLayout>
      <div className="p-10">
        <Spinner />
      </div>
    </AppLayout>
  );
}
