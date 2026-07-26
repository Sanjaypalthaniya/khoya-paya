import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';

class ConversationData {
  ConversationData(
    this.name,
    this.item,
    this.role,
    this.preview, {
    this.unread = true,
  });
  final String name, item, role;
  String preview;
  bool unread, blocked = false;
  final messages = <String>[
    'Hi, I may have found your item.',
    'Thanks. Please use the private verification question.',
  ];
}

class MessagesHubScreen extends StatefulWidget {
  const MessagesHubScreen({super.key});
  @override
  State<MessagesHubScreen> createState() => _MessagesHubScreenState();
}

class _MessagesHubScreenState extends State<MessagesHubScreen> {
  final search = TextEditingController();
  String demoState = 'ready';
  final conversations = [
    ConversationData(
      'Rohan Mehta',
      'House keys',
      'Finder',
      'I found them near the café entrance.',
    ),
    ConversationData(
      'Meera Joshi',
      'Indie dog Milo',
      'Owner',
      'Could you confirm the collar colour?',
      unread: false,
    ),
    ConversationData(
      'Khoya Paya Safety',
      'Recovery guidance',
      'Support',
      'Meet only in a public place.',
      unread: false,
    ),
  ];
  @override
  void dispose() {
    search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final list = conversations
        .where(
          (c) => '${c.name} ${c.item}'.toLowerCase().contains(
            search.text.toLowerCase(),
          ),
        )
        .toList();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (v) => setState(() => demoState = v),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'ready', child: Text('Normal')),
              PopupMenuItem(value: 'loading', child: Text('Loading')),
              PopupMenuItem(value: 'error', child: Text('Error')),
              PopupMenuItem(value: 'empty', child: Text('Empty')),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(14),
              child: TextField(
                controller: search,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.search),
                  hintText: 'Search conversations',
                ),
              ),
            ),
            Expanded(
              child: demoState == 'loading'
                  ? const Center(child: CircularProgressIndicator())
                  : demoState == 'error'
                  ? AppStateView(
                      icon: Icons.error_outline,
                      title: 'Messages unavailable',
                      message: 'This is the local error preview.',
                      action: () => setState(() => demoState = 'ready'),
                    )
                  : demoState == 'empty' || list.isEmpty
                  ? const AppStateView(
                      icon: Icons.chat_bubble_outline,
                      title: 'No conversations',
                      message:
                          'Secure recovery conversations will appear here.',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      itemCount: list.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (_, i) {
                        final conversation = list[i];
                        return AppCard(
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: ProfileAvatar(
                              conversation.name.substring(0, 1),
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    conversation.name,
                                    style: TextStyle(
                                      fontWeight: conversation.unread
                                          ? FontWeight.w900
                                          : FontWeight.w600,
                                    ),
                                  ),
                                ),
                                StatusChip(conversation.role),
                              ],
                            ),
                            subtitle: Text(
                              '${conversation.item}\n${conversation.preview}',
                              maxLines: 2,
                            ),
                            trailing: conversation.unread
                                ? const Badge(label: Text('1'))
                                : const Icon(Icons.chevron_right),
                            onTap: () async {
                              conversation.unread = false;
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      ConversationScreen(data: conversation),
                                ),
                              );
                              setState(() {});
                            },
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class ConversationScreen extends StatefulWidget {
  const ConversationScreen({super.key, required this.data});
  final ConversationData data;
  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final composer = TextEditingController();
  bool attachment = false;
  @override
  void dispose() {
    composer.dispose();
    super.dispose();
  }

  void menu(String value) {
    if (value == 'draft') {
      composer.clear();
      showAppToast(context, 'Local draft deleted');
    }
    if (value == 'block' || value == 'report') {
      showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: Text(
            value == 'block' ? 'Block conversation?' : 'Report conversation?',
          ),
          content: const Text(
            'This confirmation changes only the static prototype.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                if (value == 'block') widget.data.blocked = true;
                Navigator.pop(context);
                setState(() {});
              },
              child: const Text('Confirm'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(widget.data.name, style: const TextStyle(fontSize: 17)),
          Text(
            '${widget.data.role} • ${widget.data.item}',
            style: const TextStyle(fontSize: 11),
          ),
        ],
      ),
      actions: [
        PopupMenuButton<String>(
          onSelected: menu,
          itemBuilder: (_) => const [
            PopupMenuItem(value: 'draft', child: Text('Delete local draft')),
            PopupMenuItem(value: 'block', child: Text('Block')),
            PopupMenuItem(value: 'report', child: Text('Report')),
          ],
        ),
      ],
    ),
    body: SafeArea(
      child: Column(
        children: [
          const AppCard(
            color: AppColors.primarySoft,
            child: Row(
              children: [
                Icon(
                  Icons.health_and_safety_outlined,
                  color: AppColors.primary,
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Never share passwords, OTPs or exact home addresses.',
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(14),
              children: [
                const Center(child: Chip(label: Text('Today'))),
                ...widget.data.messages.asMap().entries.map(
                  (entry) => Align(
                    alignment: entry.key.isEven
                        ? Alignment.centerLeft
                        : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      constraints: const BoxConstraints(maxWidth: 280),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: entry.key.isEven
                            ? Colors.white
                            : AppColors.primarySoft,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(entry.value),
                    ),
                  ),
                ),
                if (attachment)
                  const Align(
                    alignment: Alignment.centerRight,
                    child: AppCard(
                      child: Column(
                        children: [
                          Icon(Icons.image_outlined, size: 54),
                          Text('demo-item-photo.jpg'),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (widget.data.blocked)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Text(
                'This local conversation is blocked.',
                style: TextStyle(color: AppColors.error),
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.all(10),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => setState(() => attachment = true),
                    icon: const Icon(Icons.attach_file),
                  ),
                  Expanded(
                    child: TextField(
                      controller: composer,
                      decoration: const InputDecoration(
                        hintText: 'Message securely',
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton.filled(
                    onPressed: () {
                      if (composer.text.trim().isEmpty) return;
                      setState(() {
                        widget.data.messages.add(composer.text.trim());
                        widget.data.preview = composer.text.trim();
                        composer.clear();
                      });
                    },
                    icon: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
        ],
      ),
    ),
  );
}
