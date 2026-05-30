<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530173922 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE actividad ADD tarea_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE actividad ADD CONSTRAINT FK_8DF2BD066D5BDFE1 FOREIGN KEY (tarea_id) REFERENCES tarea (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_8DF2BD066D5BDFE1 ON actividad (tarea_id)');
        $this->addSql('ALTER TABLE tarea ADD fecha_finalizacion DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE actividad DROP FOREIGN KEY FK_8DF2BD066D5BDFE1');
        $this->addSql('DROP INDEX IDX_8DF2BD066D5BDFE1 ON actividad');
        $this->addSql('ALTER TABLE actividad DROP tarea_id');
        $this->addSql('ALTER TABLE tarea DROP fecha_finalizacion');
    }
}
