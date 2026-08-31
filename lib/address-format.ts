export type SavedAddress = {
  id: string;
  label: string | null;
  city: string;
  addressLine: string;
  apartment: string | null;
  comment: string | null;
  isDefault: boolean;
};

export function formatSavedAddress(address: Omit<SavedAddress, "id" | "label" | "isDefault">) {
  return [
    address.city,
    address.addressLine,
    address.apartment ? `кв./офис ${address.apartment}` : "",
    address.comment ? `Комментарий: ${address.comment}` : "",
  ].filter(Boolean).join(", ");
}
