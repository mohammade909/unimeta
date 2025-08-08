// store/index.js - Updated version for your existing store
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import walletReducer from "./slices/walletSlice";
import investmentPlanReducer from "./slices/investmentPlansSlice";
import investmentReducer from "./slices/investmentSlice";
import systemSettingsApi from "../services/api/setting";
import transactionReducer from "./slices/transactions";
import treeReducer from "./slices/treeSlice";
import rewardsReducer from './slices/rewardSlice'
import userRewardReducer from './slices/userRewardSlice'
import withdrawalsReducer from './slices/withdrwal'
import accountReducer from './slices/accountSlice'
import bannerReducer from './slices/bannerSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  wallet: walletReducer,
  investmentPlans: investmentPlanReducer,
  investments: investmentReducer,
  transactions: transactionReducer,
  tree: treeReducer,
  rewards:rewardsReducer,
  userRewards:userRewardReducer,
  withdrawals:withdrawalsReducer,
  accounts:accountReducer,
  banners: bannerReducer,
  [systemSettingsApi.reducerPath]: systemSettingsApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/PAUSE',
          'persist/FLUSH',
        ],
      },
    }).concat(systemSettingsApi.middleware), // Add this line
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export const persistor = persistStore(store);