import type { SheetMusic } from "@prisma/client";

// Prisma's Decimal isn't serializable across the Server -> Client
// Component boundary, so pages convert `price` to a plain number before
// passing sheet music data down to client components.
export type SerializedSheetMusic = Omit<SheetMusic, "price"> & {
  price: number;
};
