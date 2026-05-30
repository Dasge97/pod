<?php

namespace App\Command;

use App\Entity\Usuario;
use App\Enum\RolUsuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:init', description: 'Vacía la base de datos y crea un único usuario administrador.')]
class InitCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::OPTIONAL, 'Email del administrador', 'admin@pod.dev')
            ->addArgument('password', InputArgument::OPTIONAL, 'Contraseña del administrador', 'admin')
            ->addArgument('nombre', InputArgument::OPTIONAL, 'Nombre del administrador', 'Administrador');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Vaciar todo y reiniciar IDs.
        foreach (['App\Entity\Notificacion', 'App\Entity\Actividad', 'App\Entity\Bloqueo', 'App\Entity\Tarea', 'App\Entity\ProyectoUsuario', 'App\Entity\Proyecto', 'App\Entity\Oportunidad', 'App\Entity\Usuario'] as $clase) {
            $this->em->createQuery("DELETE FROM $clase")->execute();
        }
        $conn = $this->em->getConnection();
        foreach (['notificacion', 'actividad', 'bloqueo', 'tarea', 'proyecto_usuario', 'proyecto', 'oportunidad', 'usuario'] as $tabla) {
            $conn->executeStatement("ALTER TABLE $tabla AUTO_INCREMENT = 1");
        }

        $email = $input->getArgument('email');
        $password = $input->getArgument('password');

        $admin = new Usuario();
        $admin->setNombre($input->getArgument('nombre'))
            ->setEmail($email)
            ->setRol(RolUsuario::Admin)
            ->setColor('bg-emerald-500');
        $admin->setPassword($this->hasher->hashPassword($admin, $password));

        $this->em->persist($admin);
        $this->em->flush();

        $io->success('Base de datos vacía. Usuario administrador creado.');
        $io->writeln(sprintf('Acceso: <info>%s</info> / <info>%s</info>', $email, $password));
        $io->note('Cambia la contraseña en cuanto entres (o crea el admin con tus credenciales: php bin/console app:init "tu@email" "tu-clave" "Tu Nombre").');

        return Command::SUCCESS;
    }
}
