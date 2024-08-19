import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from '@/app/services/auth'

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
})

tupListeners` docs - takes an optional callback as the 2nd arg for customization// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `se
setupListeners(store.dispatch)