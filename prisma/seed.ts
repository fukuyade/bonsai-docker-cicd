import { BonsaiStatus, MaintenanceWorkType } from "@prisma/client";

import { prisma } from "../src/lib/prisma";

// すべて架空のデータ。実在する盆栽・担当者・拠点名は使用しない。
async function main() {
  console.log("シード投入を開始します...");

  // 既存データを削除してから投入する(何度実行しても同じ結果になるようにするため)。
  // 先にMaintenanceRecordを消す(Bonsaiが手入れ履歴を持つ間は削除できない制約のため)。
  await prisma.maintenanceRecord.deleteMany();
  await prisma.bonsai.deleteMany();

  const bonsaiList = [
    {
      managementNumber: "No.001",
      name: "五葉松 弐号",
      species: "五葉松",
      status: BonsaiStatus.HEALTHY,
      location: "展示場A",
      acquiredAt: new Date("2022-04-01"),
      nextMaintenanceDate: new Date("2026-10-01"),
      memo: "サンプルデータ。毎年春に植え替え予定。",
    },
    {
      managementNumber: "No.002",
      name: "黒松 小品",
      species: "黒松",
      status: BonsaiStatus.NEEDS_CARE,
      location: "管理室A",
      acquiredAt: new Date("2023-06-15"),
      nextMaintenanceDate: new Date("2026-09-20"),
      memo: "葉が伸びすぎているため剪定が必要。",
    },
    {
      managementNumber: "No.003",
      name: "紅葉 中品",
      species: "イロハモミジ",
      status: BonsaiStatus.UNDER_TREATMENT,
      location: "展示場B",
      acquiredAt: new Date("2021-11-03"),
      nextMaintenanceDate: null,
      memo: "病害虫防除中。",
    },
    {
      managementNumber: "No.004",
      name: "真柏 ミニ",
      species: "シンパク",
      status: BonsaiStatus.HEALTHY,
      location: "展示場A",
      acquiredAt: new Date("2024-01-20"),
      nextMaintenanceDate: new Date("2026-11-05"),
      memo: null,
    },
    {
      managementNumber: "No.005",
      name: "梅 古木",
      species: "ウメ",
      status: BonsaiStatus.INACTIVE,
      location: "倉庫",
      acquiredAt: new Date("2019-03-10"),
      nextMaintenanceDate: null,
      memo: "現在は展示していない。",
    },
  ];

  for (const data of bonsaiList) {
    await prisma.bonsai.create({ data });
  }

  const bonsai001 = await prisma.bonsai.findUniqueOrThrow({
    where: { managementNumber: "No.001" },
  });
  const bonsai002 = await prisma.bonsai.findUniqueOrThrow({
    where: { managementNumber: "No.002" },
  });

  await prisma.maintenanceRecord.createMany({
    data: [
      {
        bonsaiId: bonsai001.id,
        maintenanceDate: new Date("2026-03-01"),
        workType: MaintenanceWorkType.REPOTTING,
        workerName: "サンプル担当者A",
        memo: "植え替え実施。用土を新調。",
      },
      {
        bonsaiId: bonsai001.id,
        maintenanceDate: new Date("2026-06-15"),
        workType: MaintenanceWorkType.WATERING,
        workerName: "サンプル担当者A",
        memo: null,
      },
      {
        bonsaiId: bonsai002.id,
        maintenanceDate: new Date("2026-05-10"),
        workType: MaintenanceWorkType.PRUNING,
        workerName: "サンプル担当者B",
        memo: "徒長枝を剪定。",
      },
    ],
  });

  console.log(
    `シード投入完了: Bonsai ${bonsaiList.length}件, MaintenanceRecord 3件`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
