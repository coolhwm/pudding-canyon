<p align="center">
  <img src="assets/icon.svg" width="128" alt="布丁峡谷">
</p>

<h1 align="center">布丁峡谷</h1>

<p align="center">
  给 7 岁小朋友的横版过关小游戏。<br>
  路牌会说谎，陷阱反直觉，试错才是玩法。
</p>

<p align="center">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-yellow">
  <img alt="html5" src="https://img.shields.io/badge/HTML5%20Canvas-ffd36a?logo=html5&logoColor=white">
  <img alt="no build" src="https://img.shields.io/badge/build-none-lightgrey">
</p>

<p align="center">
  <img src="docs/cover.svg" width="720" alt="布丁峡谷">
</p>

## 怎么玩

用浏览器直接打开 [`index.html`](index.html)，不用安装、不用构建。

| 操作 | 按键 |
| --- | --- |
| 走路 | ← → 或 `A` `D` |
| 跳跃 | 空格 / ↑ / `W` |
| 再玩一次 | 通关后点按钮 |

左上角是试错次数。掉下去或碰到真危险会回到附近安全的地方。

## 第一关 · 请勿相信路牌

看上去危险的往往没事，看上去像终点的往往是画的。

| 你看到的 | 其实是 |
| --- | --- |
| 「危险！粘浆坑」 | 布丁弹簧，踩上去会弹 |
| 「终点 →」和高台旗子 | 旗子是画上去的 |
| 「安全桥」 | 白桥很滑 |
| 「吸尘器是朋友」 | 真危险，碰到会重来 |
| 「大门在这边」 | 门也是画的 |
| 「毛线球不要碰」 | 粉毛线球才是家 |

## 项目结构

```
pudding-canyon/
├── index.html         # 页面和 HUD
├── style.css          # 窗口、提示、通关层
├── game.js            # 关卡逻辑、物理、绘制
├── level.json         # 关卡宽度等基础数据
├── LICENSE            # MIT
├── assets/icon.svg    # 项目图标 / favicon
└── docs/cover.svg     # README 封面
```

纯静态：`index.html` + `style.css` + `game.js`，没有依赖。

## 许可

[MIT](LICENSE)
