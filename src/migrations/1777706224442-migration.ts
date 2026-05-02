import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777706224442Safe implements MigrationInterface {
  name = 'Migration1777706224442Safe'

  public async up(queryRunner: QueryRunner): Promise<void> {

    // ─── SAFE COLUMN NULLABILITY CHANGES ─────────────────

    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`qrCode\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`location\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`howDidYouHearAboutUs\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`event_visit\` MODIFY \`ipAddress\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`event_visit\` MODIFY \`userAgent\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`event\` MODIFY \`theme\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`event\` MODIFY \`banner\` varchar(255) NULL`);

    // 🚫 DO NOT TOUCH tickets or otherImages (prevents data loss)

    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`profileImage\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`resetToken\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`resetTokenExpiry\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`emailVerified\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`verifyToken\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsTiktok\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsInstagram\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsTwitter\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsFacebook\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`vote\` MODIFY \`banner\` varchar(255) NULL`);

    // 🚫 DO NOT DROP/RECREATE contestants (same risk as tickets)
    // leave as-is unless doing controlled migration

    await queryRunner.query(`ALTER TABLE \`vote_visit\` MODIFY \`ipAddress\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`vote_visit\` MODIFY \`userAgent\` varchar(255) NULL`);

    // ─── INDEXES (SAFE) ─────────────────

    await queryRunner.query(`
      CREATE INDEX \`IDX_event_title_user_id\`
      ON \`event\` (\`title\`, \`userId\`, \`id\`)
    `);

    await queryRunner.query(`
      CREATE INDEX \`IDX_vote_title_user_id\`
      ON \`vote\` (\`title\`, \`userId\`, \`id\`)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // ─── DROP INDEXES ─────────────────

    await queryRunner.query(`DROP INDEX \`IDX_vote_title_user_id\` ON \`vote\``);
    await queryRunner.query(`DROP INDEX \`IDX_event_title_user_id\` ON \`event\``);

    // ─── REVERT NULLABILITY (SAFE) ─────────────────

    await queryRunner.query(`ALTER TABLE \`vote_visit\` MODIFY \`userAgent\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`vote_visit\` MODIFY \`ipAddress\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`vote\` MODIFY \`banner\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsFacebook\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsTwitter\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsInstagram\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`socialsTiktok\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`verifyToken\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`emailVerified\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`resetTokenExpiry\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`resetToken\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`user\` MODIFY \`profileImage\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`event\` MODIFY \`banner\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`event\` MODIFY \`theme\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`event_visit\` MODIFY \`userAgent\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`event_visit\` MODIFY \`ipAddress\` varchar(255) NULL`);

    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`howDidYouHearAboutUs\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`location\` varchar(255) NULL`);
    await queryRunner.query(`ALTER TABLE \`attendees\` MODIFY \`qrCode\` varchar(255) NULL`);

    // 🚫 No touching tickets / otherImages → preserves data
  }
}
