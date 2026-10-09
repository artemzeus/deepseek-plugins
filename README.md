# DeepSeek Harness Plugins

Коллекция плагинов для [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
A collection of plugins for DeepSeek Harness.

## Голосовой ввод Whisper / Whisper voice input

Локальное распознавание речи с поддержкой русского языка (Whisper ONNX, sherpa-onnx).
Local speech recognition with Russian support (Whisper ONNX, sherpa-onnx).

| Пакет / Package | Роль / Role |
| --- | --- |
| [`speech-to-text-whisper`](./speech-to-text-whisper) | Провайдер Whisper + скачивание модели. Whisper provider + in-plugin model download. |
| [`voice-input-whisper-bundle`](./voice-input-whisper-bundle) | Бандл: связывает провайдер + API + UI в один пакет. Bundle wiring provider + API + UI together. |
| [`client-ui-voice-input`](./client-ui-voice-input) | Пропатченный UI: кнопка микрофона + панель настроек. Patched UI: mic button + settings panel. |

## Установка / Installation

Рекомендуется ставить бандл — он подтягивает провайдер и UI автоматически:

```bash
dsh plugin --profile <profile> add @artemzeus/dsh-experimental-voice-input-whisper-bundle
```

После установки полностью перезапустите DeepSeek Harness.

Install the bundle (it pulls the provider and UI automatically):

```bash
dsh plugin --profile <profile> add @artemzeus/dsh-experimental-voice-input-whisper-bundle
```

Then fully restart DeepSeek Harness.

## Совместимость / Compatibility

- Проверено на DeepSeek Harness desktop **0.2.0-rc.2** (Electron 44, Node 24).
- `sherpa-onnx-node` 1.13.8 поставляется с DSH (peer-зависимость).
- Пакеты `@deepseek-ai/*` (cordis `~4.0.4`, `dsh-experimental-speech-to-text` `0.2.0-rc.2` и др.) поставляются с DSH; здесь они объявлены как `optional` peer-зависимости.

- Tested on DeepSeek Harness desktop **0.2.0-rc.2** (Electron 44, Node 24).
- `sherpa-onnx-node` 1.13.8 ships with DSH (peer dependency).
- The `@deepseek-ai/*` packages (cordis `~4.0.4`, `dsh-experimental-speech-to-text` `0.2.0-rc.2`, etc.) ship with DSH; they are declared as `optional` peer dependencies here.
