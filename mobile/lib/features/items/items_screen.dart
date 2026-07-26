import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';
import '../qr/qr_screens.dart';

class ItemsScreen extends StatefulWidget {
  const ItemsScreen({super.key});
  @override
  State<ItemsScreen> createState() => _ItemsScreenState();
}

class _ItemsScreenState extends State<ItemsScreen> {
  final store = PrototypeStore.instance;
  final search = TextEditingController();
  String filter = 'All';
  @override
  void initState() {
    super.initState();
    store.addListener(refresh);
  }

  @override
  void dispose() {
    store.removeListener(refresh);
    search.dispose();
    super.dispose();
  }

  void refresh() => setState(() {});
  List<ItemData> get items => store.items
      .where(
        (i) =>
            (filter == 'All' || i.status == filter) &&
            i.name.toLowerCase().contains(search.text.toLowerCase()),
      )
      .toList();
  void actions(ItemData item) => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheet) => SafeArea(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(
                item.name,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              subtitle: Text(item.id),
            ),
            ListTile(
              leading: const Icon(Icons.visibility_outlined),
              title: const Text('View details'),
              onTap: () {
                Navigator.pop(sheet);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ItemDetailScreen(item: item),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.edit_outlined),
              title: const Text('Edit item'),
              onTap: () {
                Navigator.pop(sheet);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ItemFormScreen(item: item)),
                );
              },
            ),
            ...['Lost', 'Found', 'Missing', 'Recovered'].map(
              (s) => ListTile(
                leading: Icon(
                  s == 'Recovered'
                      ? Icons.check_circle_outline
                      : Icons.flag_outlined,
                ),
                title: Text('Mark $s'),
                onTap: () {
                  store.setItemStatus(item, s);
                  Navigator.pop(sheet);
                },
              ),
            ),
            ListTile(
              leading: const Icon(Icons.qr_code),
              title: const Text('View / share QR'),
              onTap: () {
                Navigator.pop(sheet);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => QrHubScreen(item: item)),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: AppColors.error),
              title: const Text('Delete'),
              onTap: () {
                Navigator.pop(sheet);
                showDialog<void>(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Delete this item?'),
                    content: const Text(
                      'This only removes local prototype data.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          store.deleteItem(item);
                          Navigator.pop(context);
                        },
                        child: const Text('Delete'),
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
      title: const Text('My Items'),
      actions: [
        IconButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ItemFormScreen()),
          ),
          icon: const Icon(Icons.add),
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
                hintText: 'Search my items',
              ),
            ),
          ),
          SizedBox(
            height: 45,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: ['All', 'Safe', 'Lost', 'Found', 'Missing', 'Recovered']
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
            child: items.isEmpty
                ? const AppStateView(
                    icon: Icons.inventory_2_outlined,
                    title: 'No matching items',
                    message: 'Add an item or change your filters.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(14),
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final item = items[i];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: AppCard(
                          child: ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: const CircleAvatar(
                              child: Icon(Icons.inventory_2_outlined),
                            ),
                            title: Text(
                              item.name,
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            subtitle: Text('${item.category} • ${item.id}'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                StatusChip(item.status),
                                IconButton(
                                  onPressed: () => actions(item),
                                  icon: const Icon(Icons.more_vert),
                                ),
                              ],
                            ),
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ItemDetailScreen(item: item),
                              ),
                            ),
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

class ItemFormScreen extends StatefulWidget {
  const ItemFormScreen({super.key, this.item});
  final ItemData? item;
  @override
  State<ItemFormScreen> createState() => _ItemFormScreenState();
}

class _ItemFormScreenState extends State<ItemFormScreen> {
  final key = GlobalKey<FormState>();
  late final name = TextEditingController(text: widget.item?.name),
      brand = TextEditingController(text: widget.item?.brand),
      model = TextEditingController(text: widget.item?.model),
      color = TextEditingController(text: widget.item?.color),
      marks = TextEditingController(),
      value = TextEditingController(),
      description = TextEditingController(),
      emergency = TextEditingController();
  String category = 'Electronics',
      visibility = 'Private',
      recovery = 'Secure chat';
  bool reward = false, preview = false;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text(widget.item == null ? 'Add Item' : 'Edit Item')),
    body: SafeArea(
      child: Form(
        key: key,
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            if (preview)
              AppCard(
                color: AppColors.primarySoft,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name.text,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    Text('$category • ${color.text}'),
                    Text(
                      description.text.isEmpty
                          ? 'No description added'
                          : description.text,
                    ),
                  ],
                ),
              ),
            if (preview) const SizedBox(height: 14),
            AppTextField(
              controller: name,
              label: 'Name',
              validator: (v) =>
                  (v?.trim().isEmpty ?? true) ? 'Item name is required' : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: category,
              decoration: const InputDecoration(labelText: 'Category'),
              items: [
                'Electronics',
                'Bag',
                'Keys',
                'Pet',
                'Document',
                'Other',
              ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => category = v!),
            ),
            const SizedBox(height: 12),
            AppTextField(controller: brand, label: 'Brand'),
            const SizedBox(height: 12),
            AppTextField(controller: model, label: 'Model'),
            const SizedBox(height: 12),
            AppTextField(controller: color, label: 'Colour'),
            const SizedBox(height: 12),
            AppTextField(controller: marks, label: 'Unique marks'),
            const SizedBox(height: 12),
            const TextField(
              decoration: InputDecoration(
                labelText: 'Purchase date',
                hintText: 'Optional',
              ),
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: value,
              label: 'Estimated value',
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            AppTextField(controller: description, label: 'Description'),
            const SizedBox(height: 12),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: reward,
              onChanged: (v) => setState(() => reward = v),
              title: const Text('Enable recovery reward'),
            ),
            AppCard(
              child: ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.photo_library_outlined),
                title: const Text('Item images'),
                subtitle: const Text('Static media preview'),
                onTap: () =>
                    showAppToast(context, 'Demo item image selected locally'),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: recovery,
              decoration: const InputDecoration(
                labelText: 'Recovery preference',
              ),
              items: [
                'Secure chat',
                'Public place handover',
                'Support assisted',
              ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => recovery = v!,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: visibility,
              decoration: const InputDecoration(labelText: 'Visibility'),
              items: [
                'Private',
                'Community when lost',
              ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => visibility = v!,
            ),
            const SizedBox(height: 12),
            AppTextField(
              controller: emergency,
              label: 'Emergency contact (not stored)',
            ),
            const SizedBox(height: 18),
            AppButton(
              label: preview ? 'Hide preview' : 'Preview',
              secondary: true,
              onPressed: () => setState(() => preview = !preview),
            ),
            const SizedBox(height: 10),
            AppButton(
              label: 'Save locally',
              onPressed: () {
                if (!key.currentState!.validate()) {
                  return;
                }
                if (widget.item == null) {
                  PrototypeStore.instance.addItem(
                    ItemData(
                      'KP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
                      name.text,
                      category,
                      'Safe',
                      color.text,
                      brand: brand.text,
                      model: model.text,
                    ),
                  );
                }
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    ),
  );
}

class ItemDetailScreen extends StatelessWidget {
  const ItemDetailScreen({super.key, required this.item});
  final ItemData item;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(item.name),
      actions: [
        PopupMenuButton<String>(
          onSelected: (_) =>
              showAppToast(context, 'Item action applied locally'),
          itemBuilder: (_) => const [
            PopupMenuItem(value: 'share', child: Text('Share item')),
            PopupMenuItem(value: 'archive', child: Text('Archive')),
          ],
        ),
      ],
    ),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          height: 210,
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Icon(
            Icons.inventory_2_outlined,
            size: 76,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: Text(
                item.name,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
            StatusChip(item.status),
          ],
        ),
        Text('${item.brand} ${item.model} • ${item.color}'),
        const SizedBox(height: 16),
        AppCard(
          child: Column(
            children: [
              _ItemRow('Recovery ID', item.id),
              const _ItemRow('QR scans', '12'),
              const _ItemRow('Last scan', 'Yesterday • Jaipur'),
              const _ItemRow('Finder messages', '2 secure previews'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppButton(
          label: 'View QR code',
          icon: Icons.qr_code,
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => QrHubScreen(item: item)),
          ),
        ),
        const SizedBox(height: 14),
        const SectionHeader('Status timeline'),
        const AppCard(
          child: Column(
            children: [
              ListTile(
                leading: Icon(Icons.check_circle, color: AppColors.success),
                title: Text('Item registered'),
                subtitle: Text('Local prototype history'),
              ),
              ListTile(
                leading: Icon(Icons.qr_code_scanner),
                title: Text('QR viewed'),
                subtitle: Text('Yesterday'),
              ),
              ListTile(
                leading: Icon(Icons.forum_outlined),
                title: Text('Finder message preview'),
                subtitle: Text('No private data shared'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AppCard(
          child: ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.campaign_outlined),
            title: const Text('Community post'),
            subtitle: const Text('Open linked report preview'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () =>
                showAppToast(context, 'Linked community report preview opened'),
          ),
        ),
      ],
    ),
  );
}

class _ItemRow extends StatelessWidget {
  const _ItemRow(this.label, this.value);
  final String label, value;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 7),
    child: Row(
      children: [
        Expanded(child: Text(label)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w800)),
      ],
    ),
  );
}
