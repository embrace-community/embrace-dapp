import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client } from "@xmtp/xmtp-js";
import { Signer } from "ethers";

interface WagmiSigner {
  signer: Signer;
  isLoading: boolean;
}

export interface CoreState {
  wagmiSigner: WagmiSigner | null;
  xmtpClient: Client | null;
}

const initialState: CoreState = {
  wagmiSigner: null,
  xmtpClient: null,
};

export const coreSlice = createSlice({
  name: "core",
  initialState,
  reducers: {
    setSigner: (state, action: PayloadAction<WagmiSigner>) => {
      state.wagmiSigner = action.payload;
    },

    setXmtpClient: (state, action: PayloadAction<Client>) => {
      state.xmtpClient = action.payload;
    },
  },
});

export const { setSigner, setXmtpClient } = coreSlice.actions;

export default coreSlice.reducer;
