import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';

class SuccessStoriesScreen extends StatelessWidget {
  const SuccessStoriesScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Success Stories'),
      actions: [
        IconButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const SubmitStoryScreen()),
          ),
          icon: const Icon(Icons.add),
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const AppCard(
          color: AppColors.dark,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              StatusChip('Community recognition', color: AppColors.warning),
              SizedBox(height: 12),
              Text(
                'Every safe return strengthens the community.',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ...[
          (
            'Backpack returned before exam day',
            'Kabir thanked finder Riya for verifying privately and meeting at campus security.',
          ),
          (
            'Keys reunited in one afternoon',
            'A neighbourhood helper used the QR label and secure chat.',
          ),
          (
            'Milo came home safely',
            'Jaipur community members shared a public-safe missing pet report.',
          ),
        ].map(
          (story) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const CircleAvatar(
                  child: Icon(Icons.emoji_events_outlined),
                ),
                title: Text(
                  story.$1,
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
                subtitle: Text(story.$2, maxLines: 2),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        StoryDetailScreen(title: story.$1, body: story.$2),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

class StoryDetailScreen extends StatelessWidget {
  const StoryDetailScreen({super.key, required this.title, required this.body});
  final String title, body;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Recovery story')),
    body: ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Container(
          height: 220,
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: BorderRadius.circular(22),
          ),
          child: const Icon(
            Icons.volunteer_activism_outlined,
            size: 80,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 18),
        Text(title, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 10),
        Text(body),
        const SizedBox(height: 14),
        const AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: Icon(
              Icons.workspace_premium_outlined,
              color: AppColors.warning,
            ),
            title: Text('Finder badge earned'),
            subtitle: Text('Trusted Helper • Demo recognition'),
          ),
        ),
      ],
    ),
  );
}

class SubmitStoryScreen extends StatefulWidget {
  const SubmitStoryScreen({super.key});
  @override
  State<SubmitStoryScreen> createState() => _SubmitStoryScreenState();
}

class _SubmitStoryScreenState extends State<SubmitStoryScreen> {
  final story = TextEditingController();
  bool consent = false, image = false;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Share success story')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          AppTextField(controller: story, label: 'Your public-safe story'),
          const SizedBox(height: 12),
          AppCard(
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(
                image ? Icons.image : Icons.add_photo_alternate_outlined,
              ),
              title: Text(
                image ? 'Demo recovery photo selected' : 'Select demo image',
              ),
              onTap: () => setState(() => image = true),
            ),
          ),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: consent,
            onChanged: (v) => setState(() => consent = v ?? false),
            title: const Text('I consent to community publication'),
          ),
          AppButton(
            label: 'Submit locally',
            onPressed: consent
                ? () => showDialog<void>(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Story submitted locally'),
                      content: const Text('No content was uploaded.'),
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
                  )
                : null,
          ),
        ],
      ),
    ),
  );
}
