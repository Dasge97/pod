<?php

namespace App\Service\Ai;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class OpenAiClient implements AiClientInterface
{
    private HttpClientInterface $http;

    public function __construct(
        private string $apiKey,
        private string $model,
    ) {
        $this->http = HttpClient::create();
    }

    public function estaConfigurado(): bool
    {
        return $this->apiKey !== '';
    }

    public function completarJson(string $system, string $userPrompt): string
    {
        $response = $this->http->request('POST', 'https://api.openai.com/v1/chat/completions', [
            'auth_bearer' => $this->apiKey,
            'json' => [
                'model' => $this->model,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ],
            'timeout' => 60,
        ]);

        $data = $response->toArray(false);

        return $data['choices'][0]['message']['content'] ?? '';
    }
}
