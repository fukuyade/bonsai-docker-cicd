-- CreateTable
CREATE TABLE `bonsai_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bonsaiId` INTEGER NOT NULL,
    `angle` ENUM('FRONT', 'RIGHT', 'LEFT', 'BACK') NOT NULL,
    `imagePath` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bonsai_image_bonsaiId_angle_key`(`bonsaiId`, `angle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bonsai_image` ADD CONSTRAINT `bonsai_image_bonsaiId_fkey` FOREIGN KEY (`bonsaiId`) REFERENCES `bonsai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
