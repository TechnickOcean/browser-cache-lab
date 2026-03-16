# Unrealistic Client-Side Challenge (UofCTF 2026)

Author: <https://github.com/SteakEnthusiast/My-CTF-Challenges>

## Flag 1

- Intended solution: Achieving XSS by abusing the bfcache → disk cache fallback + bypassing Chrome's double-keyed cache partitioning. Cookie jar overflow to overwrite an HTTP-only cookie that is rendered serverside. Cookie sandwich attack + DOM clobbering to exfiltrate a flag embedded inside an HTTP-only JWT.
- Unintended solution: DNS rebinding shenanigans :(

`uoftctf{h4v3_y0ur53lf_4_s4ndw1ch}`

## Flag 2

- Intended solution: Achieving XSS by abusing the bfcache → disk cache fallback + bypassing Chrome's double-keyed cache partitioning. Cookie jar overflow to overwrite an HTTP-only cookie that is rendered serverside. DOM clobbering + ISO-2022-JP encoding to exfiltrate a flag otherwise unconsumeable by dom clobbering.
- Unintended solution: DNS rebinding shenanigans :(

`uoftctf{3nc0d1n6_s0_c001}`
