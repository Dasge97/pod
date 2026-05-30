<?php

namespace App\Service\Ai;

use App\Entity\Oportunidad;
use Psr\Log\LoggerInterface;

/**
 * Convierte el texto de un presupuesto en un borrador de proyecto (fases, tareas,
 * riesgos, dependencias, estimaciones). Si no hay proveedor de IA configurado o
 * la llamada falla, genera un borrador heurístico para que el flujo siga funcionando.
 */
class ProjectDraftGenerator
{
    private const SYSTEM = <<<TXT
        Eres un jefe de proyecto técnico. A partir del texto de un presupuesto de desarrollo
        de software, generas un borrador de proyecto operativo. Respondes SIEMPRE en español y
        EXCLUSIVAMENTE con un objeto JSON válido (sin texto adicional) con esta forma exacta:
        {
          "proyecto": { "nombre": string, "descripcion": string, "objetivos": string[] },
          "fases": [ { "nombre": string, "tareas": [ { "titulo": string, "estimacionHoras": number } ] } ],
          "riesgos": [ { "texto": string, "severidad": "baja"|"media"|"alta" } ],
          "dependencias": string[],
          "estimaciones": { "totalHoras": number, "notas": string }
        }
        Usa fases típicas (Análisis, Backend, Frontend, Testing, Despliegue) cuando apliquen.
        TXT;

    public function __construct(
        private AiClientInterface $ai,
        private LoggerInterface $logger,
    ) {
    }

    public function generar(string $textoPresupuesto): array
    {
        if ($this->ai->estaConfigurado()) {
            try {
                $raw = $this->ai->completarJson(self::SYSTEM, "Presupuesto:\n\n".$textoPresupuesto);
                $json = $this->extraerJson($raw);
                if ($json !== null) {
                    $json['simulado'] = false;
                    return $json;
                }
            } catch (\Throwable $e) {
                $this->logger->warning('Fallo al generar borrador con IA, se usa heurístico: '.$e->getMessage());
            }
        }

        return $this->heuristico($textoPresupuesto);
    }

    /** Construye el texto base de un presupuesto a partir de una oportunidad. */
    public function textoDeOportunidad(Oportunidad $o): string
    {
        return sprintf(
            "Cliente: %s\nProyecto: %s\nImporte: %s €\nDescripción: %s",
            $o->getCliente(),
            $o->getNombre(),
            number_format($o->getImporte(), 2, ',', '.'),
            $o->getDescripcion() ?? '(sin descripción)'
        );
    }

    private function extraerJson(string $raw): ?array
    {
        $raw = trim($raw);
        // Quita posibles vallas de código markdown.
        $raw = preg_replace('/^```(?:json)?|```$/m', '', $raw) ?? $raw;
        $start = strpos($raw, '{');
        $end = strrpos($raw, '}');
        if ($start === false || $end === false) {
            return null;
        }
        $json = substr($raw, $start, $end - $start + 1);
        $data = json_decode($json, true);

        return is_array($data) ? $data : null;
    }

    /** Borrador de demostración cuando no hay IA configurada. */
    private function heuristico(string $texto): array
    {
        $nombre = 'Proyecto a partir de presupuesto';
        if (preg_match('/Proyecto:\s*(.+)/u', $texto, $m)) {
            $nombre = trim($m[1]);
        }
        $cliente = '';
        if (preg_match('/Cliente:\s*(.+)/u', $texto, $m)) {
            $cliente = trim($m[1]);
        }

        return [
            'simulado' => true,
            'proyecto' => [
                'nombre' => $nombre,
                'descripcion' => 'Borrador generado automáticamente. Revisa y ajusta antes de confirmar.'
                    .($cliente ? ' Cliente: '.$cliente.'.' : ''),
                'objetivos' => [
                    'Cubrir el alcance descrito en el presupuesto',
                    'Entregar dentro del plazo estimado',
                ],
            ],
            'fases' => [
                ['nombre' => 'Análisis', 'tareas' => [
                    ['titulo' => 'Levantamiento de requisitos con el cliente', 'estimacionHoras' => 16],
                    ['titulo' => 'Modelo de datos y arquitectura', 'estimacionHoras' => 12],
                ]],
                ['nombre' => 'Backend', 'tareas' => [
                    ['titulo' => 'Diseño de la base de datos', 'estimacionHoras' => 10],
                    ['titulo' => 'Desarrollo de la API', 'estimacionHoras' => 28],
                    ['titulo' => 'Sistema de autenticación', 'estimacionHoras' => 12],
                ]],
                ['nombre' => 'Frontend', 'tareas' => [
                    ['titulo' => 'Diseño de la interfaz', 'estimacionHoras' => 16],
                    ['titulo' => 'Desarrollo de vistas', 'estimacionHoras' => 24],
                    ['titulo' => 'Integración con la API', 'estimacionHoras' => 12],
                ]],
                ['nombre' => 'Testing', 'tareas' => [
                    ['titulo' => 'Pruebas de integración', 'estimacionHoras' => 14],
                ]],
                ['nombre' => 'Despliegue', 'tareas' => [
                    ['titulo' => 'Despliegue y puesta en producción', 'estimacionHoras' => 8],
                ]],
            ],
            'riesgos' => [
                ['texto' => 'Alcance no cerrado en algunos puntos del presupuesto.', 'severidad' => 'media'],
                ['texto' => 'Dependencia de accesos/credenciales del cliente.', 'severidad' => 'alta'],
            ],
            'dependencias' => [
                'Accesos y credenciales necesarios del cliente',
                'Validación funcional del alcance antes de empezar',
            ],
            'estimaciones' => [
                'totalHoras' => 0,
                'notas' => 'Estimación inicial orientativa; revisar por fase.',
            ],
        ];
    }
}
