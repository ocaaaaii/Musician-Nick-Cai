"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  validateServicePackageInput,
  type ServicePackageInput,
} from "@/lib/validation/service-package";

export type ActionResult =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; message?: string };

function revalidateServiceRoutes() {
  revalidatePath("/[locale]", "layout");
}

export async function createServicePackage(
  input: ServicePackageInput
): Promise<ActionResult> {
  const fieldErrors = validateServicePackageInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.servicePackage.create({
      data: {
        type: input.type,
        title: input.title.trim(),
        priceInfo: input.priceInfo.trim(),
        description: input.description.trim(),
        sortOrder: input.sortOrder,
      },
    });
    revalidateServiceRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function updateServicePackage(
  id: string,
  input: ServicePackageInput
): Promise<ActionResult> {
  const fieldErrors = validateServicePackageInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    await prisma.servicePackage.update({
      where: { id },
      data: {
        type: input.type,
        title: input.title.trim(),
        priceInfo: input.priceInfo.trim(),
        description: input.description.trim(),
        sortOrder: input.sortOrder,
      },
    });
    revalidateServiceRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function deleteServicePackage(id: string): Promise<ActionResult> {
  try {
    await prisma.servicePackage.delete({ where: { id } });
    revalidateServiceRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}

export async function toggleServicePackagePublished(
  id: string,
  isPublished: boolean
): Promise<ActionResult> {
  try {
    await prisma.servicePackage.update({
      where: { id },
      data: { isPublished },
    });
    revalidateServiceRoutes();
    return { ok: true };
  } catch {
    return { ok: false, message: "server_error" };
  }
}
