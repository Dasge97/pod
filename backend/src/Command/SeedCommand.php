<?php

namespace App\Command;

use App\Entity\Actividad;
use App\Entity\Bloqueo;
use App\Entity\Oportunidad;
use App\Entity\Proyecto;
use App\Entity\ProyectoUsuario;
use App\Entity\Tarea;
use App\Entity\Usuario;
use App\Enum\EstadoOportunidad;
use App\Enum\EstadoProyecto;
use App\Enum\EstadoTarea;
use App\Enum\Prioridad;
use App\Enum\RolProyecto;
use App\Enum\RolUsuario;
use App\Enum\TipoActividad;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(name: 'app:seed', description: 'Carga datos de demostración realistas en la base de datos.')]
class SeedCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $now = new \DateTimeImmutable();

        // Limpieza (orden por dependencias) + reinicio de IDs para que sean predecibles (1..N).
        $conn = $this->em->getConnection();
        foreach (['App\Entity\Notificacion', 'App\Entity\Actividad', 'App\Entity\Bloqueo', 'App\Entity\Tarea', 'App\Entity\ProyectoUsuario', 'App\Entity\Proyecto', 'App\Entity\Oportunidad', 'App\Entity\Usuario'] as $clase) {
            $this->em->createQuery("DELETE FROM $clase")->execute();
        }
        foreach (['notificacion', 'actividad', 'bloqueo', 'tarea', 'proyecto_usuario', 'proyecto', 'oportunidad', 'usuario'] as $tabla) {
            $conn->executeStatement("ALTER TABLE $tabla AUTO_INCREMENT = 1");
        }

        // ---- Usuarios ----
        $defUsers = [
            ['u1', 'Marta Ruiz', 'marta@pod.dev', RolUsuario::DeptManager, 'bg-emerald-500'],
            ['u2', 'Javier Alonso', 'javier@pod.dev', RolUsuario::ProjectManager, 'bg-blue-500'],
            ['u3', 'Lucía Fernández', 'lucia@pod.dev', RolUsuario::Developer, 'bg-violet-500'],
            ['u4', 'Diego Navarro', 'diego@pod.dev', RolUsuario::Developer, 'bg-amber-500'],
            ['u5', 'Sara Molina', 'sara@pod.dev', RolUsuario::Developer, 'bg-rose-500'],
            ['u6', 'Pablo Herrera', 'pablo@pod.dev', RolUsuario::ProjectManager, 'bg-cyan-500'],
            ['u7', 'Elena Vidal', 'elena@pod.dev', RolUsuario::Sales, 'bg-indigo-500'],
            ['u8', 'Carlos Ortega', 'carlos@pod.dev', RolUsuario::Developer, 'bg-teal-500'],
            ['u9', 'Nuria Castro', 'nuria@pod.dev', RolUsuario::Sales, 'bg-fuchsia-500'],
        ];
        $U = [];
        foreach ($defUsers as [$ref, $nombre, $email, $rol, $color]) {
            $u = new Usuario();
            $u->setNombre($nombre)->setEmail($email)->setRol($rol)->setColor($color);
            $u->setPassword($this->hasher->hashPassword($u, 'pod'));
            $this->em->persist($u);
            $U[$ref] = $u;
        }
        // Marta también administra (para la demo).
        $U['u1']->setRol(RolUsuario::Admin);

        // ---- Oportunidades ----
        $defOpp = [
            ['o1', 'Distribuciones Vega', 'Ampliación Portal B2B — Fase 2', 48000, 'u7', 16, EstadoOportunidad::Negociacion, 70, 2, 'Módulo de devoluciones y panel de administración de descuentos por volumen.'],
            ['o2', 'Logística Cantábrico', 'App conductores — mantenimiento anual', 22000, 'u7', 28, EstadoOportunidad::SinRespuesta, 40, 19, 'Soporte, evolutivos y SLA de 24h para la aplicación de logística.'],
            ['o3', 'TecnoBrava S.L.', 'Plataforma de comercio headless', 95000, 'u9', 9, EstadoOportunidad::Enviado, 55, 9, 'Migración del e-commerce a arquitectura headless con CMS desacoplado.'],
            ['o4', 'Grupo Saimaza', 'Integración ERP — facturación electrónica', 63000, 'u7', 21, EstadoOportunidad::Negociacion, 80, 12, 'Conector entre el ERP del cliente y la nueva API de facturación Verifactu.'],
            ['o5', 'Clínicas Núñez', 'Portal de citas para pacientes', 37000, 'u9', 3, EstadoOportunidad::Enviado, 50, 3, 'Reserva de citas online con recordatorios y pago anticipado de consultas.'],
            ['o6', 'Editorial Aralar', 'Suscripciones digitales', 29500, 'u9', 30, EstadoOportunidad::SinRespuesta, 65, 22, 'Modelo de suscripción con muro de pago y gestión de licencias por centro educativo.'],
            ['o7', 'Mobiliario Duero', 'Configurador de producto 3D', 71000, 'u7', 2, EstadoOportunidad::Borrador, 35, 0, 'Configurador visual de muebles a medida con presupuesto instantáneo.'],
            ['o8', 'Seguros Altamira', 'Renovación licencia panel analítica', 18000, 'u9', 42, EstadoOportunidad::Aceptado, 100, 5, 'Renovación anual del cuadro de mando con dos cuadros nuevos.'],
        ];
        $O = [];
        foreach ($defOpp as [$ref, $cliente, $nombre, $importe, $resp, $diasEnvio, $estado, $prob, $ultSeg, $desc]) {
            $o = new Oportunidad();
            $o->setCliente($cliente)->setNombre($nombre)->setImporte($importe)
                ->setResponsableComercial($U[$resp])->setEstado($estado)->setProbabilidad($prob)
                ->setDescripcion($desc)
                ->setFechaEnvio($now->modify("-$diasEnvio days"))
                ->setFechaUltimaAccion($now->modify("-$ultSeg days"));
            $this->em->persist($o);
            $O[$ref] = $o;
        }

        // ---- Proyectos ----
        // [ref, nombre, cliente, estado, prioridad, progreso, resp, diasInicio, finEstOffset, finRealOffset, sinActividad, oppRef, desc]
        $defProy = [
            ['p1', 'Portal Cliente B2B', 'Distribuciones Vega', EstadoProyecto::Bloqueado, Prioridad::Critica, 58, 'u1', 108, 31, null, 0, 'o1', 'Portal de autoservicio para clientes mayoristas: catálogo, pedidos recurrentes y seguimiento de envíos.'],
            ['p2', 'Migración a microservicios', 'Interno', EstadoProyecto::Progreso, Prioridad::Alta, 41, 'u2', 88, 108, null, 1, null, 'Descomposición del monolito de facturación en servicios independientes con despliegue continuo.'],
            ['p3', 'App móvil de logística', 'Logística Cantábrico', EstadoProyecto::Progreso, Prioridad::Alta, 67, 'u6', 130, -3, null, 9, 'o2', 'Aplicación para conductores: rutas, firma de entregas e incidencias en tiempo real.'],
            ['p4', 'Rediseño del checkout', 'TecnoBrava S.L.', EstadoProyecto::Revision, Prioridad::Media, 89, 'u1', 52, 3, null, 2, 'o3', 'Nuevo flujo de pago en un solo paso con validación de tarjeta en cliente.'],
            ['p5', 'API de facturación', 'Grupo Saimaza', EstadoProyecto::Bloqueado, Prioridad::Alta, 34, 'u2', 76, -8, null, 6, 'o4', 'API REST para emisión de facturas electrónicas conforme a la normativa Verifactu.'],
            ['p6', 'Panel de analítica interna', 'Interno', EstadoProyecto::Pendiente, Prioridad::Baja, 8, 'u6', 4, 92, null, 0, null, 'Cuadro de mando con métricas de uso y rendimiento de los productos del departamento.'],
            ['p7', 'Integración pasarela de pago', 'Clínicas Núñez', EstadoProyecto::Finalizado, Prioridad::Media, 100, 'u1', 148, 92, 94, 14, 'o5', 'Integración de Redsys y Stripe con conciliación automática de cobros.'],
            ['p8', 'Onboarding automatizado', 'Editorial Aralar', EstadoProyecto::Progreso, Prioridad::Media, 52, 'u5', 80, 49, null, 3, 'o6', 'Secuencia de alta de usuarios con verificación de identidad y firma de contratos.'],
        ];
        $P = [];
        foreach ($defProy as [$ref, $nombre, $cliente, $estado, $prio, $prog, $resp, $diasIni, $finEstOff, $finRealOff, $sinAct, $oppRef, $desc]) {
            $p = new Proyecto();
            $p->setNombre($nombre)->setCliente($cliente)->setEstado($estado)->setPrioridad($prio)
                ->setProgreso($prog)->setResponsable($U[$resp])->setDescripcion($desc)
                ->setFechaInicio($now->modify("-$diasIni days"))
                ->setFechaFinEstimada($now->modify(($finEstOff >= 0 ? '+' : '-').abs($finEstOff).' days'));
            if ($finRealOff !== null) {
                $p->setFechaFinReal($now->modify("-$finRealOff days"));
            }
            if ($oppRef) {
                $p->setOportunidad($O[$oppRef]);
            }
            $this->em->persist($p);
            $P[$ref] = ['e' => $p, 'sinAct' => $sinAct];
        }

        // ---- Participantes ----
        $parts = [
            'p1' => [['u1', RolProyecto::Responsable], ['u3', RolProyecto::Colaborador], ['u4', RolProyecto::Colaborador], ['u8', RolProyecto::Colaborador], ['u7', RolProyecto::Consultado]],
            'p2' => [['u2', RolProyecto::Responsable], ['u8', RolProyecto::Colaborador], ['u3', RolProyecto::Colaborador], ['u1', RolProyecto::Consultado]],
            'p3' => [['u6', RolProyecto::Responsable], ['u4', RolProyecto::Colaborador], ['u5', RolProyecto::Colaborador]],
            'p4' => [['u1', RolProyecto::Responsable], ['u5', RolProyecto::Colaborador], ['u4', RolProyecto::Consultado]],
            'p5' => [['u2', RolProyecto::Responsable], ['u3', RolProyecto::Colaborador], ['u7', RolProyecto::Consultado]],
            'p6' => [['u6', RolProyecto::Responsable], ['u8', RolProyecto::Colaborador]],
            'p7' => [['u1', RolProyecto::Responsable], ['u5', RolProyecto::Colaborador]],
            'p8' => [['u5', RolProyecto::Responsable], ['u4', RolProyecto::Colaborador], ['u3', RolProyecto::Colaborador]],
        ];
        foreach ($parts as $pid => $lista) {
            foreach ($lista as [$uid, $rol]) {
                $pu = new ProyectoUsuario();
                $pu->setProyecto($P[$pid]['e'])->setUsuario($U[$uid])->setRol($rol);
                $this->em->persist($pu);
            }
        }

        // ---- Tareas ----
        // [proy, titulo, estado, prioridad, asignado, est, hechas, limiteOffset(+/- dias)]
        $defTareas = [
            ['p1', 'Diseñar esquema del carrito recurrente', EstadoTarea::Bloqueada, Prioridad::Critica, 'u3', 16, 11, -1],
            ['p1', 'Endpoint de catálogo paginado', EstadoTarea::Progreso, Prioridad::Alta, 'u4', 12, 7, 4],
            ['p1', 'Maquetar vista de seguimiento de envío', EstadoTarea::Pendiente, Prioridad::Media, 'u1', 8, 0, 7],
            ['p1', 'Integrar SSO del cliente', EstadoTarea::Bloqueada, Prioridad::Alta, 'u8', 10, 4, -2],
            ['p4', 'Validación de tarjeta en cliente', EstadoTarea::Progreso, Prioridad::Media, 'u1', 6, 5, 1],
            ['p4', 'Pruebas E2E del flujo de pago', EstadoTarea::Pendiente, Prioridad::Alta, 'u5', 9, 0, 2],
            ['p2', 'Extraer servicio de facturación', EstadoTarea::Progreso, Prioridad::Alta, 'u2', 24, 14, 13],
            ['p2', 'Configurar malla de servicios', EstadoTarea::Pendiente, Prioridad::Media, 'u8', 16, 0, 21],
            ['p5', 'Adaptar modelo a Verifactu', EstadoTarea::Bloqueada, Prioridad::Alta, 'u3', 20, 6, -3],
            ['p3', 'Firma de entregas sin conexión', EstadoTarea::Progreso, Prioridad::Alta, 'u4', 14, 9, 6],
            ['p8', 'Verificación de identidad documental', EstadoTarea::Progreso, Prioridad::Media, 'u5', 12, 6, 11],
            ['p1', 'Auditar accesibilidad del catálogo', EstadoTarea::Pendiente, Prioridad::Baja, 'u1', 5, 0, 15],
        ];
        $tareasRef = [];
        foreach ($defTareas as $i => [$pid, $titulo, $estado, $prio, $uid, $est, $hechas, $limOff]) {
            $t = new Tarea();
            $t->setProyecto($P[$pid]['e'])->setTitulo($titulo)->setEstado($estado)->setPrioridad($prio)
                ->setAsignado($U[$uid])->setEstimacionHoras($est)->setHorasConsumidas($hechas)
                ->setFechaLimite($now->modify(($limOff >= 0 ? '+' : '-').abs($limOff).' days'));
            $this->em->persist($t);
            $tareasRef[$i] = $t;
        }

        // ---- Bloqueos ----
        $defBloq = [
            ['p1', 'Esperando credenciales del SSO del cliente', Prioridad::Alta, 'u8', 3, false, 'El cliente no ha entregado el certificado del proveedor de identidad. Bloquea login y catálogo personalizado.'],
            ['p1', 'Decisión pendiente sobre el modelo de carrito recurrente', Prioridad::Critica, 'u3', 5, false, 'Falta validar con negocio si los pedidos recurrentes se editan o se clonan. Frena el diseño del esquema.'],
            ['p5', 'Especificación de Verifactu incompleta', Prioridad::Alta, 'u3', 6, false, 'La AEAT no ha publicado el detalle del campo de huella encadenada. Bloquea la firma de facturas.'],
            ['p3', 'Dispositivos de prueba no disponibles', Prioridad::Media, 'u6', 8, true, 'Faltaban terminales Android antiguos para QA. Resuelto con flota de dispositivos en la nube.'],
        ];
        foreach ($defBloq as [$pid, $titulo, $sev, $uid, $dias, $resuelto, $desc]) {
            $b = new Bloqueo();
            $b->setProyecto($P[$pid]['e'])->setTitulo($titulo)->setSeveridad($sev)
                ->setCreadoPor($U[$uid])->setDescripcion($desc)
                ->setFechaCreacion($now->modify("-$dias days"));
            if ($resuelto) {
                $b->setResuelto(true)->setFechaResolucion($now->modify('-1 days'));
            }
            $this->em->persist($b);
        }

        // ---- Actividad ----
        // Feed reciente (orden cronológico decreciente mediante offsets en minutos).
        $feed = [
            [TipoActividad::BloqueoCreado, 'u3', 'p1', 'abrió un bloqueo crítico en', 'modelo de carrito recurrente', 18],
            [TipoActividad::TareaCompletada, 'u4', 'p3', 'completó', 'Firma de entregas sin conexión', 42],
            [TipoActividad::ProyectoActualizado, 'u1', 'p4', 'movió a revisión el proyecto', 'Rediseño del checkout', 60],
            [TipoActividad::OportunidadActualizada, 'u7', null, 'avanzó a negociación', 'Grupo Saimaza — Integración ERP', 120],
            [TipoActividad::TareaCreada, 'u8', 'p1', 'marcó como bloqueada', 'Integrar SSO del cliente', 180],
            [TipoActividad::Comentario, 'u2', 'p2', 'comentó en', 'Extraer servicio de facturación', 240],
            [TipoActividad::ProyectoCreado, 'u6', 'p6', 'creó el proyecto', 'Panel de analítica interna', 300],
            [TipoActividad::TareaCompletada, 'u5', 'p8', 'empezó', 'Verificación de identidad documental', 1200],
            [TipoActividad::BloqueoResuelto, 'u6', 'p3', 'resolvió el bloqueo de', 'dispositivos de prueba', 1500],
            [TipoActividad::OportunidadAceptada, 'u9', null, 'cerró la oportunidad', 'Seguros Altamira', 1800],
        ];
        foreach ($feed as [$tipo, $uid, $pid, $texto, $objeto, $minutos]) {
            $a = new Actividad();
            $a->setTipo($tipo)->setUsuario($U[$uid])->setTexto($texto)->setObjeto($objeto)
                ->setProyecto($pid ? $P[$pid]['e'] : null)
                ->setFecha($now->modify("-$minutos minutes"));
            $this->em->persist($a);
        }
        // Marcador de "última actividad" por proyecto según su antigüedad (para los riesgos).
        foreach ($P as $pid => $info) {
            $dias = $info['sinAct'];
            if ($dias <= 0) {
                continue;
            }
            $a = new Actividad();
            $a->setTipo(TipoActividad::ProyectoActualizado)->setUsuario($info['e']->getResponsable())
                ->setTexto('actualizó el proyecto')->setObjeto($info['e']->getNombre())
                ->setProyecto($info['e'])->setFecha($now->modify("-$dias days"));
            $this->em->persist($a);
        }

        $this->em->flush();

        $io->success(sprintf('Seed completado: %d usuarios, %d oportunidades, %d proyectos, %d tareas.', count($U), count($O), count($P), count($defTareas)));
        $io->writeln('Acceso demo: <info>marta@pod.dev</info> / <info>pod</info> (y resto de usuarios con contraseña "pod").');

        return Command::SUCCESS;
    }
}
