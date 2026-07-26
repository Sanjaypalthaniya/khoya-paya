import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';

class QrHubScreen extends StatelessWidget {
  const QrHubScreen({super.key, required this.item});
  final ItemData item;
  void share(BuildContext context) => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheet) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Share ${item.name} QR',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            AppButton(
              label: 'Copy safe demo link',
              icon: Icons.link,
              onPressed: () {
                Navigator.pop(sheet);
                showAppToast(context, 'Demo QR link copied');
              },
            ),
            const SizedBox(height: 10),
            AppButton(
              label: 'Save QR preview',
              secondary: true,
              onPressed: () {
                Navigator.pop(sheet);
                showDialog<void>(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('QR saved locally'),
                    content: const Text(
                      'Download success UI only; no file was shared externally.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Done'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    ),
  );
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Item QR'),
      actions: [
        IconButton(
          onPressed: () => share(context),
          icon: const Icon(Icons.share_outlined),
        ),
      ],
    ),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AppCard(
            child: Column(
              children: [
                Text(item.name, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 18),
                QrVisual(
                  size: MediaQuery.sizeOf(
                    context,
                  ).width.clamp(220, 320).toDouble(),
                ),
                const SizedBox(height: 14),
                Text(
                  item.id,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                const Text('Scan to open safe finder preview'),
              ],
            ),
          ),
          const SizedBox(height: 12),
          AppButton(
            label: 'View full screen',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QrFullScreen(item: item)),
            ),
          ),
          const SizedBox(height: 10),
          AppButton(
            label: 'Print preview',
            secondary: true,
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QrPrintScreen(item: item)),
            ),
          ),
          const SizedBox(height: 10),
          AppButton(
            label: 'Open scanner',
            secondary: true,
            icon: Icons.qr_code_scanner,
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ScannerScreen()),
            ),
          ),
        ],
      ),
    ),
  );
}

class QrVisual extends StatelessWidget {
  const QrVisual({super.key, this.size = 250});
  final double size;
  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    padding: const EdgeInsets.all(18),
    color: Colors.white,
    child: GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 11,
      ),
      itemCount: 121,
      itemBuilder: (_, i) => Container(
        color: ((i * 7 + i ~/ 11 * 3) % 5 < 2 || i < 23 && i % 4 != 0)
            ? AppColors.dark
            : Colors.white,
      ),
    ),
  );
}

class QrFullScreen extends StatelessWidget {
  const QrFullScreen({super.key, required this.item});
  final ItemData item;
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: AppBar(title: Text(item.name)),
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              QrVisual(
                size: MediaQuery.sizeOf(
                  context,
                ).width.clamp(250, 420).toDouble(),
              ),
              const SizedBox(height: 20),
              Text(item.id, style: Theme.of(context).textTheme.headlineMedium),
              const Text('Khoya Paya protected item'),
            ],
          ),
        ),
      ),
    ),
  );
}

class QrPrintScreen extends StatelessWidget {
  const QrPrintScreen({super.key, required this.item});
  final ItemData item;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Print preview')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          AppCard(
            child: Column(
              children: [
                const Text(
                  'IF FOUND',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 12),
                const QrVisual(size: 220),
                const SizedBox(height: 12),
                Text('Scan securely • ${item.id}'),
                const Text('No owner contact is printed'),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});
  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  String state = 'idle';
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.dark,
    appBar: AppBar(
      backgroundColor: AppColors.dark,
      foregroundColor: Colors.white,
      title: const Text('Scan QR'),
    ),
    body: SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              'Static camera preview • camera is not accessed',
              style: TextStyle(color: Colors.white70),
            ),
            const Spacer(),
            Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(
                  color: state == 'scanning' ? AppColors.success : Colors.white,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Center(
                child: state == 'scanning'
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Icon(
                        Icons.qr_code_scanner,
                        color: Colors.white,
                        size: 90,
                      ),
              ),
            ),
            const Spacer(),
            if (state == 'idle')
              AppButton(
                label: 'Simulate Scan',
                onPressed: () async {
                  setState(() => state = 'scanning');
                  await Future<void>.delayed(const Duration(milliseconds: 600));
                  if (mounted) setState(() => state = 'valid');
                },
              ),
            if (state == 'valid') ...[
              AppButton(
                label: 'Open valid QR result',
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const QrResultScreen(kind: 'valid'),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              AppButton(
                label: 'Try invalid result',
                secondary: true,
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const QrResultScreen(kind: 'invalid'),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              AppButton(
                label: 'Recovered result',
                secondary: true,
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const QrResultScreen(kind: 'recovered'),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    ),
  );
}

class QrResultScreen extends StatelessWidget {
  const QrResultScreen({super.key, required this.kind});
  final String kind;
  @override
  Widget build(BuildContext context) {
    final invalid = kind == 'invalid', recovered = kind == 'recovered';
    return Scaffold(
      appBar: AppBar(title: const Text('Scan result')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            AppStateView(
              icon: invalid
                  ? Icons.error_outline
                  : recovered
                  ? Icons.check_circle_outline
                  : Icons.verified_user_outlined,
              title: invalid
                  ? 'QR not recognised'
                  : recovered
                  ? 'Item already recovered'
                  : 'Protected item found',
              message: invalid
                  ? 'This demo code is invalid. Check the label and try again.'
                  : recovered
                  ? 'This item has been marked recovered. No contact action is needed.'
                  : 'Travel backpack • Owner contact remains private.',
            ),
            if (!invalid && !recovered) ...[
              const AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Public finder page preview',
                      style: TextStyle(fontWeight: FontWeight.w800),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'You can send a secure message without seeing the owner’s phone number or address.',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              AppButton(
                label: 'Message owner securely',
                onPressed: () => showAppToast(
                  context,
                  'Static secure-message preview opened',
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
