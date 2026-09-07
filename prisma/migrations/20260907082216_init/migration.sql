-- CreateTable
CREATE TABLE `bonsai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `managementNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `species` VARCHAR(191) NOT NULL,
    `status` ENUM('HEALTHY', 'NEEDS_CARE', 'UNDER_TREATMENT', 'INACTIVE') NOT NULL DEFAULT 'HEALTHY',
    `location` VARCHAR(191) NULL,
    `acquiredAt` DATETIME(3) NULL,
    `nextMaintenanceDate` DATETIME(3) NULL,
    `memo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bonsai_managementNumber_key`(`managementNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bonsaiId` INTEGER NOT NULL,
    `maintenanceDate` DATETIME(3) NOT NULL,
    `workType` ENUM('WATERING', 'PRUNING', 'REPOTTING', 'FERTILIZING', 'PEST_CONTROL', 'OTHER') NOT NULL,
    `workerName` VARCHAR(191) NULL,
    `memo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `maintenance_record_bonsaiId_maintenanceDate_idx`(`bonsaiId`, `maintenanceDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `maintenance_record` ADD CONSTRAINT `maintenance_record_bonsaiId_fkey` FOREIGN KEY (`bonsaiId`) REFERENCES `bonsai`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
