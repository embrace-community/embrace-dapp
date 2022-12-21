import { useEffect } from "react";
import { useSigner as useSignerWagmi } from "wagmi";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSigner } from "../store/slices/core";
import { RootState } from "../store/store";

export default function useSigner() {
  const coreStore = useAppSelector((state: RootState) => state.core);
  const dispatch = useAppDispatch();
  const { data: signer, isLoading } = useSignerWagmi();

  useEffect(() => {
    if (signer && !coreStore.wagmiSigner?.signer) {
      dispatch(setSigner({ signer, isLoading }));
    }
  }, [signer, dispatch, coreStore.wagmiSigner?.signer, isLoading]);

  return { signer: coreStore.wagmiSigner?.signer, isLoading };
}
