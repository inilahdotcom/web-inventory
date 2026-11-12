import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import { usePermission } from "@/hooks/usePermission"
import {
  closeSession,
  createSession,
  getSession,
  listItems,
  listSessions,
  parseApiError,
  startSession,
} from "@/services/stocktake"
import type { ListItemsParams } from "@/services/stocktake"
import type { CreateSessionBody } from "@/types/stocktake"

export const stocktakeKeys = {
  all: ["stocktake"] as const,
  lists: () => [...stocktakeKeys.all, "list"] as const,
  list: (pageSize?: number) =>
    [...stocktakeKeys.lists(), { pageSize }] as const,
  details: () => [...stocktakeKeys.all, "detail"] as const,
  detail: (id: string) => [...stocktakeKeys.details(), id] as const,
  items: (id: string, params?: Omit<ListItemsParams, "cursor">) =>
    [...stocktakeKeys.detail(id), "items", params] as const,
}

export function useStocktakePermission() {
  const { role, canManageStocktake } = usePermission()
  return {
    canManage: canManageStocktake,
    canCheck: role === "admin" || role === "staff_ga",
  }
}

export function useSessions(pageSize?: number) {
  return useQuery({
    queryKey: stocktakeKeys.list(pageSize),
    queryFn: () => listSessions(pageSize),
  })
}

export function useSessionDetail(id: string) {
  return useQuery({
    queryKey: stocktakeKeys.detail(id),
    queryFn: () => getSession(id),
    enabled: Boolean(id),
  })
}

export function useSessionItems(
  id: string,
  params: Omit<ListItemsParams, "cursor"> = {},
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: stocktakeKeys.items(id, params),
    queryFn: ({ pageParam }) =>
      listItems(id, {
        ...params,
        cursor: pageParam || undefined,
      }),
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: Boolean(id) && enabled,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateSessionBody) => createSession(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stocktakeKeys.all })
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Gagal membuat sesi stok opname"))
    },
  })
}

export function useStartSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => startSession(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stocktakeKeys.all })
      toast.success("Sesi berhasil dimulai")
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Gagal memulai sesi stok opname"))
    },
  })
}

export function useCloseSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      closeSession(id, force),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stocktakeKeys.all })
      toast.success("Sesi berhasil ditutup")
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Gagal menutup sesi stok opname"))
    },
  })
}
