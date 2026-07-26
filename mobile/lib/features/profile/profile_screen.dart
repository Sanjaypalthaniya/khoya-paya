import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../communications/notifications_screen.dart';
import '../feed/community_feed_screen.dart';
import '../items/items_screen.dart';
import '../recovery/claims_screen.dart';
import '../recovery/success_stories_screen.dart';
import 'settings_screen.dart';

class EnhancedProfileScreen extends StatefulWidget {
  const EnhancedProfileScreen({super.key});
  @override
  State<EnhancedProfileScreen> createState() => _EnhancedProfileScreenState();
}

class _EnhancedProfileScreenState extends State<EnhancedProfileScreen> {
  String tab = 'Posts';
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Profile'),
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
        IconButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const SettingsScreen()),
          ),
          icon: const Icon(Icons.settings_outlined),
        ),
      ],
    ),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppCard(
            child: Column(
              children: [
                const ProfileAvatar('AS', radius: 42),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Aanya Sharma',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(width: 5),
                    const Icon(
                      Icons.verified,
                      color: AppColors.primary,
                      size: 19,
                    ),
                  ],
                ),
                const Text('@aanyahelps • Jaipur'),
                const SizedBox(height: 12),
                Row(
                  children: const [
                    Expanded(child: _Stat('240', 'Trust')),
                    Expanded(child: _Stat('1,420', 'Points')),
                    Expanded(child: _Stat('7', 'Recoveries')),
                    Expanded(child: _Stat('18', 'Helpful')),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Edit Profile',
                        secondary: true,
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const EditProfileScreen(),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: AppButton(
                        label: 'Share Profile',
                        onPressed: () =>
                            showAppToast(context, 'Demo profile link copied'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const SectionHeader('Badges & achievements'),
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children:
                  [
                        'Trusted Helper',
                        'QR Protector',
                        'Recovery Hero',
                        'Safe Reporter',
                      ]
                      .map(
                        (e) => Container(
                          width: 126,
                          margin: const EdgeInsets.only(right: 8),
                          child: AppCard(
                            child: Column(
                              children: [
                                const Icon(
                                  Icons.workspace_premium,
                                  color: AppColors.warning,
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  e,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                      .toList(),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 7,
            children: ['Posts', 'Items', 'Saved', 'Activity']
                .map(
                  (e) => ChoiceChip(
                    label: Text(e),
                    selected: tab == e,
                    onSelected: (_) => setState(() => tab = e),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(
                tab == 'Items'
                    ? Icons.inventory_2_outlined
                    : tab == 'Saved'
                    ? Icons.bookmark_outline
                    : Icons.campaign_outlined,
              ),
              title: Text('$tab overview'),
              subtitle: Text(
                tab == 'Activity'
                    ? '18 helpful community actions this month'
                    : 'Open your complete $tab collection',
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                if (tab == 'Items') {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ItemsScreen()),
                  );
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const CommunityFeedScreen(),
                    ),
                  );
                }
              },
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.assignment_outlined),
                  title: const Text('Claims & verification'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ClaimsScreen()),
                  ),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.emoji_events_outlined),
                  title: const Text('Leaderboard'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const LeaderboardScreen(),
                    ),
                  ),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.auto_stories_outlined),
                  title: const Text('Success stories'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const SuccessStoriesScreen(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class _Stat extends StatelessWidget {
  const _Stat(this.value, this.label);
  final String value, label;
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(
        value,
        style: const TextStyle(
          fontWeight: FontWeight.w900,
          color: AppColors.primary,
        ),
      ),
      Text(label, style: const TextStyle(fontSize: 11)),
    ],
  );
}

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});
  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final name = TextEditingController(text: 'Aanya Sharma'),
      bio = TextEditingController(text: 'Helping Jaipur recover what matters.');
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Edit profile')),
    body: ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const Center(child: ProfileAvatar('AS', radius: 45)),
        const SizedBox(height: 18),
        AppTextField(controller: name, label: 'Display name'),
        const SizedBox(height: 12),
        AppTextField(controller: bio, label: 'Bio'),
        const SizedBox(height: 12),
        const TextField(
          decoration: InputDecoration(labelText: 'City', hintText: 'Jaipur'),
        ),
        const SizedBox(height: 18),
        AppButton(
          label: 'Save locally',
          onPressed: () {
            showAppToast(context, 'Profile changes saved locally');
            Navigator.pop(context);
          },
        ),
      ],
    ),
  );
}

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});
  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  String period = 'Weekly', type = 'Top Finders';
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Community leaderboard')),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Wrap(
          spacing: 7,
          children: ['Weekly', 'Monthly', 'All Time', 'Nearby']
              .map(
                (e) => ChoiceChip(
                  label: Text(e),
                  selected: period == e,
                  onSelected: (_) => setState(() => period = e),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          initialValue: type,
          decoration: const InputDecoration(labelText: 'Ranking'),
          items: [
            'Top Finders',
            'Community Helpers',
            'Recovery Champions',
          ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: (v) => setState(() => type = v!),
        ),
        const SizedBox(height: 16),
        const AppCard(
          color: AppColors.primarySoft,
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(child: Text('12')),
            title: Text(
              'Your rank • Aanya Sharma',
              style: TextStyle(fontWeight: FontWeight.w900),
            ),
            subtitle: Text('1,420 points this week'),
          ),
        ),
        const SizedBox(height: 12),
        ...[
          'Riya Kapoor',
          'Dev Sharma',
          'Meera Joshi',
          'Kabir Singh',
          'Aanya Sharma',
        ].asMap().entries.map(
          (e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(child: Text('${e.key + 1}')),
                title: Text(e.value),
                subtitle: Text('${1860 - e.key * 120} trust points'),
                trailing: e.key < 3
                    ? const Icon(Icons.emoji_events, color: AppColors.warning)
                    : null,
              ),
            ),
          ),
        ),
      ],
    ),
  );
}
