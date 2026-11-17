import { useEffect } from "react"
import { useFullscreenLoading } from "./useFullscreenLoading"

/**
 * Hook untuk menyembunyikan sidebar selama halaman sedang loading.
 * Panggil di halaman manapun: usePageLoading(isLoading)
 */
export function usePageLoading(isLoading: boolean) {
  const { setFullscreenLoading } = useFullscreenLoading()

  useEffect(() => {
    setFullscreenLoading(isLoading)
    return () => setFullscreenLoading(false)
  }, [isLoading, setFullscreenLoading])
}
