import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1776884979172 implements MigrationInterface {
    name = 'Migration1776884979172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`event_visit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`eventId\` int NOT NULL, \`ipAddress\` varchar(255) NULL, \`userAgent\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`approved\` tinyint NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`qrCode\` \`qrCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`location\` \`location\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`howDidYouHearAboutUs\` \`howDidYouHearAboutUs\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` CHANGE \`theme\` \`theme\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` CHANGE \`banner\` \`banner\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`otherImages\``);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`otherImages\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`tickets\``);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`tickets\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`profileImage\` \`profileImage\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`emailVerified\` \`emailVerified\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`verifyToken\` \`verifyToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsTiktok\` \`socialsTiktok\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsInstagram\` \`socialsInstagram\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsTwitter\` \`socialsTwitter\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsFacebook\` \`socialsFacebook\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event_visit\` ADD CONSTRAINT \`FK_af464ceee535b6743e0b7c530c6\` FOREIGN KEY (\`eventId\`) REFERENCES \`event\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`event_visit\` DROP FOREIGN KEY \`FK_af464ceee535b6743e0b7c530c6\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsFacebook\` \`socialsFacebook\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsTwitter\` \`socialsTwitter\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsInstagram\` \`socialsInstagram\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`socialsTiktok\` \`socialsTiktok\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`verifyToken\` \`verifyToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`emailVerified\` \`emailVerified\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetTokenExpiry\` \`resetTokenExpiry\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`resetToken\` \`resetToken\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`profileImage\` \`profileImage\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`tickets\``);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`tickets\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`otherImages\``);
        await queryRunner.query(`ALTER TABLE \`event\` ADD \`otherImages\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event\` CHANGE \`banner\` \`banner\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event\` CHANGE \`theme\` \`theme\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`howDidYouHearAboutUs\` \`howDidYouHearAboutUs\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`location\` \`location\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`qrCode\` \`qrCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event\` DROP COLUMN \`approved\``);
        await queryRunner.query(`DROP TABLE \`event_visit\``);
    }

}
