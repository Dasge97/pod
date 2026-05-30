<?php

namespace App\Service\Ai;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AnthropicClient implements AiClientInterface
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
        $response = $this->http->request('POST', 'https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ],
            'json' => [
                'model' => $this->model,
                'max_tokens' => 4096,
                'system' => $system,
                'messages' => [
                    ['role' => 'user', 'content' => $userPrompt],
                ],
            ],
            'timeout' => 60,
        ]);

        $data = $response->toArray(false);

        return $data['content'][0]['text'] ?? '';
    }
}
