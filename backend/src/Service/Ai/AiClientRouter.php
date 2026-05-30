<?php

namespace App\Service\Ai;

/**
 * Selecciona la implementación activa de IA según el valor de AI_PROVIDER.
 * Es el servicio inyectado allá donde se pide AiClientInterface.
 */
class AiClientRouter implements AiClientInterface
{
    private AiClientInterface $activo;

    public function __construct(
        OpenAiClient $openai,
        AnthropicClient $anthropic,
        string $provider,
    ) {
        $this->activo = $provider === 'openai' ? $openai : $anthropic;
    }

    public function completarJson(string $system, string $userPrompt): string
    {
        return $this->activo->completarJson($system, $userPrompt);
    }

    public function estaConfigurado(): bool
    {
        return $this->activo->estaConfigurado();
    }
}
