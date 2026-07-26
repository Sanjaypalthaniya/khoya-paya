import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:khoya_paya_app/features/create/create_post_screen.dart';
import 'package:khoya_paya_app/features/feed/community_feed_screen.dart';
import 'package:khoya_paya_app/features/items/items_screen.dart';
import 'package:khoya_paya_app/features/qr/qr_screens.dart';
import 'package:khoya_paya_app/features/search/search_screen.dart';
import 'package:khoya_paya_app/shared/models/prototype_store.dart';

void main() {
  testWidgets('feed filters and reactions work locally', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CommunityFeedScreen()));
    expect(find.text('Black wallet near Central Park'), findsOneWidget);
    await tester.tap(find.text('Found').first);
    await tester.pump();
    expect(find.text('Found a blue Android phone'), findsOneWidget);
    await tester.tap(find.text('All').first);
    await tester.pump();
    await tester.tap(find.byIcon(Icons.favorite_border).first);
    await tester.pump();
    expect(find.byIcon(Icons.favorite), findsWidgets);
  });

  testWidgets('search and nearby interfaces are complete', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SearchHubScreen()));
    await tester.enterText(find.byType(TextField).first, 'wallet');
    await tester.pump();
    expect(find.text('Black wallet near Central Park'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.near_me_outlined));
    await tester.pumpAndSettle();
    expect(
      find.text(
        'Real location is not requested. Choose a sanitized demo area manually.',
      ),
      findsOneWidget,
    );
  });

  testWidgets('create post has guided local workflow', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CreatePostScreen()));
    expect(find.text('Report details'), findsOneWidget);
    expect(find.text('Publish locally'), findsNothing);
  });

  testWidgets('item actions and QR scanner render', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ItemsScreen()));
    expect(find.text('Work laptop'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    expect(find.text('Mark Recovered'), findsOneWidget);
    Navigator.of(tester.element(find.text('Mark Recovered'))).pop();
    await tester.pumpAndSettle();
    await tester.pumpWidget(const MaterialApp(home: ScannerScreen()));
    await tester.tap(find.text('Simulate Scan'));
    await tester.pump(const Duration(seconds: 1));
    expect(find.text('Open valid QR result'), findsOneWidget);
  });

  test('prototype store mutates posts and items only in memory', () {
    final store = PrototypeStore.instance;
    final post = store.posts.first;
    final initial = post.reactions;
    store.toggleReaction(post);
    expect(post.reactions, isNot(initial));
    final item = store.items.first;
    store.setItemStatus(item, 'Lost');
    expect(item.status, 'Lost');
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
    testWidgets('Part 2 feed has no overflow at ${width.toInt()}px', (
      tester,
    ) async {
      tester.view.physicalSize = Size(width, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(const MaterialApp(home: CommunityFeedScreen()));
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  }
}
