import { createSlice } from "@reduxjs/toolkit";
import { retrieveSettings, storeSetting } from "../../utils/settings";
import { Settings } from "../../types/settings";

export const settings = createSlice({
  name: "settings",
  initialState: retrieveSettings(),
  reducers: {
    updateSettingsState: (state, action: { payload: Partial<Settings> }) => {
      state = { ...state, ...action.payload };
      storeSetting(state);
      return state;
    },
  },
});

export const { updateSettingsState } = settings.actions;
