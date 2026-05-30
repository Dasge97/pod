<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530175752 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE notificacion (id INT AUTO_INCREMENT NOT NULL, texto VARCHAR(255) NOT NULL, tipo VARCHAR(30) NOT NULL, link VARCHAR(255) DEFAULT NULL, leida TINYINT NOT NULL, fecha DATETIME NOT NULL, usuario_id INT NOT NULL, autor_id INT DEFAULT NULL, INDEX IDX_729A19ECDB38439E (usuario_id), INDEX IDX_729A19EC14D45BBE (autor_id), INDEX idx_notif_usuario_leida (usuario_id, leida), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE notificacion ADD CONSTRAINT FK_729A19ECDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE notificacion ADD CONSTRAINT FK_729A19EC14D45BBE FOREIGN KEY (autor_id) REFERENCES usuario (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notificacion DROP FOREIGN KEY FK_729A19ECDB38439E');
        $this->addSql('ALTER TABLE notificacion DROP FOREIGN KEY FK_729A19EC14D45BBE');
        $this->addSql('DROP TABLE notificacion');
    }
}
