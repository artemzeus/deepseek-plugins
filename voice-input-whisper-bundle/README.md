# voice-input-whisper-bundle

Бандл, собирающий локальный голосовой ввод Whisper в один установочный пакет.

A bundle that packages local Whisper voice input into a single installable unit.

## Что устанавливает / What it installs

Бандл вставляет в конфигурацию DSH четыре компонента (`cordis.patch.yml`):

| id | Пакет / Package |
| --- | --- |
| `speech-to-text` | `@deepseek-ai/dsh-experimental-speech-to-text` (config `defaultProvider: whisper-local`) |
| `speech-to-text-whisper` | `@artemzeus/dsh-experimental-speech-to-text-whisper` (провайдер Whisper) |
| `api-speech-to-text` | `@deepseek-ai/dsh-experimental-api-speech-to-text` |
| `ui-voice-input` | `@artemzeus/dsh-experimental-client-ui-voice-input` (пропатченный UI) |

## Установка / Installation

```bash
dsh plugin --profile <profile> add @artemzeus/dsh-experimental-voice-input-whisper-bundle
```

Затем полностью перезапустите DeepSeek Harness. / Then fully restart DeepSeek Harness.

## Зачем бандл / Why a bundle

Встроенный UI голосового ввода (`@deepseek-ai/dsh-experimental-client-ui-voice-input`) жёстко привязан к имени оригинального бандла `@deepseek-ai/dsh-experimental-voice-input-bundle` (в `openSettings`, ключе `plugins.bundle.config` и ключе `plugins.bundle.activation`). Поэтому бандл поставляет пропатченную копию UI (`@artemzeus/dsh-experimental-client-ui-voice-input`), где ссылки переписаны на имя этого бандла — иначе панель настроек не отображается.

The built-in voice-input UI hardcodes the original bundle name `@deepseek-ai/dsh-experimental-voice-input-bundle` (in `openSettings`, the `plugins.bundle.config` key and the `plugins.bundle.activation` key). This bundle therefore ships a patched UI copy whose references point to this bundle's name — otherwise the settings panel would not appear.
