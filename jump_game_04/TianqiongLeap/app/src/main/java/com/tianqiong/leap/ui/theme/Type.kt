package com.tianqiong.leap.ui.theme

import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object TianqiongTypography {
    val title = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Black,
        fontSize = 28.sp,
        letterSpacing = 6.sp,
        color = GoldLight
    )

    val subtitle = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        letterSpacing = 4.sp,
        color = GoldDim
    )

    val heading = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        letterSpacing = 3.sp,
        color = GoldLight
    )

    val body = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Normal,
        fontSize = 15.sp,
        color = TextPrimary
    )

    val caption = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        color = TextDim
    )

    val button = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        letterSpacing = 2.sp,
        color = GoldLight
    )
}
