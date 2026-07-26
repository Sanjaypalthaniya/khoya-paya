import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../auth/login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool notifications = true, nearby = false, compact = false, wifiOnly = true;
  String language = 'English', appearance = 'System';
  void info(String title, String body) => Navigator.push(
    context,
    MaterialPageRoute(
      builder: (_) => SettingsDetailScreen(title: title, body: body),
    ),
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Settings')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          const AppCard(
            color: AppColors.primarySoft,
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.science_outlined, color: AppColors.primary),
              title: Text('Prototype Mode'),
              subtitle: Text('Preferences are local and may reset.'),
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              children: [
                _tile(
                  Icons.person_outline,
                  'Account',
                  () => info(
                    'Account',
                    'Demo profile, verification and password controls. No account mutation is performed.',
                  ),
                ),
                _tile(
                  Icons.lock_outline,
                  'Privacy',
                  () => info(
                    'Privacy',
                    'Contact details remain private. Visibility controls affect local previews only.',
                  ),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(Icons.notifications_outlined),
                  title: const Text('Notifications'),
                  value: notifications,
                  onChanged: (v) => setState(() => notifications = v),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(Icons.location_on_outlined),
                  title: const Text('Nearby location previews'),
                  value: nearby,
                  onChanged: (v) => setState(() => nearby = v),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.language),
                  title: const Text('Language'),
                  subtitle: Text(language),
                  onTap: () => setState(
                    () => language = language == 'English'
                        ? 'हिन्दी (preview)'
                        : 'English',
                  ),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.brightness_6_outlined),
                  title: const Text('Appearance'),
                  subtitle: Text(appearance),
                  onTap: () => setState(
                    () => appearance = appearance == 'System'
                        ? 'Light'
                        : 'System',
                  ),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(Icons.view_compact_outlined),
                  title: const Text('Compact cards'),
                  value: compact,
                  onChanged: (v) => setState(() => compact = v),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  secondary: const Icon(Icons.wifi_outlined),
                  title: const Text('Media on Wi-Fi only'),
                  value: wifiOnly,
                  onChanged: (v) => setState(() => wifiOnly = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppCard(
            child: Column(
              children: [
                _tile(
                  Icons.health_and_safety_outlined,
                  'Safety',
                  () => info(
                    'Safety',
                    'Meet publicly, verify ownership, and never share OTPs or payment credentials.',
                  ),
                ),
                _tile(
                  Icons.help_outline,
                  'Help',
                  () => info(
                    'Help',
                    'Browse static recovery guidance and frequently asked questions.',
                  ),
                ),
                _tile(
                  Icons.gavel_outlined,
                  'Legal',
                  () => info(
                    'Legal',
                    'Prototype terms, privacy and community guidelines preview.',
                  ),
                ),
                _tile(
                  Icons.info_outline,
                  'About App',
                  () => info(
                    'About Khoya Paya',
                    'Version 1.0.0 static prototype\nFlutter mobile experience',
                  ),
                ),
                _tile(
                  Icons.workspace_premium_outlined,
                  'Plans & billing demo',
                  () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PlansScreen()),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppButton(
            label: 'Logout prototype',
            danger: true,
            onPressed: () => showDialog<void>(
              context: context,
              builder: (_) => AlertDialog(
                title: const Text('Leave prototype session?'),
                content: const Text('No real account session exists.'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (_) => false,
                    ),
                    child: const Text('Logout'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  );
  Widget _tile(IconData icon, String title, VoidCallback tap) => ListTile(
    contentPadding: EdgeInsets.zero,
    leading: Icon(icon),
    title: Text(title),
    trailing: const Icon(Icons.chevron_right),
    onTap: tap,
  );
}

class SettingsDetailScreen extends StatelessWidget {
  const SettingsDetailScreen({
    super.key,
    required this.title,
    required this.body,
  });
  final String title, body;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(title)),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          AppCard(child: Text(body)),
          const SizedBox(height: 14),
          AppButton(
            label: 'Save prototype preference',
            onPressed: () {
              showAppToast(context, '$title preference saved locally');
              Navigator.pop(context);
            },
          ),
        ],
      ),
    ),
  );
}

class PlansScreen extends StatelessWidget {
  const PlansScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Plans • Demo')),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const AppCard(
          color: AppColors.primarySoft,
          child: Text(
            'Demo payment state only. Razorpay and payment processing are not initialized.',
          ),
        ),
        const SizedBox(height: 12),
        const AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.shield_outlined),
            title: Text(
              'Current plan: Free',
              style: TextStyle(fontWeight: FontWeight.w900),
            ),
            subtitle: Text('2 protected items • Community access'),
          ),
        ),
        const SizedBox(height: 12),
        ...[
          ('Free', '₹0', '2 items'),
          ('Plus', '₹99/mo', '10 items'),
          ('Family', '₹199/mo', '30 items'),
        ].map(
          (p) => Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p.$1,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  Text('${p.$2} • ${p.$3}'),
                  const SizedBox(height: 10),
                  AppButton(
                    label: p.$1 == 'Free' ? 'Current plan' : 'Preview upgrade',
                    secondary: p.$1 == 'Free',
                    onPressed: () => showDialog<void>(
                      context: context,
                      builder: (_) => AlertDialog(
                        title: const Text('Demo payment result'),
                        content: const Text(
                          'Choose a visual result. No payment is processed.',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                              showAppToast(context, 'Payment failure preview');
                            },
                            child: const Text('Failure'),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context);
                              showAppToast(context, 'Payment success preview');
                            },
                            child: const Text('Success'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SectionHeader('Payment method'),
        const AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(Icons.credit_card),
            title: Text('•••• 4242'),
            subtitle: Text('Static display only'),
          ),
        ),
        const SizedBox(height: 12),
        const SectionHeader('Billing history'),
        const AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text('No real transactions'),
            subtitle: Text('Demo invoice • ₹0'),
          ),
        ),
      ],
    ),
  );
}
