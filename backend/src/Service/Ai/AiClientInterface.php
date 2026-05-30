<?php

namespace App\Service\Ai;

/**
 * Abstracción del proveedor de IA. Permite intercambiar OpenAI/Anthropic sin
 * tocar el resto del código (ver config/services.yaml para el alias activo).
 */
interface AiClientInterface
{
    /**
     * Envía un prompt de sistema + usuario y devuelve la respuesta como texto.
     * Se espera que el modelo responda con JSON cuando así se le pida.
     */
    public function completarJson(string $system, string $userPrompt): string;

    /** ¿Está configurado (hay API key)? Si no, el generador usa modo heurístico. */
    public function estaConfigurado(): bool;
}
