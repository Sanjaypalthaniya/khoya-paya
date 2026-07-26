import 'package:flutter/material.dart';
import '../../core/widgets/app_widgets.dart';

class DemoNotification {
  DemoNotification(this.title, this.category, this.icon, {this.read = false});
  final String title, category;
  final IconData icon;
  bool read;
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String filter = 'All';
  final data = [
    DemoNotification(
      'Possible wallet match nearby',
      'Recovery',
      Icons.auto_awesome,
    ),
    DemoNotification(
      'Your backpack QR was scanned',
      'Activity',
      Icons.qr_code_scanner,
    ),
    DemoNotification(
      'New secure message from Rohan',
      'Activity',
      Icons.chat_bubble_outline,
    ),
    DemoNotification(
      'A new claim was received',
      'Recovery',
      Icons.assignment_outlined,
    ),
    DemoNotification(
      'Ownership verification requested',
      'Recovery',
      Icons.verified_user_outlined,
    ),
    DemoNotification(
      'Return arrangement updated',
      'Recovery',
      Icons.handshake_outlined,
    ),
    DemoNotification(
      'Demo reward status changed',
      'Recovery',
      Icons.redeem_outlined,
    ),
    DemoNotification(
      'Someone reacted to your post',
      'Activity',
      Icons.favorite_border,
    ),
    DemoNotification(
      'Community report reviewed',
      'System',
      Icons.shield_outlined,
    ),
    DemoNotification(
      'Prototype Mode is active',
      'System',
      Icons.info_outline,
      read: true,
    ),
  ];
  List<DemoNotification> get visible => data
      .where(
        (n) =>
            filter == 'All' ||
            filter == 'Unread' && !n.read ||
            n.category == filter,
      )
      .toList();
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Notifications'),
      actions: [
        TextButton(
          onPressed: () => setState(() {
            for (final n in data) {
              n.read = true;
            }
          }),
          child: const Text('Read all'),
        ),
      ],
    ),
    body: SafeArea(
      child: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: ['All', 'Unread', 'Activity', 'Recovery', 'System']
                  .map(
                    (e) => Padding(
                      padding: const EdgeInsets.only(right: 7),
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
                    icon: Icons.notifications_none,
                    title: 'All caught up',
                    message: 'No notifications match this filter.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: visible.length,
                    itemBuilder: (_, i) {
                      final n = visible[i];
                      return Dismissible(
                        key: ValueKey(n.title),
                        background: Container(
                          color: Colors.red.shade100,
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.all(20),
                          child: const Icon(Icons.delete_outline),
                        ),
                        onDismissed: (_) => setState(() => data.remove(n)),
                        child: AppCard(
                          color: n.read ? null : const Color(0xFFF2F6FF),
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(child: Icon(n.icon)),
                            title: Text(
                              n.title,
                              style: TextStyle(
                                fontWeight: n.read
                                    ? FontWeight.w600
                                    : FontWeight.w900,
                              ),
                            ),
                            subtitle: Text('${n.category} • Just now'),
                            trailing: PopupMenuButton<String>(
                              onSelected: (v) => setState(() {
                                if (v == 'read') n.read = true;
                                if (v == 'delete') data.remove(n);
                              }),
                              itemBuilder: (_) => const [
                                PopupMenuItem(
                                  value: 'read',
                                  child: Text('Mark read'),
                                ),
                                PopupMenuItem(
                                  value: 'delete',
                                  child: Text('Delete'),
                                ),
                              ],
                            ),
                            onTap: () => setState(() => n.read = true),
                          ),
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
