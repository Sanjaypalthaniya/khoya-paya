import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../mock/mock_repository.dart';
import '../communications/messages_screen.dart';
import '../communications/notifications_screen.dart';
import '../create/create_post_screen.dart';
import '../feed/community_feed_screen.dart';
import '../items/items_screen.dart';
import '../qr/qr_screens.dart';
import '../search/search_screen.dart';
import '../shared/detail_screen.dart';
import '../profile/profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int index = 0;
  void openDetail(String title, IconData icon, String description) {
    final lower = title.toLowerCase();
    if (lower.contains('register')) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const ItemFormScreen()),
      );
    } else if (lower.contains('scan')) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const ScannerScreen()),
      );
    } else if (lower.contains('report')) {
      final type = lower.contains('found')
          ? 'Found'
          : lower.contains('missing')
          ? 'Missing'
          : 'Lost';
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => CreatePostScreen(initialType: type)),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) =>
              DetailScreen(title: title, icon: icon, description: description),
        ),
      );
    }
  }

  void createSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'What would you like to do?',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              ...[
                (
                  'Report Lost Item',
                  Icons.search_off,
                  'Create a local lost-item report preview.',
                ),
                (
                  'Report Found Item',
                  Icons.volunteer_activism_outlined,
                  'Help an owner recover an item privately.',
                ),
                (
                  'Register Safe Item',
                  Icons.inventory_2_outlined,
                  'Preview proactive QR item protection.',
                ),
                (
                  'Report Missing Pet',
                  Icons.pets_outlined,
                  'Create a community-safe missing pet report.',
                ),
                (
                  'Report Document',
                  Icons.badge_outlined,
                  'Report a document without exposing private details.',
                ),
                (
                  'Scan QR',
                  Icons.qr_code_scanner,
                  'Preview a safe QR scan flow.',
                ),
              ].map(
                (item) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  minTileHeight: 52,
                  leading: CircleAvatar(
                    backgroundColor: AppColors.primarySoft,
                    child: Icon(item.$2, color: AppColors.primary),
                  ),
                  title: Text(
                    item.$1,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    if (item.$1 == 'Register Safe Item') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ItemFormScreen(),
                        ),
                      );
                    } else if (item.$1 == 'Scan QR') {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ScannerScreen(),
                        ),
                      );
                    } else {
                      final type = item.$1.contains('Found')
                          ? 'Found'
                          : item.$1.contains('Missing')
                          ? 'Missing'
                          : 'Lost';
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CreatePostScreen(initialType: type),
                        ),
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void select(int value) {
    if (value == 2) {
      createSheet();
      return;
    }
    setState(() => index = value);
  }

  @override
  Widget build(BuildContext context) => PopScope(
    canPop: index == 0,
    onPopInvokedWithResult: (didPop, result) {
      if (!didPop && index != 0) setState(() => index = 0);
    },
    child: Scaffold(
      body: IndexedStack(
        index: index > 2 ? index - 1 : index,
        children: [
          HomeScreen(onAction: openDetail),
          const SearchHubScreen(),
          const MessagesHubScreen(),
          const EnhancedProfileScreen(),
        ],
      ),
      bottomNavigationBar: _PremiumNavigationDock(
        selectedIndex: index,
        onSelected: select,
      ),
    ),
  );
}

