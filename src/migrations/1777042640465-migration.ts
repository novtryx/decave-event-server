import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777042640465 implements MigrationInterface {
    name = 'Migration1777042640465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`vote\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`edition\` varchar(255) NOT NULL, \`voteStart\` datetime NOT NULL, \`voteEnd\` datetime NOT NULL, \`pricing\` enum ('free', 'paid') NOT NULL DEFAULT 'free', \`pricePerVote\` int NOT NULL, \`showLiveCount\` tinyint NULL DEFAULT 0, \`publicLeaderboard\` tinyint NULL DEFAULT 0, \`oneVotePerDevice\` tinyint NOT NULL DEFAULT 0, \`banner\` varchar(255) NULL, \`contestants\` json NULL, \`organizerPays\` tinyint NOT NULL DEFAULT 0, \`userId\` int NOT NULL, \`approved\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vote_visit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`voteId\` varchar(255) NOT NULL, \`ipAddress\` varchar(255) NULL, \`userAgent\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`qrCode\` \`qrCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`location\` \`location\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`howDidYouHearAboutUs\` \`howDidYouHearAboutUs\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event_visit\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`event_visit\` CHANGE \`userAgent\` \`userAgent\` varchar(255) NULL`);
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
        await queryRunner.query(`ALTER TABLE \`vote\` ADD CONSTRAINT \`FK_f5de237a438d298031d11a57c3b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vote_visit\` ADD CONSTRAINT \`FK_f0b22c5100903c19d17cff5f199\` FOREIGN KEY (\`voteId\`) REFERENCES \`vote\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`vote_visit\` DROP FOREIGN KEY \`FK_f0b22c5100903c19d17cff5f199\``);
        await queryRunner.query(`ALTER TABLE \`vote\` DROP FOREIGN KEY \`FK_f5de237a438d298031d11a57c3b\``);
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
        await queryRunner.query(`ALTER TABLE \`event_visit\` CHANGE \`userAgent\` \`userAgent\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`event_visit\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`howDidYouHearAboutUs\` \`howDidYouHearAboutUs\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`location\` \`location\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`attendees\` CHANGE \`qrCode\` \`qrCode\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`vote_visit\``);
        await queryRunner.query(`DROP TABLE \`vote\``);
    }

}
