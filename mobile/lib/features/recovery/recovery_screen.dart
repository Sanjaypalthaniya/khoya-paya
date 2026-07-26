import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import 'claims_screen.dart';
import 'success_stories_screen.dart';

class RecoveryScreen extends StatefulWidget {
  const RecoveryScreen({super.key, required this.claim});
  final ClaimData claim;
  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  String method = 'Public place';
  bool owner = false, finder = false, consent = false, disputed = false;
  @override
  Widget build(BuildContext context) {
    final complete = owner && finder;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Return & recovery'),
        actions: [
          TextButton(
            onPressed: () => setState(() => disputed = true),
            child: const Text('Dispute'),
          ),
        ],
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const AppCard(
              color: AppColors.primarySoft,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.health_and_safety_outlined,
                    color: AppColors.primary,
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Meet in a well-lit public place. Bring a trusted person and verify the item before handover.',
                    ),
                  ),
                ],
              ),
            ),
            if (disputed)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: AppStateView(
                  icon: Icons.gavel_outlined,
                  title: 'Dispute opened locally',
                  message:
                      'Support and evidence review are simulated in this prototype.',
                ),
              ),
            const SizedBox(height: 16),
            Text(
              'Return method',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            RadioGroup<String>(
              groupValue: method,
              onChanged: (v) => setState(() => method = v!),
              child: const Column(
                children: [
                  RadioListTile(
                    value: 'Public place',
                    title: Text('Public-place handover'),
                    subtitle: Text('Recommended'),
                  ),
                  RadioListTile(
                    value: 'Delivery',
                    title: Text('Delivery option'),
                    subtitle: Text('Demo UI only • no courier booking'),
                  ),
                ],
              ),
            ),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Approximate meeting location',
                hintText: 'Metro help desk, Jaipur',
              ),
            ),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Date and time',
                hintText: 'Tomorrow, 4:00 PM',
              ),
            ),
            const SizedBox(height: 16),
            AppCard(
              child: Column(
                children: [
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: owner,
                    onChanged: (v) => setState(() => owner = v ?? false),
                    title: const Text('Owner confirms handover'),
                  ),
                  CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    value: finder,
                    onChanged: (v) => setState(() => finder = v ?? false),
                    title: const Text('Finder confirms handover'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Reward status',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 6),
                  const Text('₹500 demo reward • Not processed'),
                  const LinearProgressIndicator(value: .66),
                ],
              ),
            ),
            if (complete) ...[
              const SizedBox(height: 14),
              const AppStateView(
                icon: Icons.celebration_outlined,
                title: 'Recovery completed',
                message: 'Both participants confirmed the safe return.',
              ),
              CheckboxListTile(
                value: consent,
                onChanged: (v) => setState(() => consent = v ?? false),
                title: const Text(
                  'I consent to share a public-safe success story',
                ),
              ),
              AppButton(
                label: 'Create success story',
                onPressed: consent
                    ? () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const SubmitStoryScreen(),
                        ),
                      )
                    : null,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
