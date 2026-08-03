package com.tianqiong.leap.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val TianqiongColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = BgDeep,
    secondary = AccentBlue,
    onSecondary = BgDeep,
    tertiary = AccentPurple,
    background = BgDeep,
    onBackground = TextPrimary,
    surface = BgPanel,
    onSurface = TextPrimary,
    error = AccentRed,
    onError = TextBright
)

@Composable
fun TianqiongLeapTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = TianqiongColorScheme,
        content = content
    )
}
