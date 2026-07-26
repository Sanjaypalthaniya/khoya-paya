import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_widgets.dart';
import '../../shared/models/prototype_store.dart';
import '../feed/post_detail_screen.dart';

class SearchHubScreen extends StatefulWidget {
  const SearchHubScreen({super.key});
  @override
  State<SearchHubScreen> createState() => _SearchHubScreenState();
}

class _SearchHubScreenState extends State<SearchHubScreen> {
  final query = TextEditingController();
  final history = <String>['black wallet', 'keys', 'missing dog'];
  String sort = 'Latest', demoState = 'ready';
  List<PostData> get results {
    final q = query.text.toLowerCase();
    final list = PrototypeStore.instance.posts
        .where(
          (p) => [
            p.title,
            p.description,
            p.category,
            p.location,
            p.color,
            p.brand,
            p.model,
            p.status,
          ].join(' ').toLowerCase().contains(q),
        )
        .toList();
    if (sort == 'Reward') list.sort((a, b) => b.reward.compareTo(a.reward));
    return list;
  }

  void filters() => showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (sheet) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Search filters',
              style: TextStyle(fontSize: 21, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 14),
            const TextField(
              decoration: InputDecoration(labelText: 'Category or location'),
            ),
            const SizedBox(height: 10),
            AppButton(
              label: 'Apply demo filter',
              onPressed: () {
                Navigator.pop(sheet);
                setState(() {});
              },
            ),
          ],
        ),
      ),
    ),
  );
  @override
  void dispose() {
    query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final data = results;
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Search',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const NearbyScreen()),
                  ),
                  icon: const Icon(Icons.near_me_outlined),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: query,
              onChanged: (_) => setState(() => demoState = 'ready'),
              onSubmitted: (v) {
                if (v.trim().isNotEmpty) {
                  setState(() => history.insert(0, v.trim()));
                }
              },
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Search posts and protected items',
                suffixIcon: IconButton(
                  onPressed: () {
                    query.clear();
                    setState(() {});
                  },
                  icon: const Icon(Icons.clear),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: filters,
                  icon: const Icon(Icons.tune),
                  label: const Text('Filters'),
                ),
                const SizedBox(width: 8),
                PopupMenuButton<String>(
                  onSelected: (v) => setState(() => sort = v),
                  itemBuilder: (_) => ['Latest', 'Reward', 'Nearby']
                      .map((e) => PopupMenuItem(value: e, child: Text(e)))
                      .toList(),
                  child: Chip(label: Text('Sort: $sort')),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  onSelected: (v) => setState(() => demoState = v),
                  itemBuilder: (_) => const [
                    PopupMenuItem(value: 'ready', child: Text('Normal')),
                    PopupMenuItem(value: 'error', child: Text('Error demo')),
                  ],
                  child: const Icon(Icons.science_outlined),
                ),
              ],
            ),
            if (query.text.isEmpty) ...[
              const SizedBox(height: 18),
              const SectionHeader('Recent searches'),
              Wrap(
                spacing: 8,
                children: history
                    .map(
                      (e) => InputChip(
                        label: Text(e),
                        onPressed: () {
                          query.text = e;
                          setState(() {});
                        },
                        onDeleted: () => setState(() => history.remove(e)),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 18),
              const SectionHeader('Popular categories'),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Wallet', 'Phone', 'Pet', 'Keys', 'Document', 'Bag']
                    .map(
                      (e) => ActionChip(
                        label: Text(e),
                        avatar: const Icon(Icons.trending_up, size: 16),
                        onPressed: () {
                          query.text = e;
                          setState(() {});
                        },
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 18),
              const SectionHeader('Suggestions'),
              const AppCard(
                child: Column(
                  children: [
                    ListTile(
                      leading: Icon(Icons.search),
                      title: Text('Found phone in Jaipur'),
                    ),
                    ListTile(
                      leading: Icon(Icons.search),
                      title: Text('Missing pet nearby'),
                    ),
                  ],
                ),
              ),
            ] else if (demoState == 'error')
              AppStateView(
                icon: Icons.error_outline,
                title: 'Search unavailable',
                message: 'This is the local error preview.',
                action: () => setState(() => demoState = 'ready'),
              )
            else if (data.isEmpty)
              const AppStateView(
                icon: Icons.search_off,
                title: 'No results found',
                message: 'Try another item, colour, brand, location or status.',
              )
            else ...[
              const SizedBox(height: 18),
              SectionHeader('${data.length} results'),
              ...data.map(
                (p) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: AppCard(
                    child: ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        child: Icon(Icons.image_outlined),
                      ),
                      title: Text(p.title),
                      subtitle: Text('${p.category} • ${p.location}'),
                      trailing: StatusChip(p.status),
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => PostDetailScreen(post: p),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class NearbyScreen extends StatefulWidget {
  const NearbyScreen({super.key});
  @override
  State<NearbyScreen> createState() => _NearbyScreenState();
}

class _NearbyScreenState extends State<NearbyScreen> {
  bool map = true, location = true;
  double distance = 10;
  String area = 'C-Scheme, Jaipur';
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Nearby')),
    body: SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const AppCard(
            color: AppColors.primarySoft,
            child: Row(
              children: [
                Icon(Icons.location_off_outlined, color: AppColors.primary),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Real location is not requested. Choose a sanitized demo area manually.',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: area,
            decoration: const InputDecoration(labelText: 'Demo location'),
            items: [
              'C-Scheme, Jaipur',
              'Malviya Nagar, Jaipur',
              'Mansarovar, Jaipur',
            ].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
            onChanged: (v) => setState(() {
              area = v!;
              location = true;
            }),
          ),
          Row(
            children: [
              Expanded(
                child: Slider(
                  value: distance,
                  min: 1,
                  max: 25,
                  divisions: 24,
                  label: '${distance.round()} km',
                  onChanged: (v) => setState(() => distance = v),
                ),
              ),
              Text('${distance.round()} km'),
            ],
          ),
          SegmentedButton<bool>(
            segments: const [
              ButtonSegment(
                value: true,
                icon: Icon(Icons.map_outlined),
                label: Text('Map'),
              ),
              ButtonSegment(
                value: false,
                icon: Icon(Icons.list),
                label: Text('List'),
              ),
            ],
            selected: {map},
            onSelectionChanged: (v) => setState(() => map = v.first),
          ),
          const SizedBox(height: 14),
          if (!location)
            const AppStateView(
              icon: Icons.location_disabled,
              title: 'Location unavailable',
              message: 'Select a manual demo location to continue.',
            )
          else if (map)
            Container(
              height: 320,
              decoration: BoxDecoration(
                color: const Color(0xFFE7ECE8),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Stack(
                children: [
                  ...List.generate(
                    5,
                    (i) => Positioned(
                      left: 25.0 + i * 55,
                      top: 35.0 + (i % 3) * 80,
                      child: const CircleAvatar(
                        backgroundColor: AppColors.primary,
                        child: Icon(
                          Icons.inventory_2_outlined,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    bottom: 16,
                    child: Chip(label: Text('$area • ${distance.round()} km')),
                  ),
                ],
              ),
            )
          else
            ...PrototypeStore.instance.posts
                .take(5)
                .map(
                  (p) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: AppCard(
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(p.title),
                        subtitle: Text(p.location),
                        trailing: StatusChip(p.status),
                      ),
                    ),
                  ),
                ),
          const SizedBox(height: 12),
          AppButton(
            label: location
                ? 'Preview location-denied state'
                : 'Restore manual location',
            secondary: true,
            onPressed: () => setState(() => location = !location),
          ),
        ],
      ),
    ),
  );
}