class _PremiumNavigationDock extends StatelessWidget {
  const _PremiumNavigationDock({
    required this.selectedIndex,
    required this.onSelected,
  });
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  static const items = [
    ('Home', Icons.home_outlined, Icons.home_rounded),
    ('Search', Icons.search_rounded, Icons.search_rounded),
    ('Create', Icons.add_rounded, Icons.add_rounded),
    ('Messages', Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded),
    ('Profile', Icons.person_outline_rounded, Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) => SafeArea(
    top: false,
    minimum: const EdgeInsets.fromLTRB(12, 0, 12, 8),
    child: DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: AppColors.border),
        boxShadow: AppElevation.navigation,
      ),
      child: SizedBox(
        height: AppSize.navigation,
        child: Row(
          children: List.generate(items.length, (i) {
            final item = items[i];
            final selected = selectedIndex == i;
            final create = i == 2;
            return Expanded(
              child: Semantics(
                button: true,
                selected: selected,
                label: '${item.$1} tab',
                child: InkWell(
                  key: ValueKey('nav_${item.$1.toLowerCase()}'),
                  onTap: () => onSelected(i),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                  child: Center(
                    child: AnimatedContainer(
                      duration: AppMotion.fast,
                      curve: AppMotion.curve,
                      padding: EdgeInsets.symmetric(
                        horizontal: selected && !create ? 10 : 8,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: create
                            ? AppColors.primary
                            : selected
                            ? AppColors.primarySoft
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(
                          create ? AppRadius.md : AppRadius.pill,
                        ),
                        boxShadow: create ? AppElevation.low : null,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AnimatedScale(
                            scale: selected || create ? 1.06 : 1,
                            duration: AppMotion.fast,
                            child: Icon(
                              selected ? item.$3 : item.$2,
                              size: create ? 24 : 22,
                              color: create
                                  ? Colors.white
                                  : selected
                                  ? AppColors.primary
                                  : AppColors.muted,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            item.$1,
                            maxLines: 1,
                            style: TextStyle(
                              fontSize: 10.5,
                              height: 1,
                              fontWeight: selected || create
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: create
                                  ? Colors.white
                                  : selected
                                  ? AppColors.primary
                                  : AppColors.muted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    ),
  );
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onAction});
  final void Function(String, IconData, String) onAction;
  @override
  Widget build(BuildContext context) => SafeArea(
    child: CustomScrollView(
      slivers: [
        SliverAppBar(
          floating: true,
          backgroundColor: AppColors.background,
          title: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Good morning, Aanya',
                style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
              ),
              Text(
                'New Delhi • Prototype Mode',
                style: TextStyle(fontSize: 12, color: AppColors.muted),
              ),
            ],
          ),
          actions: [
            IconButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              ),
              icon: const Badge(
                label: Text('3'),
                child: Icon(Icons.notifications_none),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 14),
              child: CircleAvatar(child: Text('AS')),
            ),
          ],
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList.list(
            children: [
              TextField(
                readOnly: true,
                onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Open Search from the bottom navigation.'),
                  ),
                ),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search lost and found items',
                ),
              ),
              const SizedBox(height: 22),
              const SectionHeader('Quick actions'),
              LayoutBuilder(
                builder: (context, constraints) {
                  final width = (constraints.maxWidth - 12) / 2;
                  final actions = [
                    ('Report lost', Icons.search_off, AppColors.error),
                    (
                      'Report found',
                      Icons.volunteer_activism_outlined,
                      AppColors.success,
                    ),
                    (
                      'Register item',
                      Icons.inventory_2_outlined,
                      AppColors.primary,
                    ),
                    ('Scan QR', Icons.qr_code_scanner, AppColors.warning),
                  ];
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: actions
                        .map(
                          (a) => SizedBox(
                            width: width,
                            child: InkWell(
                              borderRadius: BorderRadius.circular(AppRadius.lg),
                              onTap: () => onAction(
                                a.$1,
                                a.$2,
                                'Complete this guided prototype flow locally.',
                              ),
                              child: AppCard(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: a.$3.withValues(
                                        alpha: .1,
                                      ),
                                      child: Icon(a.$2, color: a.$3),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      a.$1,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  );
                },
              ),
              const SizedBox(height: 22),
              SectionHeader(
                'Nearby reports',
                action: 'View all',
                onAction: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CommunityFeedScreen(),
                  ),
                ),
              ),
              ...MockRepository.posts.map(
                (post) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: AppCard(
                    child: Row(
                      children: [
                        Container(
                          width: 62,
                          height: 62,
                          decoration: BoxDecoration(
                            color: AppColors.primarySoft,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.image_outlined,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  StatusChip(
                                    post.status,
                                    color: post.status == 'Found'
                                        ? AppColors.success
                                        : AppColors.error,
                                  ),
                                  const Spacer(),
                                  Text(
                                    post.time,
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 7),
                              Text(
                                post.title,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(post.area),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SectionHeader('Your recovery'),
              const AppCard(
                color: AppColors.dark,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Recovery progress',
                      style: TextStyle(color: Colors.white70),
                    ),
                    SizedBox(height: 8),
                    Text(
                      '2 people are helping',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: 14),
                    LinearProgressIndicator(
                      value: .68,
                      color: AppColors.primary,
                      backgroundColor: Colors.white24,
                    ),
                    SizedBox(height: 10),
                    Text(
                      'Wallet report • 68% profile complete',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const SectionHeader('Protected items'),
              AppCard(
                child: InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ItemsScreen()),
                  ),
                  child: const Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: AppColors.primarySoft,
                        child: Icon(
                          Icons.shield_outlined,
                          color: AppColors.primary,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '3 items protected',
                              style: TextStyle(fontWeight: FontWeight.w800),
                            ),
                            Text('Backpack, laptop and keys'),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const SectionHeader('Community impact'),
              const Row(
                children: [
                  Expanded(
                    child: _Metric(value: '1,248', label: 'Recovered'),
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: _Metric(value: '4.8k', label: 'Helpers'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const SectionHeader('Recent activity'),
              const AppCard(
                child: Column(
                  children: [
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(Icons.visibility_outlined),
                      title: Text('Your wallet report was viewed'),
                      subtitle: Text('12 minutes ago'),
                    ),
                    Divider(),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(
                        Icons.verified_outlined,
                        color: AppColors.success,
                      ),
                      title: Text('A found item was recovered'),
                      subtitle: Text('Community success • Today'),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
            ],
          ),
        ),
      ],
    ),
  );
}

class _Metric extends StatelessWidget {
  const _Metric({required this.value, required this.label});
  final String value, label;
  @override
  Widget build(BuildContext context) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(color: AppColors.primary),
        ),
        Text(label),
      ],
    ),
  );
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String filter = 'All';
  @override
  Widget build(BuildContext context) => SafeArea(
    child: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Search community',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 6),
        const Text('Explore public-safe reports around you.'),
        const SizedBox(height: 18),
        const TextField(
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.search),
            hintText: 'Item, category or area',
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 8,
          children: ['All', 'Lost', 'Found', 'Missing']
              .map(
                (e) => ChoiceChip(
                  label: Text(e),
                  selected: filter == e,
                  onSelected: (_) => setState(() => filter = e),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 22),
        SectionHeader('$filter results'),
        ...MockRepository.posts
            .where((p) => filter == 'All' || p.status == filter)
            .map(
              (p) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(
                      child: Icon(Icons.inventory_2_outlined),
                    ),
                    title: Text(p.title),
                    subtitle: Text('${p.area} • ${p.time} ago'),
                    trailing: StatusChip(p.status),
                  ),
                ),
              ),
            ),
      ],
    ),
  );
}

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});
  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool empty = false;
  @override
  Widget build(BuildContext context) => SafeArea(
    child: Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Messages',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
              IconButton(
                tooltip: 'Toggle demo state',
                onPressed: () => setState(() => empty = !empty),
                icon: const Icon(Icons.science_outlined),
              ),
            ],
          ),
        ),
        if (empty)
          const Expanded(
            child: AppStateView(
              icon: Icons.chat_bubble_outline,
              title: 'No messages yet',
              message: 'Finder conversations will appear here.',
            ),
          )
        else
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: const [
                AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(child: Text('RK')),
                    title: Text(
                      'Rohan • Found your keys',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text('I found them near the café entrance.'),
                    trailing: Badge(label: Text('2')),
                  ),
                ),
                SizedBox(height: 12),
                AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: CircleAvatar(child: Text('KP')),
                    title: Text(
                      'Khoya Paya Safety',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      'Remember: verify ownership before meeting.',
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    ),
  );
}

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool alerts = true;
  @override
  Widget build(BuildContext context) => SafeArea(
    child: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Profile', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 18),
        const AppCard(
          child: Row(
            children: [
              CircleAvatar(radius: 30, child: Text('AS')),
              SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Aanya Sharma',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text('Community member • Demo profile'),
                    SizedBox(height: 6),
                    StatusChip('Verified prototype'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const AppCard(
          child: Row(
            children: [
              Expanded(child: _ProfileStat('240', 'Trust points')),
              Expanded(child: _ProfileStat('3', 'Protected')),
              Expanded(child: _ProfileStat('2', 'Recoveries')),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const SectionHeader('Preferences'),
        AppCard(
          child: Column(
            children: [
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.inventory_2_outlined),
                title: const Text('My Items'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ItemsScreen()),
                ),
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.people_outline),
                title: const Text('Community Feed'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const CommunityFeedScreen(),
                  ),
                ),
              ),
              const Divider(),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: alerts,
                onChanged: (v) => setState(() => alerts = v),
                secondary: const Icon(Icons.notifications_outlined),
                title: const Text('Demo notifications'),
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.palette_outlined),
                title: const Text('Design state gallery'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const StateGalleryScreen()),
                ),
              ),
              const Divider(),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.info_outline),
                title: const Text('About prototype'),
                subtitle: const Text('Static data only • Offline ready'),
                onTap: () => showAboutDialog(
                  context: context,
                  applicationName: 'Khoya Paya Prototype',
                  applicationVersion: '1.0.0',
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _ProfileStat extends StatelessWidget {
  const _ProfileStat(this.value, this.label);
  final String value, label;
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(
        value,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w900,
          color: AppColors.primary,
        ),
      ),
      Text(
        label,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 11),
      ),
    ],
  );
}

