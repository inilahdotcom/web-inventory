import type { AssetListItem } from "../../types/asset.ts"

type AssetWithFlexibleHolder = AssetListItem & {
  attributes: AssetListItem["attributes"] & {
    holderName?: string | null
    holder_name?: string | null
  }
}

export function normalizeHolderName(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID")
}

export function getAssetHolder(asset: AssetListItem): string {
  const attributes = asset.attributes as AssetWithFlexibleHolder["attributes"]
  return (
    attributes.holder ?? attributes.holderName ?? attributes.holder_name ?? ""
  )
}

export function filterAssetsByHolder(
  assets: AssetListItem[],
  holderName: string
): AssetListItem[] {
  const normalizedHolder = normalizeHolderName(holderName)
  if (!normalizedHolder) return []

  return assets.filter(
    (asset) => normalizeHolderName(getAssetHolder(asset)) === normalizedHolder
  )
}

export function getConfirmedMutationHistory<T>(
  mutationHistory: readonly T[],
  holderConfirmedAt: string | null | undefined
): T[] {
  return holderConfirmedAt ? [...mutationHistory] : []
}
