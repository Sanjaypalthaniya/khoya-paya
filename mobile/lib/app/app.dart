import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../features/splash/splash_screen.dart';

class KhoyaPayaApp extends StatelessWidget {
  const KhoyaPayaApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Khoya Paya',
    debugShowCheckedModeBanner: false,
    theme: buildAppTheme(),
    themeAnimationDuration: AppMotion.standard,
    themeAnimationCurve: AppMotion.curve,
    builder: (context, child) => MediaQuery(
      data: MediaQuery.of(context).copyWith(
        textScaler: MediaQuery.textScalerOf(
          context,
        ).clamp(minScaleFactor: 1, maxScaleFactor: 1.6),
      ),
      child: child!,
    ),
    home: const SplashScreen(),
  );
}
