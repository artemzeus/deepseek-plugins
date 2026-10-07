# speech-to-text-whisper

Локальное распознавание речи для DeepSeek Harness на базе **sherpa-onnx Whisper** — с поддержкой **русского языка** и скачиванием модели прямо в плагине.

Local speech recognition for DeepSeek Harness based on **sherpa-onnx Whisper** — with **Russian** support and in-plugin model download.

## Зачем / Why

Встроенный в DSH провайдер SenseVoice (`sherpa-onnx-sense-voice-zh-en-ja-ko-yue`) распознаёт только `auto / zh / en / yue / ja / ko` — **русского в нём нет**. Этот плагин добавляет альтернативного провайдера на мультиязычной модели Whisper, которая умеет русский и ещё десяток языков.

The SenseVoice provider shipped with DSH only supports `auto / zh / en / yue / ja / ko` — **no Russian**. This plugin adds an alternative provider on the multilingual Whisper model, which handles Russian and a dozen other languages.

## Возможности / Features

- Локальный инференс на CPU, без интернета в момент распознавания (сеть нужна только при первом скачивании модели).
- Скачивание модели внутри плагина: прогресс, проверка sha256, фолбэк `huggingface.co → hf-mirror.com`.
- Модели `base` / `small` / `medium`, точность `int8` / `fp32`.
- Языки: `auto`, `ru`, `en`, `uk`, `be`, `de`, `fr`, `es`, `it`, `pl`, `tr`, `zh`, `ja`, `ko`.

- Local CPU inference; no internet needed at transcription time (only for the first model download).
- In-plugin model download: progress, sha256 verification, `huggingface.co → hf-mirror.com` fallback.
- `base` / `small` / `medium` models, `int8` / `fp32` precision.
- Languages: `auto`, `ru`, `en`, `uk`, `be`, `de`, `fr`, `es`, `it`, `pl`, `tr`, `zh`, `ja`, `ko`.

## Требования / Requirements

- DeepSeek Harness с рантаймом `sherpa-onnx-node` (входит в дистрибутив DSH).
- Windows x64, macOS arm64/x64 или Linux x64/arm64.

- DeepSeek Harness with the `sherpa-onnx-node` runtime (bundled with DSH).
- Windows x64, macOS arm64/x64 or Linux x64/arm64.

## Установка / Installation

1. Скопируйте пакет в `node_modules` профиля DSH (по умолчанию `C:\Users\<user>\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-experimental-speech-to-text-whisper`).
2. Добавьте в `cordis.patch.yml` профиля:

```yaml
- insert:
    - id: speech-to-text
      name: "@deepseek-ai/dsh-experimental-speech-to-text"
      config:
        defaultProvider: whisper-local
    - id: speech-to-text-whisper
      name: "@deepseek-ai/dsh-experimental-speech-to-text-whisper"
      config:
        dataRoot: !!js dshHomePath('speech-to-text', 'whisper')
    - id: ui-voice-input
      name: "@deepseek-ai/dsh-experimental-client-ui-voice-input"
```

3. Перезапустите DeepSeek Harness.

1. Copy the package into the DSH profile's `node_modules` (default `C:\Users\<user>\.dsh\profiles\desktop\node_modules\@deepseek-ai\dsh-experimental-speech-to-text-whisper`).
2. Add the snippet above to the profile's `cordis.patch.yml`.
3. Restart DeepSeek Harness.

## Настройка / Configuration

| Поле / Field | По умолчанию / Default | Описание / Description |
| --- | --- | --- |
| `providerId` | `whisper-local` | Идентификатор провайдера. Provider id. |
| `dataRoot` | — (обязательное) | Корень данных; модели в `<dataRoot>/models/whisper-onnx`. Data root; models live under `<dataRoot>/models/whisper-onnx`. |
| `model` | `small` | `base` \| `small` \| `medium` |
| `precision` | `int8` | `int8` \| `fp32` |
| `threads` | `2` | Потоки CPU. CPU threads. |
| `modelOrigins` | `["https://huggingface.co", "https://hf-mirror.com"]` | Зеркала для скачивания. Download mirrors. |
| `modelDirectory` | — | Фиксированная папка модели (минуя dataRoot). Fixed model dir (bypasses dataRoot). |
| `tokensPath` | — | Фиксированный путь к tokens.txt. Fixed tokens.txt path. |

Размеры моделей (int8): `base` ≈ 160 МБ, `small` ≈ 375 МБ, `medium` ≈ 945 МБ.

Model sizes (int8): `base` ≈ 160 MB, `small` ≈ 375 MB, `medium` ≈ 945 MB.

## Использование / Usage

После перезапуска откройте голосовой ввод в чате, выберите провайдера **«Whisper small (INT8)»** и язык **auto** (Whisper сам определит язык) или `ru`.

After restarting, open voice input in the chat, pick the **“Whisper small (INT8)”** provider and language **auto** (auto-detected) or `ru`.

## Как устроено / How it works

- `lib/index.js` — провайдер: регистрация в сервисе `speechToText`, менеджер скачивания, запуск воркера.
- `lib/worker.js` — дочерний процесс: sherpa-onnx Whisper + локальный HTTP `/transcribe`.
- `runtime/assets.json` — закреплённые URL и sha256 моделей.

- `lib/index.js` — provider: registration on the `speechToText` service, download manager, worker spawn.
- `lib/worker.js` — child process: sherpa-onnx Whisper + a local HTTP `/transcribe`.
- `runtime/assets.json` — pinned model URLs and sha256.

## Лицензия / License

MIT.
