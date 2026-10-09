# client-ui-voice-input

Пропатченная копия UI голосового ввода DeepSeek Harness: кнопка микрофона + панель настроек провайдера.

A patched copy of the DeepSeek Harness voice-input UI: mic button + provider settings panel.

## Зачем патч / Why patched

Оригинальный `@deepseek-ai/dsh-experimental-client-ui-voice-input` жёстко зашивает имя бандла `@deepseek-ai/dsh-experimental-voice-input-bundle` в трёх местах (`openSettings`, ключ `plugins.bundle.config`, ключ `plugins.bundle.activation`) и собственный module-id. Этот пакет переписывает все ссылки на `@artemzeus/dsh-experimental-voice-input-whisper-bundle` и меняет module-id — чтобы панель настроек открывалась на странице бандла Whisper и не конфликтовала со встроенной копией.

The original `@deepseek-ai/dsh-experimental-client-ui-voice-input` hardcodes the bundle name `@deepseek-ai/dsh-experimental-voice-input-bundle` in three places (`openSettings`, the `plugins.bundle.config` key, the `plugins.bundle.activation` key) plus its own module id. This copy repoints them to `@artemzeus/dsh-experimental-voice-input-whisper-bundle` and changes the module id — so the settings panel opens on the Whisper bundle page without colliding with the built-in copy.

## Установка / Installation

Обычно ставится автоматически через бандл:

```bash
dsh plugin --profile <profile> add @artemzeus/dsh-experimental-voice-input-whisper-bundle
```

Отдельно / Standalone:

```bash
dsh plugin --profile <profile> add @artemzeus/dsh-experimental-client-ui-voice-input
```
