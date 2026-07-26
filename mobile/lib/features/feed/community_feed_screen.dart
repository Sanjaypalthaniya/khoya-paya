import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';
import 'post_detail_screen.dart';

class CommunityFeedScreen extends StatefulWidget {
  const CommunityFeedScreen({super.key});
  @override
  State<CommunityFeedScreen> createState() => _CommunityFeedScreenState();
}

class _CommunityFeedScreenState extends State<CommunityFeedScreen> {
  final store = PrototypeStore.instance;
  String filter = 'All';
  String category = 'All';
  bool verifiedOnly = false, rewardOnly = false;
  @override
  void initState() {
    super.initState();
    store.addListener(refresh);
  }

  @override
  void dispose() {
    store.removeListener(refresh);
    super.dispose();
  }

  void refresh() => setState(() {});
  List<PostData> get visible => store.posts.where((p) {
    if (p.hidden) return false;
    if (filter == 'Reward' && p.reward == 0) return false;
    if (filter == 'Verified' && !p.verified) return false;
    if (!['All', 'Nearby', 'Reward', 'Verified'].contains(filter) &&
        p.status != filter) {
      return false;
    }
    if (category != 'All' && p.category != category) return false;
    if (verifiedOnly && !p.verified) return false;
    if (rewardOnly && p.reward == 0) return false;
    return true;
  }).toList();

  void filters() => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => StatefulBuilder(
      builder: (context, setSheet) => SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            0,
            20,
            20 + MediaQuery.viewInsetsOf(context).bottom,
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Filter reports',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  initialValue: category,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items:
                      [
                            'All',
                            'Wallet',
                            'Phone',
                            'Pet',
                            'Document',
                            'Keys',
                            'Bag',
                            'Watch',
                          ]
                          .map(
                            (e) => DropdownMenuItem(value: e, child: Text(e)),
                          )
                          .toList(),
                  onChanged: (v) => setSheet(() => category = v!),
                ),
                const SizedBox(height: 12),
                const TextField(
                  decoration: InputDecoration(
                    labelText: 'Location',
                    hintText: 'Jaipur',
                  ),
                ),
                const SizedBox(height: 12),
                const TextField(
                  decoration: InputDecoration(
                    labelText: 'Distance',
                    suffixText: '10 km',
                  ),
                ),
                const SizedBox(height: 12),
                const TextField(
                  decoration: InputDecoration(
                    labelText: 'Date',
                    hintText: 'Any time',
                  ),
                ),
                const SizedBox(height: 12),
                const TextField(
                  decoration: InputDecoration(labelText: 'Color'),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: rewardOnly,
                  onChanged: (v) => setSheet(() => rewardOnly = v),
                  title: const Text('Reward available'),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  value: verifiedOnly,
                  onChanged: (v) => setSheet(() => verifiedOnly = v),
                  title: const Text('Verified members only'),
                ),
                const Text(
                  'Media: Any • Status follows selected feed chip',
                  style: TextStyle(color: AppColors.muted),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'Reset',
                        secondary: true,
                        onPressed: () {
                          setState(() {
                            category = 'All';
                            verifiedOnly = false;
                            rewardOnly = false;
                          });
                          Navigator.pop(context);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: AppButton(
                        label: 'Apply',
                        onPressed: () {
                          setState(() {});
                          Navigator.pop(context);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Community Feed'),
      actions: [IconButton(onPressed: filters, icon: const Icon(Icons.tune))],
    ),
    body: SafeArea(
      child: Column(
        children: [
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              children:
                  [
                        'All',
                        'Lost',
                        'Found',
                        'Missing',
                        'Recovered',
                        'Nearby',
                        'Reward',
                        'Verified',
                      ]
                      .map(
                        (e) => Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(e),
                            selected: filter == e,
                            onSelected: (_) => setState(() => filter = e),
                          ),
                        ),
                      )
                      .toList(),
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const AppStateView(
                    icon: Icons.filter_alt_off,
                    title: 'No matching reports',
                    message: 'Reset filters or select another status.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: visible.length,
                    itemBuilder: (_, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: PostCard(post: visible[i], onChanged: refresh),
                    ),
                  ),
          ),
        ],
      ),
    ),
  );
}

