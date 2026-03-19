# browser cache lab

这里收集了一些有关浏览器缓存的 CTF 题目和研究。

## 如何使用？

`challs/` 目录下存放了挑战的环境&解题脚本，大部分情况下你可以通过 docker compose 启动环境。

`chromium_source/` 目录下存放了浏览器缓存相关的 chromium 源码，于 2026/3/16 下载，并附有一些 AI 生成的注释以便理解。

### 关于 `/` 根目录下以 `research-` 开头的脚本

你需要下载 [Bun](https://bun.com) 来运行我的大部分测试/解题脚本。

你可以使用 `--watch` flag 来动态地更新你的更改到 dev server，例如：

```sh
bun --watch research-bfcache.ts
# 运行 bfcache lab
```

## 收集的挑战

目前收集了这些 CTF 挑战，感谢这些优质客户端挑战出题人的付出！

| 题目 | 出题人 | 来源 | Nick solve |
| ----- | ----- | ----- | ----- |
| [spanote](https://blog.arkark.dev/2022/11/18/seccon-en/#web-spanote) | [arkark](https://arkark.dev/) | SECCON CTF 2022 Quals | yes |
| [srcdoc-memos-revenge](https://github.com/idekctf/idekctf-2024/tree/main/web/srcdoc-memos) | [icesfont](https://github.com/icesfont/) | idekCTF 2024 | yes |
| [safestnote](https://github.com/dicegang/dicectf-quals-2025-challenges/tree/main/web/safestnote) | [arxenix](https://github.com/arxenix) | DiceCTF Quals 2025 | yes |
| [append-note](https://github.com/bliutech/my-ctf-challenges/tree/main/lactf-2026/append-note) | [bliutech](https://github.com/bliutech) | LaCTF 2026 | yes |
| [greeeting-chall](https://gist.github.com/JorianWoltjer/744d8877184481079b4e219a7239d193) | [Jorian](https://gist.github.com/JorianWoltjer) | tweet | not yet |
| [leaky-flagment](https://challenge-0325.intigriti.io/) | [0x999](https://x.com/_0x999) | Intigriti March 2025 challenge | not yet |
| [leakynote](https://gist.github.com/parrot409/09688d0bb81acbe8cd1a10cfdaa59e45) | [parrot409](https://github.com/parrot409) | corCTF 2023 | not yet |
| [unrealistic-client-side-challenge](https://github.com/UofTCTF/uoftctf-2026-chals-public/tree/main/unrealistic-1) | [SteakEnthusiast](https://github.com/SteakEnthusiast) | UofTCTF 2026 | no |
