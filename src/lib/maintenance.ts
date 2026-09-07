import type { MaintenanceRecord } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function createMaintenanceRecord(data: {
  bonsaiId: number;
  maintenanceDate: Date;
  workType: MaintenanceRecord["workType"];
  workerName: string | null;
  memo: string | null;
}): Promise<MaintenanceRecord> {
  return prisma.maintenanceRecord.create({ data });
}
