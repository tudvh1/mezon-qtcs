import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1750931121638 implements MigrationInterface {
  name = 'Migration1750931121638'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_items\` (\`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`order_id\` varchar(36) NOT NULL, \`menu_dish_id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL DEFAULT '1', \`note\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(
      `CREATE TABLE \`menu_dishes\` (\`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`menu_id\` varchar(36) NOT NULL, \`dish_id\` varchar(50) NOT NULL, \`dish_name\` varchar(255) NOT NULL, \`dish_image_url\` text NOT NULL, \`dish_price\` varchar(255) NOT NULL, \`dish_discount_price\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(
      `CREATE TABLE \`menus\` (\`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`clan_id\` varchar(50) NOT NULL, \`channel_id\` varchar(50) NOT NULL, \`message_id\` varchar(50) NOT NULL, \`report_message_id\` varchar(50) NULL, \`close_confirm_message_id\` varchar(50) NULL, \`store_url\` text NOT NULL, \`store_name\` varchar(255) NOT NULL, \`store_type\` tinyint NOT NULL, \`owner_id\` varchar(50) NOT NULL, \`is_closed\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(
      `CREATE TABLE \`orders\` (\`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`deleted_at\` timestamp(6) NULL, \`id\` varchar(36) NOT NULL, \`menu_id\` varchar(36) NOT NULL, \`user_id\` varchar(50) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_75555622ae9e99dd840804d5ab0\` FOREIGN KEY (\`menu_dish_id\`) REFERENCES \`menu_dishes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`menu_dishes\` ADD CONSTRAINT \`FK_0f427202c22ed5aede5f1b3a4bc\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_3eee574adcc7aac201aa0052274\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_3eee574adcc7aac201aa0052274\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`menu_dishes\` DROP FOREIGN KEY \`FK_0f427202c22ed5aede5f1b3a4bc\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_75555622ae9e99dd840804d5ab0\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``,
    )
    await queryRunner.query(`DROP TABLE \`orders\``)
    await queryRunner.query(`DROP TABLE \`menus\``)
    await queryRunner.query(`DROP TABLE \`menu_dishes\``)
    await queryRunner.query(`DROP TABLE \`order_items\``)
  }
}
