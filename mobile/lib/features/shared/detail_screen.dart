import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';

class DetailScreen extends StatefulWidget {
  const DetailScreen({
    super.key,
    required this.title,
    required this.icon,
    required this.description,
  });
  final String title, description;
  final IconData icon;
  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  final details = TextEditingController();
  String category = 'Personal item';
  @override
  void dispose() {
    details.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.title)),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AppCard(
            color: AppColors.primarySoft,
            child: Row(
              children: [
                Icon(widget.icon, color: AppColors.primary, size: 32),
                const SizedBox(width: 14),
                Expanded(child: Text(widget.description)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Item details', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: category,
            decoration: const InputDecoration(labelText: 'Category'),
            items: const [
              'Personal item',
              'Document',
              'Electronics',
              'Pet',
            ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) => setState(() => category = v!),
          ),
          const SizedBox(height: 12),
          AppTextField(
            controller: details,
            label: 'Public-safe description',
            hint: 'Colour, type and helpful identifying details',
          ),
          const SizedBox(height: 12),
          const AppCard(
            child: Row(
              children: [
                Icon(Icons.photo_camera_outlined),
                SizedBox(width: 12),
                Expanded(child: Text('Add local demo photo')),
                Icon(Icons.add_circle_outline),
              ],
            ),
          ),
          const SizedBox(height: 20),
          AppButton(
            label: 'Save prototype report',
            onPressed: () {
              showDialog<void>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Saved locally'),
                  content: const Text(
                    'This static prototype did not upload or send any information.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        Navigator.pop(context);
                      },
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
  );
}
