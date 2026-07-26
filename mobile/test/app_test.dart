import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khoya_paya_app/app/app.dart';
import 'package:khoya_paya_app/features/auth/login_screen.dart';
import 'package:khoya_paya_app/features/auth/signup_screen.dart';
import 'package:khoya_paya_app/features/home/main_shell.dart';
import 'package:khoya_paya_app/features/onboarding/onboarding_screen.dart';
import 'package:khoya_paya_app/features/splash/splash_screen.dart';

void main() {
  testWidgets('splash renders brand', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SplashScreen()));
    expect(find.text('Protect. Connect. Recover.'), findsOneWidget);
    await tester.pump(const Duration(seconds: 1));
  });

  testWidgets('onboarding navigation reaches final page', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: OnboardingScreen()));
    expect(find.text('Report What You Lost'), findsOneWidget);
    await tester.tap(find.text('Next'));
    await tester.pumpAndSettle();
    expect(find.text('Help Someone Recover'), findsOneWidget);
  });

  testWidgets('login validates and static login succeeds', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    await tester.tap(find.widgetWithText(FilledButton, 'Login'));
    await tester.pump();
    expect(find.text('Enter a valid email'), findsOneWidget);
    await tester.ensureVisible(find.text('Fill demo credentials'));
    await tester.tap(find.text('Fill demo credentials'));
    await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Login'));
    await tester.pump(const Duration(seconds: 1));
    await tester.pumpAndSettle();
    expect(find.text('Good morning, Aanya'), findsOneWidget);
  });

  testWidgets('signup validates fields', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SignupScreen()));
    await tester.ensureVisible(
      find.widgetWithText(FilledButton, 'Create Account'),
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Create Account'));
    await tester.pump();
    expect(find.text('Enter your full name'), findsOneWidget);
  });

  testWidgets('bottom navigation and create sheet work', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: MainShell()));
    expect(find.text('Quick actions'), findsOneWidget);
    await tester.tap(find.text('Messages'));
    await tester.pumpAndSettle();
    expect(find.text('Rohan Mehta'), findsOneWidget);
    await tester.tap(find.text('Create'));
    await tester.pumpAndSettle();
    expect(find.text('Report Missing Pet'), findsOneWidget);
  });

  testWidgets('Android back returns shell to Home', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: MainShell()));
    await tester.tap(find.text('Profile'));
    await tester.pumpAndSettle();
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Quick actions'), findsOneWidget);
  });

  for (final width in [
    320.0,
    360.0,
    375.0,
    390.0,
    393.0,
    412.0,
    414.0,
    430.0,
    480.0,
    768.0,
    820.0,
    1024.0,
  ]) {
    testWidgets('home has no overflow at ${width.toInt()}px', (tester) async {
      tester.view.physicalSize = Size(width, 800);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(const MaterialApp(home: MainShell()));
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('premium navigation exposes stable semantic destinations', (
    tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: MainShell()));
    for (final destination in [
      'home',
      'search',
      'create',
      'messages',
      'profile',
    ]) {
      expect(find.byKey(ValueKey('nav_$destination')), findsOneWidget);
    }
  });

  testWidgets('full app starts at splash', (tester) async {
    await tester.pumpWidget(const KhoyaPayaApp());
    expect(find.text('Khoya Paya'), findsOneWidget);
    await tester.pump(const Duration(seconds: 1));
  });
}
