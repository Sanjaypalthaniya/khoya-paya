import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khoya_paya_app/features/communications/messages_screen.dart';
import 'package:khoya_paya_app/features/communications/notifications_screen.dart';
import 'package:khoya_paya_app/features/profile/profile_screen.dart';
import 'package:khoya_paya_app/features/profile/settings_screen.dart';
import 'package:khoya_paya_app/features/recovery/claims_screen.dart';
import 'package:khoya_paya_app/features/recovery/recovery_screen.dart';
import 'package:khoya_paya_app/features/recovery/verification_screen.dart';

void main() {
  testWidgets('messages open and send a local message', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: MessagesHubScreen()));
    await tester.tap(find.text('Rohan Mehta'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byType(TextField).last,
      'I can meet at the help desk.',
    );
    await tester.tap(find.byIcon(Icons.send));
    await tester.pump();
    expect(find.text('I can meet at the help desk.'), findsOneWidget);
  });

  testWidgets('notifications can be marked read', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: NotificationsScreen()));
    await tester.tap(find.text('Read all'));
    await tester.pump();
    await tester.tap(find.text('Unread'));
    await tester.pump();
    expect(find.text('All caught up'), findsOneWidget);
  });

  testWidgets('claims navigate to verification steps', (tester) async {
    final claim = ClaimData(
      'Black wallet',
      'Rohan Mehta',
      'Received',
      'Review',
    );
    await tester.pumpWidget(MaterialApp(home: ClaimDetailScreen(claim: claim)));
    await tester.drag(find.byType(ListView).first, const Offset(0, -550));
    await tester.pump();
    await tester.tap(find.text('Continue verification'));
    await tester.pumpAndSettle();
    expect(find.text('Claim submitted'), findsOneWidget);
    await tester.tap(find.text('Continue'));
    await tester.pump();
    expect(find.text('Private questions'), findsOneWidget);
  });

  testWidgets('recovery completes after both confirmations', (tester) async {
    final claim = ClaimData('Wallet', 'Rohan', 'Received', 'Return');
    await tester.pumpWidget(MaterialApp(home: RecoveryScreen(claim: claim)));
    await tester.ensureVisible(find.text('Owner confirms handover'));
    await tester.tap(find.text('Owner confirms handover'));
    await tester.ensureVisible(find.text('Finder confirms handover'));
    await tester.tap(find.text('Finder confirms handover'));
    await tester.pump();
    await tester.drag(find.byType(ListView).first, const Offset(0, -650));
    await tester.pump();
    expect(find.text('Recovery completed'), findsOneWidget);
  });

  testWidgets('profile tabs and settings routes work', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: EnhancedProfileScreen()));
    await tester.tap(find.text('Items').first);
    await tester.pump();
    final itemsChip = tester.widget<ChoiceChip>(
      find.widgetWithText(ChoiceChip, 'Items'),
    );
    expect(itemsChip.selected, isTrue);
    await tester.tap(find.byIcon(Icons.settings_outlined));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Logout prototype'), 300);
    expect(find.text('Logout prototype'), findsOneWidget);
  });

  testWidgets('logout prototype returns to login', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SettingsScreen()));
    await tester.scrollUntilVisible(find.text('Logout prototype'), 300);
    await tester.tap(find.text('Logout prototype'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Logout'));
    await tester.pumpAndSettle();
    expect(find.text('Welcome back'), findsOneWidget);
  });

  testWidgets('verification route renders all primary controls', (
    tester,
  ) async {
    final claim = ClaimData('Keys', 'Meera', 'Submitted', 'Questions');
    await tester.pumpWidget(
      MaterialApp(home: VerificationFlowScreen(claim: claim)),
    );
    expect(find.text('Step 1 of 6'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
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
    testWidgets('Part 3 messages fit at ${width.toInt()}px', (tester) async {
      tester.view.physicalSize = Size(width, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(const MaterialApp(home: MessagesHubScreen()));
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  }
}