class StateGalleryScreen extends StatefulWidget {
  const StateGalleryScreen({super.key});
  @override
  State<StateGalleryScreen> createState() => _StateGalleryScreenState();
}

class _StateGalleryScreenState extends State<StateGalleryScreen> {
  int state = 0;
  @override
  Widget build(BuildContext context) {
    final views = [
      const Center(child: CircularProgressIndicator()),
      const AppStateView(
        icon: Icons.inbox_outlined,
        title: 'Nothing here yet',
        message: 'This is the reusable empty state.',
      ),
      AppStateView(
        icon: Icons.error_outline,
        title: 'Something went wrong',
        message: 'This is the reusable error state.',
        action: () => setState(() => state = 0),
      ),
      const AppStateView(
        icon: Icons.wifi_off,
        title: 'You are offline',
        message: 'Static prototype content remains available.',
      ),
      const AppStateView(
        icon: Icons.check_circle_outline,
        title: 'All done',
        message: 'This is the reusable success state.',
      ),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('State gallery')),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: List.generate(
                    5,
                    (i) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(
                          [
                            'Loading',
                            'Empty',
                            'Error',
                            'Offline',
                            'Success',
                          ][i],
                        ),
                        selected: state == i,
                        onSelected: (_) => setState(() => state = i),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Expanded(child: views[state]),
          ],
        ),
      ),
    );
  }
}