class PostCard extends StatefulWidget {
  const PostCard({super.key, required this.post, required this.onChanged});
  final PostData post;
  final VoidCallback onChanged;
  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  bool expanded = false;
  PrototypeStore get store => PrototypeStore.instance;
  void menu() => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheet) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: const Text('View user profile'),
            onTap: () {
              Navigator.pop(sheet);
              showAppToast(
                context,
                '${widget.post.user} profile preview opened',
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.flag_outlined),
            title: const Text('Report post'),
            onTap: () {
              Navigator.pop(sheet);
              showModalBottomSheet<void>(
                context: context,
                builder: (_) => const SafeArea(
                  child: AppStateView(
                    icon: Icons.flag_outlined,
                    title: 'Report received locally',
                    message: 'No report was sent from this prototype.',
                  ),
                ),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.visibility_off_outlined),
            title: const Text('Hide this post'),
            onTap: () {
              store.hide(widget.post);
              Navigator.pop(sheet);
              widget.onChanged();
            },
          ),
        ],
      ),
    ),
  );
  void share() => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheet) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Share demo report',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 14),
            AppButton(
              label: 'Copy demo link',
              icon: Icons.link,
              onPressed: () {
                Navigator.pop(sheet);
                showAppToast(context, 'Demo link copied locally');
              },
            ),
            const SizedBox(height: 10),
            AppButton(
              label: 'Close',
              secondary: true,
              onPressed: () => Navigator.pop(sheet),
            ),
          ],
        ),
      ),
    ),
  );
  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: ProfileAvatar(
              post.user.split(' ').map((e) => e[0]).take(2).join(),
            ),
            title: Row(
              children: [
                Flexible(
                  child: Text(
                    post.user,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                if (post.verified)
                  const Padding(
                    padding: EdgeInsets.only(left: 4),
                    child: Icon(
                      Icons.verified,
                      size: 17,
                      color: AppColors.primary,
                    ),
                  ),
              ],
            ),
            subtitle: Text('${post.location} • ${post.time}'),
            trailing: IconButton(
              onPressed: menu,
              icon: const Icon(Icons.more_horiz),
            ),
            onTap: () =>
                showAppToast(context, '${post.user} profile preview opened'),
          ),
          InkWell(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => PostDetailScreen(post: post)),
            ),
            child: Container(
              height: 180,
              width: double.infinity,
              color: AppColors.primarySoft,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(
                    post.category == 'Pet' ? Icons.pets : Icons.image_outlined,
                    size: 64,
                    color: AppColors.primary,
                  ),
                  Positioned(
                    left: 12,
                    top: 12,
                    child: StatusChip(
                      post.status,
                      color:
                          post.status == 'Found' || post.status == 'Recovered'
                          ? AppColors.success
                          : AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    StatusChip(post.category),
                    if (post.reward > 0) ...[
                      const SizedBox(width: 8),
                      StatusChip(
                        '₹${post.reward} reward',
                        color: AppColors.warning,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 10),
                InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PostDetailScreen(post: post),
                    ),
                  ),
                  child: Text(
                    post.title,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  post.description,
                  maxLines: expanded ? null : 2,
                  overflow: expanded ? null : TextOverflow.ellipsis,
                ),
                TextButton(
                  onPressed: () => setState(() => expanded = !expanded),
                  child: Text(expanded ? 'Show less' : 'Read more'),
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        store.toggleReaction(post);
                        widget.onChanged();
                      },
                      icon: Icon(
                        post.reacted ? Icons.favorite : Icons.favorite_border,
                        color: post.reacted ? AppColors.error : null,
                      ),
                      label: Text('${post.reactions}'),
                    ),
                    IconButton(
                      tooltip: 'Comments',
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              PostDetailScreen(post: post, openComments: true),
                        ),
                      ),
                      icon: const Icon(Icons.chat_bubble_outline),
                    ),
                    IconButton(
                      tooltip: 'Save',
                      onPressed: () {
                        store.toggleSaved(post);
                        widget.onChanged();
                      },
                      icon: Icon(
                        post.saved ? Icons.bookmark : Icons.bookmark_border,
                      ),
                    ),
                    IconButton(
                      tooltip: 'Share',
                      onPressed: share,
                      icon: const Icon(Icons.share_outlined),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
