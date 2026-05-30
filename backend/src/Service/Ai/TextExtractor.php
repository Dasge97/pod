<?php

namespace App\Service\Ai;

use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Extrae texto plano de un documento subido (PDF, DOCX o texto).
 */
class TextExtractor
{
    public function extraer(UploadedFile $archivo): string
    {
        $ext = strtolower($archivo->getClientOriginalExtension() ?: $archivo->guessExtension() ?: '');
        $path = $archivo->getPathname();

        return match ($ext) {
            'pdf' => $this->desdePdf($path),
            'docx' => $this->desdeDocx($path),
            default => (string) file_get_contents($path), // txt, md, eml...
        };
    }

    private function desdePdf(string $path): string
    {
        try {
            $parser = new PdfParser();
            return trim($parser->parseFile($path)->getText());
        } catch (\Throwable) {
            return '';
        }
    }

    /** Un .docx es un ZIP; el texto vive en word/document.xml. */
    private function desdeDocx(string $path): string
    {
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return '';
        }
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($xml === false) {
            return '';
        }
        // Convierte saltos de párrafo en saltos de línea y elimina el resto de etiquetas.
        $xml = preg_replace('/<\/w:p>/', "\n", $xml) ?? $xml;
        $texto = strip_tags($xml);

        return trim(html_entity_decode($texto, ENT_QUOTES | ENT_XML1, 'UTF-8'));
    }
}
