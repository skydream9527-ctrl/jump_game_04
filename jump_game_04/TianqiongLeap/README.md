# 天穹跃迁 (Tianqiong Leap)

横版跳跃手游 · Android · Kotlin + Jetpack

## 构建前准备

首次使用需要生成 Gradle Wrapper JAR：

```bash
# 如果本地安装了 Gradle
gradle wrapper --gradle-version 8.5

# 或者使用 Android Studio 打开项目，会自动生成
```

生成后会多出 `gradle/wrapper/gradle-wrapper.jar` 文件。

## 本地构建

```bash
./gradlew assembleDebug
```

APK 输出路径：`app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions 构建

push 到 GitHub 后，Actions 会自动构建 APK。下载 artifact 即可获取。

## 项目结构

```
app/src/main/java/com/tianqiong/leap/
├── MainActivity.kt          # 主 Activity
├── game/
│   ├── GameEngine.kt        # 核心引擎（物理、碰撞、关卡生成）
│   ├── GameView.kt          # SurfaceView 渲染
│   ├── GameConstants.kt     # 游戏常量
│   ├── entity/              # 游戏实体（Player、Platform、Shard、Particle）
│   ├── render/              # 渲染器（背景、角色、HUD）
│   └── audio/               # 音效管理
└── ui/theme/                # 原神风格 Compose 主题
```
