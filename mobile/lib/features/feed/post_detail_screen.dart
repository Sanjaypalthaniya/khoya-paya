import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({
    super.key,
    required this.post,
    this.openComments = false,
  });
  final PostData post;
  final bool openComments;
  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final composer = TextEditingController();
  String state = 'ready';
  @override
  void dispose() {
    composer.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (widget.openComments) {
      WidgetsBinding.instance.addPostFrameCallback((_) => commentsSheet());
    }
  }

  void commentsSheet() => showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (sheet) => StatefulBuilder(
      builder: (context, setSheet) {
        final comments = widget.post.comments;
        return SafeArea(
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              16,
              0,
              16,
              16 + MediaQuery.viewInsetsOf(context).bottom,
            ),
            child: SizedBox(
              height: MediaQuery.sizeOf(context).height * .72,
              child: Column(
                children: [
                  Row(
                    children: [
                      Text(
                        'Comments',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const Spacer(),
                      PopupMenuButton<String>(
                        onSelected: (v) => setSheet(() => state = v),
                        itemBuilder: (_) => const [
                          PopupMenuItem(value: 'ready', child: Text('Normal')),
                          PopupMenuItem(
                            value: 'loading',
                            child: Text('Loading state'),
                          ),
                          PopupMenuItem(
                            value: 'error',
                            child: Text('Error state'),
                          ),
                          PopupMenuItem(
                            value: 'empty',
                            child: Text('Empty state'),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Expanded(
                    child: state == 'loading'
                        ? const Center(child: CircularProgressIndicator())
                        : state == 'error'
                        ? AppStateView(
                            icon: Icons.error_outline,
                            title: 'Comments unavailable',
                            message: 'Demo error state.',
                            action: () => setSheet(() => state = 'ready'),
                          )
                        : state == 'empty' || comments.isEmpty
                        ? const AppStateView(
                            icon: Icons.chat_bubble_outline,
                            title: 'Start the conversation',
                            message:
                                'Be helpful and never share private information.',
                          )
                        : ListView.builder(
                            itemCount: comments.length,
                            itemBuilder: (_, i) => ListTile(
                              leading: const ProfileAvatar('AS'),
                              title: const Text('You • Demo comment'),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(comments[i]),
                                  TextButton(
                                    onPressed: () => showAppToast(
                                      context,
                                      'Reply composer ready',
                                    ),
                                    child: const Text('Reply'),
                                  ),
                                ],
                              ),
                              trailing: PopupMenuButton<String>(
                                onSelected: (v) {
                                  if (v == 'delete') {
                                    PrototypeStore.instance.deleteComment(
                                      widget.post,
                                      i,
                                    );
                                  }
                                  if (v == 'edit') {
                                    PrototypeStore.instance.editComment(
                                      widget.post,
                                      i,
                                      '${comments[i]} (edited)',
                                    );
                                  }
                                  setSheet(() {});
                                  setState(() {});
                                },
                                itemBuilder: (_) => const [
                                  PopupMenuItem(
                                    value: 'edit',
                                    child: Text('Edit'),
                                  ),
                                  PopupMenuItem(
                                    value: 'delete',
                                    child: Text('Delete'),
                                  ),
                                ],
                              ),
                            ),
                          ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: composer,
                          decoration: const InputDecoration(
                            hintText: 'Add a safe comment',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: () {
                          PrototypeStore.instance.addComment(
                            widget.post,
                            composer.text,
                          );
                          composer.clear();
                          setSheet(() => state = 'ready');
                          setState(() {});
                        },
                        icon: const Icon(Icons.send),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    ),
  );
  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final action = post.status == 'Lost'
        ? 'I Found This Item'
        : post.status == 'Found'
        ? 'This May Be My Item'
        : post.status == 'Recovered'
        ? 'View Recovery Status'
        : 'Message Securely';
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report details'),
        actions: [
          IconButton(
            onPressed: () {
              PrototypeStore.instance.toggleSaved(post);
              setState(() {});
            },
            icon: Icon(post.saved ? Icons.bookmark : Icons.bookmark_border),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(12),
        child: AppButton(
          label: action,
          onPressed: () => showDialog<void>(
            context: context,
            builder: (_) => AlertDialog(
              title: Text(action),
              content: const Text(
                'This is a private local prototype flow. No message or claim was sent.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Understood'),
                ),
              ],
            ),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 20),
        children: [
          Container(
            height: 270,
            color: AppColors.primarySoft,
            child: Icon(
              post.category == 'Pet' ? Icons.pets : Icons.image_outlined,
              size: 88,
              color: AppColors.primary,
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    ProfileAvatar(post.user.substring(0, 1)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  post.user,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              if (post.verified)
                                const Icon(
                                  Icons.verified,
                                  color: AppColors.primary,
                                  size: 18,
                                ),
                            ],
                          ),
                          Text('${post.location} • ${post.time}'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    StatusChip(
                      post.status,
                      color:
                          post.status == 'Found' || post.status == 'Recovered'
                          ? AppColors.success
                          : AppColors.error,
                    ),
                    const SizedBox(width: 8),
                    StatusChip(post.category),
                  ],
                ),
                const SizedBox(height: 14),
                Text(
                  post.title,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 10),
                Text(post.description),
                const SizedBox(height: 18),
                AppCard(
                  child: Column(
                    children: [
                      _Info('Approximate location', post.location),
                      _Info('Reported', post.time),
                      _Info(
                        'Colour',
                        post.color.isEmpty ? 'Not specified' : post.color,
                      ),
                      _Info(
                        'Brand / model',
                        '${post.brand} ${post.model}'.trim().isEmpty
                            ? 'Not specified'
                            : '${post.brand} ${post.model}',
                      ),
                      _Info(
                        'Reward',
                        post.reward > 0 ? '₹${post.reward}' : 'No reward',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                const AppCard(
                  color: AppColors.primarySoft,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.verified_user_outlined,
                        color: AppColors.primary,
                      ),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Verification note: ownership details remain private and should be checked before return.',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                const AppCard(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.health_and_safety_outlined,
                        color: AppColors.success,
                      ),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Safety: meet in a public place and never pay before verification.',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    TextButton.icon(
                      onPressed: () {
                        PrototypeStore.instance.toggleReaction(post);
                        setState(() {});
                      },
                      icon: Icon(
                        post.reacted ? Icons.favorite : Icons.favorite_border,
                      ),
                      label: Text('${post.reactions} reactions'),
                    ),
                    const Spacer(),
                    TextButton.icon(
                      onPressed: commentsSheet,
                      icon: const Icon(Icons.chat_bubble_outline),
                      label: Text('${post.comments.length} comments'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const SectionHeader('Related reports'),
                ...PrototypeStore.instance.posts
                    .where((p) => p.id != post.id)
                    .take(2)
                    .map(
                      (p) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: AppCard(
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(p.title),
                            subtitle: Text(p.location),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () => Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PostDetailScreen(post: p),
                              ),
                            ),
                          ),
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
}

class _Info extends StatelessWidget {
  const _Info(this.label, this.value);
  final String label, value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(label, style: const TextStyle(color: AppColors.muted)),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
      ],
    ),
  );
}
