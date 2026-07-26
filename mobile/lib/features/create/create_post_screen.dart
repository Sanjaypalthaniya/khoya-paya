import 'package:flutter/material.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key, this.initialType = 'Lost'});
  final String initialType;
  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final key = GlobalKey<FormState>();
  final title = TextEditingController(),
      description = TextEditingController(),
      location = TextEditingController(text: 'Jaipur'),
      color = TextEditingController(),
      brand = TextEditingController(),
      model = TextEditingController(),
      verification = TextEditingController();
  late String type = widget.initialType;
  String category = 'Wallet';
  int step = 0;
  bool reward = false, privateContact = true;
  @override
  void dispose() {
    for (final c in [
      title,
      description,
      location,
      color,
      brand,
      model,
      verification,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  void next() {
    if (step == 0 && !key.currentState!.validate()) return;
    if (step < 2) {
      setState(() => step++);
      return;
    }
    PrototypeStore.instance.addPost(
      PostData(
        id: 'local-${DateTime.now().millisecondsSinceEpoch}',
        user: 'Aanya Sharma',
        title: title.text,
        description: description.text,
        status: type,
        category: category,
        location: location.text,
        time: 'Just now',
        verified: true,
        reward: reward ? 500 : 0,
        color: color.text,
        brand: brand.text,
        model: model.text,
      ),
    );
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const _PublishSuccess()),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text('Create $type report')),
    body: SafeArea(
      child: Form(
        key: key,
        child: Column(
          children: [
            LinearProgressIndicator(value: (step + 1) / 3),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: [_details(), _privacy(), _preview()][step],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
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
                  if (step > 0) const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: step == 2 ? 'Publish locally' : 'Continue',
                      onPressed: next,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
  Widget _details() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Report details', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 16),
      DropdownButtonFormField<String>(
        initialValue: type,
        decoration: const InputDecoration(labelText: 'Post type'),
        items: [
          'Lost',
          'Found',
          'Missing',
        ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
        onChanged: (v) => setState(() => type = v!),
      ),
      const SizedBox(height: 12),
      DropdownButtonFormField<String>(
        initialValue: category,
        decoration: const InputDecoration(labelText: 'Category'),
        items: [
          'Wallet',
          'Phone',
          'Pet',
          'Document',
          'Keys',
          'Bag',
          'Other',
        ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
        onChanged: (v) => setState(() => category = v!),
      ),
      const SizedBox(height: 12),
      AppTextField(
        controller: title,
        label: 'Title',
        validator: (v) =>
            (v?.trim().length ?? 0) < 5 ? 'Add a useful title' : null,
      ),
      const SizedBox(height: 12),
      AppTextField(
        controller: description,
        label: 'Description',
        validator: (v) =>
            (v?.trim().length ?? 0) < 10 ? 'Add more public-safe detail' : null,
      ),
      const SizedBox(height: 12),
      AppTextField(controller: color, label: 'Colour'),
      const SizedBox(height: 12),
      AppTextField(controller: brand, label: 'Brand'),
      const SizedBox(height: 12),
      AppTextField(controller: model, label: 'Model'),
      const SizedBox(height: 12),
      AppTextField(controller: location, label: 'Approximate location'),
      const SizedBox(height: 12),
      const AppCard(
        child: ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.calendar_today_outlined),
          title: Text('Today'),
          subtitle: Text('Demo reported date'),
        ),
      ),
    ],
  );
  Widget _privacy() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        'Verification & privacy',
        style: Theme.of(context).textTheme.headlineMedium,
      ),
      const SizedBox(height: 16),
      AppTextField(
        controller: verification,
        label: 'Private verification question',
        hint: 'What unique mark should the owner know?',
      ),
      const SizedBox(height: 12),
      SwitchListTile(
        contentPadding: EdgeInsets.zero,
        value: reward,
        onChanged: (v) => setState(() => reward = v),
        title: const Text('Offer ₹500 demo reward'),
      ),
      SwitchListTile(
        contentPadding: EdgeInsets.zero,
        value: privateContact,
        onChanged: (v) => setState(() => privateContact = v),
        title: const Text('Keep contact details private'),
      ),
      AppCard(
        child: ListTile(
          contentPadding: EdgeInsets.zero,
          leading: const Icon(Icons.add_a_photo_outlined),
          title: const Text('Add media preview'),
          subtitle: const Text('Static placeholder • No upload'),
          onTap: () =>
              showAppToast(context, 'Demo media preview added locally'),
        ),
      ),
    ],
  );
  Widget _preview() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('Preview', style: Theme.of(context).textTheme.headlineMedium),
      const SizedBox(height: 16),
      AppCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StatusChip(type),
            const SizedBox(height: 10),
            Text(title.text, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(description.text),
            const SizedBox(height: 10),
            Text('$category • ${location.text}'),
            if (reward)
              const Padding(
                padding: EdgeInsets.only(top: 8),
                child: StatusChip('₹500 reward'),
              ),
          ],
        ),
      ),
      const SizedBox(height: 12),
      const AppCard(
        child: Text(
          'Publishing adds this report only to the in-memory feed. It will disappear when the app restarts.',
        ),
      ),
    ],
  );
}

class _PublishSuccess extends StatelessWidget {
  const _PublishSuccess();
  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: AppStateView(
        icon: Icons.check_circle_outline,
        title: 'Report published locally',
        message: 'Your new demo post now appears at the top of Community Feed.',
        action: () => Navigator.pop(context),
      ),
    ),
  );
}
