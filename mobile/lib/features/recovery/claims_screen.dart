import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import 'verification_screen.dart';

class ClaimData {
  ClaimData(this.item, this.person, this.direction, this.status);
  final String item, person, direction;
  String status;
}

class ClaimsScreen extends StatefulWidget {
  const ClaimsScreen({super.key});
  @override
  State<ClaimsScreen> createState() => _ClaimsScreenState();
}

class _ClaimsScreenState extends State<ClaimsScreen>
    with SingleTickerProviderStateMixin {
  late final tabs = TabController(length: 2, vsync: this);
  final claims = [
    ClaimData('Black wallet', 'Rohan Mehta', 'Received', 'Review'),
    ClaimData('Found blue phone', 'Priya Verma', 'Submitted', 'Questions'),
    ClaimData('Travel backpack', 'Kabir Singh', 'Received', 'Return'),
  ];
  @override
  void dispose() {
    tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Claims'),
      bottom: TabBar(
        controller: tabs,
        tabs: const [
          Tab(text: 'Received'),
          Tab(text: 'Submitted'),
        ],
      ),
    ),
    body: TabBarView(
      controller: tabs,
      children: ['Received', 'Submitted'].map((direction) {
        final list = claims.where((c) => c.direction == direction).toList();
        return ListView(
          padding: const EdgeInsets.all(14),
          children: [
            Wrap(
              spacing: 7,
              children: ['All', 'Review', 'Questions', 'Return']
                  .map(
                    (e) => ActionChip(
                      label: Text(e),
                      onPressed: () =>
                          showAppToast(context, '$e claim status selected'),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 14),
            ...list.map(
              (claim) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: AppCard(
                  child: ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const CircleAvatar(
                      child: Icon(Icons.assignment_outlined),
                    ),
                    title: Text(
                      claim.item,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                    subtitle: Text('${claim.person} • ${claim.direction}'),
                    trailing: StatusChip(claim.status),
                    onTap: () async {
                      await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ClaimDetailScreen(claim: claim),
                        ),
                      );
                      setState(() {});
                    },
                  ),
                ),
              ),
            ),
          ],
        );
      }).toList(),
    ),
  );
}

class ClaimDetailScreen extends StatefulWidget {
  const ClaimDetailScreen({super.key, required this.claim});
  final ClaimData claim;
  @override
  State<ClaimDetailScreen> createState() => _ClaimDetailScreenState();
}

class _ClaimDetailScreenState extends State<ClaimDetailScreen> {
  void decide(String status) => showDialog<void>(
    context: context,
    builder: (_) => AlertDialog(
      title: Text('$status claim?'),
      content: const Text('This decision updates only local prototype state.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () {
            setState(() => widget.claim.status = status);
            Navigator.pop(context);
          },
          child: const Text('Confirm'),
        ),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Claim details'),
      actions: [
        PopupMenuButton<String>(
          onSelected: (v) => decide(v),
          itemBuilder: (_) => const [
            PopupMenuItem(value: 'Withdrawn', child: Text('Withdraw claim')),
            PopupMenuItem(value: 'Disputed', child: Text('Open dispute')),
          ],
        ),
      ],
    ),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AppCard(
            color: AppColors.primarySoft,
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(
                Icons.account_balance_wallet_outlined,
                size: 38,
              ),
              title: Text(
                widget.claim.item,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              subtitle: Text('Approximate location • Jaipur'),
              trailing: StatusChip(widget.claim.status),
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const ProfileAvatar('RM'),
                  title: Text(widget.claim.person),
                  subtitle: const Text('Verified community member'),
                ),
                const Divider(),
                const ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.person_outline),
                  title: Text('Owner: Aanya Sharma'),
                  subtitle: Text('Contact remains private'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const SectionHeader('Verification progress'),
          const AppCard(
            child: Column(
              children: [
                LinearProgressIndicator(value: .5),
                SizedBox(height: 12),
                Text('Private questions complete • Evidence awaiting review'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const AppCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.image_outlined),
              title: Text('Evidence preview'),
              subtitle: Text('Demo image only • No identity document'),
            ),
          ),
          const SizedBox(height: 12),
          AppButton(
            label: 'Continue verification',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => VerificationFlowScreen(claim: widget.claim),
              ),
            ),
          ),
          const SizedBox(height: 8),
          AppButton(
            label: 'Message securely',
            secondary: true,
            onPressed: () =>
                showAppToast(context, 'Secure message route preview opened'),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Reject',
                  danger: true,
                  onPressed: () => decide('Rejected'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  label: 'Accept',
                  onPressed: () => decide('Accepted'),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
