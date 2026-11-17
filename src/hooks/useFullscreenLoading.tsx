/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

interface FullscreenLoadingContextValue {
  isFullscreenLoading: boolean
  setFullscreenLoading: (value: boolean) => void
}

const FullscreenLoadingContext = createContext<FullscreenLoadingContextValue>({
  isFullscreenLoading: false,
  setFullscreenLoading: () => {},
})

export function FullscreenLoadingProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isFullscreenLoading, setIsFullscreenLoading] = useState(false)

  const setFullscreenLoading = useCallback((value: boolean) => {
    setIsFullscreenLoading(value)
  }, [])

  return (
    <FullscreenLoadingContext.Provider
      value={{ isFullscreenLoading, setFullscreenLoading }}
    >
      {children}
    </FullscreenLoadingContext.Provider>
  )
}

export function useFullscreenLoading() {
  return useContext(FullscreenLoadingContext)
}
