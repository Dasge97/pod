<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260530111437 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE actividad (id INT AUTO_INCREMENT NOT NULL, tipo VARCHAR(255) NOT NULL, texto VARCHAR(255) NOT NULL, objeto VARCHAR(255) DEFAULT NULL, fecha DATETIME NOT NULL, usuario_id INT DEFAULT NULL, proyecto_id INT DEFAULT NULL, INDEX IDX_8DF2BD06DB38439E (usuario_id), INDEX IDX_8DF2BD06F625D1BA (proyecto_id), INDEX idx_actividad_fecha (fecha), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE bloqueo (id INT AUTO_INCREMENT NOT NULL, titulo VARCHAR(180) NOT NULL, descripcion LONGTEXT DEFAULT NULL, severidad VARCHAR(255) NOT NULL, fecha_creacion DATETIME NOT NULL, resuelto TINYINT NOT NULL, fecha_resolucion DATETIME DEFAULT NULL, proyecto_id INT NOT NULL, tarea_id INT DEFAULT NULL, creado_por_id INT NOT NULL, INDEX IDX_A12F2366F625D1BA (proyecto_id), INDEX IDX_A12F23666D5BDFE1 (tarea_id), INDEX IDX_A12F2366FE35D8C4 (creado_por_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE oportunidad (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(180) NOT NULL, cliente VARCHAR(180) NOT NULL, descripcion LONGTEXT DEFAULT NULL, importe NUMERIC(12, 2) NOT NULL, fecha_envio DATE DEFAULT NULL, fecha_ultima_accion DATETIME DEFAULT NULL, estado VARCHAR(255) NOT NULL, probabilidad INT NOT NULL, fecha_creacion DATETIME NOT NULL, responsable_comercial_id INT NOT NULL, INDEX IDX_694E0BA6C61E92AE (responsable_comercial_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE proyecto (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(180) NOT NULL, cliente VARCHAR(180) NOT NULL, descripcion LONGTEXT DEFAULT NULL, estado VARCHAR(255) NOT NULL, prioridad VARCHAR(255) NOT NULL, progreso INT NOT NULL, fecha_inicio DATE DEFAULT NULL, fecha_fin_estimada DATE DEFAULT NULL, fecha_fin_real DATE DEFAULT NULL, activo TINYINT NOT NULL, fecha_creacion DATETIME NOT NULL, oportunidad_id INT DEFAULT NULL, responsable_id INT NOT NULL, INDEX IDX_6FD202B9C92451D7 (oportunidad_id), INDEX IDX_6FD202B953C59D72 (responsable_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE proyecto_usuario (id INT AUTO_INCREMENT NOT NULL, rol VARCHAR(255) NOT NULL, proyecto_id INT NOT NULL, usuario_id INT NOT NULL, INDEX IDX_4C9FD03DF625D1BA (proyecto_id), INDEX IDX_4C9FD03DDB38439E (usuario_id), UNIQUE INDEX uniq_proyecto_usuario (proyecto_id, usuario_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE tarea (id INT AUTO_INCREMENT NOT NULL, titulo VARCHAR(180) NOT NULL, descripcion LONGTEXT DEFAULT NULL, estado VARCHAR(255) NOT NULL, prioridad VARCHAR(255) NOT NULL, estimacion_horas DOUBLE PRECISION DEFAULT NULL, horas_consumidas DOUBLE PRECISION NOT NULL, fecha_creacion DATETIME NOT NULL, fecha_limite DATE DEFAULT NULL, proyecto_id INT NOT NULL, asignado_id INT DEFAULT NULL, INDEX IDX_3CA05366F625D1BA (proyecto_id), INDEX IDX_3CA05366439B996F (asignado_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE usuario (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(120) NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, avatar VARCHAR(255) DEFAULT NULL, color VARCHAR(40) NOT NULL, rol VARCHAR(255) NOT NULL, activo TINYINT NOT NULL, fecha_creacion DATETIME NOT NULL, UNIQUE INDEX UNIQ_2265B05DE7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE actividad ADD CONSTRAINT FK_8DF2BD06DB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE actividad ADD CONSTRAINT FK_8DF2BD06F625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE bloqueo ADD CONSTRAINT FK_A12F2366F625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE bloqueo ADD CONSTRAINT FK_A12F23666D5BDFE1 FOREIGN KEY (tarea_id) REFERENCES tarea (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE bloqueo ADD CONSTRAINT FK_A12F2366FE35D8C4 FOREIGN KEY (creado_por_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE oportunidad ADD CONSTRAINT FK_694E0BA6C61E92AE FOREIGN KEY (responsable_comercial_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE proyecto ADD CONSTRAINT FK_6FD202B9C92451D7 FOREIGN KEY (oportunidad_id) REFERENCES oportunidad (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE proyecto ADD CONSTRAINT FK_6FD202B953C59D72 FOREIGN KEY (responsable_id) REFERENCES usuario (id)');
        $this->addSql('ALTER TABLE proyecto_usuario ADD CONSTRAINT FK_4C9FD03DF625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE proyecto_usuario ADD CONSTRAINT FK_4C9FD03DDB38439E FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tarea ADD CONSTRAINT FK_3CA05366F625D1BA FOREIGN KEY (proyecto_id) REFERENCES proyecto (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE tarea ADD CONSTRAINT FK_3CA05366439B996F FOREIGN KEY (asignado_id) REFERENCES usuario (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE actividad DROP FOREIGN KEY FK_8DF2BD06DB38439E');
        $this->addSql('ALTER TABLE actividad DROP FOREIGN KEY FK_8DF2BD06F625D1BA');
        $this->addSql('ALTER TABLE bloqueo DROP FOREIGN KEY FK_A12F2366F625D1BA');
        $this->addSql('ALTER TABLE bloqueo DROP FOREIGN KEY FK_A12F23666D5BDFE1');
        $this->addSql('ALTER TABLE bloqueo DROP FOREIGN KEY FK_A12F2366FE35D8C4');
        $this->addSql('ALTER TABLE oportunidad DROP FOREIGN KEY FK_694E0BA6C61E92AE');
        $this->addSql('ALTER TABLE proyecto DROP FOREIGN KEY FK_6FD202B9C92451D7');
        $this->addSql('ALTER TABLE proyecto DROP FOREIGN KEY FK_6FD202B953C59D72');
        $this->addSql('ALTER TABLE proyecto_usuario DROP FOREIGN KEY FK_4C9FD03DF625D1BA');
        $this->addSql('ALTER TABLE proyecto_usuario DROP FOREIGN KEY FK_4C9FD03DDB38439E');
        $this->addSql('ALTER TABLE tarea DROP FOREIGN KEY FK_3CA05366F625D1BA');
        $this->addSql('ALTER TABLE tarea DROP FOREIGN KEY FK_3CA05366439B996F');
        $this->addSql('DROP TABLE actividad');
        $this->addSql('DROP TABLE bloqueo');
        $this->addSql('DROP TABLE oportunidad');
        $this->addSql('DROP TABLE proyecto');
        $this->addSql('DROP TABLE proyecto_usuario');
        $this->addSql('DROP TABLE tarea');
        $this->addSql('DROP TABLE usuario');
    }
}
