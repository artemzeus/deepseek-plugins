# DeepSeek Harness Plugins

Коллекция плагинов для [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
A collection of plugins for DeepSeek Harness.

## Плагины / Plugins

| Плагин / Plugin | Описание / Description |
| --- | --- |
| [`speech-to-text-whisper`](./speech-to-text-whisper) | Локальное распознавание речи (Whisper ONNX) с поддержкой русского языка и скачиванием модели внутри плагина. Local speech recognition (Whisper ONNX) with Russian support and in-plugin model download. |

## Установка / Installation

Каждый плагин — это обычный npm-пакет, который ставится в `node_modules` профиля DSH и подключается через `cordis.patch.yml`. Подробности — в README конкретного плагина.

Each plugin is a regular npm package installed into the DSH profile's `node_modules` and mounted via `cordis.patch.yml`. See each plugin's README for details.
