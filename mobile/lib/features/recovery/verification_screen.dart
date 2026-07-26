import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import 'claims_screen.dart';
import 'recovery_screen.dart';

class VerificationFlowScreen extends StatefulWidget {
  const VerificationFlowScreen({super.key, required this.claim});
  final ClaimData claim;
  @override
  State<VerificationFlowScreen> createState() => _VerificationFlowScreenState();
}

class _VerificationFlowScreenState extends State<VerificationFlowScreen> {
  int step = 0;
  final answer = TextEditingController(), evidence = TextEditingController();
  final labels = [
    'Claim submitted',
    'Private questions',
    'Evidence review',
    'Owner decision',
    'Return arrangement',
    'Recovery confirmation',
  ];
  @override
  void dispose() {
    answer.dispose();
    evidence.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Ownership verification')),
    body: SafeArea(
      child: Column(
        children: [
          LinearProgressIndicator(value: (step + 1) / labels.length),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(18),
              children: [
                Text(
                  labels[step],
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 8),
                Text('Step ${step + 1} of ${labels.length}'),
                const SizedBox(height: 18),
                _content(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                if (step > 0)
                  Expanded(
                    child: AppButton(
                      label: 'Back',
                      secondary: true,
                      onPressed: () => setState(() => step--),
                    ),
                  ),
                if (step > 0) const SizedBox(width: 8),
                Expanded(
                  child: AppButton(
                    label: step == labels.length - 1
                        ? 'Complete recovery'
                        : 'Continue',
                    onPressed: () {
                      if (step == labels.length - 1) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => RecoveryScreen(claim: widget.claim),
                          ),
                        );
                      } else {
                        setState(() => step++);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ),
  );
  Widget _content() => switch (step) {
    0 => const AppStateView(
      icon: Icons.assignment_turned_in_outlined,
      title: 'Claim received safely',
      message:
          'The claimant and owner can continue without exposing contact details.',
    ),
    1 => Column(
      children: [
        const AppCard(
          child: Text(
            'Private question: What unique stitched mark is inside the item?',
          ),
        ),
        const SizedBox(height: 12),
        AppTextField(controller: answer, label: 'Your private answer'),
      ],
    ),
    2 => Column(
      children: [
        const AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.image_outlined),
            title: Text('Evidence upload preview'),
            subtitle: Text(
              'Do not upload Aadhaar, passwords or payment cards.',
            ),
          ),
        ),
        const SizedBox(height: 12),
        AppTextField(controller: evidence, label: 'Evidence note'),
        const SizedBox(height: 10),
        AppButton(
          label: 'Attach demo evidence',
          secondary: true,
          onPressed: () =>
              showAppToast(context, 'Demo evidence attached locally'),
        ),
      ],
    ),
    3 => Column(
      children: [
        const AppCard(
          child: Text(
            'Review answer: Black stitched initials inside the coin pocket.\n\nEvidence: Purchase photo preview.',
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          children: [
            ActionChip(
              label: const Text('Request more info'),
              onPressed: () =>
                  showAppToast(context, 'More information requested locally'),
            ),
            ActionChip(
              label: const Text('Reject'),
              onPressed: () =>
                  showAppToast(context, 'Verification rejected preview'),
            ),
            ActionChip(
              label: const Text('Approve'),
              onPressed: () =>
                  showAppToast(context, 'Verification approved locally'),
            ),
          ],
        ),
      ],
    ),
    4 => const AppCard(
      color: AppColors.primarySoft,
      child: Column(
        children: [
          Icon(Icons.handshake_outlined, size: 50, color: AppColors.primary),
          SizedBox(height: 12),
          Text(
            'Choose a safe return method in the next step.',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ),
    _ => const AppStateView(
      icon: Icons.verified_outlined,
      title: 'Verification successful',
      message: 'Both participants can now confirm the handover.',
    ),
  };
}
